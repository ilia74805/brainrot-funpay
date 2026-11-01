/**
 * Options Script для Mr. 7B
 * Управляет настройками расширения
 */

// Загрузка настроек при старте
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupTabs();
    setupEventListeners();
    loadSystemInfo();
    loadHistory();
});

// Настройки по умолчанию
const DEFAULT_SETTINGS = {
    // Общие настройки
    extensionEnabled: true,
    language: 'ru',
    theme: 'system',
    
    // ИИ и модели
    aiServerUrl: 'http://localhost:3000',
    aiModel: 'phi-2',
    temperature: 0.7,
    maxLength: 500,
    confidenceThreshold: 0.7,
    
    // Поведение
    mode: 'auto',
    autoFillInputs: true,
    autoClickButtons: true,
    autoSubmitForms: true,
    autoNavigate: true,
    showNotifications: true,
    playSounds: true,
    notificationDuration: 3,
    
    // Контекст
    defaultSubject: 'auto',
    contextTemplate: 'Ты - опытный учитель. Отвечай подробно и с пояснениями. Используй русский язык.',
    userContext: '',
    priorityMath: true,
    priorityPhysics: true,
    priorityBiology: true,
    priorityChemistry: true,
    priorityHistory: true,
    
    // Производительность
    performanceMode: 'balanced',
    enableOCR: true,
    enableComplexAnalysis: true,
    enableAutoSolve: true,
    enableRealTime: true,
    maxConcurrentTasks: 3,
    cacheSize: 100
};

// Загрузка настроек
function loadSettings() {
    chrome.storage.sync.get(null, function(data) {
        // Применяем настройки или используем значения по умолчанию
        const settings = { ...DEFAULT_SETTINGS, ...data };
        
        // Общие настройки
        document.getElementById('extensionEnabled').checked = settings.extensionEnabled;
        document.getElementById('language').value = settings.language;
        document.getElementById('theme').value = settings.theme;
        
        // ИИ и модели
        document.getElementById('aiServerUrl').value = settings.aiServerUrl;
        document.getElementById('aiModel').value = settings.aiModel;
        
        // Параметры ИИ
        document.getElementById('temperature').value = settings.temperature;
        document.getElementById('temperatureValue').textContent = settings.temperature;
        
        document.getElementById('maxLength').value = settings.maxLength;
        document.getElementById('maxLengthValue').textContent = settings.maxLength;
        
        document.getElementById('confidenceThreshold').value = settings.confidenceThreshold;
        document.getElementById('confidenceThresholdValue').textContent = Math.round(settings.confidenceThreshold * 100) + '%';
        
        // Поведение
        document.querySelector(`input[name="mode"][value="${settings.mode}"]`).checked = true;
        document.getElementById('autoFillInputs').checked = settings.autoFillInputs;
        document.getElementById('autoClickButtons').checked = settings.autoClickButtons;
        document.getElementById('autoSubmitForms').checked = settings.autoSubmitForms;
        document.getElementById('autoNavigate').checked = settings.autoNavigate;
        document.getElementById('showNotifications').checked = settings.showNotifications;
        document.getElementById('playSounds').checked = settings.playSounds;
        document.getElementById('notificationDuration').value = settings.notificationDuration;
        document.getElementById('notificationDurationValue').textContent = settings.notificationDuration;
        
        // Контекст
        document.getElementById('defaultSubject').value = settings.defaultSubject;
        document.getElementById('contextTemplate').value = settings.contextTemplate;
        document.getElementById('userContext').value = settings.userContext;
        document.getElementById('priorityMath').checked = settings.priorityMath;
        document.getElementById('priorityPhysics').checked = settings.priorityPhysics;
        document.getElementById('priorityBiology').checked = settings.priorityBiology;
        document.getElementById('priorityChemistry').checked = settings.priorityChemistry;
        document.getElementById('priorityHistory').checked = settings.priorityHistory;
        
        // Производительность
        document.getElementById('performanceMode').value = settings.performanceMode;
        updatePerformanceSettings();
        document.getElementById('enableOCR').checked = settings.enableOCR;
        document.getElementById('enableComplexAnalysis').checked = settings.enableComplexAnalysis;
        document.getElementById('enableAutoSolve').checked = settings.enableAutoSolve;
        document.getElementById('enableRealTime').checked = settings.enableRealTime;
        document.getElementById('maxConcurrentTasks').value = settings.maxConcurrentTasks;
        document.getElementById('maxConcurrentTasksValue').textContent = settings.maxConcurrentTasks;
        document.getElementById('cacheSize').value = settings.cacheSize;
        document.getElementById('cacheSizeValue').textContent = settings.cacheSize + 'MB';
        
        // Проверяем подключение к ИИ
        checkAIConnection();
    });
}

