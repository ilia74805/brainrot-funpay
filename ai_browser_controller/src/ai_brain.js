/**
 * AI Brain - Локальный ИИ для анализа и управления браузером
 * Использует WebLLM (Xenova/transformers) для работы прямо в браузере
 */

class AIBrain {
    constructor() {
        this.model = null;
        this.tokenizer = null;
        this.isLoaded = false;
        this.systemPrompt = `
Ты - ИИ-ассистент для управления браузером. 
Твои задачи:
1. Анализировать HTML-код страниц
2. Понимать вопросы и задачи
3. Принимать решения о действиях
4. Генерировать JavaScript-код для выполнения действий

Отвечай только на русском языке.
Форматируй ответы в JSON.
`;
    }

    /**
     * Загрузка локальной модели (Phi-2 или TinyLlama)
     */
    async loadModel(modelName = 'Xenova/phi-2') {
        console.log(`🤖 Загрузка модели ${modelName}...`);
        
        try {
            // Используем WebLLM от Xenova
            const { AutoModelForCausalLM, AutoTokenizer } = await import('@xenova/transformers');
            
            this.tokenizer = await AutoTokenizer.fromPretrained(modelName);
            this.model = await AutoModelForCausalLM.fromPretrained(modelName);
            
            this.isLoaded = true;
            console.log(`✅ Модель ${modelName} загружена!`);
            return true;
        } catch (error) {
            console.error('❌ Ошибка загрузки модели:', error);
            // Попробуем более легкую модель
            if (modelName !== 'Xenova/tiny-llama-1.1b') {
                return this.loadModel('Xenova/tiny-llama-1.1b');
            }
            return false;
        }
    }

    /**
     * Генерация ответа от ИИ
     */
    async generate(prompt, maxLength = 500) {
        if (!this.isLoaded) {
            await this.loadModel();
        }

        const fullPrompt = `${this.systemPrompt}\n\nПользователь: ${prompt}\nИИ:`;
        
        try {
            const inputs = this.tokenizer(fullPrompt, { return_tensors: 'pt' });
            const outputs = await this.model.generate(inputs, { 
                max_length: maxLength,
                num_return_sequences: 1,
                temperature: 0.7
            });
            
            const answer = this.tokenizer.decode(outputs[0], { skip_special_tokens: true });
            return this._cleanAnswer(answer);
        } catch (error) {
            console.error('Ошибка генерации:', error);
            return null;
        }
    }

    /**
     * Очистка ответа от лишнего текста
     */
    _cleanAnswer(answer) {
        // Удаляем повторение промпта
        const clean = answer.replace(this.systemPrompt, '');
        // Удаляем "Пользователь:" и "ИИ:"
        return clean.replace(/^(Пользователь:|User:|ИИ:|AI:)\s*/, '').trim();
    }

    /**
     * Анализ HTML-страницы
     */
    async analyzePage(html, url = '') {
        const prompt = `
Проанализируй этот HTML-код страницы ${url} и ответь в формате JSON:
{
  "type": "тип страницы (test/quiz/lesson/other)",
  "subject": "предмет (math/biology/physics/chemistry/history/other)",
  "questions": [
    {
      "text": "текст вопроса",
      "type": "тип (math_text/equation/multiple_choice/short_answer)",
      "difficulty": "сложность (easy/medium/hard)",
      "selector": "CSS-селектор элемента с вопросом"
    }
  ],
  "inputs": [
    {
      "selector": "CSS-селектор поля ввода",
      "type": "text/number/checkbox/radio/textarea",
      "related_question": "индекс связанного вопроса"
    }
  ],
  "submit_buttons": [
    {
      "selector": "CSS-селектор кнопки отправки",
      "text": "текст на кнопке"
    }
  ],
  "platform": "платформа (foxford/yandex_tutor/stepik/custom)"
}

HTML код:
${html.substring(0, 4000)}
`;

        const response = await this.generate(prompt, 1000);
        
        try {
            // Пытаемся распарсить JSON
            const jsonStart = response.indexOf('{');
            const jsonEnd = response.lastIndexOf('}') + 1;
            const jsonStr = response.substring(jsonStart, jsonEnd);
            return JSON.parse(jsonStr);
        } catch (e) {
            // Если не JSON, возвращаем текст
            return { 
                analysis: response,
                raw: true 
            };
        }
    }

    /**
     * Решение задачи
     */
    async solveProblem(question, context = {}) {
        const prompt = `
Реши эту задачу и ответь в формате JSON:
{
  "question": "${question}",
  "subject": "предмет",
  "type": "тип задачи",
  "solution": "подробное решение",
  "answer": "конечный ответ",
  "confidence": 0.0-1.0,
  "steps": ["шаг 1", "шаг 2", ...]
}

Вопрос: ${question}
${context.html ? `Контекст: ${context.html.substring(0, 500)}` : ''}
`;

        const response = await this.generate(prompt, 800);
        
        try {
            const jsonStart = response.indexOf('{');
            const jsonEnd = response.lastIndexOf('}') + 1;
            const jsonStr = response.substring(jsonStart, jsonEnd);
            return JSON.parse(jsonStr);
        } catch (e) {
            return { 
                question: question,
                answer: response,
                confidence: 0.5 
            };
        }
    }

