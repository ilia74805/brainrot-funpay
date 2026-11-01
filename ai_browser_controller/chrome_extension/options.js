/**
 * Mr. 7B - Options Script
 * Professional settings management for AI Browser Controller
 */

// Default settings
const DEFAULT_SETTINGS = {
    // General settings
    extensionEnabled: true,
    language: 'ru',
    theme: 'system',
    popupWidth: 300,
    fontSize: 'medium',
    
    // AI settings
    aiServerUrl: 'http://localhost:3000',
    aiModel: 'phi-2',
    temperature: 0.7,
    maxLength: 500,
    confidenceThreshold: 0.7,
    enableOCR: true,
    enableComplexAnalysis: true,
    enableAutoSolve: true,
    enableRealTime: true,
    
    // Behavior settings
    mode: 'auto',
    autoFillInputs: true,
    autoClickButtons: true,
    autoSubmitForms: true,
    autoNavigate: true,
    showNotifications: true,
    playSounds: true,
    notificationDuration: 3,
    defaultPlatform: 'auto',
    delayBetweenActions: 500,
    processAllTabs: true,
    maxConcurrentTasks: 3,
    
    // Context settings
    defaultSubject: 'auto',
    contextTemplate: 'Ты - опытный учитель. Отвечай подробно и с пояснениями. Используй русский язык.',
    userContext: '',
    priorityMath: true,
    priorityPhysics: true,
    priorityBiology: true,
    priorityChemistry: true,
    priorityHistory: true,
    priorityInformatics: true,
    priorityLanguages: true,
    priorityStatistics: true,
    detectMathProblems: true,
    detectTextProblems: true,
    detectMultipleChoice: true,
    detectOpenQuestions: true,
    
    // Performance settings
    performanceMode: 'balanced',
    enableCache: true,
    cacheSize: 100,
    lazyLoading: true,
    minimizeDOM: true,
    batchProcessing: true
};

// Current settings
let currentSettings = { ...DEFAULT_SETTINGS };

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupTabs();
    setupEventListeners();
    loadSystemInfo();
    loadHistory();
    setupTheme();
});

// Load settings from storage
function loadSettings() {
    chrome.storage.sync.get(null, function(data) {
        currentSettings = { ...DEFAULT_SETTINGS, ...data };
        populateForm();
        checkAIConnection();
    });
}

// Populate form with current settings
function populateForm() {
    const s = currentSettings;
    
    // General tab
    setCheckbox('extensionEnabled', s.extensionEnabled);
    setSelect('language', s.language);
    setSelect('theme', s.theme);
    setInput('popupWidth', s.popupWidth);
    setSelect('fontSize', s.fontSize);
    
    // Notifications
    setCheckbox('showNotifications', s.showNotifications);
    setCheckbox('playSounds', s.playSounds);
    setRange('notificationDuration', s.notificationDuration, s.notificationDuration);
    
    // AI tab
    setInput('aiServerUrl', s.aiServerUrl);
    setSelect('aiModel', s.aiModel);
    setRange('temperature', s.temperature, s.temperature);
    setRange('maxLength', s.maxLength, s.maxLength);
    setRange('confidenceThreshold', s.confidenceThreshold, Math.round(s.confidenceThreshold * 100) + '%');
    setCheckbox('enableOCR', s.enableOCR);
    setCheckbox('enableComplexAnalysis', s.enableComplexAnalysis);
    setCheckbox('enableAutoSolve', s.enableAutoSolve);
    setCheckbox('enableRealTime', s.enableRealTime);
    
    // Behavior tab
    setRadio('mode', s.mode);
    setCheckbox('autoFillInputs', s.autoFillInputs);
    setCheckbox('autoClickButtons', s.autoClickButtons);
    setCheckbox('autoSubmitForms', s.autoSubmitForms);
    setCheckbox('autoNavigate', s.autoNavigate);
    setSelect('defaultPlatform', s.defaultPlatform);
    setInput('delayBetweenActions', s.delayBetweenActions);
    setCheckbox('processAllTabs', s.processAllTabs);
    setRange('maxConcurrentTasks', s.maxConcurrentTasks, s.maxConcurrentTasks);
    
    // Context tab
    setSelect('defaultSubject', s.defaultSubject);
    setTextarea('contextTemplate', s.contextTemplate);
    setTextarea('userContext', s.userContext);
    setCheckbox('priorityMath', s.priorityMath);
    setCheckbox('priorityPhysics', s.priorityPhysics);
    setCheckbox('priorityBiology', s.priorityBiology);
    setCheckbox('priorityChemistry', s.priorityChemistry);
    setCheckbox('priorityHistory', s.priorityHistory);
    setCheckbox('priorityInformatics', s.priorityInformatics);
    setCheckbox('priorityLanguages', s.priorityLanguages);
    setCheckbox('priorityStatistics', s.priorityStatistics);
    setCheckbox('detectMathProblems', s.detectMathProblems);
    setCheckbox('detectTextProblems', s.detectTextProblems);
    setCheckbox('detectMultipleChoice', s.detectMultipleChoice);
    setCheckbox('detectOpenQuestions', s.detectOpenQuestions);
    
    // Performance tab
    setRadio('performanceMode', s.performanceMode);
    setCheckbox('enableCache', s.enableCache);
    setRange('cacheSize', s.cacheSize, s.cacheSize);
    setCheckbox('lazyLoading', s.lazyLoading);
    setCheckbox('minimizeDOM', s.minimizeDOM);
    setCheckbox('batchProcessing', s.batchProcessing);
    
    // Update performance settings based on mode
    updatePerformancePreset();
}

