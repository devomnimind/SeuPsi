import { QdrantClient } from '@qdrant/js-client-rest';
import { pipeline } from '@xenova/transformers';

// Configuração do Qdrant (Lendo do .env)
const QDRANT_URL = import.meta.env.VITE_SEUPSI_QDRANT_URL || '';
const QDRANT_API_KEY = import.meta.env.VITE_SEUPSI_QDRANT_API_KEY || '';
const COLLECTION_NAME = import.meta.env.VITE_SEUPSI_QDRANT_COLLECTION || 'omnimind_memories';

// Singleton para o pipeline de embeddings (para não recarregar o modelo toda vez)
let embeddingPipeline: unknown = null;

export const VectorService = {
    async getEmbedding(text: string) {
        if (!embeddingPipeline) {
            console.log('Carregando modelo de embedding...');
            // Usando versão quantizada para rodar leve no navegador
            embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const output = await (embeddingPipeline as any)(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    },

    async search(query: string, limit = 3) {
        try {
            const client = new QdrantClient({
                url: QDRANT_URL,
                apiKey: QDRANT_API_KEY,
            });

            const queryVector = await this.getEmbedding(query);

            const searchResult = await client.search(COLLECTION_NAME, {
                vector: queryVector as number[],
                limit: limit,
                with_payload: true,
            });

            return searchResult.map(item => ({
                score: item.score,
                content: item.payload?.content || item.payload?.text || JSON.stringify(item.payload),
                metadata: item.payload
            }));

        } catch (error) {
            console.error('Erro na busca vetorial:', error);
            return [];
        }
    }
};
