// Super Calculator Content Script - Full Text Understanding
console.log("Super Calculator Content Script loaded");

let isEnabled = true;
const solvedCache = new Map();

// Регулярные выражения для поиска
const mathPatterns = [
    /(\d+\/\d+)/g,
    /(\d+[\+\-\*\/\^]\d+)/g,
    /(\([^)]+\))/g,
    /([\-+]?\d*x\^?\d*[\-+]?\d*[=]?[\-+]?\d*)/g,
    /(sin|cos|tan|cot|asin|acos|atan|sqrt|cbrt|log|ln|factorial)\s*\([^\)]+\)/gi,
    /(площадь|объем)\s+(\w+)\s+(\w+)\s+([\d\s/\-]+)/gi,
    /(факториал|перестановки|сочетания)\s+(\d+)\s*(\d*)/gi,
    /(\d+)\s+([а-яa-z°]+)\s+в\s+([а-яa-z°]+)/gi,
    /(\d+)\^(\d+)/g,
    /(\d+)%/g
];

const Calculator = {
    mathFunctions: {
        'sin': Math.sin, 'sind': (x) => Math.sin(x * Math.PI / 180),
        'cos': Math.cos, 'cosd': (x) => Math.cos(x * Math.PI / 180),
        'tan': Math.tan, 'tand': (x) => Math.tan(x * Math.PI / 180),
        'cot': (x) => 1 / Math.tan(x),
        'cotd': (x) => 1 / Math.tan(x * Math.PI / 180),
        'asin': Math.asin, 'acos': Math.acos, 'atan': Math.atan,
        'asind': (x) => Math.asin(x) * 180 / Math.PI,
        'acosd': (x) => Math.acos(x) * 180 / Math.PI,
        'atand': (x) => Math.atan(x) * 180 / Math.PI,
        'log': (x, base) => Math.log(x) / Math.log(base || 10),
        'ln': Math.log, 'lg': Math.log10,
        'sqrt': Math.sqrt, 'cbrt': (x) => Math.pow(x, 1/3),
        'sqr': (x) => x * x, 'abs': Math.abs,
        'floor': Math.floor, 'ceil': Math.ceil, 'round': Math.round
    },
    
    constants: {'pi': Math.PI, 'π': Math.PI, 'e': Math.E},
    
    evaluate: function(expr) {
        try {
            let processed = expr;
            for (const [name, value] of Object.entries(this.constants)) {
                processed = processed.replace(new RegExp(name, 'gi'), value);
            }
            for (const [name, func] of Object.entries(this.mathFunctions)) {
                const pattern = new RegExp(`${name}\(([^\)]+)\)`, 'gi');
                processed = processed.replace(pattern, (match, args) => {
                    const argValues = args.split(',').map(a => parseFloat(a.trim()));
                    if (name === 'log' && argValues.length === 2) {
                        return func(argValues[0], argValues[1]);
                    }
                    return func(argValues[0]);
                });
            }
            return eval(processed);
        } catch (e) {
            return null;
        }
    },
    
    solveEquation: function(expr) {
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
    },
    
    geometry: {
        area: {
            'круг': (r) => Math.PI * r * r, 'circle': (r) => Math.PI * r * r,
            'окружность': (r) => Math.PI * r * r, 'квадрат': (a) => a * a,
            'square': (a) => a * a, 'прямоугольник': (a, b) => a * b,
            'rectangle': (a, b) => a * b, 'треугольник': (a, b) => a * b / 2,
            'triangle': (a, b) => a * b / 2, 'трапеция': (a, b, h) => (a + b) / 2 * h,
            'trapezoid': (a, b, h) => (a + b) / 2 * h, 'ромб': (d1, d2) => d1 * d2 / 2,
            'rhombus': (d1, d2) => d1 * d2 / 2, 'параллелограмм': (a, h) => a * h,
            'parallelogram': (a, h) => a * h
        },
        volume: {
            'куб': (a) => a * a * a, 'cube': (a) => a * a * a,
            'параллелепипед': (a, b, c) => a * b * c, 'parallelepiped': (a, b, c) => a * b * c,
            'шар': (r) => (4/3) * Math.PI * r * r * r, 'sphere': (r) => (4/3) * Math.PI * r * r * r,
            'цилиндр': (r, h) => Math.PI * r * r * h, 'cylinder': (r, h) => Math.PI * r * r * h,
            'конус': (r, h) => (1/3) * Math.PI * r * r * h, 'cone': (r, h) => (1/3) * Math.PI * r * r * h,
            'пирамида': (ba, h) => ba * h / 3, 'pyramid': (ba, h) => ba * h / 3
        }
    },
    
    convertUnits: function(value, fromUnit, toUnit) {
        fromUnit = fromUnit.toLowerCase();
        toUnit = toUnit.toLowerCase();
        if (['°c', 'c'].includes(fromUnit) || ['°f', 'f'].includes(fromUnit) || fromUnit === 'k') {
            let fromType = ['°c', 'c'].includes(fromUnit) ? 'c' : ['°f', 'f'].includes(fromUnit) ? 'f' : 'k';
            let toType = ['°c', 'c'].includes(toUnit) ? 'c' : ['°f', 'f'].includes(toUnit) ? 'f' : 'k';
            if (fromType === toType) return value;
            let kelvin = fromType === 'c' ? value + 273.15 : fromType === 'f' ? (value - 32) * 5/9 + 273.15 : value;
            return toType === 'c' ? kelvin - 273.15 : toType === 'f' ? (kelvin - 273.15) * 9/5 + 32 : kelvin;
        }
        const units = {
            'м': 1, 'm': 1, 'см': 0.01, 'cm': 0.01, 'мм': 0.001, 'mm': 0.001,
            'км': 1000, 'km': 1000, 'кг': 1, 'kg': 1, 'г': 0.001, 'g': 0.001,
            'т': 1000, 'ton': 1000, 'с': 1, 'мин': 60, 'min': 60,
            'ч': 3600, 'hour': 3600, 'л': 0.001, 'l': 0.001
        };
        if (fromUnit in units && toUnit in units) {
            return value * units[fromUnit] / units[toUnit];
        }
        return null;
    },
    
    combinatorics: {
        factorial: (n) => n < 0 ? null : Array.from({length: n}, (_, i) => i + 1).reduce((a, b) => a * b, 1),
        permutations: (n, k) => k > n || k < 0 ? null : Array.from({length: k}, (_, i) => n - k + i + 1).reduce((a, b) => a * b, 1),
        combinations: (n, k) => {
            if (k > n || k < 0) return null;
            if (k > n - k) k = n - k;
            let result = 1;
            for (let i = 1; i <= k; i++) result = result * (n - k + i) / i;
            return Math.round(result);
        }
    }
};

