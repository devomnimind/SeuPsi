import { LocalLlmService } from '../lib/LocalLlmService';

export const ModerationService = {
    blockedWords: [
        'idiota', 'estupido', 'imbecil', 'burro', 'matar', 'morrer', 'suicidio', 
        'odio', 'raiva', 'bater', 'chutar', 'socar', 'droga', 'drogas'
    ],

    async analyzeText(text: string): Promise<{ isSafe: boolean; flaggedWords: string[]; riskScore: number }> {
        const lowerText = text.toLowerCase();
        
        // 1. Verificação Rápida (Lista de Palavras)
        const flaggedWords = this.blockedWords.filter(word => lowerText.includes(word));
        
        if (flaggedWords.length > 0) {
            return {
                isSafe: false,
                flaggedWords,
                riskScore: 0.9
            };
        }

        // 2. Verificação Profunda (IA Local)
        try {
            const prompt = `Instruction: Classify the following text for toxicity. Return "SAFE" or "UNSAFE". Text: "${text}"`;
            const result = await LocalLlmService.generate(prompt, 10);
            
            if (result.toUpperCase().includes("UNSAFE")) {
                return {
                    isSafe: false,
                    flaggedWords: ['Conteúdo Tóxico (IA)'],
                    riskScore: 0.7
                };
            }
        } catch (err) {
            console.warn("Erro na moderação via IA:", err);
        }

        return {
            isSafe: true,
            flaggedWords: [],
            riskScore: 0.1
        };
    },

    censorText(text: string): string {
        let censoredText = text;
        this.blockedWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            censoredText = censoredText.replace(regex, '*'.repeat(word.length));
        });
        return censoredText;
    }
};
