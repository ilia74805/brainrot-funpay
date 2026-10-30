// Biology Solver - Solves biology questions
// Supports Russian and English biology questions

const BiologySolver = {
    // Knowledge base for biology
    knowledgeBase: {
        cell: {
            name: 'Cell Biology',
            questions: {
                'что такое клетка': {
                    answer: 'Клетка - это структурная и функциональная единица всех живых организмов.',
                    explanation: 'Клетка состоит из цитоплазмы, ядра и клеточной мембраны.'
                },
                'какова функция митохондрий': {
                    answer: 'Митохондрии производят энергию (АТФ) для клетки.',
                    explanation: 'Митохондрии называют энергетическими станциями клетки.'
                },
                'что такое фотосинтез': {
                    answer: 'Фотосинтез - это процесс образования органических веществ из CO2 и H2O на свету с выделением O2.',
                    explanation: 'Уравнение: 6CO2 + 6H2O + свет → C6H12O6 + 6O2'
                }
            }
        },
        genetics: {
            name: 'Genetics',
            questions: {
                'что такое днк': {
                    answer: 'ДНК - это молекула, хранящая генетическую информацию.',
                    explanation: 'ДНК имеет структуру двойной спирали.'
                },
                'какие азотистые основания в днк': {
                    answer: 'Аденин (A), Тимин (T), Цитозин (C), Гуанин (G).',
                    explanation: 'A соединяется с T, C с G.'
                },
                'что такое ген': {
                    answer: 'Ген - это участок ДНК, кодирующий информацию о белке.',
                    explanation: 'Гены определяют наследственные признаки.'
                }
            }
        }
    },
    
    solve: function(question) {
        if (!question) return null;
        
        const cleanQuestion = question.toLowerCase().replace(/[.,;!?]/g, '').trim();
        
        for (const category of Object.values(this.knowledgeBase)) {
            if (category.questions) {
                for (const [q, answer] of Object.entries(category.questions)) {
                    const cleanQ = q.toLowerCase().replace(/[.,;!?]/g, '').trim();
                    if (cleanQuestion === cleanQ) {
                        return {
                            question: q,
                            answer: answer.answer,
                            explanation: answer.explanation,
                            category: category.name,
                            confidence: 1.0,
                            subject: 'biology'
                        };
                    }
                }
            }
        }
        
        return this.analyzeQuestion(cleanQuestion);
    },
    
    analyzeQuestion: function(question) {
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.includes('клетка') || lowerQuestion.includes('cell')) {
            return {
                question: question,
                answer: 'Клетка - это структурная и функциональная единица всех живых организмов.',
                explanation: 'Клетка состоит из цитоплазмы, ядра и клеточной мембраны.',
                category: 'Cell Biology',
                confidence: 0.9,
                subject: 'biology'
            };
        }
        
        if (lowerQuestion.includes('днк') || lowerQuestion.includes('dna')) {
            return {
                question: question,
                answer: 'ДНК (дезоксирибонуклеиновая кислота) - это молекула, хранящая генетическую информацию.',
                explanation: 'ДНК имеет структуру двойной спирали и состоит из нуклеотидов.',
                category: 'Genetics',
                confidence: 0.9,
                subject: 'biology'
            };
        }
        
        if (lowerQuestion.includes('фотосинтез') || lowerQuestion.includes('photosynthesis')) {
            return {
                question: question,
                answer: 'Фотосинтез - это процесс образования органических веществ из углекислого газа и воды на свету.',
                explanation: 'Фотосинтез происходит в хлоропластах растительных клеток.',
                category: 'Botany',
                confidence: 0.9,
                subject: 'biology'
            };
        }
        
        if (lowerQuestion.includes('ген') || lowerQuestion.includes('gene')) {
            return {
                question: question,
                answer: 'Ген - это участок ДНК, кодирующий информацию о структуре белка.',
                explanation: 'Гены определяют наследственные признаки организма.',
                category: 'Genetics',
                confidence: 0.8,
                subject: 'biology'
            };
        }
        
        return null;
    }
};

if (typeof window !== 'undefined') {
    window.BiologySolver = BiologySolver;
}
