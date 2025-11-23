import { LocalLlmService } from '../lib/LocalLlmService';

export const MeditationGenerator = {
    async generateMeditation(topic: string): Promise<string> {
        // 1. RAG: Buscar contexto no banco vetorial (Mantido)
        console.log(`Buscando contexto para: ${topic}`);
        // const contextResults = await VectorService.search(topic, 3); // Descomentar quando VectorService estiver populado
        
        // const contextText = ""; // contextResults.map(r => r.content).join('\n\n');

        // 2. Geração via IA Real (Local LLM)
        console.log('Gerando meditação via IA Local...');
        
        const prompt = `Instruction: Write a calm and relaxing guided meditation script about "${topic}". Use simple, soothing language in Portuguese.
        
        Script:`;

        try {
            const generatedScript = await LocalLlmService.generate(prompt, 200);
            return generatedScript;
        } catch (error) {
            console.error('Erro ao gerar meditação:', error);
            return "Concentre-se na sua respiração. Inspire profundamente... expire lentamente. Sinta o ar entrando e saindo. (Erro na geração de IA)";
        }
    }
};