// Настройка вкладок
function setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Удаляем активный класс у всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс к выбранной вкладке
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Slider для temperature
    document.getElementById('temperature').addEventListener('input', function() {
        document.getElementById('temperatureValue').textContent = this.value;
    });
    
    // Slider для maxLength
    document.getElementById('maxLength').addEventListener('input', function() {
        document.getElementById('maxLengthValue').textContent = this.value;
    });
    
    // Slider для confidenceThreshold
    document.getElementById('confidenceThreshold').addEventListener('input', function() {
        document.getElementById('confidenceThresholdValue').textContent = Math.round(this.value * 100) + '%';
    });
    
    // Slider для notificationDuration
    document.getElementById('notificationDuration').addEventListener('input', function() {
        document.getElementById('notificationDurationValue').textContent = this.value;
    });
    
    // Slider для maxConcurrentTasks
    document.getElementById('maxConcurrentTasks').addEventListener('input', function() {
        document.getElementById('maxConcurrentTasksValue').textContent = this.value;
    });
    
    // Slider для cacheSize
    document.getElementById('cacheSize').addEventListener('input', function() {
        document.getElementById('cacheSizeValue').textContent = this.value + 'MB';
    });
    
    // Режим производительности
    document.getElementById('performanceMode').addEventListener('change', updatePerformanceSettings);
}

// Обновление настроек производительности
function updatePerformanceSettings() {
    const mode = document.getElementById('performanceMode').value;
    const customSettings = document.getElementById('customPerformanceSettings');
    
    if (mode === 'custom') {
        customSettings.style.display = 'block';
    } else {
        customSettings.style.display = 'none';
        
        // Автоматически настраиваем параметры в зависимости от режима
        if (mode === 'performance') {
            document.getElementById('enableOCR').checked = true;
            document.getElementById('enableComplexAnalysis').checked = true;
            document.getElementById('enableAutoSolve').checked = true;
            document.getElementById('enableRealTime').checked = true;
            document.getElementById('maxConcurrentTasks').value = 5;
            document.getElementById('maxConcurrentTasksValue').textContent = '5';
        } else if (mode === 'battery') {
            document.getElementById('enableOCR').checked = false;
            document.getElementById('enableComplexAnalysis').checked = false;
            document.getElementById('enableAutoSolve').checked = false;
            document.getElementById('enableRealTime').checked = false;
            document.getElementById('maxConcurrentTasks').value = 1;
            document.getElementById('maxConcurrentTasksValue').textContent = '1';
        } else {
            // Balanced
            document.getElementById('enableOCR').checked = true;
            document.getElementById('enableComplexAnalysis').checked = true;
            document.getElementById('enableAutoSolve').checked = true;
            document.getElementById('enableRealTime').checked = true;
            document.getElementById('maxConcurrentTasks').value = 3;
            document.getElementById('maxConcurrentTasksValue').textContent = '3';
        }
    }
}

// Проверка подключения к ИИ
function checkAIConnection() {
    chrome.runtime.sendMessage({ action: 'checkAIConnection' }, function(response) {
        const statusBadge = document.getElementById('connectionStatus');
        
        if (response && response.connected) {
            statusBadge.textContent = 'Подключено';
            statusBadge.className = 'status-badge connected';
        } else {
            statusBadge.textContent = 'Не подключено';
            statusBadge.className = 'status-badge disconnected';
        }
    });
}

// Тестирование соединения
function testConnection() {
    const url = document.getElementById('aiServerUrl').value;
    const statusBadge = document.getElementById('connectionStatus');
    
    statusBadge.textContent = 'Проверка...';
    statusBadge.className = 'status-badge loading';
    
    fetch(`${url}/api/status`)
        .then(response => response.json())
        .then(data => {
            if (data.ai_loaded && data.browser_connected) {
                statusBadge.textContent = 'Подключено';
                statusBadge.className = 'status-badge connected';
                showNotification('✅ Соединение с ИИ установлено!', 'success');
            } else {
                statusBadge.textContent = 'Частично подключено';
                statusBadge.className = 'status-badge warning';
                showNotification('⚠️ ИИ загружен, но браузер не подключен', 'warning');
            }
        })
        .catch(error => {
            statusBadge.textContent = 'Не подключено';
            statusBadge.className = 'status-badge disconnected';
            showNotification('❌ Не удалось подключиться к ИИ. Проверьте адрес сервера.', 'error');
        });
}

