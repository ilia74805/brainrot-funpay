// Super Calculator Popup Script

// Текущее состояние
let isEnabled = true;
let foundCount = 0;

// Инициализация
window.onload = function() {
    // Загружаем состояние
    chrome.storage.sync.get(['enabled'], function(data) {
        isEnabled = data.enabled !== false;
        updateUI();
    });
    
    // Устанавливаем обработчики
    document.getElementById('toggle-switch').addEventListener('change', toggleExtension);
    
    // Проверяем текущую вкладку
    checkCurrentTab();
};

// Переключение расширения
function toggleExtension() {
    isEnabled = document.getElementById('toggle-switch').checked;
    chrome.storage.sync.set({enabled: isEnabled});
    
    // Отправляем сообщение background script
    chrome.runtime.sendMessage({action: 'setStatus', enabled: isEnabled});
    
    updateUI();
}

// Обновление интерфейса
function updateUI() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const toggleSwitch = document.getElementById('toggle-switch');
    
    if (isEnabled) {
        statusIndicator.classList.remove('off');
        statusText.textContent = 'Расширение включено';
        toggleSwitch.checked = true;
    } else {
        statusIndicator.classList.add('off');
        statusText.textContent = 'Расширение выключено';
        toggleSwitch.checked = false;
    }
    
    // Update auto-test stats
    updateAutoTestStats();
}

// Auto-test functions
function startAutoTest() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'startAutoTest'}, function(response) {
            if (response && response.success) {
                updateAutoTestStats();
                showNotification('✅ Авто-тест запущен!');
            } else {
                showNotification('⚠️ Не удалось запустить авто-тест');
            }
        });
    });
}

function stopAutoTest() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'stopAutoTest'}, function(response) {
            if (response && response.success) {
                updateAutoTestStats();
                showNotification('❌ Авто-тест остановлен');
            }
        });
    });
    
    // Also stop multi-tab solver
    MultiTabSolver.stop();
}

function updateAutoTestStats() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'getAutoTestStats'}, function(response) {
            if (response) {
                const statsEl = document.getElementById('auto-test-stats');
                statsEl.textContent = `Авто-тест: ${response.solved} ✅ | ${response.failed} ❌`;
            }
        });
    });
    
    // Update multi-tab stats
    updateMultiTabStats();
}

function updateMultiTabStats() {
    const statsEl = document.getElementById('auto-test-stats');
    const multiTabStats = MultiTabSolver.getStats();
    if (multiTabStats.isRunning) {
        statsEl.textContent += ` | Все вкладки: ${multiTabStats.solvedTabs}/${multiTabStats.totalTabs} ✅`;
    }
}

function startMultiTab() {
    showNotification('🌐 Запускаю решение во всех вкладках...');
    MultiTabSolver.solveAllTabs(function(result) {
        if (result.action === 'finished') {
            showNotification(`✅ Готово! ${result.solved} ✅ | ${result.failed} ❌`);
            updateAutoTestStats();
        } else if (result.action === 'no_tabs') {
            showNotification('⚠️ Нет вкладок с тестами');
        }
    });
    updateAutoTestStats();
}

function solveCurrentAndNext() {
    showNotification('➡️ Решаю текущую и следующую вкладку...');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length === 0) return;
        
        const currentTab = tabs[0];
        
        // Solve current tab
        chrome.tabs.sendMessage(currentTab.id, {action: 'startAutoTest'}, function(response) {
            if (response && response.success) {
                showNotification('✅ Текущая вкладка решена!');
            } else {
                showNotification('⚠️ Не удалось решить текущую вкладку');
            }
            
            // Move to next tab
            setTimeout(() => {
                chrome.tabs.query({}, function(allTabs) {
                    const currentIndex = allTabs.findIndex(t => t.id === currentTab.id);
                    if (currentIndex < allTabs.length - 1) {
                        const nextTab = allTabs[currentIndex + 1];
                        chrome.tabs.update(nextTab.id, {active: true}, function() {
                            setTimeout(() => {
                                chrome.tabs.sendMessage(nextTab.id, {action: 'startAutoTest'}, function(response) {
                                    if (response && response.success) {
                                        showNotification('✅ Следующая вкладка решена!');
                                    } else {
                                        showNotification('⚠️ Не удалось решить следующую вкладку');
                                    }
                                });
                            }, 1000);
                        });
                    } else {
                        showNotification('ℹ️ Это последняя вкладка');
                    }
                });
            }, 2000);
        });
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.background = 'rgba(0,0,0,0.8)';
    notification.style.color = 'white';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '9999';
    notification.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2s forwards';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Проверка текущей вкладки
function checkCurrentTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
                if (response && response.enabled !== undefined) {
                    isEnabled = response.enabled;
                    updateUI();
                }
            });
        }
    });
}

// Решение всех задач на странице
function solveAll() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'solveAll'}, function(response) {
                if (response && response.count !== undefined) {
                    foundCount = response.count;
                    document.getElementById('found-count').textContent = foundCount;
                    showNotification('Найдено ' + foundCount + ' выражений');
                }
            });
        }
    });
}

// Обновление страницы
function refreshPage() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
            chrome.tabs.reload(tabs[0].id);
        }
    });
}

// Показ уведомления
function showNotification(message) {
    // Создаем временный элемент для уведомления
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

// Переключение вкладок
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Ручной ввод
function calculateManual() {
    const input = document.getElementById('manual-input');
    const result = document.getElementById('manual-result');
    const expr = input.value.trim();
    
    if (!expr) {
        result.textContent = 'Введите выражение';
        return;
    }
    
    // Пробуем вычислить
    try {
        // Проверяем тип выражения
        
        // Уравнение
        if (/x/.test(expr)) {
            const solutions = solveEquation(expr);
            if (solutions && solutions.length > 0) {
                result.textContent = 'Решения:\n' + solutions.join('\n');
            } else {
                result.textContent = 'Нет решений';
            }
            return;
        }
        
        // Геометрия
        const geoMatch = expr.match(/(площадь|объем)\s+(\w+)\s+(\w+)\s+([\d\s/\-]+)/i);
        if (geoMatch) {
            const type = geoMatch[1].toLowerCase();
            const shape = geoMatch[2].toLowerCase();
            const params = geoMatch[4].split(/[,\s]+/).filter(p => p).map(p => parseFloat(p));
            
            const geometry = {
                area: {
                    'круг': (r) => Math.PI * r * r,
                    'circle': (r) => Math.PI * r * r,
                    'квадрат': (a) => a * a,
                    'square': (a) => a * a,
                    'прямоугольник': (a, b) => a * b,
                    'rectangle': (a, b) => a * b,
                    'треугольник': (a, b) => a * b / 2,
                    'triangle': (a, b) => a * b / 2
                },
                volume: {
                    'куб': (a) => a * a * a,
                    'cube': (a) => a * a * a,
                    'шар': (r) => (4/3) * Math.PI * r * r * r,
                    'sphere': (r) => (4/3) * Math.PI * r * r * r
                }
            };
            
            const func = type === 'площадь' ? geometry.area[shape] : geometry.volume[shape];
            if (func) {
                const res = func(...params);
                result.textContent = 'Результат: ' + res.toFixed(6);
            } else {
                result.textContent = 'Неизвестная фигура';
            }
            return;
        }
        
        // Единицы
        const unitMatch = expr.match(/(\d+)\s+([а-яa-z°]+)\s+в\s+([а-яa-z°]+)/i);
        if (unitMatch) {
            const value = parseFloat(unitMatch[1]);
            const fromUnit = unitMatch[2].toLowerCase();
            const toUnit = unitMatch[3].toLowerCase();
            const res = convertUnits(value, fromUnit, toUnit);
            if (res !== null) {
                result.textContent = value + ' ' + fromUnit + ' = ' + res.toFixed(6) + ' ' + toUnit;
            } else {
                result.textContent = 'Неизвестные единицы';
            }
            return;
        }
        
        // Комбинаторика
        const combMatch = expr.match(/(факториал|перестановки|сочетания)\s+(\d+)\s*(\d*)/i);
        if (combMatch) {
            const type = combMatch[1].toLowerCase();
            const n = parseInt(combMatch[2]);
            const k = combMatch[3] ? parseInt(combMatch[3]) : 0;
            
            if (type === 'факториал') {
                result.textContent = n + '! = ' + factorial(n);
            } else if (type === 'перестановки') {
                result.textContent = 'A(' + n + ',' + k + ') = ' + permutations(n, k);
            } else if (type === 'сочетания') {
                result.textContent = 'C(' + n + ',' + k + ') = ' + combinations(n, k);
            }
            return;
        }
        
        // Обычное выражение
        const res = evaluateExpression(expr);
        if (res !== null) {
            result.textContent = expr + ' = ' + res.toFixed(6);
        } else {
            result.textContent = 'Ошибка вычисления';
        }
    } catch (e) {
        result.textContent = 'Ошибка: ' + e.message;
    }
}

// Вспомогательные функции
function solveEquation(expr) {
    expr = expr.replace(/\s+/g, '').replace('=', '');
    
    const quadMatch = expr.match(/([\-+]?\d*\.?\d*)x\^2([\-+]?\d*\.?\d*)x([\-+]?\d*\.?\d*)/);
    if (quadMatch) {
        let a = parseFloat(quadMatch[1] || '1');
        let b = parseFloat(quadMatch[2] || '0');
        let c = parseFloat(quadMatch[3] || '0');
        
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return [];
        if (discriminant === 0) return [-b / (2 * a)];
        
        const sqrtD = Math.sqrt(discriminant);
        return [(-b + sqrtD) / (2 * a), (-b - sqrtD) / (2 * a)];
    }
    
    const linMatch = expr.match(/([\-+]?\d*\.?\d*)x([\-+]?\d*\.?\d*)/);
    if (linMatch) {
        let a = parseFloat(linMatch[1] || '1');
        let b = parseFloat(linMatch[2] || '0');
        if (a === 0) return b === 0 ? ['∞'] : [];
        return [-b / a];
    }
    
    return null;
}

function convertUnits(value, fromUnit, toUnit) {
    fromUnit = fromUnit.toLowerCase();
    toUnit = toUnit.toLowerCase();
    
    if (['°c', 'c', 'цел'].includes(fromUnit) || ['°f', 'f', 'фар'].includes(fromUnit) || fromUnit === 'k') {
        let fromType = ['°c', 'c', 'цел'].includes(fromUnit) ? 'c' : ['°f', 'f', 'фар'].includes(fromUnit) ? 'f' : 'k';
        let toType = ['°c', 'c', 'цел'].includes(toUnit) ? 'c' : ['°f', 'f', 'фар'].includes(toUnit) ? 'f' : 'k';
        
        if (fromType === toType) return value;
        
        let kelvin = fromType === 'c' ? value + 273.15 : 
                     fromType === 'f' ? (value - 32) * 5/9 + 273.15 : value;
        
        return toType === 'c' ? kelvin - 273.15 :
               toType === 'f' ? (kelvin - 273.15) * 9/5 + 32 : kelvin;
    }
    
    const units = {
        'м': 1, 'm': 1, 'см': 0.01, 'cm': 0.01, 'мм': 0.001, 'mm': 0.001,
        'км': 1000, 'km': 1000, 'кг': 1, 'kg': 1, 'г': 0.001, 'g': 0.001
    };
    
    if (fromUnit in units && toUnit in units) {
        return value * units[fromUnit] / units[toUnit];
    }
    
    return null;
}

function factorial(n) {
    if (n < 0) return null;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function permutations(n, k) {
    if (k > n || k < 0) return null;
    let result = 1;
    for (let i = n - k + 1; i <= n; i++) result *= i;
    return result;
}

function combinations(n, k) {
    if (k > n || k < 0) return null;
    if (k > n - k) k = n - k;
    let result = 1;
    for (let i = 1; i <= k; i++) {
        result = result * (n - k + i) / i;
    }
    return Math.round(result);
}

function evaluateExpression(expr) {
    try {
        // Заменяем константы
        expr = expr.replace(/pi/gi, Math.PI);
        expr = expr.replace(/π/gi, Math.PI);
        expr = expr.replace(/e/gi, Math.E);
        
        // Заменяем функции
        expr = expr.replace(/sin\(([^\)]+)\)/gi, 'Math.sin($1)');
        expr = expr.replace(/cos\(([^\)]+)\)/gi, 'Math.cos($1)');
        expr = expr.replace(/tan\(([^\)]+)\)/gi, 'Math.tan($1)');
        expr = expr.replace(/sqrt\(([^\)]+)\)/gi, 'Math.sqrt($1)');
        expr = expr.replace(/log\(([^\)]+)\)/gi, 'Math.log10($1)');
        expr = expr.replace(/ln\(([^\)]+)\)/gi, 'Math.log($1)');
        
        // Вычисляем
        return eval(expr);
    } catch (e) {
        return null;
    }
}

// Настройки
function showSettings() {
    alert('Настройки:\n\n' +
          '1. Включите/выключите расширение переключателем\n' +
          '2. Нажмите "Найти все задачи" для сканирования страницы\n' +
          '3. Наводите на выделенные выражения для просмотра решений\n' +
          '4. В ручном режиме можно вводить выражения напрямую');
}

// CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
