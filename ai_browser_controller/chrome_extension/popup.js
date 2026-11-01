/**
 * Popup Script для Mr. 7B
 * Управляет интерфейсом расширения
 */

// Состояние
let isEnabled = true;
let isConnectedToAI = false;

// Инициализация при загрузке
window.onload = function() {
    // Загружаем состояние
    chrome.storage.sync.get(['enabled'], function(data) {
        isEnabled = data.enabled !== false;
        document.getElementById('toggle-switch').checked = isEnabled;
        updateUI();
    });
    
    // Проверяем подключение к ИИ
    checkAIConnection();
    
    // Настраиваем переключатель
    document.getElementById('toggle-switch').addEventListener('change', toggleExtension);
    
    // Обновляем статус каждые 5 секунд
    setInterval(checkAIConnection, 5000);
};

// Переключение расширения
function toggleExtension() {
    isEnabled = document.getElementById('toggle-switch').checked;
    chrome.storage.sync.set({ enabled: isEnabled });
    
    // Отправляем сообщение в background
    chrome.runtime.sendMessage({
        from: 'popup',
        action: 'toggleExtension',
        enabled: isEnabled
    });
    
    updateUI();
}

// Обновление интерфейса
function updateUI() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Скрываем спиннер
    loadingSpinner.style.display = 'none';
    
    if (isEnabled) {
        statusIndicator.classList.remove('off');
        statusText.textContent = 'Включено';
    } else {
        statusIndicator.classList.add('off');
        statusText.textContent = 'Выключено';
    }
    
    // Обновляем статус ИИ
    const aiStatus = document.getElementById('ai-status');
    if (isConnectedToAI) {
        aiStatus.textContent = 'ИИ: подключён ✅';
        aiStatus.style.color = '#10b981';
    } else {
        aiStatus.textContent = 'ИИ: не подключён ❌';
        aiStatus.style.color = '#ef4444';
    }
}

// Проверка подключения к ИИ
function checkAIConnection() {
    chrome.runtime.sendMessage({
        from: 'popup',
        action: 'checkStatus'
    }, function(response) {
        if (response) {
            isConnectedToAI = response.connectedToAI;
            updateUI();
        }
    });
}

// Подключение к ИИ
function connectToAI() {
    document.getElementById('loading-spinner').style.display = 'inline-block';
    document.getElementById('ai-status').textContent = 'Подключение к ИИ...';
    
    chrome.runtime.sendMessage({
        from: 'popup',
        action: 'connectToAI'
    }, function(response) {
        document.getElementById('loading-spinner').style.display = 'none';
        
        if (response && response.connected) {
            isConnectedToAI = true;
            showNotification('✅ Подключено к ИИ!');
        } else {
            showNotification('❌ Не удалось подключиться к ИИ. Запустите AI Server.');
        }
        
        updateUI();
    });
}

// Запуск авто-решения
function startAutoSolve() {
    if (!isEnabled) {
        showNotification('⚠️ Сначала включи расширение!');
        return;
    }
    
    if (!isConnectedToAI) {
        showNotification('⚠️ Сначала подключи ИИ!');
        return;
    }
    
    document.getElementById('loading-spinner').style.display = 'inline-block';
    document.getElementById('stats').textContent = 'Решаю задачи...';
    
    chrome.runtime.sendMessage({
        from: 'popup',
        action: 'startAutoSolve'
    }, function(response) {
        document.getElementById('loading-spinner').style.display = 'none';
        
        if (response && response.success) {
            showNotification('🚀 Авто-решение запущено!');
            document.getElementById('stats').textContent = 'Задачи решены!';
        } else {
            showNotification('❌ Ошибка при авто-решении');
            document.getElementById('stats').textContent = 'Ошибка';
        }
    });
}

// Анализ страницы
function analyzePage() {
    if (!isEnabled) {
        showNotification('⚠️ Сначала включи расширение!');
        return;
    }
    
    if (!isConnectedToAI) {
        showNotification('⚠️ Сначала подключи ИИ!');
        return;
    }
    
    document.getElementById('loading-spinner').style.display = 'inline-block';
    document.getElementById('stats').textContent = 'Анализирую страницу...';
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzePage' }, function(response) {
                document.getElementById('loading-spinner').style.display = 'none';
                
                if (response && !response.error) {
                    showNotification('🔍 Анализ завершён!');
                    document.getElementById('stats').textContent = `Найдено: ${response.questions?.length || 0} вопросов`;
                } else {
                    showNotification('❌ Ошибка анализа');
                    document.getElementById('stats').textContent = 'Ошибка';
                }
            });
        } else {
            document.getElementById('loading-spinner').style.display = 'none';
            showNotification('⚠️ Нет активных вкладок');
        }
    });
}

// Отображение уведомлений
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'rgba(0,0,0,0.8)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '20px';
    notification.style.zIndex = '9999';
    notification.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2s';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2500);
}

// Открытие настроек
function openSettings() {
    chrome.runtime.sendMessage({
        from: 'popup',
        action: 'openSettings'
    });
}

// CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('🚀 Mr. 7B Popup загружен');
