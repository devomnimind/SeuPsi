import { supabase } from '../lib/supabase';
import { LocalLlmService } from '../lib/LocalLlmService';

export const VectorService = {
    /**
     * Salva um texto na memória de longo prazo (Vector Store do Supabase)
     */
    async saveMemory(userId: string, content: string, metadata: object = {}) {
        try {
            console.log('Gerando embedding para memória...');
            const embedding = await LocalLlmService.embed(content);

            if (embedding.length === 0) {
                console.warn('Falha ao gerar embedding. Memória não será salva vetorialmente.');
                return null;
            }

            const { data, error } = await supabase.from('memories').insert({
                user_id: userId,
                content,
                embedding,
                metadata
            }).select().single();

            if (error) throw error;
            console.log('Memória salva com sucesso:', data.id);
            return data;
        } catch (error) {
            console.error('Erro ao salvar memória:', error);
            return null;
        }
    },

    /**
     * Busca memórias similares (RAG)
     */
    async search(userId: string, query: string, limit = 3, threshold = 0.5) {
        try {
            console.log(`Buscando memórias similares a: "${query}"`);
            const queryEmbedding = await LocalLlmService.embed(query);

            if (queryEmbedding.length === 0) return [];

            const { data, error } = await supabase.rpc('match_memories', {
                query_embedding: queryEmbedding,
                match_threshold: threshold,
                match_count: limit,
                p_user_id: userId
            });

            if (error) throw error;
            
            console.log(`Encontradas ${data?.length || 0} memórias relevantes.`);
            return data || [];
        } catch (error) {
            console.error('Erro na busca vetorial:', error);
            return [];
        }
    }
};
