#!/usr/bin/env node

/**
 * Agent Executor - Core agent execution engine
 * Handles task execution, workflow orchestration, and LLM integration
 */

const { executeTool } = require('./agent-tools');

/**
 * Execute a single task step
 */
const executeStep = async (step, context = {}) => {
    const { tool, params, condition } = step;

    // Check condition if exists
    if (condition) {
        const conditionMet = evaluateCondition(condition, context);
        if (!conditionMet) {
            return { skipped: true, reason: 'Condition not met' };
        }
    }

    // Resolve parameters from context
    const resolvedParams = resolveParams(params, context);

    try {
        const result = await executeTool(tool, resolvedParams);
        return { success: true, result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Execute a task (which may have multiple steps)
 */
const executeTask = async (task, context = {}, config = {}) => {
    const { steps, name, description } = task;
    const { verbose = false } = config;

    if (verbose) {
        console.log(`Executing task: ${name || 'Unnamed task'}`);
        if (description) {
            console.log(`Description: ${description}`);
        }
    }

    const results = [];
    const taskContext = { ...context };

    for (const step of steps) {
        const stepResult = await executeStep(step, taskContext);
        results.push(stepResult);

        // Update context with step result
        if (stepResult.success && stepResult.result !== undefined) {
            // Store result with step index or name
            const stepName = step.name || `step_${results.length}`;
            taskContext[stepName] = stepResult.result;
            
            // Also store as the tool name for easy reference
            taskContext[step.tool] = stepResult.result;
        }

        // Stop on error unless continueOnError is set
        if (!stepResult.success && !step.continueOnError) {
            if (verbose) {
                console.error(`Task failed at step ${results.length}: ${stepResult.error}`);
            }
            break;
        }
    }

    const allSuccess = results.every(r => r.success || r.skipped);
    return {
        success: allSuccess,
        results,
        context: taskContext
    };
};

/**
 * Execute a workflow (sequence of tasks)
 */
const executeWorkflow = async (workflow, initialContext = {}, config = {}) => {
    const { verbose = false } = config;

    if (verbose) {
        console.log(`Starting workflow with ${workflow.length} tasks`);
    }

    const workflowContext = { ...initialContext };
    const taskResults = [];

    for (let i = 0; i < workflow.length; i++) {
        const task = workflow[i];
        
        if (verbose) {
            console.log(`\nTask ${i + 1}/${workflow.length}`);
        }

        const taskResult = await executeTask(task, workflowContext, config);
        taskResults.push(taskResult);

        // Merge task context into workflow context
        Object.assign(workflowContext, taskResult.context);

        // Stop workflow on task failure unless continueOnError is set
        if (!taskResult.success && !task.continueOnError) {
            if (verbose) {
                console.error(`Workflow stopped at task ${i + 1}`);
            }
            break;
        }
    }

    const allSuccess = taskResults.every(r => r.success);
    return {
        success: allSuccess,
        taskResults,
        context: workflowContext
    };
};

/**
 * Execute agent with LLM assistance
 * The LLM can help plan, execute, and interpret results
 */
const executeAgentWithLLM = async (agentConfig, userQuery, chatFunction, config = {}) => {
    const { verbose = false } = config;
    
    // Build initial context
    const context = {
        query: userQuery,
        timestamp: new Date().toISOString()
    };

    // If workflow is defined, execute it
    if (agentConfig.workflow && agentConfig.workflow.length > 0) {
        return await executeWorkflow(agentConfig.workflow, context, config);
    }

    // If tasks are defined but no workflow, let LLM decide which to run
    if (agentConfig.tasks && agentConfig.tasks.length > 0) {
        // Ask LLM to select appropriate task
        const taskNames = agentConfig.tasks.map((t, i) => `${i + 1}. ${t.name}: ${t.description || 'No description'}`).join('\n');
        const prompt = `Given the user query: "${userQuery}"\n\nAvailable tasks:\n${taskNames}\n\nWhich task number should be executed? Reply with just the number.`;
        
        const messages = [
            { role: 'system', content: 'You are a helpful task selection assistant. Reply with only the task number.' },
            { role: 'user', content: prompt }
        ];

        try {
            const response = await chatFunction(messages);
            const taskIndex = parseInt(response.trim()) - 1;

            if (taskIndex >= 0 && taskIndex < agentConfig.tasks.length) {
                const selectedTask = agentConfig.tasks[taskIndex];
                if (verbose) {
                    console.log(`LLM selected task: ${selectedTask.name}`);
                }
                return await executeTask(selectedTask, context, config);
            }
        } catch (error) {
            if (verbose) {
                console.error('Error in LLM task selection:', error.message);
            }
        }
    }

    return {
        success: false,
        error: 'No workflow or tasks to execute'
    };
};

/**
 * Resolve parameters by replacing placeholders with context values
 */
const resolveParams = (params, context) => {
    const resolved = {};
    
    for (const key in params) {
        let value = params[key];
        
        // Replace {{variable}} placeholders
        if (typeof value === 'string') {
            value = value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
                return context[varName] !== undefined ? context[varName] : match;
            });
        }
        
        resolved[key] = value;
    }
    
    return resolved;
};

/**
 * Evaluate a condition
 */
const evaluateCondition = (condition, context) => {
    // Simple condition evaluation
    // Format: "variable operator value" e.g., "count > 10"
    const parts = condition.split(' ');
    if (parts.length !== 3) {
        return true; // Invalid condition format, assume true
    }

    const [varName, operator, valueStr] = parts;
    const contextValue = context[varName];
    const targetValue = isNaN(valueStr) ? valueStr : parseFloat(valueStr);

    switch (operator) {
        case '>': return contextValue > targetValue;
        case '<': return contextValue < targetValue;
        case '>=': return contextValue >= targetValue;
        case '<=': return contextValue <= targetValue;
        case '==': return contextValue == targetValue;
        case '===': return contextValue === targetValue;
        case '!=': return contextValue != targetValue;
        case '!==': return contextValue !== targetValue;
        default: return true;
    }
};

module.exports = {
    executeStep,
    executeTask,
    executeWorkflow,
    executeAgentWithLLM,
    resolveParams,
    evaluateCondition
};
