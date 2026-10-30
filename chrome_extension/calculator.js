// Super Calculator - Chrome Extension

// Переключение вкладок
function showTab(tabName) {
    // Скрываем все вкладки
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Убираем активность с кнопок
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Показываем выбранную вкладку
    document.getElementById(tabName).classList.add('active');
    
    // Активируем кнопку
    event.target.classList.add('active');
    
    // Обновляем список фигур при переключении на геометрию
    if (tabName === 'geometry') {
        updateGeometryShapes();
    }
}

// Обновление списка фигур в зависимости от типа
function updateGeometryShapes() {
    const type = document.getElementById('geo-type').value;
    const shapeSelect = document.getElementById('geo-shape');
    
    if (type === 'area') {
        shapeSelect.innerHTML = '
            <option value="circle">Круг</option>
            <option value="square">Квадрат</option>
            <option value="rectangle">Прямоугольник</option>
            <option value="triangle">Треугольник</option>
            <option value="trapezoid">Трапеция</option>
            <option value="rhombus">Ромб</option>
            <option value="parallelogram">Параллелограмм</option>
        ';
    } else {
        shapeSelect.innerHTML = '
            <option value="cube">Куб</option>
            <option value="parallelepiped">Параллелепипед</option>
            <option value="sphere">Шар</option>
            <option value="cylinder">Цилиндр</option>
            <option value="cone">Конус</option>
            <option value="pyramid">Пирамида</option>
        ';
    }
}

// Вычисление дробей
async function calculateFraction() {
    const expr = document.getElementById('frac-input').value;
    if (!expr) return;
    
    try {
        const response = await fetch('https://api.calculatorsuper.ru/frac', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({expr})
        });
        const result = await response.json();
        document.getElementById('frac-result').textContent = result;
    } catch (e) {
        // Локальное вычисление
        try {
            const result = eval(expr.replace(/\//g, '/'));
            document.getElementById('frac-result').textContent = 'Результат: ' + result;
        } catch (e2) {
            document.getElementById('frac-result').textContent = 'Ошибка: ' + e2.message;
        }
    }
}

// Вычисление геометрии
async function calculateGeometry() {
    const type = document.getElementById('geo-type').value;
    const shape = document.getElementById('geo-shape').value;
    const params = document.getElementById('geo-params').value.split(',').map(p => parseFloat(p.trim()));
    
    if (params.some(isNaN)) {
        document.getElementById('geo-result').textContent = 'Ошибка: неверные параметры';
        return;
    }
    
    // Локальное вычисление
    let result;
    const shapeMap = {
        'circle': {area: (r) => Math.PI * r * r},
        'square': {area: (a) => a * a},
        'rectangle': {area: (a, b) => a * b},
        'triangle': {area: (a, b) => a * b / 2},
        'trapezoid': {area: (a, b, h) => (a + b) / 2 * h},
        'rhombus': {area: (d1, d2) => d1 * d2 / 2},
        'parallelogram': {area: (a, h) => a * h},
        'cube': {volume: (a) => a * a * a},
        'parallelepiped': {volume: (a, b, c) => a * b * c},
        'sphere': {volume: (r) => (4/3) * Math.PI * r * r * r},
        'cylinder': {volume: (r, h) => Math.PI * r * r * h},
        'cone': {volume: (r, h) => (1/3) * Math.PI * r * r * h},
        'pyramid': {volume: (ba, h) => ba * h / 3}
    };
    
    const func = type === 'area' ? shapeMap[shape]?.area : shapeMap[shape]?.volume;
    if (func) {
        result = func(...params);
        document.getElementById('geo-result').textContent = 'Результат: ' + result.toFixed(6);
    } else {
        document.getElementById('geo-result').textContent = 'Ошибка: неверная фигура';
    }
}

// Вычисление тригонометрии
async function calculateTrig() {
    const expr = document.getElementById('trig-input').value;
    if (!expr) return;
    
    try {
        // Заменяем русские функции на английские
        const funcMap = {
            'sin': 'Math.sin', 'cos': 'Math.cos', 'tan': 'Math.tan',
            'sind': 'x=>Math.sin(x*Math.PI/180)', 'cosd': 'x=>Math.cos(x*Math.PI/180)',
            'tand': 'x=>Math.tan(x*Math.PI/180)',
            'sqrt': 'Math.sqrt', 'log': 'Math.log10', 'ln': 'Math.log',
            'lg': 'Math.log10', 'pi': 'Math.PI', 'e': 'Math.E'
        };
        
        let processed = expr;
        for (const [rus, eng] of Object.entries(funcMap)) {
            processed = processed.replace(new RegExp(rus, 'g'), eng);
        }
        
        // Вычисляем
        const result = eval(processed);
        document.getElementById('trig-result').textContent = 'Результат: ' + result.toFixed(6);
    } catch (e) {
        document.getElementById('trig-result').textContent = 'Ошибка: ' + e.message;
    }
}

// Решение уравнений
async function solveEquation() {
    const expr = document.getElementById('eq-input').value.replace(/\s+/g, '').replace('=', '');
    if (!expr) return;
    
    // Решаем квадратное уравнение ax^2 + bx + c = 0
    const quadMatch = expr.match(/([\-+]?\d*\.?\d*)x\^2([\-+]\d*\.?\d*)x([\-+]\d*\.?\d*)/);
    if (quadMatch) {
        let a = parseFloat(quadMatch[1] || '1');
        let b = parseFloat(quadMatch[2] || '0');
        let c = parseFloat(quadMatch[3] || '0');
        
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            document.getElementById('eq-result').textContent = 'Нет действительных решений';
        } else if (discriminant === 0) {
            const x = -b / (2 * a);
            document.getElementById('eq-result').textContent = 'x = ' + x.toFixed(6);
        } else {
            const sqrtD = Math.sqrt(discriminant);
            const x1 = (-b + sqrtD) / (2 * a);
            const x2 = (-b - sqrtD) / (2 * a);
            document.getElementById('eq-result').textContent = 'x₁ = ' + x1.toFixed(6) + '\nx₂ = ' + x2.toFixed(6);
        }
        return;
    }
    
    // Решаем линейное уравнение ax + b = 0
    const linMatch = expr.match(/([\-+]?\d*\.?\d*)x([\-+]\d*\.?\d*)/);
    if (linMatch) {
        let a = parseFloat(linMatch[1] || '1');
        let b = parseFloat(linMatch[2] || '0');
        
        if (a === 0) {
            document.getElementById('eq-result').textContent = b === 0 ? 'Бесконечно много решений' : 'Нет решений';
        } else {
            const x = -b / a;
            document.getElementById('eq-result').textContent = 'x = ' + x.toFixed(6);
        }
        return;
    }
    
    document.getElementById('eq-result').textContent = 'Ошибка: неверное уравнение';
}

