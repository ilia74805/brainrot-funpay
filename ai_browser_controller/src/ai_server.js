/**
 * AI Server - Локальный сервер для ИИ-управления браузером
 * Запускается на localhost:3000
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const { AIBrain } = require('./ai_brain');
const { BrowserController } = require('./browser_controller');

class AIServer {
    constructor(port = 3000) {
        this.port = port;
        this.app = express();
        this.server = null;
        this.wss = null;
        this.aiBrain = new AIBrain();
        this.browserController = new BrowserController();
        this.clients = new Set();
    }

    /**
     * Запуск сервера
     */
    async start() {
        // Настраиваем middleware
        this.app.use(cors());
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

        // Загружаем ИИ-модель
        console.log('🤖 Загрузка ИИ-модели...');
        await this.aiBrain.loadModel();

        // Подключаемся к браузеру
        console.log('🌐 Подключение к браузеру...');
        await this.browserController.connectToExistingBrowser();

        // Настраиваем маршруты
        this._setupRoutes();

        // Запускаем HTTP-сервер
        this.server = this.app.listen(this.port, () => {
            console.log(`✅ AI Server запущен на http://localhost:${this.port}`);
        });

        // Запускаем WebSocket-сервер
        this.wss = new WebSocket.Server({ server: this.server });
        this._setupWebSocket();

        return this.server;
    }

    /**
     * Настройка маршрутов
     */
    _setupRoutes() {
        // Проверка статуса
        this.app.get('/api/status', (req, res) => {
            res.json({
                status: 'online',
                ai_loaded: this.aiBrain.isLoaded,
                browser_connected: this.browserController.connected,
                timestamp: new Date().toISOString()
            });
        });

        // Анализ страницы
        this.app.post('/api/analyze', async (req, res) => {
            try {
                const { html, url } = req.body;
                if (!html) {
                    return res.status(400).json({ error: 'HTML обязателен' });
                }

                const analysis = await this.aiBrain.analyzePage(html, url);
                res.json(analysis);
            } catch (error) {
                console.error('Ошибка анализа:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Решение задачи
        this.app.post('/api/solve', async (req, res) => {
            try {
                const { question, context } = req.body;
                if (!question) {
                    return res.status(400).json({ error: 'Вопрос обязателен' });
                }

                const solution = await this.aiBrain.solveProblem(question, context || {});
                res.json(solution);
            } catch (error) {
                console.error('Ошибка решения:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Полный анализ и решение
        this.app.post('/api/full-analysis', async (req, res) => {
            try {
                const { html, url } = req.body;
                if (!html) {
                    return res.status(400).json({ error: 'HTML обязателен' });
                }

                const result = await this.aiBrain.fullAnalysisAndSolution(html, url);
                res.json(result);
            } catch (error) {
                console.error('Ошибка полного анализа:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Генерация плана действий
        this.app.post('/api/action-plan', async (req, res) => {
            try {
                const { analysis, answers } = req.body;
                if (!analysis) {
                    return res.status(400).json({ error: 'Анализ обязателен' });
                }

                const plan = await this.aiBrain.generateActionPlan(analysis, answers || []);
                res.json(plan);
            } catch (error) {
                console.error('Ошибка генерации плана:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Генерация JavaScript-кода
        this.app.post('/api/execution-code', async (req, res) => {
            try {
                const { actions } = req.body;
                if (!actions || !Array.isArray(actions)) {
                    return res.status(400).json({ error: 'Действия обязательны' });
                }

                const code = await this.aiBrain.generateExecutionCode(actions);
                res.json({ code });
            } catch (error) {
                console.error('Ошибка генерации кода:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Управление браузером
        this.app.post('/api/browser/click', async (req, res) => {
            try {
                const { selector, x, y } = req.body;
                let success;
                
                if (selector) {
                    success = await this.browserController.clickElement(selector);
                } else if (x && y) {
                    success = await this.browserController.clickAtCoordinates(x, y);
                } else {
                    return res.status(400).json({ error: 'Нужно указать selector или координаты' });
                }

                res.json({ success });
            } catch (error) {
                console.error('Ошибка клика:', error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/browser/type', async (req, res) => {
            try {
                const { selector, text } = req.body;
                if (!selector || !text) {
                    return res.status(400).json({ error: 'Нужно указать selector и текст' });
                }

                const success = await this.browserController.typeTextPuppeteer(selector, text);
                res.json({ success });
            } catch (error) {
                console.error('Ошибка ввода текста:', error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/browser/submit', async (req, res) => {
            try {
                const { selector } = req.body;
                const success = await this.browserController.submitForm(selector);
                res.json({ success });
            } catch (error) {
                console.error('Ошибка отправки:', error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/browser/navigate', async (req, res) => {
            try {
                const { url } = req.body;
                if (!url) {
                    return res.status(400).json({ error: 'URL обязателен' });
                }

                const success = await this.browserController.navigateTo(url);
                res.json({ success });
            } catch (error) {
                console.error('Ошибка навигации:', error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/browser/html', async (req, res) => {
            try {
                const html = await this.browserController.getPageHTML();
                res.json({ html });
            } catch (error) {
                console.error('Ошибка получения HTML:', error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/browser/tabs', async (req, res) => {
            try {
                const tabs = await this.browserController.getAllTabs();
                res.json({ tabs });
            } catch (error) {
                console.error('Ошибка получения вкладок:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Выполнение полного цикла: анализ + решение + действия
        this.app.post('/api/auto-solve', async (req, res) => {
            try {
                const { url } = req.body;
                
                // Переходим на страницу
                if (url) {
                    await this.browserController.navigateTo(url);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                // Получаем HTML
                const html = await this.browserController.getPageHTML();
                if (!html) {
                    return res.status(400).json({ error: 'Не удалось получить HTML' });
                }

                // Полный анализ и решение
                const result = await this.aiBrain.fullAnalysisAndSolution(html, url);
                
                // Выполняем действия
                if (result.actionPlan && result.actionPlan.actions) {
                    for (const action of result.actionPlan.actions) {
                        switch (action.type) {
                            case 'fill_input':
                                await this.browserController.typeTextPuppeteer(
                                    action.selector, 
                                    action.value
                                );
                                await new Promise(resolve => setTimeout(resolve, 500));
                                break;
                            case 'click':
                                await this.browserController.clickElement(action.selector);
                                await new Promise(resolve => setTimeout(resolve, 500));
                                break;
                            case 'wait':
                                await new Promise(resolve => setTimeout(resolve, action.milliseconds));
                                break;
                            case 'navigate':
                                await this.browserController.navigateTo(action.url);
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                break;
                        }
                    }
                }

                res.json({
                    ...result,
                    executed: true,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Ошибка авто-решения:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Статистика
        this.app.get('/api/stats', (req, res) => {
            res.json({
                ai_model: this.aiBrain.isLoaded ? 'Loaded' : 'Not loaded',
                browser_connected: this.browserController.connected,
                clients: this.clients.size,
                uptime: process.uptime()
            });
        });
    }

    /**
     * Настройка WebSocket
     */
    _setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('🔗 Новое WebSocket-соединение');
            this.clients.add(ws);

            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    const { action, payload } = data;

                    switch (action) {
                        case 'analyze':
                            const analysis = await this.aiBrain.analyzePage(payload.html, payload.url);
                            ws.send(JSON.stringify({ action: 'analysis_result', data: analysis }));
                            break;
                        case 'solve':
                            const solution = await this.aiBrain.solveProblem(payload.question, payload.context);
                            ws.send(JSON.stringify({ action: 'solution_result', data: solution }));
                            break;
                        case 'execute':
                            // Выполняем JavaScript-код
                            const result = await this.browserController.executeScript(payload.code);
                            ws.send(JSON.stringify({ action: 'execution_result', data: result }));
                            break;
                        case 'browser_action':
                            // Выполняем действие браузера
                            const browserResult = await this._executeBrowserAction(payload);
                            ws.send(JSON.stringify({ action: 'browser_result', data: browserResult }));
                            break;
                        default:
                            ws.send(JSON.stringify({ error: 'Неизвестное действие' }));
                    }
                } catch (error) {
                    console.error('WebSocket ошибка:', error);
                    ws.send(JSON.stringify({ error: error.message }));
                }
            });

            ws.on('close', () => {
                console.log('🔴 WebSocket-соединение закрыто');
                this.clients.delete(ws);
            });
        });
    }

    /**
     * Выполнение действия браузера через WebSocket
     */
    async _executeBrowserAction(action) {
        switch (action.type) {
            case 'click':
                return { success: await this.browserController.clickElement(action.selector) };
            case 'type':
                return { success: await this.browserController.typeTextPuppeteer(action.selector, action.text) };
            case 'submit':
                return { success: await this.browserController.submitForm(action.selector) };
            case 'navigate':
                return { success: await this.browserController.navigateTo(action.url) };
            default:
                return { error: 'Неизвестный тип действия' };
        }
    }

    /**
     * Остановка сервера
     */
    async stop() {
        if (this.wss) {
            this.wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.close();
                }
            });
            this.wss.close();
        }

        if (this.server) {
            this.server.close();
        }

        await this.browserController.disconnect();
        console.log('✅ AI Server остановлен');
    }
}

// Запуск сервера
if (require.main === module) {
    const server = new AIServer();
    server.start().catch(error => {
        console.error('Ошибка запуска сервера:', error);
        process.exit(1);
    });

    // Обработка сигналов для корректного завершения
    process.on('SIGINT', async () => {
        await server.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        await server.stop();
        process.exit(0);
    });
}

module.exports = AIServer;
