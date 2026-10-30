// Auto Test Solver - Automatically solves and submits test answers
// Works with Foxford, Yandex.Tutor, Stepik, and other educational platforms

const AutoTestSolver = {
    // Platform-specific selectors and behavior
    platforms: {
        foxford: {
            name: 'Foxford',
            taskSelectors: [
                '.task__text',
                '.problem-statement',
                '.question-text',
                '.task-content',
                '[class*="task"][class*="text"]',
                '.mathjax',
                '.katex'
            ],
            inputSelectors: [
                'input[type="text"]',
                'input[type="number"]',
                'textarea',
                '[class*="answer"][type="text"]',
                '[class*="input"][type="text"]',
                '.answer-input input',
                '.math-input input'
            ],
            submitSelectors: [
                'button[type="submit"]',
                'button:contains("Проверить")',
                'button:contains("Отправить")',
                'button:contains("Check")',
                'button:contains("Submit")',
                '.btn-submit',
                '.check-button',
                '[class*="submit"]'
            ],
            answerFormat: 'exact', // exact, fraction, decimal, integer
            delayBetweenActions: 1000,
            maxAttempts: 3
        },
        yandexTutor: {
            name: 'Yandex.Tutor',
            taskSelectors: [
                '.task__statement',
                '.problem-viewer__content',
                '.math-viewer',
                '.task-text'
            ],
            inputSelectors: [
                'input.answer-input',
                'textarea.answer-input',
                '[data-test-id="answer-input"]'
            ],
            submitSelectors: [
                'button:contains("Проверить")',
                '[data-test-id="check-button"]'
            ],
            answerFormat: 'flexible',
            delayBetweenActions: 1500,
            maxAttempts: 2
        },
        stepik: {
            name: 'Stepik',
            taskSelectors: [
                '.problem__statement',
                '.problem-view',
                '.math',
                '.problem-text'
            ],
            inputSelectors: [
                'input.problem__answer',
                'textarea.problem__answer',
                '[class*="answer"] input',
                '[class*="answer"] textarea'
            ],
            submitSelectors: [
                'button:contains("Submit")',
                'button:contains("Check")',
                '.submit-button'
            ],
            answerFormat: 'flexible',
            delayBetweenActions: 2000,
            maxAttempts: 3
        },
        default: {
            name: 'Generic',
            taskSelectors: [
                '.task',
                '.problem',
                '.question',
                '[class*="task"]',
                '[class*="problem"]',
                '[class*="question"]'
            ],
            inputSelectors: [
                'input[type="text"]',
                'input[type="number"]',
                'textarea'
            ],
            submitSelectors: [
                'button[type="submit"]',
                'button:contains("Проверить")',
                'button:contains("Отправить")',
                'button:contains("Check")',
                'button:contains("Submit")'
            ],
            answerFormat: 'flexible',
            delayBetweenActions: 1000,
            maxAttempts: 3
        }
    },
    
    // Current state
    isRunning: false,
    currentPlatform: null,
    solvedCount: 0,
    failedCount: 0,
    
    // Start auto-solving
    start: function() {
        if (this.isRunning) return false;
        
        this.isRunning = true;
        this.solvedCount = 0;
        this.failedCount = 0;
        
        console.log('⚡ Auto Test Solver started');
        
        // Detect platform
        this.currentPlatform = this.detectPlatform();
        console.log(`🎯 Detected platform: ${this.currentPlatform.name}`);
        
        // Start solving
        this.solveAllTasks();
        
        return true;
    },
    
    // Stop auto-solving
    stop: function() {
        this.isRunning = false;
        console.log('❌ Auto Test Solver stopped');
        return true;
    },
    
    // Detect current platform
    detectPlatform: function() {
        const url = window.location.href;
        
        if (url.includes('foxford')) return this.platforms.foxford;
        if (url.includes('yandex.tutor') || url.includes('tutor.yandex')) return this.platforms.yandexTutor;
        if (url.includes('stepik')) return this.platforms.stepik;
        
        return this.platforms.default;
    },
    
    // Find all tasks on the page
    findTasks: function() {
        const platform = this.currentPlatform;
        const tasks = [];
        
        // Try all task selectors
        for (const selector of platform.taskSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const text = el.textContent?.trim();
                    if (text && !tasks.some(t => t.text === text)) {
                        tasks.push({
                            element: el,
                            text: text,
                            selector: selector
                        });
                    }
                });
            } catch (e) {
                // Selector might be invalid
            }
        }
        
        // Also look for MathJax/KaTeX elements
        const mathElements = document.querySelectorAll('.mathjax, .katex, [class*="math"]');
        mathElements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && !tasks.some(t => t.text === text)) {
                tasks.push({
                    element: el,
                    text: text,
                    selector: 'math'
                });
            }
        });
        
        return tasks;
    },
    
    // Find all answer inputs
    findAnswerInputs: function() {
        const platform = this.currentPlatform;
        const inputs = [];
        
        for (const selector of platform.inputSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (!el.readOnly && !el.disabled && !inputs.includes(el)) {
                        inputs.push(el);
                    }
                });
            } catch (e) {
                // Selector might be invalid
            }
        }
        
        return inputs;
    },
    
    // Find submit button
    findSubmitButton: function() {
        const platform = this.currentPlatform;
        
        for (const selector of platform.submitSelectors) {
            try {
                // Handle :contains pseudo-selector
                if (selector.includes(':contains(')) {
                    const text = selector.match(/:contains\("([^"]+)"\)/)?.[1];
                    if (text) {
                        const buttons = document.querySelectorAll('button');
                        for (const btn of buttons) {
                            if (btn.textContent?.toLowerCase().includes(text.toLowerCase())) {
                                return btn;
                            }
                        }
                    }
                } else {
                    const btn = document.querySelector(selector);
                    if (btn) return btn;
                }
            } catch (e) {
                // Selector might be invalid
            }
        }
        
        return null;
    },
    
    // Solve all tasks on the page
    solveAllTasks: function() {
        if (!this.isRunning) return;
        
        const tasks = this.findTasks();
        const inputs = this.findAnswerInputs();
        
        console.log(`📋 Found ${tasks.length} tasks and ${inputs.length} answer fields`);
        
        if (tasks.length === 0 || inputs.length === 0) {
            console.log('⚠️ No tasks or answer fields found');
            this.isRunning = false;
            return;
        }
        
        // Try to match tasks with inputs
        this.matchTasksWithInputs(tasks, inputs);
    },
    
    // Match tasks with answer inputs
    matchTasksWithInputs: function(tasks, inputs) {
        const platform = this.currentPlatform;
        
        // Try to find inputs near tasks
        for (const task of tasks) {
            // Find the closest input to this task
            let closestInput = null;
            let minDistance = Infinity;
            
            for (const input of inputs) {
                if (inputs.filter(i => i !== input).some(i => i === closestInput)) continue;
                
                const taskRect = task.element.getBoundingClientRect();
                const inputRect = input.getBoundingClientRect();
                
                // Calculate distance between elements
                const distance = Math.sqrt(
                    Math.pow(taskRect.left - inputRect.left, 2) +
                    Math.pow(taskRect.top - inputRect.top, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestInput = input;
                }
            }
            
            if (closestInput && !closestInput.dataset.solved) {
                // Solve this task
                this.solveAndFillTask(task, closestInput);
            }
        }
        
        // Check if we've filled all inputs
        const filledInputs = inputs.filter(i => i.value && i.value.trim());
        if (filledInputs.length === inputs.length) {
            // All inputs filled, try to submit
            setTimeout(() => this.trySubmit(), platform.delayBetweenActions);
        }
    },
    
    // Solve a single task and fill the answer
    solveAndFillTask: function(task, input) {
        const platform = this.currentPlatform;
        const taskText = task.text;
        
        console.log(`🔍 Solving task: "${taskText.substring(0, 100)}..."`);
        
        // Try AI solver first
        const solution = AISolver.solve(taskText);
        
        if (solution && solution.result !== null && solution.result !== undefined) {
            // Format the answer according to platform requirements
            const formattedAnswer = this.formatAnswer(solution.result, platform.answerFormat);
            
            // Fill the input
            this.fillInput(input, formattedAnswer);
            
            console.log(`✅ Solved: ${taskText.substring(0, 50)}... → ${formattedAnswer}`);
            this.solvedCount++;
        } else {
            // Try to extract expression from task
            const exprMatch = taskText.match(/([\d\s\+\-\*\/\^().\/]+)/);
            if (exprMatch) {
                const result = Calculator.evaluate(exprMatch[1]);
                if (result !== null) {
                    const formattedAnswer = this.formatAnswer(result, platform.answerFormat);
                    this.fillInput(input, formattedAnswer);
                    console.log(`✅ Solved (expr): ${exprMatch[1]} → ${formattedAnswer}`);
                    this.solvedCount++;
                } else {
                    console.log(`❌ Failed to solve: ${taskText.substring(0, 50)}...`);
                    this.failedCount++;
                }
            } else {
                console.log(`❌ Failed to solve: ${taskText.substring(0, 50)}...`);
                this.failedCount++;
            }
        }
        
        // Mark input as solved
        input.dataset.solved = 'true';
        
        // Continue with next task
        setTimeout(() => this.solveAllTasks(), platform.delayBetweenActions);
    },
    
    // Fill input with answer
    fillInput: function(input, answer) {
        try {
            // Clear existing value
            input.value = '';
            
            // Trigger input events for React/Angular/Vue
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
            
            // Set value
            input.value = answer;
            
            // Trigger more events
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('blur', { bubbles: true }));
            input.dispatchEvent(new Event('keyup', { bubbles: true, key: 'Enter' }));
            
            console.log(`📝 Filled input with: ${answer}`);
        } catch (e) {
            console.error('❌ Error filling input:', e);
        }
    },
    
    // Format answer according to platform requirements
    formatAnswer: function(result, format) {
        if (typeof result === 'string') {
            return result;
        }
        
        if (format === 'integer') {
            return Math.round(result).toString();
        }
        
        if (format === 'fraction') {
            // Try to convert to fraction
            if (Number.isInteger(result)) {
                return result.toString();
            }
            
            // For decimal results, try to find a simple fraction
            const tol = 0.0001;
            for (let denom = 1; denom <= 100; denom++) {
                for (let numer = -1000; numer <= 1000; numer++) {
                    if (Math.abs(numer / denom - result) < tol) {
                        return `${numer}/${denom}`;
                    }
                }
            }
            return result.toString();
        }
        
        if (format === 'exact') {
            // Keep as precise as possible
            if (Number.isInteger(result)) {
                return result.toString();
            }
            return result.toString();
        }
        
        // Flexible format - try to detect what's expected
        if (Number.isInteger(result)) {
            return result.toString();
        }
        
        // Check if it's a simple fraction
        const asString = result.toString();
        if (asString.includes('/')) {
            return asString;
        }
        
        // Round to reasonable precision
        const rounded = Math.round(result * 1000) / 1000;
        if (rounded === Math.round(rounded)) {
            return Math.round(rounded).toString();
        }
        return rounded.toString().replace(/\.?0+$/, '');
    },
    
    // Try to submit the form
    trySubmit: function() {
        const platform = this.currentPlatform;
        const submitBtn = this.findSubmitButton();
        
        if (submitBtn) {
            console.log('📤 Submitting answers...');
            
            // Click the button
            submitBtn.click();
            
            // Also trigger events
            submitBtn.dispatchEvent(new Event('click', { bubbles: true }));
            
            // Check if there are any errors after submission
            setTimeout(() => this.checkForErrors(), 2000);
        } else {
            console.log('⚠️ No submit button found');
            this.isRunning = false;
        }
    },
    
    // Check for errors after submission
    checkForErrors: function() {
        // Look for error messages
        const errorSelectors = [
            '.error',
            '.alert-danger',
            '.alert-error',
            '.validation-error',
            '[class*="error"]',
            '[class*="invalid"]'
        ];
        
        for (const selector of errorSelectors) {
            const errors = document.querySelectorAll(selector);
            if (errors.length > 0) {
                console.log('⚠️ Errors found after submission');
                // Try to re-solve with different answer formats
                this.retryWithDifferentFormats();
                return;
            }
        }
        
        // Check for success messages
        const successSelectors = [
            '.success',
            '.alert-success',
            '.correct',
            '[class*="success"]',
            '[class*="correct"]'
        ];
        
        for (const selector of successSelectors) {
            const successes = document.querySelectorAll(selector);
            if (successes.length > 0) {
                console.log('✅ Submission successful!');
                this.isRunning = false;
                return;
            }
        }
        
        console.log('ℹ️ No clear feedback from submission');
        this.isRunning = false;
    },
    
    // Retry with different answer formats
    retryWithDifferentFormats: function() {
        const inputs = this.findAnswerInputs().filter(i => i.dataset.solved === 'true');
        
        for (const input of inputs) {
            const originalValue = input.value;
            
            // Try different formats
            const formats = ['integer', 'fraction', 'exact', 'flexible'];
            let foundBetter = false;
            
            for (const format of formats) {
                if (foundBetter) break;
                
                try {
                    const num = parseFloat(originalValue);
                    if (isNaN(num)) continue;
                    
                    const formatted = this.formatAnswer(num, format);
                    if (formatted !== originalValue) {
                        this.fillInput(input, formatted);
                        foundBetter = true;
                        console.log(`🔄 Retrying with format ${format}: ${formatted}`);
                    }
                } catch (e) {
                    // Try next format
                }
            }
        }
        
        // Try to submit again
        setTimeout(() => this.trySubmit(), 2000);
    },
    
    // Auto-detect and solve new tasks (for dynamic pages)
    startObserver: function() {
        if (this.observer) this.observer.disconnect();
        
        this.observer = new MutationObserver((mutations) => {
            if (!this.isRunning) return;
            
            // Check for new tasks or inputs
            for (const mutation of mutations) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // New content added, try to solve
                    setTimeout(() => this.solveAllTasks(), 1000);
                    break;
                }
            }
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },
    
    // Stop observer
    stopObserver: function() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    },
    
    // Get statistics
    getStats: function() {
        return {
            solved: this.solvedCount,
            failed: this.failedCount,
            isRunning: this.isRunning,
            platform: this.currentPlatform?.name || 'Unknown'
        };
    },
    
    // Solve current page (public method)
    solvePage: function() {
        this.start();
        this.startObserver();
    },
    
    // Stop solving (public method)
    stopSolving: function() {
        this.stop();
        this.stopObserver();
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.AutoTestSolver = AutoTestSolver;
}
