// Text Task Parser - Advanced Problem Solver for Russian/English
// Handles: arithmetic, geometry, algebra, word problems, fractions

const TextTaskParser = {
    // Helper functions
    gcd: function(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    },
    
    simplifyFraction: function(num, denom) {
        const commonDivisor = this.gcd(num, denom);
        return {numerator: num / commonDivisor, denominator: denom / commonDivisor};
    },
    
    // Pattern definitions
    patterns: [
        {
            name: 'Петя и среднее арифметическое',
            regex: /(?:Петя|Petya|Петр|Peter)\s*(?:написал|создал|вводит|вв[ёе]л|вводит)\s*(?:программу|код|числа|numbers)/i,
            solver: function(text) {
                const increaseMatch = text.match(/(?:увеличивается|возрастает|increases|grows)\s*(?:на|by|на\s+)\s*(\d+)/i);
                const thousandMatch = text.match(/(?:тысячное|1000\-е|1000\-th|тысяча|1000)\s*(?:введ[ёе]нное|число|number)/i);
                
                if (increaseMatch || thousandMatch) {
                    const increase = increaseMatch ? parseInt(increaseMatch[1]) : 3;
                    const n = 1000;
                    const result = increase * 2 * (n - 1);
                    
                    return {
                        result: result,
                        description: `Первое число: a₁\nСреднее после 2-го числа: (a₁ + a₂)/2 = a₁ + ${increase}\n→ a₂ = a₁ + ${increase * 2}\n\nСреднее после 3-го числа: (a₁ + a₂ + a₃)/3 = a₁ + ${increase * 2}\n→ a₃ = a₁ + ${increase * 4}\n\nПаттерн: aₙ = a₁ + ${increase * 2} × (n-1)\n\nДля n = ${n}:\na_${n} = a₁ + ${increase * 2} × ${n-1} = a₁ + ${result}\n\nРазница: ${result}`,
                        expression: `a_1000 = a_1 + ${increase} * 2 * 999 = a_1 + ${result}`,
                        originalText: text,
                        patternName: 'Среднее арифметическое'
                    };
                }
                return null;
            }
        },
        {
            name: 'Арифметическая прогрессия',
            regex: /(?:арифметическая\s+прогрессия|arithmetic\s+progression|разность\s+арифметической|common\s+difference|d\s*=\s*[\d\-]+)/i,
            solver: function(text) {
                const diffMatch = text.match(/(?:разность|difference|d)\s*(?:равна|is|=\s*)\s*([\d\-\.]+)/i);
                const firstMatch = text.match(/(?:первый\s+член|first\s+term|a₁|a1)\s*(?:равен|is|=\s*)\s*([\d\-\.]+)/i);
                const nMatch = text.match(/(?:найти|find|сколько|how\s+much)\s*(?:[\d]+\-й|[\d]+\-th|n\s*=\s*)\s*(\d+)/i);
                
                if (diffMatch) {
                    const d = parseFloat(diffMatch[1]);
                    const n = nMatch ? parseInt(nMatch[1]) : 10;
                    const a1 = firstMatch ? parseFloat(firstMatch[1]) : 0;
                    
                    const an = a1 + d * (n - 1);
                    const sum = n * (2 * a1 + d * (n - 1)) / 2;
                    
                    return {
                        result: an,
                        description: `a₁ = ${a1}, d = ${d}, n = ${n}\n\naₙ = a₁ + d(n-1) = ${a1} + ${d} × ${n-1} = ${an}\nSₙ = n/2 × (2a₁ + d(n-1)) = ${sum}`,
                        expression: `a_${n} = ${a1} + ${d} * ${n-1} = ${an}`,
                        originalText: text,
                        patternName: 'Арифметическая прогрессия'
                    };
                }
                return null;
            }
        },
        {
            name: 'Геометрическая прогрессия',
            regex: /(?:геометрическая\s+прогрессия|geometric\s+progression|знаменатель\s+геометрической|common\s+ratio|q\s*=\s*[\d\-\.\/]+)/i,
            solver: function(text) {
                const ratioMatch = text.match(/(?:знаменатель|ratio|q)\s*(?:равен|is|=\s*)\s*([\d\-\.\/]+)/i);
                const firstMatch = text.match(/(?:первый\s+член|first\s+term|b₁|b1)\s*(?:равен|is|=\s*)\s*([\d\-\.\/]+)/i);
                const nMatch = text.match(/(?:найти|find)\s*(?:[\d]+\-й|[\d]+\-th|n\s*=\s*)\s*(\d+)/i);
                
                if (ratioMatch) {
                    const q = parseFloat(ratioMatch[1]);
                    const n = nMatch ? parseInt(nMatch[1]) : 10;
                    const b1 = firstMatch ? parseFloat(firstMatch[1]) : 1;
                    
                    const bn = b1 * Math.pow(q, n - 1);
                    const sum = b1 * (Math.pow(q, n) - 1) / (q - 1);
                    
                    return {
                        result: bn,
                        description: `b₁ = ${b1}, q = ${q}, n = ${n}\n\nbₙ = b₁ × q^(n-1) = ${b1} × ${q}^${n-1} = ${bn}\nSₙ = b₁ × (q^n - 1)/(q - 1) = ${sum.toFixed(2)}`,
                        expression: `b_${n} = ${b1} * ${q}^${n-1} = ${bn}`,
                        originalText: text,
                        patternName: 'Геометрическая прогрессия'
                    };
                }
                return null;
            }
        },
        {
            name: 'Движение навстречу',
            regex: /(?:движутся\s+навстречу|moving\s+towards|встреча|meet|навстречу\s+друг\s+другу|towards\s+each\s+other)/i,
            solver: function(text) {
                const v1Match = text.match(/(?:скорость\s+первого|speed\s+of\s+first|v₁|v1|первый)\s*(?:равна|is|=\s*|идет|moves)\s*([\d\-\.\,]+)/i);
                const v2Match = text.match(/(?:скорость\s+второго|speed\s+of\s+second|v₂|v2|второй)\s*(?:равна|is|=\s*|идет|moves)\s*([\d\-\.\,]+)/i);
                const sMatch = text.match(/(?:расстояние|distance|s|между\s+ними)\s*(?:равно|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (v1Match && v2Match && sMatch) {
                    const v1 = parseFloat(v1Match[1].replace(',', '.'));
                    const v2 = parseFloat(v2Match[1].replace(',', '.'));
                    const s = parseFloat(sMatch[1].replace(',', '.'));
                    
                    const t = s / (v1 + v2);
                    const meetingPointFromFirst = v1 * t;
                    
                    return {
                        result: t,
                        description: `v₁ = ${v1}, v₂ = ${v2}, s = ${s}\n\nВремя встречи: t = s / (v₁ + v₂) = ${s} / (${v1} + ${v2}) = ${t.toFixed(2)} ч\nРасстояние от первого: ${meetingPointFromFirst.toFixed(2)}`,
                        expression: `t = ${s} / (${v1} + ${v2}) = ${t.toFixed(2)}`,
                        originalText: text,
                        patternName: 'Движение навстречу'
                    };
                }
                return null;
            }
        },
        {
            name: 'Движение вдогонку',
            regex: /(?:движутся\s+в\s+одну\s+сторону|moving\s+in\s+same\s+direction|догоняет|chasing|вдогонку|догнать)/i,
            solver: function(text) {
                const v1Match = text.match(/(?:скорость\s+первого|speed\s+of\s+first|v₁)\s*(?:равна|is|=\s*)\s*([\d\-\.\,]+)/i);
                const v2Match = text.match(/(?:скорость\s+второго|speed\s+of\s+second|v₂)\s*(?:равна|is|=\s*)\s*([\d\-\.\,]+)/i);
                const sMatch = text.match(/(?:расстояние|distance|s)\s*(?:равно|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (v1Match && v2Match && sMatch) {
                    const v1 = parseFloat(v1Match[1].replace(',', '.'));
                    const v2 = parseFloat(v2Match[1].replace(',', '.'));
                    const s = parseFloat(sMatch[1].replace(',', '.'));
                    
                    const relativeV = Math.abs(v1 - v2);
                    const t = s / relativeV;
                    
                    return {
                        result: t,
                        description: `v₁ = ${v1}, v₂ = ${v2}, s = ${s}\n\nОтносительная скорость: |v₁ - v₂| = ${relativeV}\nВремя догонки: t = s / |v₁ - v₂| = ${s} / ${relativeV} = ${t.toFixed(2)} ч`,
                        expression: `t = ${s} / |${v1} - ${v2}| = ${t.toFixed(2)}`,
                        originalText: text,
                        patternName: 'Движение вдогонку'
                    };
                }
                return null;
            }
        },
        {
            name: 'Проценты',
            regex: /(?:процент|percent|%|\s+от\s+|of\s+)/i,
            solver: function(text) {
                const percentMatch = text.match(/(\d+)\s*%/);
                const valueMatch = text.match(/(?:числа|number|значения|value|величины|amount)\s*(?:равно|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (percentMatch && valueMatch) {
                    const percent = parseFloat(percentMatch[1]);
                    const value = parseFloat(valueMatch[1].replace(',', '.'));
                    const result = (percent / 100) * value;
                    
                    return {
                        result: result,
                        description: `${percent}% от ${value} = (${percent}/100) × ${value} = ${result}`,
                        expression: `${percent}% * ${value} = ${result}`,
                        originalText: text,
                        patternName: 'Проценты'
                    };
                }
                
                const partMatch = text.match(/(?:часть|part|составляет|equals)\s*(?:равна|is|=\s*)\s*([\d\-\.\,]+)/i);
                const wholeMatch = text.match(/(?:целое|whole|всего|total|все|all)\s*(?:равно|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (partMatch && wholeMatch) {
                    const part = parseFloat(partMatch[1].replace(',', '.'));
                    const whole = parseFloat(wholeMatch[1].replace(',', '.'));
                    const percent = (part / whole) * 100;
                    
                    return {
                        result: percent,
                        description: `${part} от ${whole} = (${part}/${whole}) × 100% = ${percent.toFixed(2)}%`,
                        expression: `(${part}/${whole}) * 100 = ${percent.toFixed(2)}%`,
                        originalText: text,
                        patternName: 'Проценты (обратная задача)'
                    };
                }
                return null;
            }
        },
        {
            name: 'Пропорция',
            regex: /(?:пропорция|proportion|отношение|ratio|так\s+же|as\s+)/i,
            solver: function(text) {
                const match = text.match(/(\d+)\s*(?:к|:|to)\s*(\d+)\s*(?:как|as|так\s+же)\s*(\d+)\s*(?:к|:|to)\s*(\d+)/i);
                if (match) {
                    const a = parseInt(match[1]);
                    const b = parseInt(match[2]);
                    const c = parseInt(match[3]);
                    const d = parseInt(match[4]);
                    
                    const x = (b * c) / a;
                    
                    return {
                        result: x,
                        description: `${a}:${b} = ${c}:x\n\nx = (${b} × ${c}) / ${a} = ${x}`,
                        expression: `x = (${b} * ${c}) / ${a} = ${x}`,
                        originalText: text,
                        patternName: 'Пропорция'
                    };
                }
                return null;
            }
        },
        {
            name: 'Квадратное уравнение',
            regex: /(?:квадратное\s+уравнение|quadratic\s+equation|x\s*\^\s*2|x\s*в\s*квадрате|ax\^2\s*\+\s*bx\s*\+\s*c)/i,
            solver: function(text) {
                const match = text.match(/(?:\-?\d*\.?\d*)\s*x\s*\^\s*2\s*([\+\-]\s*\d*\.?\d*)\s*x\s*([\+\-]\s*\d*\.?\d*)/i);
                if (match) {
                    const fullText = match[0];
                    const aMatch = fullText.match(/(^|[\+\-])\s*(\d*\.?\d*)/);
                    const a = aMatch ? (aMatch[1] === '-' ? -parseFloat(aMatch[2] || '1') : parseFloat(aMatch[2] || '1')) : 1;
                    const b = parseFloat(match[1].replace(/\s/g, '')) || 0;
                    const c = parseFloat(match[2].replace(/\s/g, '')) || 0;
                    
                    const discriminant = b * b - 4 * a * c;
                    
                    if (discriminant < 0) {
                        return {
                            result: 'Нет действительных корней',
                            description: `a = ${a}, b = ${b}, c = ${c}\n\nD = b² - 4ac = ${b}² - 4×${a}×${c} = ${discriminant} < 0\nНет действительных корней`,
                            expression: `D = ${b}^2 - 4*${a}*${c} = ${discriminant}`,
                            originalText: text,
                            patternName: 'Квадратное уравнение'
                        };
                    }
                    
                    const sqrtD = Math.sqrt(discriminant);
                    const x1 = (-b + sqrtD) / (2 * a);
                    const x2 = (-b - sqrtD) / (2 * a);
                    
                    return {
                        result: discriminant === 0 ? x1 : `x₁ = ${x1}, x₂ = ${x2}`,
                        description: `a = ${a}, b = ${b}, c = ${c}\n\nD = b² - 4ac = ${b}² - 4×${a}×${c} = ${discriminant}\n\nx = [-${b} ± √${discriminant}] / (2×${a})\nx₁ = ${x1}\nx₂ = ${x2}`,
                        expression: `x = [-${b} ± √${discriminant}] / ${2*a}`,
                        originalText: text,
                        patternName: 'Квадратное уравнение'
                    };
                }
                return null;
            }
        },
        {
            name: 'Геометрия - Площадь круга',
            regex: /(?:площадь|area|S)\s*(?:круга|circle|окружности)/i,
            solver: function(text) {
                const rMatch = text.match(/(?:радиус|radius|r|диаметр|diameter)\s*(?:равен|is|=\s*)\s*([\d\-\.\,]+)/i);
                const dMatch = text.match(/(?:диаметр|diameter|d)\s*(?:равен|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (rMatch) {
                    const r = parseFloat(rMatch[1].replace(',', '.'));
                    const area = Math.PI * r * r;
                    return {
                        result: area.toFixed(2),
                        description: `r = ${r}\n\nS = πr² = π × ${r}² = ${area.toFixed(2)}`,
                        expression: `π * ${r}^2 = ${area.toFixed(2)}`,
                        originalText: text,
                        patternName: 'Площадь круга'
                    };
                }
                if (dMatch) {
                    const d = parseFloat(dMatch[1].replace(',', '.'));
                    const r = d / 2;
                    const area = Math.PI * r * r;
                    return {
                        result: area.toFixed(2),
                        description: `d = ${d}, r = ${r}\n\nS = πr² = π × ${r}² = ${area.toFixed(2)}`,
                        expression: `π * (${d}/2)^2 = ${area.toFixed(2)}`,
                        originalText: text,
                        patternName: 'Площадь круга'
                    };
                }
                return null;
            }
        },
        {
            name: 'Геометрия - Площадь квадрата',
            regex: /(?:площадь|area|S)\s*(?:квадрата|square)/i,
            solver: function(text) {
                const aMatch = text.match(/(?:сторона|side|a|длина\s+стороны)\s*(?:равна|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (aMatch) {
                    const a = parseFloat(aMatch[1].replace(',', '.'));
                    const area = a * a;
                    return {
                        result: area,
                        description: `a = ${a}\n\nS = a² = ${a}² = ${area}`,
                        expression: `${a}^2 = ${area}`,
                        originalText: text,
                        patternName: 'Площадь квадрата'
                    };
                }
                return null;
            }
        },
        {
            name: 'Геометрия - Площадь прямоугольника',
            regex: /(?:площадь|area|S)\s*(?:прямоугольника|rectangle)/i,
            solver: function(text) {
                const aMatch = text.match(/(?:длина|length|a|сторона)\s*(?:равна|is|=\s*)\s*([\d\-\.\,]+)/i);
                const bMatch = text.match(/(?:ширина|width|b|другая\s+сторона)\s*(?:равна|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (aMatch && bMatch) {
                    const a = parseFloat(aMatch[1].replace(',', '.'));
                    const b = parseFloat(bMatch[1].replace(',', '.'));
                    const area = a * b;
                    return {
                        result: area,
                        description: `a = ${a}, b = ${b}\n\nS = a × b = ${a} × ${b} = ${area}`,
                        expression: `${a} * ${b} = ${area}`,
                        originalText: text,
                        patternName: 'Площадь прямоугольника'
                    };
                }
                return null;
            }
        },
        {
            name: 'Геометрия - Площадь треугольника',
            regex: /(?:площадь|area|S)\s*(?:треугольника|triangle)/i,
            solver: function(text) {
                const baseMatch = text.match(/(?:основание|base|a)\s*(?:равно|is|=\s*)\s*([\d\-\.\,]+)/i);
                const heightMatch = text.match(/(?:высота|height|h)\s*(?:равна|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (baseMatch && heightMatch) {
                    const base = parseFloat(baseMatch[1].replace(',', '.'));
                    const height = parseFloat(heightMatch[1].replace(',', '.'));
                    const area = 0.5 * base * height;
                    return {
                        result: area,
                        description: `основание = ${base}, высота = ${height}\n\nS = ½ × основание × высота = ½ × ${base} × ${height} = ${area}`,
                        expression: `0.5 * ${base} * ${height} = ${area}`,
                        originalText: text,
                        patternName: 'Площадь треугольника'
                    };
                }
                return null;
            }
        },
        {
            name: 'Геометрия - Объем куба',
            regex: /(?:объем|volume|V)\s*(?:куба|cube)/i,
            solver: function(text) {
                const aMatch = text.match(/(?:ребро|edge|a|сторона)\s*(?:равно|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (aMatch) {
                    const a = parseFloat(aMatch[1].replace(',', '.'));
                    const volume = a * a * a;
                    return {
                        result: volume,
                        description: `a = ${a}\n\nV = a³ = ${a}³ = ${volume}`,
                        expression: `${a}^3 = ${volume}`,
                        originalText: text,
                        patternName: 'Объем куба'
                    };
                }
                return null;
            }
        },
        {
            name: 'Геометрия - Объем шара',
            regex: /(?:объем|volume|V)\s*(?:шара|sphere|сферы)/i,
            solver: function(text) {
                const rMatch = text.match(/(?:радиус|radius|r)\s*(?:равен|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (rMatch) {
                    const r = parseFloat(rMatch[1].replace(',', '.'));
                    const volume = (4/3) * Math.PI * r * r * r;
                    return {
                        result: volume.toFixed(2),
                        description: `r = ${r}\n\nV = (4/3)πr³ = (4/3) × π × ${r}³ = ${volume.toFixed(2)}`,
                        expression: `(4/3) * π * ${r}^3 = ${volume.toFixed(2)}`,
                        originalText: text,
                        patternName: 'Объем шара'
                    };
                }
                return null;
            }
        },
        {
            name: 'Геометрия - Объем цилиндра',
            regex: /(?:объем|volume|V)\s*(?:цилиндра|cylinder)/i,
            solver: function(text) {
                const rMatch = text.match(/(?:радиус|radius|r)\s*(?:равен|is|=\s*)\s*([\d\-\.\,]+)/i);
                const hMatch = text.match(/(?:высота|height|h)\s*(?:равна|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (rMatch && hMatch) {
                    const r = parseFloat(rMatch[1].replace(',', '.'));
                    const h = parseFloat(hMatch[1].replace(',', '.'));
                    const volume = Math.PI * r * r * h;
                    return {
                        result: volume.toFixed(2),
                        description: `r = ${r}, h = ${h}\n\nV = πr²h = π × ${r}² × ${h} = ${volume.toFixed(2)}`,
                        expression: `π * ${r}^2 * ${h} = ${volume.toFixed(2)}`,
                        originalText: text,
                        patternName: 'Объем цилиндра'
                    };
                }
                return null;
            }
        },
        {
            name: 'Теорема Пифагора',
            regex: /(?:Пифагор|Pythagoras|прямоугольный\s+треугольник|right\s+triangle|гипотенуза|hypotenuse)/i,
            solver: function(text) {
                const hypMatch = text.match(/(?:гипотенуза|hypotenuse|c)\s*(?:равна|is|=\s*)\s*([\d\-\.\,]+)/i);
                const leg1Match = text.match(/(?:катет|leg|a)\s*(?:равен|is|=\s*)\s*([\d\-\.\,]+)/i);
                const leg2Match = text.match(/(?:другой\s+катет|other\s+leg|b)\s*(?:равен|is|=\s*)\s*([\d\-\.\,]+)/i);
                
                if (hypMatch && leg1Match) {
                    const c = parseFloat(hypMatch[1].replace(',', '.'));
                    const a = parseFloat(leg1Match[1].replace(',', '.'));
                    const b = Math.sqrt(c * c - a * a);
                    return {
                        result: b.toFixed(2),
                        description: `c = ${c}, a = ${a}\n\nb = √(c² - a²) = √(${c}² - ${a}²) = √${(c*c - a*a).toFixed(2)} = ${b.toFixed(2)}`,
                        expression: `√(${c}^2 - ${a}^2) = ${b.toFixed(2)}`,
                        originalText: text,
                        patternName: 'Теорема Пифагора'
                    };
                }
                
                if (leg1Match && leg2Match) {
                    const a = parseFloat(leg1Match[1].replace(',', '.'));
                    const b = parseFloat(leg2Match[1].replace(',', '.'));
                    const c = Math.sqrt(a * a + b * b);
                    return {
                        result: c.toFixed(2),
                        description: `a = ${a}, b = ${b}\n\nc = √(a² + b²) = √(${a}² + ${b}²) = √${(a*a + b*b).toFixed(2)} = ${c.toFixed(2)}`,
                        expression: `√(${a}^2 + ${b}^2) = ${c.toFixed(2)}`,
                        originalText: text,
                        patternName: 'Теорема Пифагора'
                    };
                }
                return null;
            }
        },
        {
            name: 'Совместная работа',
            regex: /(?:работа|work|производительность|productivity|вместе|together|за\s+сколько|how\s+long)/i,
            solver: function(text) {
                const time1Match = text.match(/(?:первый|first|rabotnik|рабочий)\s*(?:выполняет|does|делает|заканчивает)\s*(?:работу|work|задачу|task)\s*(?:за|in|в\s+течение)\s*(\d+)\s*(?:час|hours|ч|day|дней|минут)/i);
                const time2Match = text.match(/(?:второй|second|rabotnik|рабочий)\s*(?:выполняет|does|делает|заканчивает)\s*(?:работу|work|задачу|task)\s*(?:за|in|в\s+течение)\s*(\d+)\s*(?:час|hours|ч|day|дней|минут)/i);
                
                if (time1Match && time2Match) {
                    const t1 = parseInt(time1Match[1]);
                    const t2 = parseInt(time2Match[1]);
                    
                    const rate1 = 1 / t1;
                    const rate2 = 1 / t2;
                    const combinedRate = rate1 + rate2;
                    const timeTogether = 1 / combinedRate;
                    
                    return {
                        result: timeTogether.toFixed(2),
                        description: `Первый выполняет за ${t1} ч → производительность: 1/${t1} работ/ч\nВторой выполняет за ${t2} ч → производительность: 1/${t2} работ/ч\nОбщая производительность: 1/${t1} + 1/${t2} = ${combinedRate.toFixed(4)} работ/ч\nВремя вместе: 1 / ${combinedRate.toFixed(4)} = ${timeTogether.toFixed(2)} ч`,
                        expression: `1 / (1/${t1} + 1/${t2}) = ${timeTogether.toFixed(2)}`,
                        originalText: text,
                        patternName: 'Совместная работа'
                    };
                }
                return null;
            }
        },
        {
            name: 'Дроби (сложение/вычитание)',
            regex: /(\d+\/\d+)\s*([\+\-])\s*(\d+\/\d+)/,
            solver: function(text) {
                const match = text.match(/(\d+)\/(\d+)\s*([\+\-])\s*(\d+)\/(\d+)/);
                if (match) {
                    const a = parseInt(match[1]);
                    const b = parseInt(match[2]);
                    const op = match[3];
                    const c = parseInt(match[4]);
                    const d = parseInt(match[5]);
                    
                    const commonDenom = b * d;
                    const num1 = a * d;
                    const num2 = c * b;
                    let resultNum;
                    
                    if (op === '+') {
                        resultNum = num1 + num2;
                    } else {
                        resultNum = num1 - num2;
                    }
                    
                    const simplified = this.simplifyFraction(resultNum, commonDenom);
                    const decimal = resultNum / commonDenom;
                    
                    return {
                        result: simplified.numerator === simplified.denominator ? simplified.numerator : 
                               `${simplified.numerator}/${simplified.denominator} ≈ ${decimal.toFixed(4)}`,
                        description: `${a}/${b} ${op} ${c}/${d} = (${a}×${d})/${b}×${d} ${op} (${c}×${b})/${b}×${d} = ${num1}/${commonDenom} ${op} ${num2}/${commonDenom} = ${resultNum}/${commonDenom} = ${simplified.numerator}/${simplified.denominator}`,
                        expression: `${a}/${b} ${op} ${c}/${d} = ${simplified.numerator}/${simplified.denominator}`,
                        originalText: text,
                        patternName: 'Дроби'
                    };
                }
                return null;
            }
        },
        {
            name: 'Дроби (умножение/деление)',
            regex: /(\d+\/\d+)\s*([\*\/])\s*(\d+\/\d+)/,
            solver: function(text) {
                const match = text.match(/(\d+)\/(\d+)\s*([\*\/])\s*(\d+)\/(\d+)/);
                if (match) {
                    const a = parseInt(match[1]);
                    const b = parseInt(match[2]);
                    const op = match[3];
                    const c = parseInt(match[4]);
                    const d = parseInt(match[5]);
                    
                    let resultNum, resultDenom;
                    
                    if (op === '*') {
                        resultNum = a * c;
                        resultDenom = b * d;
                    } else {
                        resultNum = a * d;
                        resultDenom = b * c;
                    }
                    
                    const simplified = this.simplifyFraction(resultNum, resultDenom);
                    const decimal = resultNum / resultDenom;
                    
                    return {
                        result: simplified.numerator === simplified.denominator ? simplified.numerator : 
                               `${simplified.numerator}/${simplified.denominator} ≈ ${decimal.toFixed(4)}`,
                        description: `${a}/${b} ${op} ${c}/${d} = (${a}×${c})/(${b}×${d}) = ${resultNum}/${resultDenom} = ${simplified.numerator}/${simplified.denominator}`,
                        expression: `${a}/${b} ${op} ${c}/${d} = ${simplified.numerator}/${simplified.denominator}`,
                        originalText: text,
                        patternName: 'Дроби (умножение/деление)'
                    };
                }
                return null;
            }
        },
        {
            name: 'Скорость-Время-Расстояние',
            regex: /(?:скорость|speed|v|время|time|t|расстояние|distance|s|s\s*=\s*v\s*\*\s*t|v\s*=\s*s\/t|t\s*=\s*s\/v)/i,
            solver: function(text) {
                const vMatch = text.match(/(?:скорость|speed|v|идет\s+со\s+скоростью)\s*(?:равна|is|=\s*|составляет)\s*([\d\-\.\,]+)/i);
                const tMatch = text.match(/(?:время|time|t|за\s+время)\s*(?:равно|is|=\s*|составило)\s*([\d\-\.\,]+)/i);
                const sMatch = text.match(/(?:расстояние|distance|s|пройденное\s+расстояние)\s*(?:равно|is|=\s*|составило)\s*([\d\-\.\,]+)/i);
                
                const missing = [];
                if (!vMatch) missing.push('v');
                if (!tMatch) missing.push('t');
                if (!sMatch) missing.push('s');
                
                if (missing.length === 1) {
                    const v = vMatch ? parseFloat(vMatch[1].replace(',', '.')) : null;
                    const t = tMatch ? parseFloat(tMatch[1].replace(',', '.')) : null;
                    const s = sMatch ? parseFloat(sMatch[1].replace(',', '.')) : null;
                    
                    if (missing[0] === 's' && v && t) {
                        return {
                            result: (v * t).toFixed(2),
                            description: `v = ${v}, t = ${t}\n\ns = v × t = ${v} × ${t} = ${(v * t).toFixed(2)}`,
                            expression: `${v} * ${t} = ${(v * t).toFixed(2)}`,
                            originalText: text,
                            patternName: 'Скорость-Время-Расстояние'
                        };
                    }
                    
                    if (missing[0] === 't' && v && s) {
                        return {
                            result: (s / v).toFixed(2),
                            description: `s = ${s}, v = ${v}\n\nt = s / v = ${s} / ${v} = ${(s / v).toFixed(2)}`,
                            expression: `${s} / ${v} = ${(s / v).toFixed(2)}`,
                            originalText: text,
                            patternName: 'Скорость-Время-Расстояние'
                        };
                    }
                    
                    if (missing[0] === 'v' && s && t) {
                        return {
                            result: (s / t).toFixed(2),
                            description: `s = ${s}, t = ${t}\n\nv = s / t = ${s} / ${t} = ${(s / t).toFixed(2)}`,
                            expression: `${s} / ${t} = ${(s / t).toFixed(2)}`,
                            originalText: text,
                            patternName: 'Скорость-Время-Расстояние'
                        };
                    }
                }
                return null;
            }
        }
    ],
    
    parse: function(text) {
        if (!text || typeof text !== 'string') return null;
        
        // Clean text
        const cleanText = text.replace(/\s+/g, ' ').trim();
        
        // Try all patterns
        for (const pattern of this.patterns) {
            if (pattern.regex.test(cleanText)) {
                const result = pattern.solver(cleanText);
                if (result) {
                    return result;
                }
            }
        }
        
        // Try to parse simple expressions
        const simpleMatch = cleanText.match(/([\d\s\+\-\*\/\^().\/]+)/);
        if (simpleMatch) {
            try {
                const expr = simpleMatch[1].replace(/\s/g, '');
                // Replace common math functions for evaluation
                let evalExpr = expr
                    .replace(/\bpi\b/gi, 'Math.PI')
                    .replace(/\be\b/gi, 'Math.E')
                    .replace(/\bsqrt\b/gi, 'Math.sqrt')
                    .replace(/\bsin\b/gi, 'Math.sin')
                    .replace(/\bcos\b/gi, 'Math.cos')
                    .replace(/\btan\b/gi, 'Math.tan')
                    .replace(/\blog\b/gi, 'Math.log10')
                    .replace(/\bln\b/gi, 'Math.log');
                
                const result = eval(evalExpr);
                if (!isNaN(result) && isFinite(result)) {
                    return {
                        result: result,
                        description: `${expr} = ${result}`,
                        expression: expr,
                        originalText: text,
                        patternName: 'Простое выражение'
                    };
                }
            } catch (e) {
                // Ignore evaluation errors
            }
        }
        
        return null;
    }
};