    /**
     * Генерация плана действий
     */
    async generateActionPlan(analysis, answers) {
        const prompt = `
На основе анализа страницы и решённых задач, сгенерируй план действий в формате JSON:
{
  "actions": [
    {
      "type": "fill_input",
      "selector": "CSS-селектор",
      "value": "значение для ввода",
      "description": "описание действия"
    },
    {
      "type": "click",
      "selector": "CSS-селектор",
      "description": "описание действия"
    },
    {
      "type": "wait",
      "milliseconds": 1000,
      "description": "ожидание"
    },
    {
      "type": "navigate",
      "url": "URL для перехода",
      "description": "навигация"
    }
  ],
  "expected_result": "что должно произойти после выполнения"
}

Анализ страницы: ${JSON.stringify(analysis)}
Ответы: ${JSON.stringify(answers)}
`;

        const response = await this.generate(prompt, 1000);
        
        try {
            const jsonStart = response.indexOf('{');
            const jsonEnd = response.lastIndexOf('}') + 1;
            const jsonStr = response.substring(jsonStart, jsonEnd);
            return JSON.parse(jsonStr);
        } catch (e) {
            return { 
                actions: [],
                error: 'Не удалось сгенерировать план' 
            };
        }
    }

    /**
     * Генерация JavaScript-кода для выполнения действий
     */
    async generateExecutionCode(actions) {
        const jsActions = actions.map(action => {
            switch (action.type) {
                case 'fill_input':
                    return `document.querySelector('${action.selector}').value = '${action.value}';`;
                case 'click':
                    return `document.querySelector('${action.selector}').click();`;
                case 'wait':
                    return `await new Promise(resolve => setTimeout(resolve, ${action.milliseconds}));`;
                case 'navigate':
                    return `window.location.href = '${action.url}';`;
                default:
                    return `// Unknown action: ${action.type}`;
            }
        }).join('\n');

        return `
(async () => {
    try {
        ${jsActions}
        console.log('✅ Все действия выполнены');
        return { success: true };
    } catch (error) {
        console.error('❌ Ошибка:', error);
        return { success: false, error: error.message };
    }
})();
`;
    }

    /**
     * Полный цикл: анализ → решение → действия
     */
    async fullAnalysisAndSolution(html, url = '') {
        // Шаг 1: Анализ страницы
        const analysis = await this.analyzePage(html, url);
        
        if (analysis.raw) {
            // Если анализ не в JSON, пробуем простой метод
            return this._simpleAnalysis(html);
        }
        
        // Шаг 2: Решение задач
        const answers = [];
        if (analysis.questions && analysis.questions.length > 0) {
            for (const [index, question] of analysis.questions.entries()) {
                const solution = await this.solveProblem(question.text, { html });
                answers.push({
                    question_index: index,
                    answer: solution.answer,
                    solution: solution.solution
                });
            }
        }
        
        // Шаг 3: Генерация плана действий
        const actionPlan = await this.generateActionPlan(analysis, answers);
        
        // Шаг 4: Генерация кода
        const executionCode = await this.generateExecutionCode(actionPlan.actions);
        
        return {
            analysis,
            answers,
            actionPlan,
            executionCode,
            success: true
        };
    }

    /**
     * Простой анализ (если ИИ не справился)
     */
    _simpleAnalysis(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        
        const inputs = Array.from(doc.querySelectorAll('input, textarea, select'))
            .map(input => ({
                selector: this._getCssSelector(input),
                type: input.type || input.tagName.toLowerCase(),
                id: input.id,
                name: input.name,
                placeholder: input.placeholder
            }));
        
        const questions = Array.from(doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6'))
            .filter(el => {
                const text = el.textContent.trim();
                return text.length > 10 && 
                       (text.includes('?') || 
                        /[\d\+\-\*\/\^=()\s\u0430-\u044f]+/.test(text));
            })
            .map(el => ({
                text: el.textContent.trim(),
                selector: this._getCssSelector(el)
            }));
        
        const submitButtons = Array.from(doc.querySelectorAll('button, input[type="submit"]'))
            .filter(btn => {
                const text = (btn.textContent || btn.value || '').toLowerCase();
                return text.includes('ответить') || 
                       text.includes('submit') || 
                       text.includes('проверка') || 
                       text.includes('check') ||
                       text.includes('отправить');
            })
            .map(btn => ({
                selector: this._getCssSelector(btn),
                text: btn.textContent || btn.value
            }));
        
        return {
            type: 'unknown',
            subject: 'unknown',
            questions,
            inputs,
            submit_buttons: submitButtons,
            platform: 'custom'
        };
    }

    /**
     * Получение CSS-селектора для элемента
     */
    _getCssSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        if (element.className) {
            const classes = element.className.split(' ').filter(c => c);
            if (classes.length > 0) {
                return `.${classes.join('.')}`;
            }
        }
        return element.tagName.toLowerCase();
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIBrain;
} else if (typeof window !== 'undefined') {
    window.AIBrain = AIBrain;
}