function findAllTasks() {
    const textNodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        if (node.nodeValue.trim() && node.parentNode.tagName !== 'SCRIPT' && 
            node.parentNode.tagName !== 'STYLE' && node.parentNode.tagName !== 'NOSCRIPT') {
            textNodes.push(node);
        }
    }
    
    const tasks = [];
    for (const textNode of textNodes) {
        const text = textNode.nodeValue;
        
        // Try text parser first
        const textTask = TextTaskParser.parse(text);
        if (textTask) {
            tasks.push({
                text: textTask.originalText,
                type: 'text',
                node: textNode,
                start: text.indexOf(textTask.originalText),
                end: text.indexOf(textTask.originalText) + textTask.originalText.length,
                solution: textTask,
                isTextTask: true
            });
            continue;
        }
        
        // Try regex patterns
        for (const pattern of mathPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                for (const match of matches) {
                    if (/[a-zа-я]/.test(match[0]) && !/[\d\+\-\*\/\^=()\/]/.test(match[0])) continue;
                    tasks.push({
                        text: match,
                        type: 'expression',
                        node: textNode,
                        start: text.indexOf(match),
                        end: text.indexOf(match) + match.length
                    });
                }
            }
        }
    }
    return tasks;
}

function highlightTasks(tasks) {
    for (const task of tasks) {
        if (solvedCache.has(task.text + task.start)) continue;
        const span = document.createElement('span');
        span.className = 'math-expression';
        span.textContent = task.text;
        span.dataset.originalText = task.text;
        span.dataset.type = task.type;
        span.dataset.solved = 'false';
        if (task.isTextTask) {
            span.dataset.textTask = 'true';
            span.dataset.patternName = task.solution.patternName;
        }
        const parent = task.node.parentNode;
        const before = task.node.splitText(task.start);
        const after = before.splitText(task.text.length);
        parent.insertBefore(span, after);
        parent.removeChild(before);
        solvedCache.set(task.text + task.start, true);
    }
}

