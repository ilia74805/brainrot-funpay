// Super Calculator Content Script
// Автоматически находит и решает математические задачи на странице

console.log("Super Calculator Content Script loaded");

// Флаг включенности
let isEnabled = true;

// Регулярные выражения для поиска математических выражений
const mathPatterns = [
    // Дроби: 1/2, -3/4, 5/6
    /(\d+\/\d+)/g,
    
    // Простые выражения: 2+2, 3*4, 5-1, 6/2
    /(\d+[\+\-\*\/\^]\d+)/g,
    
    // Выражения со скобками: (1+2), (3*(4+5))
    /(\([^)]+\))/g,
    
    // Уравнения: x^2-4=0, 2x+3=7
    /([\-+]?\d*x\^?\d*[\-+]?\d*[\-+]?\d*=?[\-+]?\d*)/g,
    
    // Тригонометрия: sin(30), cos(45), sqrt(16)
    /(sin|cos|tan|cot|asin|acos|atan|sqrt|cbrt|log|ln|factorial)\s*\([^\)]+\)/gi,
    
    // Геометрия: площадь круг радиус 5
    /(площадь|объем)\s+(\w+)\s+(\w+)\s+([\d\s/\-]+)/gi,
    
    // Комбинаторика: факториал 5, сочетания 5 3
    /(факториал|перестановки|сочетания)\s+(\d+)\s*(\d*)/gi,
    
    // Единицы: 10 м в см
    /(\d+)\s+([а-яa-z°]+)\s+в\s+([а-яa-z°]+)/gi,
    
    // Числа с степенями: 2^3, 10^2
    /(\d+)\^(\d+)/g,
    
    // Проценты: 20%, 50%
    /(\d+)%/g
];

