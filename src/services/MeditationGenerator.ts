import { VectorService } from './VectorService';

export const MeditationGenerator = {
    async generateScript(topic: string, _durationMinutes: number = 5) {
        // 1. RAG: Buscar contexto no banco vetorial
        console.log(`Buscando contexto para: ${topic}`);
        const contextResults = await VectorService.search(topic, 3);
        
        const contextText = contextResults
            .map(r => r.content)
            .join('\n\n');

        console.log('Contexto encontrado:', contextResults.length, 'fragmentos');

        // 2. Prompt Engineering (Preparado para uso futuro com IA real)
        /*
        const systemPrompt = `
            Você é um guia de meditação experiente e calmo.
            Crie um roteiro de meditação guiada de aproximadamente ${_durationMinutes} minutos.
            
            Use o seguinte CONHECIMENTO BASE para enriquecer a meditação (se relevante):
            ---
            ${contextText}
            ---
            
            O roteiro deve ser direto, relaxante e focado no tema: "${topic}".
        `;
        */

        // 3. Geração via IA (Mock temporário)
        // Simulando uma chamada direta ou usando o método sendMessage se adaptado
        // Aqui vamos simular a chamada ao LLM para demonstração, 
        // mas idealmente o AiService teria um método 'generateText'
        
        // Mock temporário da geração (para não gastar tokens reais em loop de teste)
        // Em produção, isso chamaria AiService.generate(systemPrompt)
        
        const mockScript = `
            Feche os olhos suavemente... Respire fundo...
            Sinta o ar entrando pelos pulmões e saindo devagar...
            ${contextText ? "Lembrando do que aprendemos: " + contextText.substring(0, 50) + "..." : ""}
            Concentre-se no momento presente... Deixe as preocupações sobre "${topic}" irem embora...
            Inspire... Expire...
            Sinta seu corpo relaxar, desde os pés até a cabeça...
            Você está seguro... Você está em paz...
            ...
            Quando estiver pronto, abra os olhos devagar.
        `;

        return mockScript; // Retornando mock por enquanto para validar fluxo
    }
};
