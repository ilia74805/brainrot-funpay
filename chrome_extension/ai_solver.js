// AI-Powered Universal Problem Solver
// This module attempts to solve ANY problem using multiple strategies

const AISolver = {
    // Strategy 1: Pattern-based solving (fast, deterministic)
    patternSolver: typeof TextTaskParser !== 'undefined' ? TextTaskParser : null,
    
    // Strategy 2: Expression evaluation
    evaluateExpression: function(expr) {
        try {
            // Clean and prepare expression
            let cleanExpr = expr
                .replace(/\s+/g, '')
                .replace(/,[\d]/g, '.')  // Replace comma decimals
                .replace(/\bpi\b/gi, 'Math.PI')
                .replace(/\be\b/gi, 'Math.E')
                .replace(/\bsin\b/gi, 'Math.sin')
                .replace(/\bcos\b/gi, 'Math.cos')
                .replace(/\btan\b/gi, 'Math.tan')
                .replace(/\bcot\b/gi, '1/Math.tan')
                .replace(/\basin\b/gi, 'Math.asin')
                .replace(/\bacos\b/gi, 'Math.acos')
                .replace(/\batan\b/gi, 'Math.atan')
                .replace(/\bsqrt\b/gi, 'Math.sqrt')
                .replace(/\bln\b/gi, 'Math.log')
                .replace(/\blog\b/gi, 'Math.log10')
                .replace(/\blg\b/gi, 'Math.log10')
                .replace(/\bfactorial\b/gi, 'this.factorial')
                .replace(/\babs\b/gi, 'Math.abs')
                .replace(/\bfloor\b/gi, 'Math.floor')
                .replace(/\bceil\b/gi, 'Math.ceil')
                .replace(/\bround\b/gi, 'Math.round');
            
            // Add our helper functions to scope
            const scope = {
                factorial: this.factorial,
                gcd: (typeof TextTaskParser !== 'undefined' && TextTaskParser.gcd) ? TextTaskParser.gcd : ((a, b) => { let t; while (b) { t = b; b = a % b; a = t; } return a; }),
                lcm: this.lcm,
                combinations: this.combinations,
                permutations: this.permutations,
                solveQuadratic: this.solveQuadratic,
                solveLinear: this.solveLinear,
                derivative: this.derivative,
                integral: this.integral
            };
            
            // Evaluate with extended scope
            const result = new Function('return ' + cleanExpr).call(scope);
            
            if (!isNaN(result) && isFinite(result)) {
                return {
                    result: result,
                    type: 'expression',
                    description: `${expr} = ${result}`,
                    confidence: 0.9
                };
            }
        } catch (e) {
            // Try to extract numbers and operators
            const nums = expr.match(/[\d\.\,]+/g);
            const ops = expr.match(/[\+\-\*\/\^%]/g);
            if (nums && ops) {
                return null; // Can't evaluate, but might be parseable
            }
        }
        return null;
    },
    
    // Strategy 3: Natural language understanding with keyword extraction
    nlpSolver: function(text) {
        const cleanText = text.toLowerCase().replace(/[.,;!?]/g, '');
        
        // Extract all numbers
        const numbers = text.match(/[\d\.\,]+/g) || [];
        const nums = numbers.map(n => parseFloat(n.replace(',', '.')));
        
        // Extract keywords
        const keywords = cleanText.split(/\s+/);
        
        // Try to identify problem type
        const problemType = this.identifyProblemType(cleanText, keywords);
        
        if (problemType && nums.length > 0) {
            return this.solveByType(problemType, nums, text);
        }
        
        return null;
    },
    
    identifyProblemType: function(text, keywords) {
        const typeKeywords = {
            'sum': ['сумма', 'sum', 'сложить', 'add', 'плюс', '+'],
            'difference': ['разность', 'difference', 'вычесть', 'subtract', 'минус', '-'],
            'product': ['произведение', 'product', 'умножить', 'multiply', 'раз', '*'],
            'division': ['частное', 'division', 'разделить', 'divide', '/'],
            'fraction': ['дробь', 'fraction', '/'],
            'percentage': ['процент', 'percent', '%'],
            'geometry': ['площадь', 'area', 'объем', 'volume', 'длина', 'length', 'периметр', 'perimeter'],
            'algebra': ['уравнение', 'equation', 'решить', 'solve', 'найти', 'find', 'x', 'y'],
            'trigonometry': ['синус', 'sin', 'косинус', 'cos', 'тангенс', 'tan', 'котангенс', 'cot'],
            'statistics': ['среднее', 'average', 'медиана', 'median', 'мода', 'mode'],
            'combinatorics': ['сочетание', 'combination', 'перестановка', 'permutation', 'факториал', 'factorial'],
            'movement': ['скорость', 'speed', 'время', 'time', 'расстояние', 'distance', 'движение', 'movement'],
            'work': ['работа', 'work', 'вместе', 'together', 'производительность', 'productivity'],
            'age': ['возраст', 'age', 'лет', 'years', 'старше', 'older', 'моложе', 'younger']
        };
        
        for (const [type, kws] of Object.entries(typeKeywords)) {
            for (const kw of kws) {
                if (text.includes(kw) || keywords.includes(kw)) {
                    return type;
                }
            }
        }
        
        return null;
    },
    
    solveByType: function(type, nums, text) {
        switch (type) {
            case 'sum':
                if (nums.length >= 2) {
                    const result = nums.reduce((a, b) => a + b, 0);
                    return {
                        result: result,
                        type: 'sum',
                        description: `${nums.join(' + ')} = ${result}`,
                        confidence: 0.8
                    };
                }
                break;
                
            case 'difference':
                if (nums.length >= 2) {
                    const result = nums[0] - nums[1];
                    return {
                        result: result,
                        type: 'difference',
                        description: `${nums[0]} - ${nums[1]} = ${result}`,
                        confidence: 0.8
                    };
                }
                break;
                
            case 'product':
                if (nums.length >= 2) {
                    const result = nums.reduce((a, b) => a * b, 1);
                    return {
                        result: result,
                        type: 'product',
                        description: `${nums.join(' × ')} = ${result}`,
                        confidence: 0.8
                    };
                }
                break;
                
            case 'division':
                if (nums.length >= 2) {
                    const result = nums[0] / nums[1];
                    return {
                        result: result,
                        type: 'division',
                        description: `${nums[0]} / ${nums[1]} = ${result}`,
                        confidence: 0.8
                    };
                }
                break;
                
            case 'percentage':
                if (nums.length >= 2) {
                    const percent = nums[0];
                    const value = nums[1];
                    const result = (percent / 100) * value;
                    return {
                        result: result,
                        type: 'percentage',
                        description: `${percent}% от ${value} = ${result}`,
                        confidence: 0.9
                    };
                }
                break;
                
            case 'geometry':
                // Try to identify specific geometry problem
                if (text.includes('круг') || text.includes('circle')) {
                    if (nums.length >= 1) {
                        const r = nums[0];
                        const area = Math.PI * r * r;
                        const circum = 2 * Math.PI * r;
                        return {
                            result: area,
                            type: 'geometry',
                            description: `r = ${r}\nПлощадь = πr² = ${area.toFixed(2)}\nОкружность = 2πr = ${circum.toFixed(2)}`,
                            confidence: 0.85
                        };
                    }
                }
                if (text.includes('квадрат') || text.includes('square')) {
                    if (nums.length >= 1) {
                        const a = nums[0];
                        const area = a * a;
                        const perimeter = 4 * a;
                        return {
                            result: area,
                            type: 'geometry',
                            description: `a = ${a}\nПлощадь = a² = ${area}\nПериметр = 4a = ${perimeter}`,
                            confidence: 0.85
                        };
                    }
                }
                break;
                
            case 'algebra':
                // Try to solve simple equations
                const eqMatch = text.match(/([\d\s]+)[xX]\s*([\+\-])\s*([\d\s]+)/);
                if (eqMatch) {
                    const a = parseFloat(eqMatch[1]);
                    const op = eqMatch[2];
                    const b = parseFloat(eqMatch[3]);
                    const result = op === '+' ? -b / a : b / a;
                    return {
                        result: result,
                        type: 'algebra',
                        description: `${a}x ${op} ${b} = 0 → x = ${result}`,
                        confidence: 0.8
                    };
                }
                break;
                
            case 'statistics':
                if (nums.length >= 2) {
                    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
                    return {
                        result: avg,
                        type: 'statistics',
                        description: `Среднее от [${nums.join(', ')}] = ${avg.toFixed(2)}`,
                        confidence: 0.9
                    };
                }
                break;
                
            case 'combinatorics':
                if (nums.length >= 1) {
                    const n = nums[0];
                    const fact = this.factorial(n);
                    return {
                        result: fact,
                        type: 'combinatorics',
                        description: `${n}! = ${fact}`,
                        confidence: 0.9
                    };
                }
                if (nums.length >= 2) {
                    const n = nums[0];
                    const k = nums[1];
                    const comb = this.combinations(n, k);
                    const perm = this.permutations(n, k);
                    return {
                        result: comb,
                        type: 'combinatorics',
                        description: `C(${n}, ${k}) = ${comb}\nA(${n}, ${k}) = ${perm}`,
                        confidence: 0.85
                    };
                }
                break;
                
            case 'movement':
                if (nums.length >= 3) {
                    // Assume s, v, t
                    const s = nums[0];
                    const v = nums[1];
                    const t = nums[2];
                    const missing = text.includes('найти') || text.includes('find') || text.includes('?');
                    
                    if (missing) {
                        if (!s) return {result: v * t, type: 'movement', description: `s = v × t = ${v} × ${t} = ${v * t}`, confidence: 0.7};
                        if (!v) return {result: s / t, type: 'movement', description: `v = s / t = ${s} / ${t} = ${s / t}`, confidence: 0.7};
                        if (!t) return {result: s / v, type: 'movement', description: `t = s / v = ${s} / ${v} = ${s / v}`, confidence: 0.7};
                    }
                }
                break;
        }
        
        return null;
    },
    
    // Strategy 4: Try to parse as equation and solve
    solveEquation: function(text) {
        // Try to extract equation
        const eqMatch = text.match(/([\d\s\+\-\*\/\^()xXyY]+)\s*(?:=\s*|равно\s*|equals\s*)([\d\s\+\-\*\/\^()xXyY]+)/i);
        
        if (eqMatch) {
            const left = eqMatch[1].replace(/\s/g, '');
            const right = eqMatch[2].replace(/\s/g, '');
            
            // Simple linear equation: ax + b = c
            const linearMatch = left.match(/([\d\-\.]+)?[xX]/);
            if (linearMatch && !left.includes('^') && !right.includes('^')) {
                const a = linearMatch[1] ? parseFloat(linearMatch[1]) : 1;
                const b = left.includes('+') ? parseFloat(left.match(/\+([\d\-\.]+)/)?.[1] || '0') : 
                          left.includes('-') ? -parseFloat(left.match(/\-([\d\-\.]+)/)?.[1] || '0') : 0;
                const c = parseFloat(right) || 0;
                
                const x = (c - b) / a;
                return {
                    result: x,
                    type: 'equation',
                    description: `${left} = ${right}\n${a}x + ${b} = ${c}\nx = (${c} - ${b}) / ${a} = ${x}`,
                    confidence: 0.85
                };
            }
            
            // Quadratic equation
            if (left.includes('x^2') || left.includes('x2') || left.includes('x²')) {
                const result = this.solveQuadratic(left, right);
                if (result) {
                    return {
                        result: result,
                        type: 'equation',
                        description: result.description,
                        confidence: 0.8
                    };
                }
            }
        }
        
        return null;
    },
    
    // Strategy 5: Try to find and solve multiple sub-problems
    solveComplex: function(text) {
        // Split text into sentences
        const sentences = text.split(/[.!?]/);
        const results = [];
        
        for (const sentence of sentences) {
            const result = this.solve(sentence.trim());
            if (result) {
                results.push(result);
            }
        }
        
        if (results.length === 1) {
            return results[0];
        }
        
        if (results.length > 1) {
            return {
                result: results.map(r => r.result).join(', '),
                type: 'complex',
                description: results.map(r => r.description).join('\n\n'),
                confidence: results.reduce((acc, r) => acc + r.confidence, 0) / results.length
            };
        }
        
        return null;
    },
    
    // Main solve method - tries all strategies
    solve: function(text) {
        if (!text || typeof text !== 'string') {
            return null;
        }
        
        const cleanText = text.trim();
        
        // Strategy 1: Try pattern-based solver first (most reliable)
        const patternResult = this.patternSolver.parse(cleanText);
        if (patternResult) {
            return {
                ...patternResult,
                confidence: 0.95,
                strategy: 'pattern'
            };
        }
        
        // Strategy 2: Try expression evaluation
        const exprResult = this.evaluateExpression(cleanText);
        if (exprResult) {
            return {
                ...exprResult,
                confidence: 0.9,
                strategy: 'expression'
            };
        }
        
        // Strategy 3: Try equation solving
        const eqResult = this.solveEquation(cleanText);
        if (eqResult) {
            return {
                ...eqResult,
                confidence: 0.85,
                strategy: 'equation'
            };
        }
        
        // Strategy 4: Try NLP-based solving
        const nlpResult = this.nlpSolver(cleanText);
        if (nlpResult) {
            return {
                ...nlpResult,
                confidence: 0.7,
                strategy: 'nlp'
            };
        }
        
        // Strategy 5: Try complex problem solving
        const complexResult = this.solveComplex(cleanText);
        if (complexResult) {
            return {
                ...complexResult,
                confidence: 0.75,
                strategy: 'complex'
            };
        }
        
        // Strategy 6: Last resort - try to extract any numbers and operations
        const lastResort = this.lastResort(cleanText);
        if (lastResort) {
            return {
                ...lastResort,
                confidence: 0.5,
                strategy: 'last_resort'
            };
        }
        
        return null;
    },
    
    lastResort: function(text) {
        // Extract all numbers
        const numbers = text.match(/[\d\.\,]+/g);
        if (!numbers || numbers.length < 2) {
            return null;
        }
        
        const nums = numbers.map(n => parseFloat(n.replace(',', '.')));
        
        // Extract operators
        const ops = text.match(/[\+\-\*\/\^%]/g) || [];
        
        if (ops.length === 0) {
            // Just return sum or average
            const sum = nums.reduce((a, b) => a + b, 0);
            const avg = sum / nums.length;
            
            return {
                result: avg,
                type: 'average',
                description: `Среднее от [${nums.join(', ')}] = ${avg.toFixed(2)}`
            };
        }
        
        // Try to apply operations in order
        let result = nums[0];
        for (let i = 0; i < ops.length && i < nums.length - 1; i++) {
            const op = ops[i];
            const nextNum = nums[i + 1];
            
            switch (op) {
                case '+': result += nextNum; break;
                case '-': result -= nextNum; break;
                case '*': result *= nextNum; break;
                case '/': result /= nextNum; break;
                case '^': result = Math.pow(result, nextNum); break;
                case '%': result %= nextNum; break;
            }
        }
        
        return {
            result: result,
            type: 'calculated',
            description: `${nums[0]} ${ops[0]} ${nums[1]} = ${result}`
        };
    },
    
    // ============ HELPER FUNCTIONS ============
    
    factorial: function(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    },
    
    lcm: function(a, b) {
        const gcdFunc = (typeof TextTaskParser !== 'undefined' && TextTaskParser.gcd) ? TextTaskParser.gcd : ((a, b) => { let t; while (b) { t = b; b = a % b; a = t; } return a; });
        return Math.abs(a * b) / gcdFunc(a, b);
    },
    
    combinations: function(n, k) {
        if (k > n || k < 0) return 0;
        if (k > n - k) k = n - k;
        let result = 1;
        for (let i = 1; i <= k; i++) {
            result = result * (n - k + i) / i;
        }
        return Math.round(result);
    },
    
    permutations: function(n, k) {
        if (k > n || k < 0) return 0;
        let result = 1;
        for (let i = n - k + 1; i <= n; i++) {
            result *= i;
        }
        return result;
    },
    
    solveQuadratic: function(left, right) {
        // Parse ax^2 + bx + c = 0
        const aMatch = left.match(/([\d\-\.]+)?[xX]\^2/);
        const bMatch = left.match(/([\+\-]\s*[\d\-\.]+)?[xX]/);
        const cMatch = left.match(/([\+\-]\s*[\d\-\.]+)/);
        
        const a = aMatch ? parseFloat(aMatch[1] || '1') : 1;
        const b = bMatch ? parseFloat(bMatch[1].replace(/\s/g, '')) : 0;
        const c = cMatch ? parseFloat(cMatch[1].replace(/\s/g, '')) : 0;
        const d = parseFloat(right) || 0;
        
        const discriminant = b * b - 4 * a * (c - d);
        
        if (discriminant < 0) {
            return {
                result: 'Нет действительных корней',
                description: `D = ${b}² - 4×${a}×${c - d} = ${discriminant} < 0\nНет действительных корней`
            };
        }
        
        const sqrtD = Math.sqrt(discriminant);
        const x1 = (-b + sqrtD) / (2 * a);
        const x2 = (-b - sqrtD) / (2 * a);
        
        return {
            result: discriminant === 0 ? x1 : `x₁ = ${x1}, x₂ = ${x2}`,
            description: `a = ${a}, b = ${b}, c = ${c - d}\nD = ${discriminant}\nx = [${-b} ± √${discriminant}] / (2×${a})\nx₁ = ${x1}, x₂ = ${x2}`
        };
    },
    
    solveLinear: function(a, b, c) {
        // Solve ax + b = c
        if (a === 0) {
            if (b === c) return {result: '∞', description: 'Бесконечно много решений'};
            return {result: '∅', description: 'Нет решений'};
        }
        const x = (c - b) / a;
        return {result: x, description: `x = (${c} - ${b}) / ${a} = ${x}`};
    },
    
    derivative: function(expr, x = 'x') {
        // Simple numeric derivative
        const h = 0.0001;
        try {
            const f = new Function(x, 'return ' + expr);
            const f_x = f(x);
            const f_x_h = f(x + h);
            return (f_x_h - f_x) / h;
        } catch (e) {
            return NaN;
        }
    },
    
    integral: function(expr, a, b) {
        // Simple numeric integral (trapezoidal rule)
        const n = 1000;
        const h = (b - a) / n;
        try {
            const f = new Function('x', 'return ' + expr);
            let sum = 0.5 * (f(a) + f(b));
            for (let i = 1; i < n; i++) {
                sum += f(a + i * h);
            }
            return sum * h;
        } catch (e) {
            return NaN;
        }
    },
    
    // ============ ADVANCED MATH FUNCTIONS ============
    
    solveSystem: function(equations) {
        // Solve system of 2 linear equations
        // Format: ["a1x + b1y = c1", "a2x + b2y = c2"]
        if (equations.length !== 2) return null;
        
        const eq1 = equations[0];
        const eq2 = equations[1];
        
        const a1 = parseFloat(eq1.match(/([\d\-\.]+)?[xX]/)?.[1] || '1');
        const b1 = parseFloat(eq1.match(/([\+\-]\s*[\d\-\.]+)?[yY]/)?.[1] || '0');
        const c1 = parseFloat(eq1.match(/=\s*([\d\-\.]+)/)?.[1] || '0');
        
        const a2 = parseFloat(eq2.match(/([\d\-\.]+)?[xX]/)?.[1] || '1');
        const b2 = parseFloat(eq2.match(/([\+\-]\s*[\d\-\.]+)?[yY]/)?.[1] || '0');
        const c2 = parseFloat(eq2.match(/=\s*([\d\-\.]+)/)?.[1] || '0');
        
        const det = a1 * b2 - a2 * b1;
        if (det === 0) return {result: 'Нет единственного решения', description: 'Система не имеет единственного решения'};;
        
        const x = (c1 * b2 - c2 * b1) / det;
        const y = (a1 * c2 - a2 * c1) / det;
        
        return {
            result: `x = ${x}, y = ${y}`,
            description: `Решение системы:\nx = (${c1}×${b2} - ${c2}×${b1}) / (${a1}×${b2} - ${a2}×${b1}) = ${x}\ny = (${a1}×${c2} - ${a2}×${c1}) / (${a1}×${b2} - ${a2}×${b1}) = ${y}`
        };
    },
    
    matrixMultiply: function(A, B) {
        // Multiply two matrices
        const rowsA = A.length;
        const colsA = A[0].length;
        const rowsB = B.length;
        const colsB = B[0].length;
        
        if (colsA !== rowsB) return null;
        
        const result = [];
        for (let i = 0; i < rowsA; i++) {
            result[i] = [];
            for (let j = 0; j < colsB; j++) {
                let sum = 0;
                for (let k = 0; k < colsA; k++) {
                    sum += A[i][k] * B[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    },
    
    matrixDeterminant: function(matrix) {
        // Calculate determinant of 2x2 or 3x3 matrix
        const n = matrix.length;
        
        if (n === 2) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        }
        
        if (n === 3) {
            return matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
                   matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                   matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
        }
        
        return NaN;
    },
    
    // Complex numbers
    complexAdd: function(a, b) {
        return {re: a.re + b.re, im: a.im + b.im};
    },
    
    complexMultiply: function(a, b) {
        return {
            re: a.re * b.re - a.im * b.im,
            im: a.re * b.im + a.im * b.re
        };
    },
    
    // Statistics
    mean: function(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },
    
    median: function(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    },
    
    stdDev: function(arr) {
        const m = this.mean(arr);
        const variance = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length;
        return Math.sqrt(variance);
    },
    
    // Probability
    probabilityAnd: function(probs) {
        return probs.reduce((a, b) => a * b, 1);
    },
    
    probabilityOr: function(probs) {
        return 1 - probs.reduce((a, b) => a * (1 - b), 1);
    },
    
    // Trigonometry
    toDegrees: function(rad) {
        return rad * 180 / Math.PI;
    },
    
    toRadians: function(deg) {
        return deg * Math.PI / 180;
    },
    
    // Logarithms
    logBase: function(x, base) {
        return Math.log(x) / Math.log(base);
    }
};

// Make AISolver available globally for content.js
if (typeof window !== 'undefined') {
    window.AISolver = AISolver;
}