// Функции калькулятора (локальные, без обращения к серверу)
const Calculator = {
    // Вычисление дробей
    evalFraction: function(expr) {
        try {
            // Заменяем дроби на операции деления
            let processed = expr.replace(/(\d+)\/(\d+)/g, '($1/$2)');
            // Добавляем явное умножение
            processed = processed.replace(/(\d+)(\()/, '$1*$2');
            // Вычисляем
            return eval(processed);
        } catch (e) {
            return null;
        }
    },
    
    // Тригонометрия
    mathFunctions: {
        'sin': Math.sin,
        'cos': Math.cos,
        'tan': Math.tan,
        'cot': (x) => 1 / Math.tan(x),
        'asin': Math.asin,
        'acos': Math.acos,
        'atan': Math.atan,
        'sqrt': Math.sqrt,
        'cbrt': (x) => Math.pow(x, 1/3),
        'log': (x, base) => Math.log(x) / Math.log(base || 10),
        'ln': Math.log,
        'factorial': (n) => {
            if (n < 0) return null;
            let result = 1;
            for (let i = 2; i <= n; i++) result *= i;
            return result;
        }
    },
    
    // Константы
    constants: {
        'pi': Math.PI,
        'π': Math.PI,
        'e': Math.E
    },
    
    // Вычисление выражений с функциями
    evaluate: function(expr) {
        try {
            // Заменяем константы
            for (const [name, value] of Object.entries(this.constants)) {
                expr = expr.replace(new RegExp(name, 'gi'), value);
            }
            
            // Заменяем функции
            for (const [name, func] of Object.entries(this.mathFunctions)) {
                const pattern = new RegExp(name + '\(([^\)]+)\)', 'gi');
                expr = expr.replace(pattern, (match, args) => {
                    const argValues = args.split(',').map(a => parseFloat(a.trim()));
                    if (name === 'log' && argValues.length === 2) {
                        return func(argValues[0], argValues[1]);
                    }
                    return func(argValues[0]);
                });
            }
            
            // Вычисляем
            return eval(expr);
        } catch (e) {
            return null;
        }
    },
    
    // Решение уравнений
    solveEquation: function(expr) {
        // Убираем =0
        expr = expr.replace('=0', '').replace('=', '').replace(/\s+/g, '');
        
        // Квадратное уравнение: ax^2 + bx + c = 0
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
        
        // Линейное уравнение: ax + b = 0
        const linMatch = expr.match(/([\-+]?\d*\.?\d*)x([\-+]?\d*\.?\d*)/);
        if (linMatch) {
            let a = parseFloat(linMatch[1] || '1');
            let b = parseFloat(linMatch[2] || '0');
            if (a === 0) return b === 0 ? ['∞'] : [];
            return [-b / a];
        }
        
        return null;
    },
    
    // Геометрия
    geometry: {
        area: {
            'круг': (r) => Math.PI * r * r,
            'circle': (r) => Math.PI * r * r,
            'окружность': (r) => Math.PI * r * r,
            'квадрат': (a) => a * a,
            'square': (a) => a * a,
            'прямоугольник': (a, b) => a * b,
            'rectangle': (a, b) => a * b,
            'треугольник': (a, b) => a * b / 2,
            'triangle': (a, b) => a * b / 2,
            'трапеция': (a, b, h) => (a + b) / 2 * h,
            'trapezoid': (a, b, h) => (a + b) / 2 * h,
            'ромб': (d1, d2) => d1 * d2 / 2,
            'rhombus': (d1, d2) => d1 * d2 / 2,
            'параллелограмм': (a, h) => a * h,
            'parallelogram': (a, h) => a * h
        },
        volume: {
            'куб': (a) => a * a * a,
            'cube': (a) => a * a * a,
            'параллелепипед': (a, b, c) => a * b * c,
            'parallelepiped': (a, b, c) => a * b * c,
            'шар': (r) => (4/3) * Math.PI * r * r * r,
            'sphere': (r) => (4/3) * Math.PI * r * r * r,
            'сфера': (r) => (4/3) * Math.PI * r * r * r,
            'цилиндр': (r, h) => Math.PI * r * r * h,
            'cylinder': (r, h) => Math.PI * r * r * h,
            'конус': (r, h) => (1/3) * Math.PI * r * r * h,
            'cone': (r, h) => (1/3) * Math.PI * r * r * h,
            'пирамида': (ba, h) => ba * h / 3,
            'pyramid': (ba, h) => ba * h / 3
        }
    },
    
    // Конвертация единиц
    convertUnits: function(value, fromUnit, toUnit) {
        fromUnit = fromUnit.toLowerCase();
        toUnit = toUnit.toLowerCase();
        
        // Температура
        if (['°c', 'c', 'цел'].includes(fromUnit) || ['°f', 'f', 'фар'].includes(fromUnit) || fromUnit === 'k') {
            let fromType = ['°c', 'c', 'цел'].includes(fromUnit) ? 'c' : ['°f', 'f', 'фар'].includes(fromUnit) ? 'f' : 'k';
            let toType = ['°c', 'c', 'цел'].includes(toUnit) ? 'c' : ['°f', 'f', 'фар'].includes(toUnit) ? 'f' : 'k';
            
            if (fromType === toType) return value;
            
            let kelvin = fromType === 'c' ? value + 273.15 : 
                         fromType === 'f' ? (value - 32) * 5/9 + 273.15 : value;
            
            return toType === 'c' ? kelvin - 273.15 :
                   toType === 'f' ? (kelvin - 273.15) * 9/5 + 32 : kelvin;
        }
        
        // Другие единицы
        const units = {
            'м': 1, 'm': 1, 'см': 0.01, 'cm': 0.01, 'мм': 0.001, 'mm': 0.001,
            'км': 1000, 'km': 1000, 'кг': 1, 'kg': 1, 'г': 0.001, 'g': 0.001,
            'с': 1, 'мин': 60, 'min': 60, 'ч': 3600, 'hour': 3600,
            'л': 0.001, 'l': 0.001, 'мл': 0.000001, 'ml': 0.000001
        };
        
        if (fromUnit in units && toUnit in units) {
            return value * units[fromUnit] / units[toUnit];
        }
        
        return null;
    },
    
    // Комбинаторика
    combinatorics: {
        factorial: (n) => {
            if (n < 0) return null;
            let result = 1;
            for (let i = 2; i <= n; i++) result *= i;
            return result;
        },
        permutations: (n, k) => {
            if (k > n || k < 0) return null;
            let result = 1;
            for (let i = n - k + 1; i <= n; i++) result *= i;
            return result;
        },
        combinations: (n, k) => {
            if (k > n || k < 0) return null;
            if (k > n - k) k = n - k;
            let result = 1;
            for (let i = 1; i <= k; i++) {
                result = result * (n - k + i) / i;
            }
            return Math.round(result);
        }
    }
};

// Поиск математических выражений на странице
function findMathExpressions() {
    const textNodes = [];
    
    // Собираем все текстовые узлы
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        if (node.nodeValue.trim() && node.parentNode.tagName !== 'SCRIPT' && node.parentNode.tagName !== 'STYLE') {
            textNodes.push(node);
        }
    }
    
    const expressions = [];
    
    // Ищем выражения в каждом узле
    for (const textNode of textNodes) {
        const text = textNode.nodeValue;
        
        for (const pattern of mathPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                for (const match of matches) {
                    // Проверяем, что это не часть слова
                    if (/[a-zа-я]/.test(match[0]) && !/[\d\+\-\*\/\^=()\/]/.test(match[0])) {
                        continue;
                    }
                    
                    expressions.push({
                        text: match,
                        node: textNode,
                        start: text.indexOf(match),
                        end: text.indexOf(match) + match.length
                    });
                }
            }
        }
    }
    
    return expressions;
}