// Переподключение
function reconnect() {
    const url = document.getElementById('aiServerUrl').value;
    chrome.storage.sync.set({ aiServerUrl: url });
    testConnection();
}

// Сохранение настроек
function saveSettings() {
    const settings = {
        // Общие настройки
        extensionEnabled: document.getElementById('extensionEnabled').checked,
        language: document.getElementById('language').value,
        theme: document.getElementById('theme').value,
        
        // ИИ и модели
        aiServerUrl: document.getElementById('aiServerUrl').value,
        aiModel: document.getElementById('aiModel').value,
        temperature: parseFloat(document.getElementById('temperature').value),
        maxLength: parseInt(document.getElementById('maxLength').value),
        confidenceThreshold: parseFloat(document.getElementById('confidenceThreshold').value),
        
        // Поведение
        mode: document.querySelector('input[name="mode"]:checked').value,
        autoFillInputs: document.getElementById('autoFillInputs').checked,
        autoClickButtons: document.getElementById('autoClickButtons').checked,
        autoSubmitForms: document.getElementById('autoSubmitForms').checked,
        autoNavigate: document.getElementById('autoNavigate').checked,
        showNotifications: document.getElementById('showNotifications').checked,
        playSounds: document.getElementById('playSounds').checked,
        notificationDuration: parseInt(document.getElementById('notificationDuration').value),
        
        // Контекст
        defaultSubject: document.getElementById('defaultSubject').value,
        contextTemplate: document.getElementById('contextTemplate').value,
        userContext: document.getElementById('userContext').value,
        priorityMath: document.getElementById('priorityMath').checked,
        priorityPhysics: document.getElementById('priorityPhysics').checked,
        priorityBiology: document.getElementById('priorityBiology').checked,
        priorityChemistry: document.getElementById('priorityChemistry').checked,
        priorityHistory: document.getElementById('priorityHistory').checked,
        
        // Производительность
        performanceMode: document.getElementById('performanceMode').value,
        enableOCR: document.getElementById('enableOCR').checked,
        enableComplexAnalysis: document.getElementById('enableComplexAnalysis').checked,
        enableAutoSolve: document.getElementById('enableAutoSolve').checked,
        enableRealTime: document.getElementById('enableRealTime').checked,
        maxConcurrentTasks: parseInt(document.getElementById('maxConcurrentTasks').value),
        cacheSize: parseInt(document.getElementById('cacheSize').value)
    };
    
    chrome.storage.sync.set(settings, function() {
        showNotification('✅ Настройки сохранены!', 'success');
        
        // Отправляем сообщение в background для обновления
        chrome.runtime.sendMessage({ action: 'settingsUpdated', settings: settings });
    });
}

// Сброс настроек
function resetSettings() {
    if (confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
        chrome.storage.sync.set(DEFAULT_SETTINGS, function() {
            showNotification('✅ Настройки сброшены!', 'success');
            loadSettings();
        });
    }
}

// Сброс контекста
function resetContext() {
    if (confirm('Вы уверены, что хотите сбросить настройки контекста?')) {
        chrome.storage.sync.set({
            defaultSubject: DEFAULT_SETTINGS.defaultSubject,
            contextTemplate: DEFAULT_SETTINGS.contextTemplate,
            userContext: DEFAULT_SETTINGS.userContext
        }, function() {
            showNotification('✅ Контекст сброшен!', 'success');
            loadSettings();
        });
    }
}

// Очистка всех данных
function clearAllData() {
    if (confirm('ВНИМАНИЕ! Это удалит ВСЕ настройки и историю. Вы уверены?')) {
        chrome.storage.sync.clear(function() {
            showNotification('✅ Все данные очищены!', 'success');
            loadSettings();
        });
    }
}

