import { pipeline, env } from '@xenova/transformers';

// Configuração para ambiente web/vite
env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * Serviço de IA Local Unificado.
 * Suporta:
 * 1. Geração de Texto (text2text-generation) para Chat/Criatividade.
 * 2. Embeddings (feature-extraction) para Memória/RAG.
 */
export class LocalLlmService {
    private static textGenerator: unknown = null;
    private static embedder: unknown = null;
    
    // Modelos escolhidos para equilíbrio entre performance e qualidade no browser
    private static textModel = 'Xenova/LaMini-Flan-T5-248M'; 
    private static embedModel = 'Xenova/all-MiniLM-L6-v2'; // Muito rápido e eficiente para RAG

    /**
     * Inicializa o gerador de texto (Lazy Loading)
     */
    static async getTextGenerator() {
        if (!this.textGenerator) {
            console.log('Carregando modelo de Geração de Texto...');
            this.textGenerator = await pipeline('text2text-generation', this.textModel);
            console.log('Modelo de Texto carregado!');
        }
        return this.textGenerator;
    }

    /**
     * Inicializa o gerador de embeddings (Lazy Loading)
     */
    static async getEmbedder() {
        if (!this.embedder) {
            console.log('Carregando modelo de Embeddings...');
            this.embedder = await pipeline('feature-extraction', this.embedModel);
            console.log('Modelo de Embeddings carregado!');
        }
        return this.embedder;
    }

    /**
     * Gera resposta de texto para um prompt
     */
    static async generate(prompt: string, maxNewTokens: number = 100): Promise<string> {
        try {
            const generator = await this.getTextGenerator();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const output = await (generator as any)(prompt, {
                max_new_tokens: maxNewTokens,
                temperature: 0.7,
                do_sample: true,
            });

            return output[0]?.generated_text || "Desculpe, não consegui processar.";
        } catch (error) {
            console.error('Erro na geração local:', error);
            return "Erro no processamento neural local.";
        }
    }

    /**
     * Gera vetor (embedding) para um texto
     * Retorna array de números (ex: 384 dimensões)
     */
    static async embed(text: string): Promise<number[]> {
        try {
            const embedder = await this.getEmbedder();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const output = await (embedder as any)(text, { pooling: 'mean', normalize: true });
            
            // Converte Tensor/Float32Array para array normal de JS
            return Array.from(output.data);
        } catch (error) {
            console.error('Erro na geração de embedding:', error);
            return []; // Retorna vazio em caso de erro para não quebrar fluxo
        }
    }
}