// Конвертация единиц
async function convertUnits() {
    const value = parseFloat(document.getElementById('unit-value').value);
    const fromUnit = document.getElementById('unit-from').value.toLowerCase();
    const toUnit = document.getElementById('unit-to').value.toLowerCase();
    
    if (isNaN(value)) {
        document.getElementById('unit-result').textContent = 'Ошибка: неверное значение';
        return;
    }
    
    // Конвертация температуры
    if (['°c', 'c', 'цел'].includes(fromUnit) || ['°f', 'f', 'фар'].includes(fromUnit) || fromUnit === 'k') {
        let fromType, toType;
        
        if (['°c', 'c', 'цел'].includes(fromUnit)) fromType = 'c';
        else if (['°f', 'f', 'фар'].includes(fromUnit)) fromType = 'f';
        else fromType = 'k';
        
        if (['°c', 'c', 'цел'].includes(toUnit)) toType = 'c';
        else if (['°f', 'f', 'фар'].includes(toUnit)) toType = 'f';
        else toType = 'k';
        
        if (fromType === toType) {
            document.getElementById('unit-result').textContent = value + ' ' + toUnit;
            return;
        }
        
        let kelvin;
        if (fromType === 'c') kelvin = value + 273.15;
        else if (fromType === 'f') kelvin = (value - 32) * 5/9 + 273.15;
        else kelvin = value;
        
        let result;
        if (toType === 'c') result = kelvin - 273.15;
        else if (toType === 'f') result = (kelvin - 273.15) * 9/5 + 32;
        else result = kelvin;
        
        document.getElementById('unit-result').textContent = value + ' ' + fromUnit + ' = ' + result.toFixed(6) + ' ' + toUnit;
        return;
    }
    
    // Конвертация других единиц
    const units = {
        'м': 1, 'm': 1, 'см': 0.01, 'cm': 0.01, 'мм': 0.001, 'mm': 0.001,
        'км': 1000, 'km': 1000, 'кг': 1, 'kg': 1, 'г': 0.001, 'g': 0.001,
        'с': 1, 'мин': 60, 'min': 60, 'ч': 3600, 'hour': 3600,
        'л': 0.001, 'l': 0.001, 'мл': 0.000001, 'ml': 0.000001
    };
    
    if (fromUnit in units && toUnit in units) {
        const result = value * units[fromUnit] / units[toUnit];
        document.getElementById('unit-result').textContent = value + ' ' + fromUnit + ' = ' + result.toFixed(6) + ' ' + toUnit;
    } else {
        document.getElementById('unit-result').textContent = 'Ошибка: неверные единицы';
    }
}

// Вычисление комбинаторики
async function calculateCombinatorics() {
    const type = document.getElementById('comb-type').value;
    const n = parseInt(document.getElementById('comb-n').value);
    const k = parseInt(document.getElementById('comb-k').value);
    
    if (isNaN(n) || (type !== 'factorial' && isNaN(k))) {
        document.getElementById('comb-result').textContent = 'Ошибка: неверные значения';
        return;
    }
    
    if (type === 'factorial') {
        let result = 1;
        for (let i = 1; i <= n; i++) result *= i;
        document.getElementById('comb-result').textContent = n + '! = ' + result;
    } else if (type === 'permutations') {
        if (k > n) {
            document.getElementById('comb-result').textContent = 'Ошибка: k > n';
            return;
        }
        let result = 1;
        for (let i = n - k + 1; i <= n; i++) result *= i;
        document.getElementById('comb-result').textContent = 'A(' + n + ',' + k + ') = ' + result;
    } else if (type === 'combinations') {
        if (k > n) {
            document.getElementById('comb-result').textContent = 'Ошибка: k > n';
            return;
        }
        let k2 = k > n - k ? n - k : k;
        let result = 1;
        for (let i = 1; i <= k2; i++) {
            result = result * (n - k2 + i) / i;
        }
        document.getElementById('comb-result').textContent = 'C(' + n + ',' + k + ') = ' + Math.round(result);
    }
}

// Инициализация
window.onload = function() {
    // Устанавливаем обработчики для обновления фигур
    document.getElementById('geo-type').addEventListener('change', updateGeometryShapes);
};