// Загрузка истории
function loadHistory() {
    chrome.storage.local.get(['history'], function(data) {
        const historyList = document.getElementById('historyList');
        const history = data.history || [];
        
        if (history.length === 0) {
            historyList.innerHTML = '<div class="alert alert-info">История пуста</div>';
            return;
        }
        
        historyList.innerHTML = history.slice(0, 50).map(item => `
            <div class="history-item">
                <div>
                    <div class="question">${escapeHtml(item.question.substring(0, 100))}${item.question.length > 100 ? '...' : ''}</div>
                    <div class="answer">${escapeHtml(item.answer)}</div>
                </div>
                <div>
                    <div class="timestamp">${formatDate(item.timestamp)}</div>
                    <div class="actions">
                        <button class="btn btn-sm btn-primary btn-icon" onclick="copyToClipboard('${escapeHtml(item.answer)}')">📋</button>
                        <button class="btn btn-sm btn-danger btn-icon" onclick="removeHistoryItem(${history.indexOf(item)})">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Обновляем статистику
        updateStats(history);
    });
}

// Фильтрация истории
function filterHistory() {
    const filter = document.getElementById('historyFilter').value;
    chrome.storage.local.get(['history'], function(data) {
        const history = data.history || [];
        const historyList = document.getElementById('historyList');
        
        let filtered = history;
        
        if (filter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            filtered = history.filter(item => item.timestamp.startsWith(today));
        } else if (filter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = history.filter(item => new Date(item.timestamp) >= weekAgo);
        } else if (filter !== 'all') {
            filtered = history.filter(item => item.subject === filter);
        }
        
        if (filtered.length === 0) {
            historyList.innerHTML = '<div class="alert alert-info">Нет записей</div>';
            return;
        }
        
        historyList.innerHTML = filtered.slice(0, 50).map(item => `
            <div class="history-item">
                <div>
                    <div class="question">${escapeHtml(item.question.substring(0, 100))}${item.question.length > 100 ? '...' : ''}</div>
                    <div class="answer">${escapeHtml(item.answer)}</div>
                </div>
                <div>
                    <div class="timestamp">${formatDate(item.timestamp)}</div>
                    <div class="actions">
                        <button class="btn btn-sm btn-primary btn-icon" onclick="copyToClipboard('${escapeHtml(item.answer)}')">📋</button>
                        <button class="btn btn-sm btn-danger btn-icon" onclick="removeHistoryItem(${history.indexOf(item)})">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        updateStats(filtered);
    });
}

// Удаление элемента истории
function removeHistoryItem(index) {
    chrome.storage.local.get(['history'], function(data) {
        const history = data.history || [];
        history.splice(index, 1);
        
        chrome.storage.local.set({ history: history }, function() {
            showNotification('🗑️ Запись удалена!', 'success');
            loadHistory();
        });
    });
}

// Очистка истории
function clearHistory() {
    if (confirm('Вы уверены, что хотите очистить всю историю?')) {
        chrome.storage.local.set({ history: [] }, function() {
            showNotification('✅ История очищена!', 'success');
            loadHistory();
        });
    }
}

// Экспорт истории
function exportHistory() {
    chrome.storage.local.get(['history'], function(data) {
        const history = data.history || [];
        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mr7b_history_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('📥 История экспортирована!', 'success');
    });
}

// Импорт истории
function importHistory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const history = JSON.parse(e.target.result);
                chrome.storage.local.get(['history'], function(data) {
                    const existingHistory = data.history || [];
                    const newHistory = [...existingHistory, ...history];
                    
                    chrome.storage.local.set({ history: newHistory }, function() {
                        showNotification('📤 История импортирована!', 'success');
                        loadHistory();
                    });
                });
            } catch (error) {
                showNotification('❌ Ошибка импорта!', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Обновление статистики
function updateStats(history) {
    const stats = {
        total: history.length,
        successful: history.filter(item => item.success).length,
        averageRating: history.reduce((sum, item) => sum + (item.rating || 0), 0) / history.length || 0,
        errors: history.filter(item => item.error).length
    };
    
    const statElements = document.querySelectorAll('.stat-item');
    if (statElements.length >= 4) {
        statElements[0].innerHTML = `<div style="font-size: 24px; font-weight: bold; color: var(--primary);">${stats.total}</div><div style="font-size: 12px; color: var(--text-secondary);">Всего запросов</div>`;
        statElements[1].innerHTML = `<div style="font-size: 24px; font-weight: bold; color: var(--success);">${stats.successful}</div><div style="font-size: 12px; color: var(--text-secondary);">Успешных ответов</div>`;
        statElements[2].innerHTML = `<div style="font-size: 24px; font-weight: bold; color: var(--warning);">${stats.averageRating.toFixed(1)}</div><div style="font-size: 12px; color: var(--text-secondary);">Средний рейтинг</div>`;
        statElements[3].innerHTML = `<div style="font-size: 24px; font-weight: bold; color: var(--danger);">${stats.errors}</div><div style="font-size: 12px; color: var(--text-secondary);">Ошибок</div>`;
    }
}

// Загрузка информации о системе
function loadSystemInfo() {
    // Получаем информацию о браузере
    const userAgent = navigator.userAgent;
    let browser = 'Неизвестный';
    let os = 'Неизвестная';
    
    if (userAgent.includes('Firefox')) {
        browser = 'Mozilla Firefox';
    } else if (userAgent.includes('Edg')) {
        browser = 'Microsoft Edge';
    } else if (userAgent.includes('OPR')) {
        browser = 'Opera';
    } else if (userAgent.includes('Chrome')) {
        browser = 'Google Chrome';
    } else if (userAgent.includes('Safari')) {
        browser = 'Apple Safari';
    }
    
    if (userAgent.includes('Windows')) {
        os = 'Windows';
    } else if (userAgent.includes('Mac')) {
        os = 'macOS';
    } else if (userAgent.includes('Linux')) {
        os = 'Linux';
    } else if (userAgent.includes('Android')) {
        os = 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
    }
    
    document.getElementById('browserInfo').textContent = browser;
    document.getElementById('osInfo').textContent = os;
    
    // Получаем информацию о памяти (если возможно)
    if (navigator.deviceMemory) {
        document.getElementById('memoryInfo').textContent = `${navigator.deviceMemory} GB`;
    } else {
        document.getElementById('memoryInfo').textContent = 'Неизвестно';
    }
    
    // Получаем информацию о процессоре
    if (navigator.hardwareConcurrency) {
        document.getElementById('cpuInfo').textContent = `${navigator.hardwareConcurrency} ядер`;
    } else {
        document.getElementById('cpuInfo').textContent = 'Неизвестно';
    }
    
    // Загружаем рекомендации
    loadRecommendations(browser, os, navigator.deviceMemory, navigator.hardwareConcurrency);
}

// Загрузка рекомендаций
function loadRecommendations(browser, os, memory, cpuCores) {
    const recommendations = [];
    
    // Рекомендации по ОЗУ
    if (memory && memory < 4) {
        recommendations.push('⚠️ У вас мало оперативной памяти. Рекомендуется использовать модель TinyLlama-1.1B.');
    } else if (memory && memory >= 8) {
        recommendations.push('✅ У вас достаточно оперативной памяти. Можно использовать любую модель.');
    }
    
    // Рекомендации по процессору
    if (cpuCores && cpuCores < 4) {
        recommendations.push('⚠️ У вас мало ядер процессора. Отключите тяжелые функции для улучшения производительности.');
    }
    
    // Рекомендации по браузеру
    if (browser !== 'Google Chrome' && browser !== 'Microsoft Edge') {
        recommendations.push('ℹ️ Для наилучшей работы рекомендуется использовать Google Chrome или Microsoft Edge.');
    }
    
    // Если нет рекомендаций
    if (recommendations.length === 0) {
        recommendations.push('✅ Ваша система полностью совместима с Mr. 7B!');
    }
    
    document.getElementById('recommendations').innerHTML = recommendations.map(r => `<div style="margin-bottom: 8px;">${r}</div>`).join('');
}

// Запуск диагностики
function runDiagnostics() {
    showNotification('🔍 Запуск диагностики...', 'info');
    
    // Проверяем подключение к ИИ
    testConnection();
    
    // Проверяем настройки
    chrome.storage.sync.get(null, function(data) {
        if (Object.keys(data).length === 0) {
            showNotification('⚠️ Настройки не сохранены. Используются значения по умолчанию.', 'warning');
        } else {
            showNotification('✅ Настройки загружены успешно.', 'success');
        }
    });
    
    // Проверяем историю
    chrome.storage.local.get(['history'], function(data) {
        if (!data.history || data.history.length === 0) {
            showNotification('ℹ️ История пуста.', 'info');
        } else {
            showNotification(`✅ История содержит ${data.history.length} записей.`, 'success');
        }
    });
}

// Копирование в буфер обмена
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 Скопировано в буфер обмена!', 'success');
    }).catch(() => {
        showNotification('❌ Не удалось скопировать!', 'error');
    });
}

// Форматирование даты
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Если меньше минуты
    if (diff < 60000) {
        return 'Только что';
    }
    
    // Если меньше часа
    if (diff < 3600000) {
        return `${Math.floor(diff / 60000)} мин назад`;
    }
    
    // Если меньше дня
    if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)} ч назад`;
    }
    
    // Если меньше недели
    if (diff < 604800000) {
        return `${Math.floor(diff / 86400000)} дн назад`;
    }
    
    // Форматируем дату
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Отображение уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '999999';
    notification.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 3s';
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    } else if (type === 'warning') {
        notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }
    
    notification.style.color = 'white';
    notification.style.fontSize = '14px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3500);
}

// Добавляем CSS для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(20px); }
    }
`;
document.head.appendChild(style);
