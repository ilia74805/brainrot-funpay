// Universal Solver - Solves ANY problem across all subjects
const UniversalSolver = {
    solvers: [],
    
    init: function() {
        this.solvers = [AISolver, TextTaskParser, BiologySolver, StatisticsSolver];
        if (typeof DOMAnalyzer !== 'undefined') this.domAnalyzer = DOMAnalyzer;
        console.log('Universal Solver initialized');
    },
    
    solve: function(text, context = {}) {
        if (!text) return null;
        
        if (this.domAnalyzer && context.page) {
            const analysis = this.domAnalyzer.analyzePage();
            context.subject = analysis.subject;
        }
        
        const results = [];
        for (const solver of this.solvers) {
            if (solver && solver.solve) {
                try {
                    const result = solver.solve(text);
                    if (result) {
                        result.solver = solver.constructor ? solver.constructor.name : 'Unknown';
                        results.push(result);
                    }
                } catch (e) {}
            }
        }
        
        if (results.length > 0) {
            results.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
            const best = results[0];
            best.allResults = results;
            best.subject = context.subject || best.subject || this.detectSubject(text);
            return best;
        }
        
        return this.understandQuestion(text, context);
    },
    
    detectSubject: function(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('биология') || lowerText.includes('biology') || lowerText.includes('клетка') || lowerText.includes('днк')) return 'biology';
        if (lowerText.includes('статистика') || lowerText.includes('вероятность') || lowerText.includes('сочетание')) return 'statistics';
        if (/[\d\+\-\*\/\^=()\s]+/.test(lowerText)) return 'math';
        return 'unknown';
    },
    
    understandQuestion: function(text) {
        return { question: text, answer: 'Попробуйте уточнить вопрос', category: 'General', confidence: 0.5 };
    },
    
    solvePage: function() {
        if (!this.domAnalyzer) return { success: false };
        const analysis = this.domAnalyzer.analyzePage();
        const pairs = this.domAnalyzer.getQuestionAnswerPairs();
        const results = [];
        let solvedCount = 0;
        
        for (const pair of pairs) {
            const solution = this.solve(pair.question, { subject: analysis.subject });
            if (solution) {
                if (pair.answerInput) this.fillInput(pair.answerInput, solution.answer);
                results.push(solution);
                solvedCount++;
            }
        }
        
        setTimeout(() => {
            const submitBtn = this.findSubmitButton();
            if (submitBtn) submitBtn.click();
        }, 1000);
        
        return { success: true, solved: solvedCount, failed: pairs.length - solvedCount, results: results };
    },
    
    fillInput: function(input, answer) {
        try {
            if (!input) return false;
            input.value = answer;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        } catch (e) { return false; }
    },
    
    findSubmitButton: function() {
        const buttons = document.querySelectorAll('button, input[type="submit"]');
        for (const btn of buttons) {
            const text = (btn.textContent || btn.value || '').toLowerCase();
            if (text.includes('проверить') || text.includes('отправить') || text.includes('submit')) return btn;
        }
        return null;
    }
};

if (typeof window !== 'undefined') {
    window.UniversalSolver = UniversalSolver;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => UniversalSolver.init());
    } else {
        UniversalSolver.init();
    }
}