function solveExpression(expr) {
    const text = expr.dataset.originalText;
    if (expr.dataset.textTask === 'true') {
        const task = TextTaskParser.parse(text);
        if (task) return {result: task.result, description: task.description, expression: task.expression};
    }
    if (/\d+\/\d+/.test(text)) return {result: Calculator.evaluate(text)};
    if (/\d+[\+\-\*\/\^]\d+/.test(text)) return {result: Calculator.evaluate(text)};
    if (/x/.test(text)) {
        const solutions = Calculator.solveEquation(text);
        if (solutions && solutions.length > 0) return {result: 'x = ' + solutions.join(', x = ')};
        return null;
    }
    if (/sin|cos|tan|cot|sqrt|log|ln|factorial/i.test(text)) return {result: Calculator.evaluate(text)};
    
    const geoMatch = text.match(/(площадь|объем)\s+(\w+)\s+(\w+)\s+([\d\s/\-]+)/i);
    if (geoMatch) {
        const type = geoMatch[1].toLowerCase();
        const shape = geoMatch[2].toLowerCase();
        const params = geoMatch[4].split(/[,\s]+/).filter(p => p).map(p => parseFloat(p));
        if (type === 'площадь' && Calculator.geometry.area[shape]) {
            return {result: Calculator.geometry.area[shape](...params)};
        }
        if (type === 'объем' && Calculator.geometry.volume[shape]) {
            return {result: Calculator.geometry.volume[shape](...params)};
        }
    }
    
    const unitMatch = text.match(/(\d+)\s+([а-яa-z°]+)\s+в\s+([а-яa-z°]+)/i);
    if (unitMatch) {
        const value = parseFloat(unitMatch[1]);
        const fromUnit = unitMatch[2];
        const toUnit = unitMatch[3];
        const result = Calculator.convertUnits(value, fromUnit, toUnit);
        if (result !== null) return {result: result + ' ' + toUnit};
    }
    
    const combMatch = text.match(/(факториал|перестановки|сочетания)\s+(\d+)\s*(\d*)/i);
    if (combMatch) {
        const type = combMatch[1].toLowerCase();
        const n = parseInt(combMatch[2]);
        const k = combMatch[3] ? parseInt(combMatch[3]) : 0;
        if (type === 'факториал') return {result: Calculator.combinatorics.factorial(n)};
        if (type === 'перестановки') return {result: Calculator.combinatorics.permutations(n, k)};
        if (type === 'сочетания') return {result: Calculator.combinatorics.combinations(n, k)};
    }
    
    try { return {result: Calculator.evaluate(text)}; } catch (e) { return null; }
}

function showSolution(event) {
    const expr = event.target;
    if (expr.classList.contains('math-expression') && expr.dataset.solved === 'false') {
        const solution = solveExpression(expr);
        if (solution && solution.result !== null) {
            expr.dataset.solved = 'true';
            let tooltipText = expr.dataset.textTask === 'true' 
                ? `🧠 ${expr.dataset.patternName}\n\n${solution.description}`
                : `${expr.dataset.originalText} = ${solution.result}`;
            expr.title = tooltipText;
            const tooltip = document.createElement('div');
            tooltip.className = 'math-tooltip';
            tooltip.innerHTML = `<strong>${expr.dataset.textTask === 'true' ? '✅ Решение:' : '✅ Ответ:'}</strong><br>${tooltipText.replace(/\n/g, '<br>')}`;
            document.body.appendChild(tooltip);
            const rect = expr.getBoundingClientRect();
            tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 5) + 'px';
            tooltip.style.left = (rect.left + window.scrollX) + 'px';
            expr.dataset.tooltip = 'true';
        }
    }
}

function hideSolution(event) {
    if (event.target.classList.contains('math-expression')) {
        const tooltip = document.querySelector('.math-tooltip');
        if (tooltip) tooltip.remove();
    }
}

function solveAll() {
    const tasks = findAllTasks();
    highlightTasks(tasks);
    document.querySelectorAll('.math-expression').forEach(expr => {
        expr.addEventListener('mouseenter', showSolution);
        expr.addEventListener('mouseleave', hideSolution);
    });
    return tasks.length;
}

function autoFillInputs() {
    document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
        const value = input.value.trim();
        if (value && /[\d\+\-\*\/\^=()\/]/.test(value) && !input.dataset.filled) {
            const result = Calculator.evaluate(value);
            if (result !== null && !isNaN(result)) {
                input.value = result;
                input.dataset.filled = 'true';
            }
        }
    });
}

function init() {
    chrome.storage.sync.get(['enabled'], function(data) {
        isEnabled = data.enabled !== false;
        if (isEnabled) {
            setTimeout(() => {
                solveAll();
                autoFillInputs();
                const observer = new MutationObserver(() => { solveAll(); autoFillInputs(); });
                observer.observe(document.body, { childList: true, subtree: true });
            }, 1000);
        }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
        isEnabled = request.enabled;
        if (isEnabled) { solveAll(); autoFillInputs(); }
        else {
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
    if (request.action === 'solveSelection') {
        const solution = TextTaskParser.parse(request.text);
        if (solution) sendResponse({result: solution.result, description: solution.description});
        else {
            const result = Calculator.evaluate(request.text);
            sendResponse(result !== null ? {result: result} : {error: 'Не удалось решить'});
        }
    }
});

init();
