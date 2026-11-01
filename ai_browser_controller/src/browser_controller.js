/**
 * Browser Controller - Управление браузером через Chrome DevTools Protocol
 * Позволяет ИИ выполнять любые действия в браузере
 */

const CDP = require('chrome-remote-interface');
const puppeteer = require('puppeteer');

class BrowserController {
    constructor() {
        this.browser = null;
        this.client = null;
        this.target = null;
        this.connected = false;
    }

    /**
     * Подключение к существующему браузеру Chrome
     */
    async connectToExistingBrowser(port = 9222) {
        try {
            this.client = await CDP({ port: port });
            const targets = await this.client.listTargets();
            
            // Находим первую доступную вкладку
            const target = targets.find(t => t.type === 'page');
            if (!target) {
                throw new Error('Не найдена ни одна вкладка');
            }
            
            this.target = target;
            this.connected = true;
            console.log(`✅ Подключено к вкладке: ${target.title}`);
            return true;
        } catch (error) {
            console.error('❌ Ошибка подключения:', error);
            return false;
        }
    }

    /**
     * Запуск нового браузера
     */
    async launchNewBrowser(headless = false) {
        try {
            this.browser = await puppeteer.launch({
                headless: headless,
                args: [
                    '--remote-debugging-port=9222',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage'
                ]
            });
            
            // Подключаемся к запущенному браузеру
            await this.connectToExistingBrowser();
            console.log('✅ Новый браузер запущен');
            return true;
        } catch (error) {
            console.error('❌ Ошибка запуска браузера:', error);
            return false;
        }
    }

    /**
     * Получение текущей вкладки
     */
    async getCurrentTab() {
        if (!this.connected) {
            await this.connectToExistingBrowser();
        }
        
        try {
            const session = await this.client.attachTarget(this.target.id);
            return session;
        } catch (error) {
            console.error('Ошибка получения вкладки:', error);
            return null;
        }
    }

    /**
     * Получение HTML-кода страницы
     */
    async getPageHTML() {
        const session = await this.getCurrentTab();
        if (!session) return null;
        
        try {
            const { DOM } = session;
            const { root } = await DOM.getDocument();
            const html = await DOM.getOuterHTML({ nodeId: root.nodeId });
            return html.outerHTML;
        } catch (error) {
            console.error('Ошибка получения HTML:', error);
            return null;
        }
    }

    /**
     * Получение скриншота страницы
     */
    async takeScreenshot() {
        const session = await this.getCurrentTab();
        if (!session) return null;
        
        try {
            const { Page } = session;
            const screenshot = await Page.captureScreenshot();
            return screenshot.data;
        } catch (error) {
            console.error('Ошибка получения скриншота:', error);
            return null;
        }
    }

    /**
     * Клик по элементу (по селектору)
     */
    async clickElement(selector) {
        const session = await this.getCurrentTab();
        if (!session) return false;
        
        try {
            const { DOM, Input } = session;
            
            // Получаем элемент
            const { nodeId } = await DOM.querySelector({ selector });
            if (!nodeId) {
                console.log(`❌ Элемент не найден: ${selector}`);
                return false;
            }
            
            // Получаем координаты элемента
            const boxModel = await DOM.getBoxModel({ nodeId });
            const x = (boxModel.model.border[0].x + boxModel.model.border[2].x) / 2;
            const y = (boxModel.model.border[0].y + boxModel.model.border[2].y) / 2;
            
            // Кликаем
            await Input.dispatchMouseEvent({
                type: 'mousePressed',
                x: Math.round(x),
                y: Math.round(y),
                button: 'left',
                clickCount: 1
            });
            
            await Input.dispatchMouseEvent({
                type: 'mouseReleased',
                x: Math.round(x),
                y: Math.round(y),
                button: 'left',
                clickCount: 1
            });
            
            console.log(`✅ Клик по элементу: ${selector}`);
            return true;
        } catch (error) {
            console.error('Ошибка клика:', error);
            return false;
        }
    }

    /**
     * Клик по координатам
     */
    async clickAtCoordinates(x, y) {
        const session = await this.getCurrentTab();
        if (!session) return false;
        
        try {
            const { Input } = session;
            
            await Input.dispatchMouseEvent({
                type: 'mousePressed',
                x: Math.round(x),
                y: Math.round(y),
                button: 'left',
                clickCount: 1
            });
            
            await Input.dispatchMouseEvent({
                type: 'mouseReleased',
                x: Math.round(x),
                y: Math.round(y),
                button: 'left',
                clickCount: 1
            });
            
            console.log(`✅ Клик по координатам: (${x}, ${y})`);
            return true;
        } catch (error) {
            console.error('Ошибка клика по координатам:', error);
            return false;
        }
    }

    /**
     * Ввод текста в элемент
     */
    async typeText(selector, text) {
        const session = await this.getCurrentTab();
        if (!session) return false;
        
        try {
            const { DOM, Input } = session;
            
            // Фокусируемся на элементе
            const { nodeId } = await DOM.querySelector({ selector });
            if (!nodeId) {
                console.log(`❌ Элемент не найден: ${selector}`);
                return false;
            }
            
            // Кликаем по элементу
            const boxModel = await DOM.getBoxModel({ nodeId });
            const x = (boxModel.model.border[0].x + boxModel.model.border[2].x) / 2;
            const y = (boxModel.model.border[0].y + boxModel.model.border[2].y) / 2;
            
            await this.clickAtCoordinates(x, y);
            
            // Вводим текст
            for (const char of text) {
                await Input.dispatchKeyEvent({
                    type: 'keyDown',
                    text: char,
                    unmodifiedText: char,
                    keyIdentifier: char,
                    code: char,
                    key: char
                });
                await Input.dispatchKeyEvent({
                    type: 'keyUp',
                    text: char,
                    unmodifiedText: char,
                    keyIdentifier: char,
                    code: char,
                    key: char
                });
            }
            
            console.log(`✅ Введён текст "${text}" в элемент: ${selector}`);
            return true;
        } catch (error) {
            console.error('Ошибка ввода текста:', error);
            return false;
        }
    }

