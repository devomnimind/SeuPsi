import { VectorService } from './VectorService';

export type Question = {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index 0-3
    explanation: string;
};

export type StudySchedule = {
    title: string;
    days: {
        day: string;
        topics: string[];
        duration: string;
    }[];
};

export const StudyGenerator = {
    async generateQuestions(topic: string, _count: number = 5): Promise<Question[]> {
        console.log(`Buscando material de estudo para: ${topic}`);
        const contextResults = await VectorService.search(topic, 5);
        
        // Mock response for now
        // Em produção, usaria contextResults para gerar o prompt
        console.log('Contexto encontrado:', contextResults.length);
        /*
        const systemPrompt = `
            Você é um professor especialista.
            Crie ${count} questões de múltipla escolha sobre: "${topic}".
            
            Use este MATERIAL DE REFERÊNCIA se relevante:
            ---
            ${contextText}
            ---
            
            Retorne APENAS um JSON válido no seguinte formato, sem markdown:
            [
                {
                    "id": "1",
                    "text": "Enunciado da questão...",
                    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
                    "correctAnswer": 0,
                    "explanation": "Explicação breve do porquê a A está correta."
                }
            ]
        `;
        */

        // Mock response for now
        return [
            {
                id: '1',
                text: `Qual é o principal conceito relacionado a ${topic}?`,
                options: [
                    `Conceito A sobre ${topic}`,
                    'Conceito B totalmente errado',
                    'Conceito C irrelevante',
                    'Conceito D confuso'
                ],
                correctAnswer: 0,
                explanation: `O Conceito A é fundamental para entender ${topic} porque... (baseado no contexto recuperado).`
            },
            {
                id: '2',
                text: 'Como isso se aplica na prática?',
                options: [
                    'Não se aplica',
                    'Apenas na teoria',
                    `Aplica-se diretamente em casos de ${topic}`,
                    'Nenhuma das anteriores'
                ],
                correctAnswer: 2,
                explanation: 'A aplicação prática é vasta e inclui...'
            }
        ];
    },

    async generateSchedule(goal: string, availableTime: string): Promise<StudySchedule> {
        // RAG search for study techniques or specific content
        // const contextResults = await VectorService.search(goal, 3);
        console.log(`Gerando cronograma para: ${goal}`);
        
        // Mock response
        return {
            title: `Plano de Estudos: ${goal}`,
            days: [
                {
                    day: 'Segunda-feira',
                    topics: [`Introdução a ${goal}`, 'Conceitos Básicos', 'Leitura do Material'],
                    duration: availableTime
                },
                {
                    day: 'Terça-feira',
                    topics: ['Aprofundamento Prático', 'Resolução de Exercícios', 'Revisão'],
                    duration: availableTime
                },
                {
                    day: 'Quarta-feira',
                    topics: ['Tópicos Avançados', 'Simulado Rápido', 'Análise de Erros'],
                    duration: availableTime
                }
            ]
        };
    }
};
