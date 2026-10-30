// DOM Analyzer - Understands page structure and extracts test questions
// Can read HTML, analyze forms, and understand test logic

const DOMAnalyzer = {
    // Analyze entire page structure
    analyzePage: function() {
        const analysis = {
            title: document.title,
            url: window.location.href,
            forms: [],
            questions: [],
            inputs: [],
            buttons: [],
            testType: null,
            platform: this.detectPlatform(),
            difficulty: 'unknown',
            subject: this.detectSubject()
        };
        
        // Analyze forms
        analysis.forms = this.analyzeForms();
        
        // Analyze questions
        analysis.questions = this.extractQuestions();
        
        // Analyze inputs
        analysis.inputs = this.extractInputs();
        
        // Analyze buttons
        analysis.buttons = this.extractButtons();
        
        // Detect test type
        analysis.testType = this.detectTestType(analysis);
        
        // Try to understand test logic
        analysis.testLogic = this.analyzeTestLogic(analysis);
        
        return analysis;
    },
    
    // Detect platform
    detectPlatform: function() {
        const url = window.location.href.toLowerCase();
        const html = document.documentElement.outerHTML.toLowerCase();
        
        if (url.includes('foxford') || html.includes('foxford')) return 'foxford';
        if (url.includes('yandex') || html.includes('yandex')) return 'yandex';
        if (url.includes('stepik') || html.includes('stepik')) return 'stepik';
        if (url.includes('skillbox') || html.includes('skillbox')) return 'skillbox';
        if (url.includes('geekbrains') || html.includes('geekbrains')) return 'geekbrains';
        if (url.includes('coursera') || html.includes('coursera')) return 'coursera';
        if (url.includes('udemy') || html.includes('udemy')) return 'udemy';
        if (url.includes('test') || html.includes('test')) return 'generic_test';
        if (url.includes('exam') || html.includes('exam')) return 'exam';
        if (url.includes('quiz') || html.includes('quiz')) return 'quiz';
        
        return 'unknown';
    },
    
    // Detect subject
    detectSubject: function() {
        const text = document.body.textContent.toLowerCase();
        const url = window.location.href.toLowerCase();
        
        // Math
        if (text.includes('математика') || text.includes('math') || 
            text.includes('алгебра') || text.includes('геометрия') ||
            text.includes('уравнение') || text.includes('equation')) {
            return 'math';
        }
        
        // Biology
        if (text.includes('биология') || text.includes('biology') || 
            text.includes('клетка') || text.includes('cell') ||
            text.includes('организм') || text.includes('organism') ||
            text.includes('днк') || text.includes('dna') ||
            text.includes('генетика') || text.includes('genetics') ||
            text.includes('эволюция') || text.includes('evolution') ||
            text.includes('анатомия') || text.includes('anatomy') ||
            text.includes('физиология') || text.includes('physiology') ||
            text.includes('ботаника') || text.includes('botany') ||
            text.includes('зоология') || text.includes('zoology')) {
            return 'biology';
        }
        
        // Physics
        if (text.includes('физика') || text.includes('physics') || 
            text.includes('сила') || text.includes('force') ||
            text.includes('энергия') || text.includes('energy') ||
            text.includes('скорость') || text.includes('velocity')) {
            return 'physics';
        }
        
        // Chemistry
        if (text.includes('химия') || text.includes('chemistry') || 
            text.includes('реакция') || text.includes('reaction') ||
            text.includes('вещество') || text.includes('substance') ||
            text.includes('молекула') || text.includes('molecule')) {
            return 'chemistry';
        }
        
        // History
        if (text.includes('история') || text.includes('history') || 
            text.includes('год') || text.includes('year') ||
            text.includes('век') || text.includes('century')) {
            return 'history';
        }
        
        // Russian
        if (text.includes('русский') || text.includes('russian') || 
            text.includes('язык') || text.includes('language') ||
            text.includes('грамматика') || text.includes('grammar')) {
            return 'russian';
        }
        
        // English
        if (text.includes('english') || text.includes('английский') ||
            text.includes('grammar') || text.includes('vocabulary')) {
            return 'english';
        }
        
        // Informatics
        if (text.includes('информатика') || text.includes('informatics') || 
            text.includes('программирование') || text.includes('programming') ||
            text.includes('алгоритм') || text.includes('algorithm') ||
            text.includes('код') || text.includes('code')) {
            return 'informatics';
        }
        
        return 'unknown';
    },
    
    // Analyze all forms on page
    analyzeForms: function() {
        const forms = [];
        const formElements = document.querySelectorAll('form');
        
        formElements.forEach(form => {
            const formData = {
                id: form.id,
                className: form.className,
                action: form.action,
                method: form.method,
                inputs: [],
                buttons: [],
                name: form.getAttribute('name') || ''
            };
            
            // Get all inputs in form
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                formData.inputs.push({
                    type: input.type || input.tagName.toLowerCase(),
                    name: input.name,
                    id: input.id,
                    className: input.className,
                    value: input.value,
                    placeholder: input.placeholder
                });
            });
            
            // Get all buttons in form
            const buttons = form.querySelectorAll('button, input[type="submit"], input[type="button"]');
            buttons.forEach(btn => {
                formData.buttons.push({
                    type: btn.type,
                    text: btn.textContent?.trim() || btn.value || '',
                    className: btn.className
                });
            });
            
            forms.push(formData);
        });
        
        return forms;
    },
    
    // Extract all questions from page
    extractQuestions: function() {
        const questions = [];
        const text = document.body.textContent;
        
        // Pattern 1: Questions with question marks
        const questionPattern = /([А-ЯA-Z][^.!?]*[?])/g;
        const matches = text.match(questionPattern) || [];
        
        matches.forEach((match, index) => {
            // Clean up the question
            const cleanMatch = match
                .replace(/\s+/g, ' ')
                .trim();
            
            if (cleanMatch.length > 10) { // Filter out short matches
                questions.push({
                    id: `q_${index}`,
                    text: cleanMatch,
                    type: this.detectQuestionType(cleanMatch),
                    element: null
                });
            }
        });
        
        // Pattern 2: Questions in specific elements
        const questionSelectors = [
            '.question',
            '.task',
            '.problem',
            '.test-question',
            '.quiz-question',
            '.question-text',
            '.task-text',
            '.problem-statement',
            '[class*="question"]',
            '[class*="task"]',
            '[class*="problem"]'
        ];
        
        questionSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
                const text = el.textContent?.trim();
                if (text && text.length > 10) {
                    // Check if we already have this question
                    const exists = questions.some(q => 
                        q.text === text || 
                        (q.text && text && q.text.includes(text)) ||
                        (q.text && text && text.includes(q.text))
                    );
                    
                    if (!exists) {
                        questions.push({
                            id: `elem_${selector.replace(/[^a-z]/g, '')}_${index}`,
                            text: text,
                            type: this.detectQuestionType(text),
                            element: el
                        });
                    }
                }
            });
        });
        
        // Pattern 3: Math expressions
        const mathPattern = /(\$[^$]+\$|\\{[^}]+\\}|\\begin{[^}]+}[^\\]+\\end{[^}]+}|[\d\s\+\-\*\/\^().=]+)/g;
        const mathMatches = text.match(mathPattern) || [];
        
        mathMatches.forEach((match, index) => {
            const cleanMatch = match
                .replace(/\s+/g, ' ')
                .replace(/^\$|\$$/g, '')
                .replace(/\\{|\\}/g, '')
                .trim();
            
            if (cleanMatch.length > 3) {
                const exists = questions.some(q => q.text === cleanMatch);
                if (!exists) {
                    questions.push({
                        id: `math_${index}`,
                        text: cleanMatch,
                        type: 'math_expression',
                        element: null
                    });
                }
            }
        });
        
        return questions;
    },
    
    // Detect question type
    detectQuestionType: function(text) {
        const lowerText = text.toLowerCase();
        
        // Multiple choice
        if (lowerText.includes('выберите') || lowerText.includes('select') ||
            lowerText.includes('укажите') || lowerText.includes('choose') ||
            lowerText.includes('отметьте') || lowerText.includes('mark')) {
            return 'multiple_choice';
        }
        
        // True/False
        if (lowerText.includes('верно') || lowerText.includes('неверно') ||
            lowerText.includes('true') || lowerText.includes('false') ||
            lowerText.includes('да') || lowerText.includes('нет') ||
            lowerText.includes('yes') || lowerText.includes('no')) {
            return 'true_false';
        }
        
        // Short answer
        if (lowerText.includes('введите') || lowerText.includes('enter') ||
            lowerText.includes('напишите') || lowerText.includes('write') ||
            lowerText.includes('ответ') || lowerText.includes('answer') ||
            lowerText.includes('заполните') || lowerText.includes('fill')) {
            return 'short_answer';
        }
        
        // Math problem
        if (/[\d\+\-\*\/\^=()\s]+/.test(text) ||
            lowerText.includes('решите') || lowerText.includes('solve') ||
            lowerText.includes('найдите') || lowerText.includes('find') ||
            lowerText.includes('вычислите') || lowerText.includes('calculate')) {
            return 'math_problem';
        }
        
        // Matching
        if (lowerText.includes('соотнесите') || lowerText.includes('match') ||
            lowerText.includes('сопоставьте') || lowerText.includes('pair')) {
            return 'matching';
        }
        
        // Essay
        if (lowerText.includes('напишите сочинение') || lowerText.includes('write essay') ||
            lowerText.includes('развернутый ответ') || lowerText.includes('detailed answer')) {
            return 'essay';
        }
        
        // Default
        return 'unknown';
    },
    
    // Extract all inputs
    extractInputs: function() {
        const inputs = [];
        
        const inputSelectors = [
            'input[type="text"]',
            'input[type="number"]',
            'input[type="email"]',
            'input[type="password"]',
            'textarea',
            'select',
            'input[type="radio"]',
            'input[type="checkbox"]',
            '[class*="input"]',
            '[class*="answer"]',
            '[class*="field"]',
            '.answer-input',
            '.math-input',
            '.text-input'
        ];
        
        inputSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    // Skip if already added
                    if (inputs.some(i => i.element === el)) return;
                    
                    inputs.push({
                        element: el,
                        type: el.type || el.tagName.toLowerCase(),
                        name: el.name,
                        id: el.id,
                        className: el.className,
                        value: el.value,
                        placeholder: el.placeholder,
                        required: el.required,
                        disabled: el.disabled,
                        readonly: el.readOnly
                    });
                });
            } catch (e) {
                // Invalid selector
            }
        });
        
        return inputs;
    },
    
    // Extract all buttons
    extractButtons: function() {
        const buttons = [];
        
        const buttonSelectors = [
            'button',
            'input[type="submit"]',
            'input[type="button"]',
            '[class*="btn"]',
            '[class*="button"]',
            '[class*="submit"]',
            '[class*="check"]',
            '[class*="next"]',
            '[class*="prev"]'
        ];
        
        buttonSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    // Skip if already added
                    if (buttons.some(b => b.element === el)) return;
                    
                    const text = el.textContent?.trim() || el.value || '';
                    
                    buttons.push({
                        element: el,
                        type: el.type || 'button',
                        text: text,
                        className: el.className,
                        id: el.id,
                        action: this.detectButtonAction(text)
                    });
                });
            } catch (e) {
                // Invalid selector
            }
        });
        
        return buttons;
    },
    
    // Detect button action
    detectButtonAction: function(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('проверить') || lowerText.includes('check') ||
            lowerText.includes('отправить') || lowerText.includes('submit') ||
            lowerText.includes('сохранить') || lowerText.includes('save') ||
            lowerText.includes('готово') || lowerText.includes('done')) {
            return 'submit';
        }
        
        if (lowerText.includes('далее') || lowerText.includes('next') ||
            lowerText.includes('следующий') || lowerText.includes('continue')) {
            return 'next';
        }
        
        if (lowerText.includes('назад') || lowerText.includes('back') ||
            lowerText.includes('предыдущий') || lowerText.includes('previous')) {
            return 'previous';
        }
        
        if (lowerText.includes('пропустить') || lowerText.includes('skip') ||
            lowerText.includes('не знаю') || lowerText.includes("don't know")) {
            return 'skip';
        }
        
        if (lowerText.includes('начать') || lowerText.includes('start') ||
            lowerText.includes('начать тест') || lowerText.includes('begin')) {
            return 'start';
        }
        
        if (lowerText.includes('закончить') || lowerText.includes('finish') ||
            lowerText.includes('выйти') || lowerText.includes('exit')) {
            return 'finish';
        }
        
        return 'unknown';
    },
    
    // Detect test type
    detectTestType: function(analysis) {
        const {forms, questions, inputs, buttons} = analysis;
        
        // Single page test
        if (questions.length > 0 && inputs.length > 0 && 
            buttons.some(b => b.action === 'submit')) {
            return 'single_page';
        }
        
        // Multi-page test
        if (questions.length > 0 && 
            buttons.some(b => b.action === 'next') &&
            buttons.some(b => b.action === 'previous')) {
            return 'multi_page';
        }
        
        // Quiz with immediate feedback
        if (buttons.some(b => b.action === 'check') &&
            inputs.length > 0) {
            return 'immediate_feedback';
        }
        
        // Form-based test
        if (forms.length > 0) {
            return 'form_based';
        }
        
        // Unknown
        return 'unknown';
    },
    
    // Analyze test logic
    analyzeTestLogic: function(analysis) {
        const {testType, questions, inputs, buttons} = analysis;
        const logic = {
            type: testType,
            steps: [],
            canAutoSolve: false,
            autoSolveStrategy: null
        };
        
        switch (testType) {
            case 'single_page':
                logic.canAutoSolve = true;
                logic.autoSolveStrategy = 'solve_all_and_submit';
                logic.steps = [
                    {action: 'extract_questions', description: 'Извлечь все вопросы'},
                    {action: 'solve_questions', description: 'Решить все вопросы'},
                    {action: 'fill_answers', description: 'Заполнить все ответы'},
                    {action: 'submit', description: 'Отправить тест'}
                ];
                break;
                
            case 'multi_page':
                logic.canAutoSolve = true;
                logic.autoSolveStrategy = 'solve_page_by_page';
                logic.steps = [
                    {action: 'extract_questions', description: 'Извлечь вопросы текущей страницы'},
                    {action: 'solve_questions', description: 'Решить вопросы'},
                    {action: 'fill_answers', description: 'Заполнить ответы'},
                    {action: 'check_answers', description: 'Проверить ответы (если возможно)'},
                    {action: 'go_to_next', description: 'Перейти на следующую страницу'},
                    {action: 'repeat', description: 'Повторить для всех страниц'}
                ];
                break;
                
            case 'immediate_feedback':
                logic.canAutoSolve = true;
                logic.autoSolveStrategy = 'solve_and_check';
                logic.steps = [
                    {action: 'extract_questions', description: 'Извлечь вопросы'},
                    {action: 'solve_questions', description: 'Решить вопросы'},
                    {action: 'fill_answers', description: 'Заполнить ответы'},
                    {action: 'check', description: 'Проверить ответы'},
                    {action: 'correct_errors', description: 'Исправить ошибки'}
                ];
                break;
                
            case 'form_based':
                logic.canAutoSolve = true;
                logic.autoSolveStrategy = 'fill_form_and_submit';
                logic.steps = [
                    {action: 'analyze_form', description: 'Анализировать форму'},
                    {action: 'fill_form', description: 'Заполнить форму'},
                    {action: 'submit_form', description: 'Отправить форму'}
                ];
                break;
        }
        
        return logic;
    },
    
    // Get question-answer pairs
    getQuestionAnswerPairs: function() {
        const analysis = this.analyzePage();
        const pairs = [];
        
        // Try to match questions with inputs
        analysis.questions.forEach(question => {
            // Find closest input
            if (question.element) {
                const inputs = this.findClosestInputs(question.element);
                inputs.forEach(input => {
                    pairs.push({
                        question: question.text,
                        questionType: question.type,
                        answerInput: input.element,
                        answerType: input.type
                    });
                });
            } else {
                // Try to find input by position
                const allInputs = this.extractInputs();
                const allQuestions = this.extractQuestions();
                const questionIndex = allQuestions.findIndex(q => q.text === question.text);
                
                if (allInputs[questionIndex]) {
                    pairs.push({
                        question: question.text,
                        questionType: question.type,
                        answerInput: allInputs[questionIndex].element,
                        answerType: allInputs[questionIndex].type
                    });
                }
            }
        });
        
        return pairs;
    },
    
    // Find closest inputs to an element
    findClosestInputs: function(element) {
        const allInputs = this.extractInputs();
        const elementRect = element.getBoundingClientRect();
        
        // Calculate distances and sort
        const inputsWithDistance = allInputs.map(input => {
            const inputRect = input.element.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(elementRect.left - inputRect.left, 2) +
                Math.pow(elementRect.top - inputRect.top, 2)
            );
            return {input, distance};
        });
        
        inputsWithDistance.sort((a, b) => a.distance - b.distance);
        
        // Return top 3 closest inputs
        return inputsWithDistance.slice(0, 3).map(i => i.input);
    },
    
    // Get full page structure as JSON
    getPageStructure: function() {
        return {
            page: this.analyzePage(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.DOMAnalyzer = DOMAnalyzer;
}
