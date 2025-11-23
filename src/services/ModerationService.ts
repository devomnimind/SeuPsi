import { LocalLlmService } from '../lib/LocalLlmService';

export const ModerationService = {
    blockedWords: [
        'idiota', 'estupido', 'imbecil', 'burro', 'matar', 'morrer', 'suicidio', 
        'odio', 'raiva', 'bater', 'chutar', 'socar', 'droga', 'drogas'
    ],

    async analyzeText(text: string): Promise<{ isSafe: boolean; flaggedWords: string[]; riskScore: number; feedback?: string; suggestion?: string }> {
        const lowerText = text.toLowerCase();
        
        // 1. Verificação Rápida (Lista de Palavras)
        const flaggedWords = this.blockedWords.filter(word => lowerText.includes(word));
        
        if (flaggedWords.length > 0) {
            return {
                isSafe: false,
                flaggedWords,
                riskScore: 0.9,
                feedback: "Seu texto contém palavras que violam nossas diretrizes de comunidade.",
                suggestion: "Por favor, remova termos ofensivos e tente expressar sua opinião com respeito."
            };
        }

        // 2. Verificação Profunda (IA Local - Guardião de Direitos Humanos)
        try {
            const prompt = `Instruction: Act as a Human Rights and Community Safety Moderator. Analyze the following text for toxicity, hate speech, bullying, or passive-aggressive behavior.
            Text: "${text}"
            
            If SAFE, return JSON: {"safe": true}
            If UNSAFE, return JSON: {"safe": false, "reason": "Educational explanation in Portuguese", "suggestion": "Polite alternative in Portuguese"}
            JSON:`;
            
            const resultText = await LocalLlmService.generate(prompt, 150);
            const jsonMatch = resultText.match(/\{.*\}/s);
            
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                if (!analysis.safe) {
                    return {
                        isSafe: false,
                        flaggedWords: ['Violação de Conduta'],
                        riskScore: 0.8,
                        feedback: analysis.reason || "Este conteúdo pode ser considerado ofensivo.",
                        suggestion: analysis.suggestion || "Que tal reformular de maneira mais construtiva?"
                    };
                }
            } else if (resultText.toUpperCase().includes("UNSAFE")) {
                // Fallback se JSON falhar
                 return {
                    isSafe: false,
                    flaggedWords: ['Conteúdo Tóxico'],
                    riskScore: 0.7,
                    feedback: "Detectamos um tom agressivo ou inadequado.",
                    suggestion: "Respire fundo e tente reescrever com mais calma."
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