// Helper functions for setting form values
function setCheckbox(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = value;
}

function setSelect(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function setInput(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function setTextarea(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function setRange(id, value, displayValue) {
    const el = document.getElementById(id);
    const displayEl = document.getElementById(id + 'Value');
    if (el) el.value = value;
    if (displayEl) displayEl.textContent = displayValue;
}

function setRadio(name, value) {
    const radios = document.querySelectorAll(`input[name="${name}"]`);
    radios.forEach(radio => {
        if (radio.value === value) radio.checked = true;
    });
}

// Setup tab switching
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveSettings);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetSettings);
    
    // Test connection button
    document.getElementById('testConnection').addEventListener('click', testConnection);
    
    // History buttons
    document.getElementById('exportHistory').addEventListener('click', exportHistory);
    document.getElementById('importHistory').addEventListener('click', importHistory);
    document.getElementById('clearHistory').addEventListener('click', clearHistory);
    document.getElementById('clearCache').addEventListener('click', clearCache);
    
    // Refresh system info
    document.getElementById('refreshSystemInfo').addEventListener('click', loadSystemInfo);
    
    // Modal close button
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    
    // Filter history
    document.getElementById('historySearch').addEventListener('input', filterHistory);
    document.getElementById('historyFilter').addEventListener('change', filterHistory);
    document.getElementById('clearHistorySearch').addEventListener('click', function() {
        document.getElementById('historySearch').value = '';
        document.getElementById('historyFilter').value = 'all';
        filterHistory();
    });
    
    // Theme switcher
    document.getElementById('theme').addEventListener('change', function() {
        setupTheme();
    });
    
    // Performance mode switcher
    const perfRadios = document.querySelectorAll('input[name="performanceMode"]');
    perfRadios.forEach(radio => {
        radio.addEventListener('change', updatePerformancePreset);
    });
    
    // Range sliders - update display values
    setupRangeListeners();
}

// Setup range slider listeners
function setupRangeListeners() {
    const ranges = [
        { id: 'temperature', display: 'temperatureValue' },
        { id: 'maxLength', display: 'maxLengthValue' },
        { id: 'confidenceThreshold', display: 'confidenceThresholdValue', format: (v) => Math.round(v * 100) + '%' },
        { id: 'notificationDuration', display: 'notificationDurationValue' },
        { id: 'maxConcurrentTasks', display: 'maxConcurrentTasksValue' },
        { id: 'cacheSize', display: 'cacheSizeValue' },
        { id: 'delayBetweenActions', display: 'delayBetweenActionsValue' }
    ];
    
    ranges.forEach(range => {
        const el = document.getElementById(range.id);
        const displayEl = document.getElementById(range.display);
        if (el && displayEl) {
            el.addEventListener('input', function() {
                if (range.format) {
                    displayEl.textContent = range.format(this.value);
                } else {
                    displayEl.textContent = this.value;
                }
            });
        }
    });
}

