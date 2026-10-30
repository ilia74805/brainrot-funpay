// Statistics and Probability Solver
// Solves statistics, probability, and combinatorics problems

const StatisticsSolver = {
    // Combinatorics functions
    factorial: function(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    },
    
    permutations: function(n, k) {
        if (k > n || k < 0) return 0;
        let result = 1;
        for (let i = n - k + 1; i <= n; i++) {
            result *= i;
        }
        return result;
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
    
    permutationsWithRepetition: function(n, k) {
        return Math.pow(n, k);
    },
    
    combinationsWithRepetition: function(n, k) {
        return this.combinations(n + k - 1, k);
    },
    
    // Probability functions
    probabilityAnd: function(probs) {
        return probs.reduce((a, b) => a * b, 1);
    },
    
    probabilityOr: function(probs) {
        return 1 - probs.reduce((a, b) => a * (1 - b), 1);
    },
    
    // Statistics functions
    mean: function(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },
    
    median: function(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    },
    
    mode: function(arr) {
        const frequency = {};
        arr.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
        
        let maxFreq = 0;
        let modes = [];
        for (const num in frequency) {
            if (frequency[num] > maxFreq) {
                maxFreq = frequency[num];
                modes = [parseFloat(num)];
            } else if (frequency[num] === maxFreq) {
                modes.push(parseFloat(num));
            }
        }
        
        return modes.length === 1 ? modes[0] : modes;
    },
    
    variance: function(arr, sample = false) {
        const m = this.mean(arr);
        const sum = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0);
        return sample ? sum / (arr.length - 1) : sum / arr.length;
    },
    
    stdDev: function(arr, sample = false) {
        return Math.sqrt(this.variance(arr, sample));
    },
    
    range: function(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        return sorted[sorted.length - 1] - sorted[0];
    },
    
    quartiles: function(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const n = sorted.length;
        
        return {
            q1: sorted[Math.floor(n * 0.25)],
            q2: this.median(sorted),
            q3: sorted[Math.floor(n * 0.75)]
        };
    },
    
    // Binomial distribution
    binomialProbability: function(n, k, p) {
        return this.combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    },
    
    binomialCumulative: function(n, k, p) {
        let sum = 0;
        for (let i = 0; i <= k; i++) {
            sum += this.binomialProbability(n, i, p);
        }
        return sum;
    },
    
    // Normal distribution (approximation)
    normalPDF: function(x, mean = 0, std = 1) {
        const exponent = -Math.pow(x - mean, 2) / (2 * std * std);
        return Math.exp(exponent) / (std * Math.sqrt(2 * Math.PI));
    },
    
    normalCDF: function(x, mean = 0, std = 1) {
        // Approximation using error function
        return 0.5 * (1 + this.erf((x - mean) / (std * Math.sqrt(2))));
    },
    
    erf: function(x) {
        // Approximation of error function
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;
        
        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);
        
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return sign * y;
    },
    
    // Hypothesis testing
    zTest: function(sampleMean, populationMean, std, n, twoTailed = true) {
        const z = (sampleMean - populationMean) / (std / Math.sqrt(n));
        const pValue = twoTailed ? 2 * (1 - this.normalCDF(Math.abs(z))) : 1 - this.normalCDF(z);
        return { z: z, pValue: pValue };
    },
    
    tTest: function(sample1, sample2, twoTailed = true) {
        const n1 = sample1.length;
        const n2 = sample2.length;
        const mean1 = this.mean(sample1);
        const mean2 = this.mean(sample2);
        const var1 = this.variance(sample1, true);
        const var2 = this.variance(sample2, true);
        
        const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
        const t = (mean1 - mean2) / Math.sqrt(pooledVar * (1/n1 + 1/n2));
        
        // Degrees of freedom
        const df = n1 + n2 - 2;
        
        // Approximate p-value using t-distribution approximation
        const pValue = this.tDistributionCDF(Math.abs(t), df) * (twoTailed ? 2 : 1);
        
        return { t: t, df: df, pValue: pValue };
    },
    
    tDistributionCDF: function(t, df) {
        // Approximation for large df
        if (df > 100) {
            return this.normalCDF(t);
        }
        
        // Simple approximation for small df
        // This is a placeholder - real implementation would use more complex methods
        return this.normalCDF(t * (1 + 1/(4*df)));
    },
    
    // Chi-square test
    chiSquareTest: function(observed, expected) {
        let chiSquare = 0;
        for (let i = 0; i < observed.length; i++) {
            chiSquare += Math.pow(observed[i] - expected[i], 2) / expected[i];
        }
        
        const df = observed.length - 1;
        const pValue = this.chiSquareCDF(chiSquare, df);
        
        return { chiSquare: chiSquare, df: df, pValue: pValue };
    },
    
    chiSquareCDF: function(x, df) {
        // Approximation using incomplete gamma function
        // This is a placeholder - real implementation would use proper methods
        if (x <= 0) return 0;
        if (x > 100) return 1;
        
        // Simple approximation
        return 1 - Math.exp(-x / 2);
    },
    
    // Correlation
    correlation: function(x, y) {
        const n = x.length;
        if (n !== y.length || n === 0) return NaN;
        
        const meanX = this.mean(x);
        const meanY = this.mean(y);
        
        let cov = 0;
        let varX = 0;
        let varY = 0;
        
        for (let i = 0; i < n; i++) {
            cov += (x[i] - meanX) * (y[i] - meanY);
            varX += Math.pow(x[i] - meanX, 2);
            varY += Math.pow(y[i] - meanY, 2);
        }
        
        return cov / Math.sqrt(varX * varY);
    },
    
    // Regression
    linearRegression: function(x, y) {
        const n = x.length;
        if (n !== y.length || n === 0) return null;
        
        const meanX = this.mean(x);
        const meanY = this.mean(y);
        
        let cov = 0;
        let varX = 0;
        
        for (let i = 0; i < n; i++) {
            cov += (x[i] - meanX) * (y[i] - meanY);
            varX += Math.pow(x[i] - meanX, 2);
        }
        
        const slope = cov / varX;
        const intercept = meanY - slope * meanX;
        
        return { slope: slope, intercept: intercept };
    },
    
    // Solve statistics problems
    solve: function(text) {
        if (!text) return null;
        
        const cleanText = text.toLowerCase().replace(/[.,;!?]/g, '').trim();
        
        // Try to extract numbers
        const numbers = text.match(/[\d\.\,]+/g) || [];
        const nums = numbers.map(n => parseFloat(n.replace(',', '.')));
        
        // Combinatorics
        if (cleanText.includes('перестановка') || cleanText.includes('permutation')) {
            if (nums.length >= 2) {
                const n = nums[0];
                const k = nums[1];
                return {
                    question: text,
                    answer: this.permutations(n, k),
                    explanation: `P(${n}, ${k}) = ${n}! / (${n}-${k})! = ${this.permutations(n, k)}`,
                    category: 'Combinatorics',
                    confidence: 0.95,
                    subject: 'statistics'
                };
            }
        }
        
        if (cleanText.includes('сочетание') || cleanText.includes('combination') || 
            cleanText.includes('сколько способов выбрать') || cleanText.includes('how many ways to choose')) {
            if (nums.length >= 2) {
                const n = nums[0];
                const k = nums[1];
                return {
                    question: text,
                    answer: this.combinations(n, k),
                    explanation: `C(${n}, ${k}) = ${n}! / (${k}! * (${n}-${k})!) = ${this.combinations(n, k)}`,
                    category: 'Combinatorics',
                    confidence: 0.95,
                    subject: 'statistics'
                };
            }
        }
        
        if (cleanText.includes('размещение') || cleanText.includes('arrangement')) {
            if (nums.length >= 2) {
                const n = nums[0];
                const k = nums[1];
                return {
                    question: text,
                    answer: this.permutations(n, k),
                    explanation: `A(${n}, ${k}) = ${n}! / (${n}-${k})! = ${this.permutations(n, k)}`,
                    category: 'Combinatorics',
                    confidence: 0.9,
                    subject: 'statistics'
                };
            }
        }
        
        // Probability
        if (cleanText.includes('вероятность') || cleanText.includes('probability') || 
            cleanText.includes('какова вероятность') || cleanText.includes('what is the probability')) {
            if (nums.length >= 1) {
                const p = nums[0] / 100 || nums[0];
                return {
                    question: text,
                    answer: p,
                    explanation: `Вероятность: ${p}`,
                    category: 'Probability',
                    confidence: 0.8,
                    subject: 'statistics'
                };
            }
        }
        
        // Statistics
        if (cleanText.includes('среднее') || cleanText.includes('mean') || 
            cleanText.includes('среднее арифметическое') || cleanText.includes('average')) {
            if (nums.length > 0) {
                const avg = this.mean(nums);
                return {
                    question: text,
                    answer: avg,
                    explanation: `Среднее = (${nums.join(' + ')}) / ${nums.length} = ${avg}`,
                    category: 'Statistics',
                    confidence: 0.9,
                    subject: 'statistics'
                };
            }
        }
        
        if (cleanText.includes('медиана') || cleanText.includes('median')) {
            if (nums.length > 0) {
                const med = this.median(nums);
                return {
                    question: text,
                    answer: med,
                    explanation: `Медиана = ${med}`,
                    category: 'Statistics',
                    confidence: 0.9,
                    subject: 'statistics'
                };
            }
        }
        
        if (cleanText.includes('мода') || cleanText.includes('mode')) {
            if (nums.length > 0) {
                const mode = this.mode(nums);
                return {
                    question: text,
                    answer: Array.isArray(mode) ? mode.join(', ') : mode,
                    explanation: `Мода = ${Array.isArray(mode) ? mode.join(', ') : mode}`,
                    category: 'Statistics',
                    confidence: 0.85,
                    subject: 'statistics'
                };
            }
        }
        
        if (cleanText.includes('дисперсия') || cleanText.includes('variance')) {
            if (nums.length > 1) {
                const varResult = this.variance(nums);
                return {
                    question: text,
                    answer: varResult,
                    explanation: `Дисперсия = ${varResult}`,
                    category: 'Statistics',
                    confidence: 0.85,
                    subject: 'statistics'
                };
            }
        }
        
        if (cleanText.includes('стандартное отклонение') || cleanText.includes('standard deviation') || 
            cleanText.includes('среднеквадратичное отклонение')) {
            if (nums.length > 1) {
                const std = this.stdDev(nums);
                return {
                    question: text,
                    answer: std,
                    explanation: `Стандартное отклонение = √${this.variance(nums)} = ${std}`,
                    category: 'Statistics',
                    confidence: 0.85,
                    subject: 'statistics'
                };
            }
        }
        
        // Binomial distribution
        if (cleanText.includes('биномиальное распределение') || cleanText.includes('binomial distribution')) {
            if (nums.length >= 3) {
                const n = nums[0];
                const k = nums[1];
                const p = nums[2] / 100 || nums[2];
                const prob = this.binomialProbability(n, k, p);
                return {
                    question: text,
                    answer: prob,
                    explanation: `P(X=${k}) = C(${n}, ${k}) * ${p}^${k} * ${1-p}^${n-k} = ${prob}`,
                    category: 'Probability',
                    confidence: 0.8,
                    subject: 'statistics'
                };
            }
        }
        
        // Normal distribution
        if (cleanText.includes('нормальное распределение') || cleanText.includes('normal distribution')) {
            if (nums.length >= 3) {
                const x = nums[0];
                const mean = nums[1];
                const std = nums[2];
                const prob = this.normalCDF(x, mean, std);
                return {
                    question: text,
                    answer: prob,
                    explanation: `P(X ≤ ${x}) = Φ((${x}-${mean})/${std}) = ${prob}`,
                    category: 'Probability',
                    confidence: 0.75,
                    subject: 'statistics'
                };
            }
        }
        
        // Correlation
        if (cleanText.includes('корреляция') || cleanText.includes('correlation')) {
            return {
                question: text,
                answer: 'Для расчета корреляции нужны данные X и Y',
                explanation: 'Коэффициент корреляции показывает степень линейной зависимости между двумя переменными.',
                category: 'Statistics',
                confidence: 0.7,
                subject: 'statistics'
            };
        }
        
        // Hypothesis testing
        if (cleanText.includes('проверка гипотезы') || cleanText.includes('hypothesis test') ||
            cleanText.includes('z-тест') || cleanText.includes('z-test') ||
            cleanText.includes('t-тест') || cleanText.includes('t-test')) {
            return {
                question: text,
                answer: 'Для проверки гипотезы нужны данные выборки',
                explanation: 'Проверка гипотезы позволяет определить, значимо ли отличаются данные от ожидаемых значений.',
                category: 'Statistics',
                confidence: 0.7,
                subject: 'statistics'
            };
        }
        
        return null;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.StatisticsSolver = StatisticsSolver;
}