// Подсветка найденных выражений
function highlightExpressions(expressions) {
    for (const expr of expressions) {
        const span = document.createElement('span');
        span.className = 'math-expression';
        span.textContent = expr.text;
        span.dataset.originalText = expr.text;
        span.dataset.solved = 'false';
        
        // Разбиваем текстовый узел
        const parent = expr.node.parentNode;
        const before = expr.node.splitText(expr.start);
        const after = before.splitText(expr.text.length);
        
        parent.insertBefore(span, after);
        parent.removeChild(before);
    }
}

// Решение выражения
function solveExpression(expr) {
    const text = expr.dataset.originalText;
    
    // Проверяем тип выражения
    
    // 1. Дробь
    if (/\d+\/\d+/.test(text)) {
        return Calculator.evalFraction(text);
    }
    
    // 2. Простое выражение
    if (/\d+[\+\-\*\/\^]\d+/.test(text)) {
        return Calculator.evaluate(text);
    }
    
    // 3. Уравнение
    if (/x/.test(text)) {
        const solutions = Calculator.solveEquation(text);
        if (solutions && solutions.length > 0) {
            return 'x = ' + solutions.join(', x = ');
        }
        return null;
    }
    
    // 4. Тригонометрия
    if (/sin|cos|tan|cot|sqrt|log|ln|factorial/i.test(text)) {
        return Calculator.evaluate(text);
    }
    
    // 5. Геометрия
    const geoMatch = text.match(/(площадь|объем)\s+(\w+)\s+(\w+)\s+([\d\s/\-]+)/i);
    if (geoMatch) {
        const type = geoMatch[1].toLowerCase();
        const shape = geoMatch[2].toLowerCase();
        const paramType = geoMatch[3].toLowerCase();
        const params = geoMatch[4].split(/[,\s]+/).filter(p => p).map(p => parseFloat(p));
        
        if (type === 'площадь' && Calculator.geometry.area[shape]) {
            return Calculator.geometry.area[shape](...params);
        }
        if (type === 'объем' && Calculator.geometry.volume[shape]) {
            return Calculator.geometry.volume[shape](...params);
        }
    }
    
    // 6. Единицы
    const unitMatch = text.match(/(\d+)\s+([а-яa-z°]+)\s+в\s+([а-яa-z°]+)/i);
    if (unitMatch) {
        const value = parseFloat(unitMatch[1]);
        const fromUnit = unitMatch[2];
        const toUnit = unitMatch[3];
        const result = Calculator.convertUnits(value, fromUnit, toUnit);
        if (result !== null) {
            return result + ' ' + toUnit;
        }
    }
    
    // 7. Комбинаторика
    const combMatch = text.match(/(факториал|перестановки|сочетания)\s+(\d+)\s*(\d*)/i);
    if (combMatch) {
        const type = combMatch[1].toLowerCase();
        const n = parseInt(combMatch[2]);
        const k = combMatch[3] ? parseInt(combMatch[3]) : 0;
        
        if (type === 'факториал') {
            return Calculator.combinatorics.factorial(n);
        }
        if (type === 'перестановки') {
            return Calculator.combinatorics.permutations(n, k);
        }
        if (type === 'сочетания') {
            return Calculator.combinatorics.combinations(n, k);
        }
    }
    
    // 8. Проценты
    const percentMatch = text.match(/(\d+)%/);
    if (percentMatch) {
        return parseFloat(percentMatch[1]) / 100;
    }
    
    // 9. Пробуем вычислить как обычное выражение
    try {
        return Calculator.evaluate(text);
    } catch (e) {
        return null;
    }
}