// Update performance settings based on selected mode
function updatePerformancePreset() {
    const mode = document.querySelector('input[name="performanceMode"]:checked').value;
    
    switch(mode) {
        case 'high':
            setCheckbox('enableOCR', true);
            setCheckbox('enableComplexAnalysis', true);
            setCheckbox('enableAutoSolve', true);
            setCheckbox('enableRealTime', true);
            setRange('maxConcurrentTasks', 5, 5);
            setCheckbox('enableCache', true);
            setRange('cacheSize', 200, 200);
            setCheckbox('lazyLoading', false);
            setCheckbox('minimizeDOM', false);
            setCheckbox('batchProcessing', true);
            break;
            
        case 'balanced':
            setCheckbox('enableOCR', true);
            setCheckbox('enableComplexAnalysis', true);
            setCheckbox('enableAutoSolve', true);
            setCheckbox('enableRealTime', true);
            setRange('maxConcurrentTasks', 3, 3);
            setCheckbox('enableCache', true);
            setRange('cacheSize', 100, 100);
            setCheckbox('lazyLoading', true);
            setCheckbox('minimizeDOM', true);
            setCheckbox('batchProcessing', true);
            break;
            
        case 'low':
            setCheckbox('enableOCR', false);
            setCheckbox('enableComplexAnalysis', false);
            setCheckbox('enableAutoSolve', true);
            setCheckbox('enableRealTime', false);
            setRange('maxConcurrentTasks', 1, 1);
            setCheckbox('enableCache', true);
            setRange('cacheSize', 50, 50);
            setCheckbox('lazyLoading', true);
            setCheckbox('minimizeDOM', true);
            setCheckbox('batchProcessing', false);
            break;
    }
}

// Test AI server connection
function testConnection() {
    const url = document.getElementById('aiServerUrl').value;
    const statusBadge = document.getElementById('connectionStatus');
    
    statusBadge.textContent = 'Проверка...';
    statusBadge.className = 'status-badge connecting';
    
    fetch(`${url}/api/status`)
        .then(response => {
            if (!response.ok) throw new Error('Server error');
            return response.json();
        })
        .then(data => {
            if (data.ai_loaded && data.browser_connected) {
                statusBadge.textContent = 'Подключено';
                statusBadge.className = 'status-badge connected';
                showToast('✅ Соединение с ИИ установлено!', 'success');
            } else {
                statusBadge.textContent = 'Частично подключено';
                statusBadge.className = 'status-badge warning';
                showToast('⚠️ ИИ загружен, но браузер не подключен', 'warning');
            }
        })
        .catch(error => {
            statusBadge.textContent = 'Не подключено';
            statusBadge.className = 'status-badge disconnected';
            showToast('❌ Не удалось подключиться к ИИ. Проверьте адрес сервера.', 'error');
        });
}

// Check AI connection on load
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

// Save settings
function saveSettings() {
    const settings = collectFormData();
    
    chrome.storage.sync.set(settings, function() {
        currentSettings = { ...settings };
        showToast('✅ Настройки сохранены!', 'success');
        
        // Send update to background script
        chrome.runtime.sendMessage({ 
            action: 'settingsUpdated', 
            settings: settings 
        });
    });
}

// Collect all form data
function collectFormData() {
    return {
        // General
        extensionEnabled: getCheckbox('extensionEnabled'),
        language: getSelect('language'),
        theme: getSelect('theme'),
        popupWidth: parseInt(getInput('popupWidth')) || 300,
        fontSize: getSelect('fontSize'),
        
        // Notifications
        showNotifications: getCheckbox('showNotifications'),
        playSounds: getCheckbox('playSounds'),
        notificationDuration: parseInt(getInput('notificationDuration')) || 3,
        
        // AI
        aiServerUrl: getInput('aiServerUrl'),
        aiModel: getSelect('aiModel'),
        temperature: parseFloat(getInput('temperature')) || 0.7,
        maxLength: parseInt(getInput('maxLength')) || 500,
        confidenceThreshold: parseFloat(getInput('confidenceThreshold')) || 0.7,
        enableOCR: getCheckbox('enableOCR'),
        enableComplexAnalysis: getCheckbox('enableComplexAnalysis'),
        enableAutoSolve: getCheckbox('enableAutoSolve'),
        enableRealTime: getCheckbox('enableRealTime'),
        
        // Behavior
        mode: getRadio('mode'),
        autoFillInputs: getCheckbox('autoFillInputs'),
        autoClickButtons: getCheckbox('autoClickButtons'),
        autoSubmitForms: getCheckbox('autoSubmitForms'),
        autoNavigate: getCheckbox('autoNavigate'),
        defaultPlatform: getSelect('defaultPlatform'),
        delayBetweenActions: parseInt(getInput('delayBetweenActions')) || 500,
        processAllTabs: getCheckbox('processAllTabs'),
        maxConcurrentTasks: parseInt(getInput('maxConcurrentTasks')) || 3,
        
        // Context
        defaultSubject: getSelect('defaultSubject'),
        contextTemplate: getTextarea('contextTemplate'),
        userContext: getTextarea('userContext'),
        priorityMath: getCheckbox('priorityMath'),
        priorityPhysics: getCheckbox('priorityPhysics'),
        priorityBiology: getCheckbox('priorityBiology'),
        priorityChemistry: getCheckbox('priorityChemistry'),
        priorityHistory: getCheckbox('priorityHistory'),
        priorityInformatics: getCheckbox('priorityInformatics'),
        priorityLanguages: getCheckbox('priorityLanguages'),
        priorityStatistics: getCheckbox('priorityStatistics'),
        detectMathProblems: getCheckbox('detectMathProblems'),
        detectTextProblems: getCheckbox('detectTextProblems'),
        detectMultipleChoice: getCheckbox('detectMultipleChoice'),
        detectOpenQuestions: getCheckbox('detectOpenQuestions'),
        
        // Performance
        performanceMode: getRadio('performanceMode'),
        enableCache: getCheckbox('enableCache'),
        cacheSize: parseInt(getInput('cacheSize')) || 100,
        lazyLoading: getCheckbox('lazyLoading'),
        minimizeDOM: getCheckbox('minimizeDOM'),
        batchProcessing: getCheckbox('batchProcessing')
    };
}

