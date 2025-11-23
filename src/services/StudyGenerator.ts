import { LocalLlmService } from '../lib/LocalLlmService';
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
    generateQuestions: async (topic: string, count: number = 3): Promise<Question[]> => {
        console.log(`Buscando material de estudo para: ${topic}`);
        // Busca contexto real (se disponível) ou usa string vazia
        const contextResults = await VectorService.search(topic, 3);
        const contextText = contextResults.map(r => r.content).join('\n');

        console.log('Gerando questões via IA Local...');

        const prompt = `Instruction: Create ${count} multiple choice questions about "${topic}" in Portuguese.
        Context: ${contextText.substring(0, 500)}
        Format: Return ONLY a valid JSON array of objects with fields: id (string), text (string question), options (array of 4 strings), correctAnswer (number index 0-3), explanation (string).
        Example: [{"id":"1", "text":"Q?", "options":["A","B","C","D"], "correctAnswer":0, "explanation":"Exp"}]
        JSON:`;

        try {
            const responseText = await LocalLlmService.generate(prompt, 500);
            // Tentativa robusta de extrair JSON da resposta da IA
            const jsonMatch = responseText.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("No JSON found in response");
        } catch (error) {
            console.error("Erro na geração de questões:", error);
            // Fallback de emergência apenas se a IA falhar totalmente na formatação
            // Mas ainda tentando ser dinâmico
            return [{
                id: 'error-1',
                text: `Não foi possível gerar questões sobre ${topic} agora. Tente novamente.`,
                options: ["Erro", "Tentar de novo", "Verificar conexão", "Aguardar"],
                correctAnswer: 1,
                explanation: "Ocorreu uma falha no processamento da IA local."
            }];
        }
    },

    async generateSchedule(goal: string, availableTime: string): Promise<StudySchedule> {
        console.log(`Gerando cronograma para: ${goal}`);
        
        const prompt = `Instruction: Create a 3-day study schedule for "${goal}" with ${availableTime} available per day. Language: Portuguese.
        Format: Return ONLY a valid JSON object with fields: title (string), days (array of objects with day (string), topics (array strings), duration (string)).
        Example: {"title":"Plano", "days":[{"day":"Segunda", "topics":["A"], "duration":"1h"}]}
        JSON:`;

        try {
            const responseText = await LocalLlmService.generate(prompt, 400);
            const jsonMatch = responseText.match(/\{.*\}/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("No JSON found");
        } catch (error) {
            console.error("Erro na geração de cronograma:", error);
            return {
                title: `Plano de Estudos: ${goal}`,
                days: [
                    { day: 'Hoje', topics: ['Revisão Geral', 'Foco nos Fundamentos'], duration: availableTime }
                ]
            };
        }
    }
};
