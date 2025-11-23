import { VectorService } from './VectorService';
import { LocalLlmService } from '../lib/LocalLlmService';

export const MeditationGenerator = {
    async generateMeditation(topic: string, userId?: string): Promise<string> {
        // 1. RAG: Buscar contexto no banco vetorial (Se tiver usuário)
        console.log(`Buscando contexto para: ${topic}`);
        
        let contextText = "";
        if (userId) {
             const contextResults = await VectorService.search(userId, topic, 2); 
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             contextText = contextResults.map((r: any) => r.content).join('\n\n');
        }

        // 2. Geração via IA Real (Local LLM)
        console.log('Gerando meditação via IA Local...');
        
        const prompt = `Instruction: Write a calm and relaxing guided meditation script about "${topic}". Use simple, soothing language in Portuguese.
        ${contextText ? `Context to include subtly: ${contextText}` : ''}
        
        Script:`;

        try {
            const generatedScript = await LocalLlmService.generate(prompt, 200);
            return generatedScript;
        } catch (error) {
            console.error('Erro ao gerar meditação:', error);
            return "Concentre-se na sua respiração. Inspire profundamente... expire lentamente. Sinta o ar entrando e saindo.";
        }
    }
};