// Helper functions for getting form values
function getCheckbox(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

function getSelect(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function getInput(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function getTextarea(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function getRadio(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
}

// Reset settings to default
function resetSettings() {
    if (confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
        chrome.storage.sync.set(DEFAULT_SETTINGS, function() {
            currentSettings = { ...DEFAULT_SETTINGS };
            populateForm();
            showToast('✅ Настройки сброшены!', 'success');
        });
    }
}

// Setup theme
function setupTheme() {
    const theme = document.getElementById('theme').value || currentSettings.theme;
    document.body.setAttribute('data-theme', theme);
}

// Load system information
function loadSystemInfo() {
    // Extension version
    const manifest = chrome.runtime.getManifest();
    document.getElementById('extVersion').textContent = manifest.version || '1.0.0';
    
    // Browser info
    const userAgent = navigator.userAgent;
    let browserInfo = 'Unknown';
    if (userAgent.includes('Chrome')) browserInfo = 'Chrome';
    else if (userAgent.includes('Firefox')) browserInfo = 'Firefox';
    else if (userAgent.includes('Edge')) browserInfo = 'Edge';
    else if (userAgent.includes('Safari')) browserInfo = 'Safari';
    document.getElementById('browserInfo').textContent = browserInfo;
    
    // Memory info (approximate)
    if (navigator.deviceMemory) {
        document.getElementById('memoryInfo').textContent = navigator.deviceMemory + 'GB';
    } else {
        document.getElementById('memoryInfo').textContent = 'Unknown';
    }
    
    // CPU info (approximate)
    if (navigator.hardwareConcurrency) {
        document.getElementById('cpuInfo').textContent = navigator.hardwareConcurrency + ' cores';
    } else {
        document.getElementById('cpuInfo').textContent = 'Unknown';
    }
    
    // Active tabs
    chrome.tabs.query({}, function(tabs) {
        document.getElementById('tabsCount').textContent = tabs.length;
    });
    
    // Storage usage
    chrome.storage.sync.getBytesInUse(function(bytes) {
        const mb = (bytes / (1024 * 1024)).toFixed(2);
        document.getElementById('storageUsage').textContent = mb + 'MB';
    });
}

// Toast notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

// Modal functions
function showModal(title, body, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').textContent = body;
    
    // Remove existing event listener
    document.getElementById('confirmBtn').onclick = null;
    
    // Add new event listener
    document.getElementById('confirmBtn').addEventListener('click', function() {
        if (onConfirm) onConfirm();
        closeModal();
    });
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('active');
}

// History functions
function loadHistory() {
    chrome.storage.local.get(['history'], function(data) {
        const history = data.history || [];
        renderHistory(history);
        updateStats(history);
    });
}

function renderHistory(history) {
    const tbody = document.getElementById('historyBody');
    
    if (history.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">Нет данных истории</td></tr>';
        return;
    }
    
    tbody.innerHTML = history.slice(0, 100).map((item, index) => {
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleString('ru-RU');
        const platform = item.platform || 'Unknown';
        const subject = item.subject || 'Unknown';
        const type = item.type || 'Unknown';
        const status = item.success ? '✅ Успех' : '❌ Ошибка';
        
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${platform}</td>
                <td>${subject}</td>
                <td>${type}</td>
                <td><span class="status-badge ${item.success ? 'connected' : 'disconnected'}">${item.success ? '✅' : '❌'}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewHistoryItem(${index})" title="Просмотр">👁️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteHistoryItem(${index})" title="Удалить">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewHistoryItem(index) {
    chrome.storage.local.get(['history'], function(data) {
        const history = data.history || [];
        const item = history[index];
        
        if (item) {
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <div class="modal-content">
                    <p><strong>Вопрос:</strong> ${escapeHtml(item.question)}</p>
                    <p><strong>Ответ:</strong> ${escapeHtml(item.answer)}</p>
                    <p><strong>Платформа:</strong> ${item.platform || 'Unknown'}</p>
                    <p><strong>Предмет:</strong> ${item.subject || 'Unknown'}</p>
                    <p><strong>Время:</strong> ${new Date(item.timestamp).toLocaleString('ru-RU')}</p>
                </div>
            `;
            document.getElementById('modalTitle').textContent = 'Подробности решения';
            document.getElementById('confirmBtn').style.display = 'none';
            document.getElementById('confirmModal').classList.add('active');
        }
    });
}

function deleteHistoryItem(index) {
    if (confirm('Удалить этот элемент из истории?')) {
        chrome.storage.local.get(['history'], function(data) {
            const history = data.history || [];
            history.splice(index, 1);
            
            chrome.storage.local.set({ history: history }, function() {
                showToast('🗑️ Запись удалена!', 'success');
                loadHistory();
            });
        });
    }
}

function filterHistory() {
    const search = document.getElementById('historySearch').value.toLowerCase();
    const filter = document.getElementById('historyFilter').value;
    
    chrome.storage.local.get(['history'], function(data) {
        let history = data.history || [];
        
        // Apply filter
        if (filter === 'success') {
            history = history.filter(item => item.success);
        } else if (filter === 'failed') {
            history = history.filter(item => !item.success);
        } else if (filter === 'manual') {
            history = history.filter(item => item.mode === 'manual');
        }
        
        // Apply search
        if (search) {
            history = history.filter(item => 
                (item.question && item.question.toLowerCase().includes(search)) ||
                (item.answer && item.answer.toLowerCase().includes(search)) ||
                (item.platform && item.platform.toLowerCase().includes(search)) ||
                (item.subject && item.subject.toLowerCase().includes(search))
            );
        }
        
        renderHistory(history);
        updateStats(history);
    });
}

function updateStats(history) {
    const total = history.length;
    const success = history.filter(item => item.success).length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
    
    // Calculate average time (if available)
    const times = history.filter(item => item.time).map(item => item.time);
    const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    
    // Get favorite subject
    const subjects = {};
    history.forEach(item => {
        const subject = item.subject || 'Unknown';
        subjects[subject] = (subjects[subject] || 0) + 1;
    });
    const favoriteSubject = Object.keys(subjects).length > 0 
        ? Object.entries(subjects).sort((a, b) => b[1] - a[1])[0][0]
        : '-';
    
    document.getElementById('totalSolved').textContent = total;
    document.getElementById('successRate').textContent = successRate + '%';
    document.getElementById('avgTime').textContent = avgTime + 'с';
    document.getElementById('favoriteSubject').textContent = favoriteSubject;
}

function clearHistory() {
    showModal(
        'Очистить историю',
        'Вы уверены, что хотите удалить всю историю решений?',
        function() {
            chrome.storage.local.set({ history: [] }, function() {
                showToast('🗑️ История очищена!', 'success');
                loadHistory();
            });
        }
    );
}

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
        
        showToast('📥 История экспортирована!', 'success');
    });
}

function importHistory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const history = JSON.parse(e.target.result);
                chrome.storage.local.get(['history'], function(data) {
                    const existingHistory = data.history || [];
                    const newHistory = [...existingHistory, ...history];
                    
                    chrome.storage.local.set({ history: newHistory }, function() {
                        showToast('📤 История импортирована!', 'success');
                        loadHistory();
                    });
                });
            } catch (error) {
                showToast('❌ Ошибка импорта!', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearCache() {
    showModal(
        'Очистить кэш',
        'Вы уверены, что хотите очистить кэш?',
        function() {
            chrome.storage.local.set({ cache: {} }, function() {
                showToast('🧹 Кэш очищен!', 'success');
            });
        }
    );
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU');
}

// Make functions available globally for onclick handlers
window.showModal = showModal;
window.closeModal = closeModal;
window.viewHistoryItem = viewHistoryItem;
window.deleteHistoryItem = deleteHistoryItem;
window.filterHistory = filterHistory;
window.exportHistory = exportHistory;
window.importHistory = importHistory;
window.clearHistory = clearHistory;
window.clearCache = clearCache;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.testConnection = testConnection;
