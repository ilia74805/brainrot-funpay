/**
 * Background Script для Mr. 7B
 * Управляет соединением с AI Server и координирует действия
 */

// Состояние расширения
let isEnabled = true;
let isConnectedToAI = false;
let currentTabId = null;

// Настройки
const AI_SERVER_URL = 'http://localhost:3000';

// Подключение к AI Server
function connectToAIServer() {
    return fetch(`${AI_SERVER_URL}/api/status`)
        .then(response => response.json())
        .then(data => {
            isConnectedToAI = data.ai_loaded && data.browser_connected;
            return isConnectedToAI;
        })
        .catch(error => {
            console.error('Не удалось подключиться к AI Server:', error);
            isConnectedToAI = false;
            return false;
        });
}

// Отправка запроса на AI Server
function sendToAIServer(endpoint, data = {}) {
    return fetch(`${AI_SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}

// Обработчик сообщений от content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabId = sender.tab?.id;
    
    // Сохраняем текущую вкладку
    if (tabId) {
        currentTabId = tabId;
    }
    
    // Обработка различных действий
    switch (request.action) {
        case 'checkStatus':
            sendResponse({
                enabled: isEnabled,
                connectedToAI: isConnectedToAI
            });
            break;
            
        case 'toggleExtension':
            isEnabled = request.enabled;
            chrome.storage.sync.set({ enabled: isEnabled });
            
            // Отправляем сообщение всем вкладкам
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'toggle',
                        enabled: isEnabled
                    });
                });
            });
            sendResponse({ success: true, enabled: isEnabled });
            break;
            
        case 'analyzePage':
            // Получаем HTML страницы
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => document.documentElement.outerHTML
            }, (results) => {
                if (results && results[0] && results[0].result) {
                    const html = results[0].result;
                    sendToAIServer('/api/analyze', { html, url: request.url })
                        .then(analysis => sendResponse(analysis))
                        .catch(error => sendResponse({ error: error.message }));
                } else {
                    sendResponse({ error: 'Не удалось получить HTML' });
                }
            });
            break;
            
        case 'solveProblem':
            sendToAIServer('/api/solve', { question: request.question, context: request.context })
                .then(solution => sendResponse(solution))
                .catch(error => sendResponse({ error: error.message }));
            break;
            
        case 'autoSolve':
            // Полный цикл: анализ + решение + действия
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => document.documentElement.outerHTML
            }, (results) => {
                if (results && results[0] && results[0].result) {
                    const html = results[0].result;
                    sendToAIServer('/api/auto-solve', { html, url: request.url })
                        .then(result => sendResponse(result))
                        .catch(error => sendResponse({ error: error.message }));
                } else {
                    sendResponse({ error: 'Не удалось получить HTML' });
                }
            });
            break;
            
        case 'executeAction':
            // Выполнение действия через AI Server
            sendToAIServer('/api/browser/' + request.type, request.payload)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ error: error.message }));
            break;
            
        case 'getTabs':
            chrome.tabs.query({}, (tabs) => {
                sendResponse({ tabs: tabs.map(t => ({
                    id: t.id,
                    title: t.title,
                    url: t.url,
                    active: t.active
                })) });
            });
            break;
            
        case 'switchTab':
            chrome.tabs.update(request.tabId, { active: true }, () => {
                sendResponse({ success: true });
            });
            break;
            
        case 'getCurrentTab':
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    sendResponse({ tab: {
                        id: tabs[0].id,
                        title: tabs[0].title,
                        url: tabs[0].url
                    } });
                } else {
                    sendResponse({ error: 'Нет активных вкладок' });
                }
            });
            break;
            
        default:
            sendResponse({ error: 'Неизвестное действие' });
    }
    
    return true; // Для асинхронных ответов
});

// Проверка подключения при запуске
connectToAIServer().then(connected => {
    console.log(`AI Server ${connected ? 'подключён' : 'не подключён'}`);
    
    // Периодическая проверка подключения
    setInterval(connectToAIServer, 30000); // Каждые 30 секунд
});

// Загрузка состояния из хранилища
chrome.storage.sync.get(['enabled'], (data) => {
    isEnabled = data.enabled !== false;
});

// Контекстное меню
chrome.runtime.onInstalled.addListener(() => {
    // Создаем контекстное меню
    chrome.contextMenus.create({
        id: 'analyzeWithAI',
        title: 'Проанализировать с Mr. 7B',
        contexts: ['page', 'selection']
    });
    
    chrome.contextMenus.create({
        id: 'autoSolveWithAI',
        title: 'Авто-решение с Mr. 7B',
        contexts: ['page']
    });
    
    chrome.contextMenus.create({
        id: 'solveSelection',
        title: 'Решить выделенный текст',
        contexts: ['selection']
    });
});

// Обработчик кликов по контекстному меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case 'analyzeWithAI':
            chrome.tabs.sendMessage(tab.id, { action: 'analyzePage' });
            break;
            
        case 'autoSolveWithAI':
            chrome.tabs.sendMessage(tab.id, { action: 'autoSolve' });
            break;
            
        case 'solveSelection':
            if (info.selectionText) {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'solveSelection',
                    text: info.selectionText
                });
            }
            break;
    }
});

// Сообщения от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.from === 'popup') {
        switch (request.action) {
            case 'getStatus':
                sendResponse({
                    enabled: isEnabled,
                    connectedToAI: isConnectedToAI
                });
                break;
                
            case 'connectToAI':
                connectToAIServer().then(connected => {
                    isConnectedToAI = connected;
                    sendResponse({ connected: isConnectedToAI });
                });
                break;
                
            case 'startAutoSolve':
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs.length > 0) {
                        chrome.tabs.sendMessage(tabs[0].id, { action: 'autoSolve' });
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ error: 'Нет активных вкладок' });
                    }
                });
                break;
                
            case 'openSettings':
                chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
                sendResponse({ success: true });
                break;
                
            case 'checkAIConnection':
                sendResponse({ connected: isConnectedToAI });
                break;
                
            case 'settingsUpdated':
                isEnabled = request.settings.extensionEnabled;
                chrome.storage.sync.set({ enabled: isEnabled });
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'settingsUpdated',
                            settings: request.settings
                        });
                    });
                });
                sendResponse({ success: true });
                break;
        }
    }
});

// Уведомления
function showNotification(message, type = 'info') {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.svg',
        title: 'Mr. 7B',
        message: message
    }).catch(() => {
        // Если уведомления не поддерживаются, просто логируем
        console.log(`[Mr. 7B] ${message}`);
    });
}

console.log('🚀 Mr. 7B Background Script загружен');