// Отображение решения при наведении
function showSolution(event) {
    const expr = event.target;
    if (expr.classList.contains('math-expression') && expr.dataset.solved === 'false') {
        const result = solveExpression(expr);
        if (result !== null) {
            expr.title = 'Результат: ' + result;
            expr.dataset.solved = 'true';
            
            // Создаем tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'math-tooltip';
            tooltip.textContent = expr.dataset.originalText + ' = ' + result;
            document.body.appendChild(tooltip);
            
            // Позиционируем tooltip
            const rect = expr.getBoundingClientRect();
            tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 5) + 'px';
            tooltip.style.left = (rect.left + window.scrollX) + 'px';
            
            expr.dataset.tooltip = tooltip.id;
        }
    }
}

// Удаление tooltip
function hideSolution(event) {
    const expr = event.target;
    if (expr.classList.contains('math-expression') && expr.dataset.tooltip) {
        const tooltip = document.querySelector('.math-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
}

// Автоматическое решение всех задач на странице
function solveAll() {
    const expressions = findMathExpressions();
    highlightExpressions(expressions);
    
    // Добавляем обработчики событий
    document.querySelectorAll('.math-expression').forEach(expr => {
        expr.addEventListener('mouseenter', showSolution);
        expr.addEventListener('mouseleave', hideSolution);
    });
    
    console.log('Найдено выражений:', expressions.length);
    return expressions.length;
}

// Автоматическое заполнение полей ввода
function autoFillInputs() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
    
    for (const input of inputs) {
        const value = input.value.trim();
        if (value && /[\d\+\-\*\/\^=()\/]/.test(value)) {
            const result = Calculator.evaluate(value);
            if (result !== null && !isNaN(result)) {
                // Не перезаписываем, если пользователь уже что-то ввел
                if (!input.dataset.filled) {
                    input.value = result;
                    input.dataset.filled = 'true';
                }
            }
        }
    }
}

// Основная функция инициализации
function init() {
    // Проверяем, включено ли расширение
    chrome.storage.sync.get(['enabled'], function(data) {
        isEnabled = data.enabled !== false;
        
        if (isEnabled) {
            // Ждем загрузки страницы
            setTimeout(() => {
                solveAll();
                autoFillInputs();
                
                // Добавляем обработчик для новых элементов (AJAX, динамический контент)
                const observer = new MutationObserver((mutations) => {
                    solveAll();
                    autoFillInputs();
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: false,
                    characterData: false
                });
            }, 1000);
        }
    });
}

// Прослушиваем сообщения от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
        isEnabled = request.enabled;
        if (isEnabled) {
            solveAll();
            autoFillInputs();
        } else {
            // Удаляем подсветку
            document.querySelectorAll('.math-expression').forEach(el => {
                const textNode = document.createTextNode(el.dataset.originalText);
                el.parentNode.replaceChild(textNode, el);
            });
            document.querySelectorAll('.math-tooltip').forEach(el => el.remove());
        }
        sendResponse({status: 'ok'});
    }
    
    if (request.action === 'solveAll') {
        const count = solveAll();
        sendResponse({count: count});
    }
    
    if (request.action === 'getStatus') {
        sendResponse({enabled: isEnabled});
    }
});

// Запускаем инициализацию
init();
