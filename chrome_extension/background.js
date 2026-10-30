// Super Calculator Background Script
// Управляет состоянием расширения

// Состояние по умолчанию
let isEnabled = true;

// Устанавливаем состояние при установке
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({enabled: true});
});

// Прослушиваем сообщения от content script и popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStatus') {
        chrome.storage.sync.get(['enabled'], function(data) {
            sendResponse({enabled: data.enabled !== false});
        });
        return true; // Асинхронный ответ
    }
    
    if (request.action === 'setStatus') {
        chrome.storage.sync.set({enabled: request.enabled});
        // Отправляем сообщение всем вкладкам
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'toggle',
                    enabled: request.enabled
                });
            });
        });
        sendResponse({status: 'ok'});
    }
    
    if (request.action === 'solveAll') {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'solveAll'}, sendResponse);
            }
        });
        return true; // Асинхронный ответ
    }
    
    // Auto-test functions
    if (request.action === 'startAutoTest') {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'startAutoTest'}, sendResponse);
            }
        });
        return true;
    }
    
    if (request.action === 'stopAutoTest') {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'stopAutoTest'}, sendResponse);
            }
        });
        return true;
    }
    
    if (request.action === 'getAutoTestStats') {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'getAutoTestStats'}, sendResponse);
            }
        });
        return true;
    }
    
    // Multi-tab functions
    if (request.action === 'startMultiTab') {
        // This is handled by popup.js directly
        sendResponse({success: true});
        return true;
    }
    
    if (request.action === 'solveCurrentAndNext') {
        // This is handled by popup.js directly
        sendResponse({success: true});
        return true;
    }
});

// Контекстное меню
chrome.runtime.onInstalled.addListener(() => {
    // Создаем контекстное меню
    chrome.contextMenus.create({
        id: 'solveMath',
        title: 'Решить выражение',
        contexts: ['selection']
    });
});

// Обработчик контекстного меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'solveMath' && info.selectionText) {
        // Отправляем выбранный текст на решение
        chrome.tabs.sendMessage(tab.id, {
            action: 'solveSelection',
            text: info.selectionText
        });
    }
});