    /**
     * Ввод текста с использованием Puppeteer (надежнее)
     */
    async typeTextPuppeteer(selector, text) {
        if (!this.browser) {
            await this.launchNewBrowser();
        }
        
        try {
            const pages = await this.browser.pages();
            const page = pages[0];
            
            await page.focus(selector);
            await page.keyboard.down('Control');
            await page.keyboard.press('A');
            await page.keyboard.up('Control');
            await page.keyboard.press('Backspace');
            await page.type(selector, text);
            
            console.log(`✅ Введён текст "${text}" в элемент: ${selector}`);
            return true;
        } catch (error) {
            console.error('Ошибка ввода текста (Puppeteer):', error);
            return false;
        }
    }

    /**
     * Выбор значения в выпадающем списке
     */
    async selectOption(selector, value) {
        const session = await this.getCurrentTab();
        if (!session) return false;
        
        try {
            const { DOM, Input } = session;
            
            // Кликаем по селекту
            await this.clickElement(selector);
            
            // Ждем немного
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Ищем опцию
            const options = await DOM.querySelectorAll({ selector: `${selector} option` });
            const targetOption = options.nodeIds.find((nodeId, index) => {
                // Проверяем value или text
                return value === options.backingStore[index].attributes.value ||
                       value === options.backingStore[index].nodeValue;
            });
            
            if (!targetOption) {
                console.log(`❌ Опция "${value}" не найдена`);
                return false;
            }
            
            // Кликаем по опции
            await this.clickElement(`${selector} option[value="${value}"]`);
            
            console.log(`✅ Выбрана опция "${value}" в элементе: ${selector}`);
            return true;
        } catch (error) {
            console.error('Ошибка выбора опции:', error);
            return false;
        }
    }

    /**
     * Нажатие на кнопку отправки
     */
    async submitForm(selector = 'button[type="submit"], input[type="submit"]') {
        return this.clickElement(selector);
    }

    /**
     * Навигация по URL
     */
    async navigateTo(url) {
        const session = await this.getCurrentTab();
        if (!session) return false;
        
        try {
            const { Page } = session;
            await Page.navigate({ url });
            await Page.loadEventFired();
            
            console.log(`✅ Переход на: ${url}`);
            return true;
        } catch (error) {
            console.error('Ошибка навигации:', error);
            return false;
        }
    }

    /**
     * Ожидание загрузки элемента
     */
    async waitForElement(selector, timeout = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const session = await this.getCurrentTab();
            if (!session) return false;
            
            try {
                const { DOM } = session;
                const { nodeId } = await DOM.querySelector({ selector });
                if (nodeId) {
                    return true;
                }
            } catch (error) {
                // Элемент не найден
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`❌ Элемент не найден за ${timeout}ms: ${selector}`);
        return false;
    }

    /**
     * Получение текста элемента
     */
    async getElementText(selector) {
        const session = await this.getCurrentTab();
        if (!session) return null;
        
        try {
            const { DOM } = session;
            const { nodeId } = await DOM.querySelector({ selector });
            if (!nodeId) return null;
            
            const { nodeValue } = await DOM.getNodeValue({ nodeId });
            return nodeValue;
        } catch (error) {
            console.error('Ошибка получения текста:', error);
            return null;
        }
    }

    /**
     * Выполнение JavaScript-кода на странице
     */
    async executeScript(script) {
        const session = await this.getCurrentTab();
        if (!session) return null;
        
        try {
            const { Runtime } = session;
            const result = await Runtime.evaluate({ expression: script });
            return result.result.value;
        } catch (error) {
            console.error('Ошибка выполнения скрипта:', error);
            return null;
        }
    }

    /**
     * Получение всех вкладок
     */
    async getAllTabs() {
        if (!this.client) {
            await this.connectToExistingBrowser();
        }
        
        try {
            const targets = await this.client.listTargets();
            return targets.filter(t => t.type === 'page');
        } catch (error) {
            console.error('Ошибка получения вкладок:', error);
            return [];
        }
    }

    /**
     * Переключение на другую вкладку
     */
    async switchToTab(tabId) {
        try {
            const targets = await this.client.listTargets();
            const target = targets.find(t => t.id === tabId || t.targetId === tabId);
            
            if (!target) {
                console.log(`❌ Вкладка не найдена: ${tabId}`);
                return false;
            }
            
            this.target = target;
            console.log(`✅ Переключено на вкладку: ${target.title}`);
            return true;
        } catch (error) {
            console.error('Ошибка переключения на вкладку:', error);
            return false;
        }
    }

    /**
     * Закрытие вкладки
     */
    async closeTab(tabId) {
        try {
            const session = await this.client.attachTarget(tabId);
            await session.detach();
            console.log(`✅ Вкладка закрыта: ${tabId}`);
            return true;
        } catch (error) {
            console.error('Ошибка закрытия вкладки:', error);
            return false;
        }
    }

    /**
     * Отключение от браузера
     */
    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.client = null;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
        this.connected = false;
        console.log('✅ Отключено от браузера');
    }
}

// Экспорт
module.exports = BrowserController;
