/**
 * Content Script для Mr. 7B
 * Работает на каждой странице и взаимодействует с AI Server
 */

console.log('🚀 Mr. 7B Content Script загружен');

// Состояние
let isEnabled = true;
let currentAnalysis = null;

// Прослушиваем сообщения от background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'toggle':
            isEnabled = request.enabled;
            if (isEnabled) {
                analyzeAndHighlight();
            } else {
                removeHighlights();
            }
            sendResponse({ success: true });
            break;
            
        case 'analyzePage':
            analyzePage().then(analysis => {
                currentAnalysis = analysis;
                sendResponse(analysis);
            }).catch(error => {
                sendResponse({ error: error.message });
            });
            break;
            
        case 'autoSolve':
            autoSolvePage().then(result => {
                sendResponse(result);
            }).catch(error => {
                sendResponse({ error: error.message });
            });
            break;
            
        case 'solveSelection':
            solveSelectedText(request.text).then(solution => {
                sendResponse(solution);
            }).catch(error => {
                sendResponse({ error: error.message });
            });
            break;
            
        default:
            sendResponse({ error: 'Неизвестное действие' });
    }
    
    return true; // Для асинхронных ответов
});

// Анализ страницы
async function analyzePage() {
    const html = document.documentElement.outerHTML;
    const url = window.location.href;
    
    // Отправляем запрос на AI Server
    const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ html, url })
    });
    
    if (!response.ok) {
        throw new Error('Ошибка анализа страницы');
    }
    
    const analysis = await response.json();
    return analysis;
}

// Авто-решение страницы
async function autoSolvePage() {
    const html = document.documentElement.outerHTML;
    const url = window.location.href;
    
    // Отправляем запрос на полное авто-решение
    const response = await fetch('http://localhost:3000/api/auto-solve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ html, url })
    });
    
    if (!response.ok) {
        throw new Error('Ошибка авто-решения');
    }
    
    const result = await response.json();
    
    // Выделяем найденные элементы
    if (result.analysis && result.analysis.questions) {
        highlightQuestions(result.analysis.questions);
    }
    
    // Показываем уведомление
    showNotification(`🎯 Найдено ${result.analysis?.questions?.length || 0} вопросов, решены ${result.answers?.length || 0}`);
    
    return result;
}

// Решение выделенного текста
async function solveSelectedText(text) {
    const response = await fetch('http://localhost:3000/api/solve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: text })
    });
    
    if (!response.ok) {
        throw new Error('Ошибка решения');
    }
    
    const solution = await response.json();
    return solution;
}

// Выделение вопросов на странице
function highlightQuestions(questions) {
    removeHighlights();
    
    questions.forEach((question, index) => {
        try {
            const element = document.querySelector(question.selector);
            if (element) {
                const span = document.createElement('span');
                span.className = 'mr7b-question';
                span.dataset.questionIndex = index;
                span.dataset.originalText = element.textContent;
                span.innerHTML = element.innerHTML;
                
                element.parentNode.replaceChild(span, element);
                
                // Добавляем подсказку при наведении
                span.title = `Вопрос ${index + 1}: ${question.text.substring(0, 100)}...`;
            }
        } catch (error) {
            console.error('Ошибка выделения вопроса:', error);
        }
    });
}

// Удаление выделений
function removeHighlights() {
    document.querySelectorAll('.mr7b-question').forEach(el => {
        const span = document.createElement('span');
        span.innerHTML = el.dataset.originalText || el.innerHTML;
        el.parentNode.replaceChild(span, el);
    });
}

// Автоматическое выделение и анализ
function analyzeAndHighlight() {
    analyzePage().then(analysis => {
        currentAnalysis = analysis;
        if (analysis.questions && analysis.questions.length > 0) {
            highlightQuestions(analysis.questions);
            showNotification(`🔍 Найдено ${analysis.questions.length} вопросов`);
        }
    }).catch(error => {
        console.error('Ошибка авто-анализа:', error);
    });
}

// Отображение уведомлений на странице
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'mr7b-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Стили уведомления
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '10px',
        zIndex: '999999',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        animation: 'mr7b-fadeIn 0.3s, mr7b-fadeOut 0.3s 3s'
    });
    
    setTimeout(() => {
        notification.remove();
    }, 3500);
}

// CSS стили
const style = document.createElement('style');
style.textContent = `
    .mr7b-question {
        background: linear-gradient(135deg, rgba(30, 58, 138, 0.2), rgba(59, 130, 246, 0.2));
        border-left: 4px solid #3b82f6;
        padding: 8px 12px;
        margin: 5px 0;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .mr7b-question:hover {
        background: linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(59, 130, 246, 0.4));
        transform: translateX(5px);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }
    
    @keyframes mr7b-fadeIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes mr7b-fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(20px); }
    }
`;
document.head.appendChild(style);

// Проверяем включено ли расширение
chrome.storage.sync.get(['enabled'], (data) => {
    isEnabled = data.enabled !== false;
    if (isEnabled) {
        setTimeout(analyzeAndHighlight, 1000);
    }
});

// Наблюдаем за изменениями DOM
const observer = new MutationObserver(() => {
    if (isEnabled) {
        analyzeAndHighlight();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
});

console.log('🎯 Mr. 7B Content Script готов к работе!');
