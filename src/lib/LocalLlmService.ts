import { pipeline, env } from '@xenova/transformers';

// Configuração para não tentar carregar binários locais em ambiente web/vite se der erro, 
// mas permitir download do CDN HuggingFace.
env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * Serviço de LLM Local rodando no navegador via WebAssembly.
 * Usa modelos quantizados do HuggingFace (ex: Xenova/LaMini-Flan-T5-783M ou similar leve).
 */
export class LocalLlmService {
    private static instance: unknown = null;
    private static modelName = 'Xenova/LaMini-Flan-T5-248M'; // Modelo leve para resposta rápida

    static async getInstance() {
        if (!this.instance) {
            console.log('Carregando modelo de IA local...');
            this.instance = await pipeline('text2text-generation', this.modelName);
            console.log('Modelo de IA local carregado!');
        }
        return this.instance;
    }

    static async generate(prompt: string, maxNewTokens: number = 100): Promise<string> {
        try {
            const generator = await this.getInstance();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const output = await (generator as any)(prompt, {
                max_new_tokens: maxNewTokens,
                temperature: 0.7,
                do_sample: true,
            });

            // O output geralmente é [{ generated_text: "..." }]
            return output[0]?.generated_text || "Desculpe, não consegui processar sua solicitação.";
        } catch (error) {
            console.error('Erro na geração local:', error);
            return "Houve um erro ao processar sua mensagem. Tente novamente.";
        }
    }
}

