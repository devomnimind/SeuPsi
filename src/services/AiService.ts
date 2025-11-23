import { supabase } from '../lib/supabase';
import { LocalLlmService } from '../lib/LocalLlmService';

export type TherapyMode = 'tcc' | 'psicanalise' | 'gestalt' | 'psicodrama';

export type Message = {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
};

export type Session = {
    id: string;
    title: string;
    updated_at: string;
    summary?: string;
    therapy_mode: TherapyMode;
};

export const AiService = {
    // Criar nova sessão
    async createSession(userId: string, mode: TherapyMode = 'tcc', firstMessage?: string) {
        const { data, error } = await supabase
            .from('ai_chat_sessions')
            .insert({
                user_id: userId,
                therapy_mode: mode,
                title: firstMessage ? firstMessage.substring(0, 30) + '...' : 'Nova Conversa'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Buscar sessões do usuário
    async getSessions(userId: string) {
        const { data, error } = await supabase
            .from('ai_chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Buscar mensagens de uma sessão
    async getMessages(sessionId: string) {
        const { data, error } = await supabase
            .from('ai_chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Enviar mensagem e obter resposta (REAL com Local LLM)
    async sendMessage(sessionId: string, content: string, mode: TherapyMode = 'tcc') {
        // 1. Salvar mensagem do usuário
        const { error: userMsgError } = await supabase
            .from('ai_chat_messages')
            .insert({
                session_id: sessionId,
                role: 'user',
                content: content
            });

        if (userMsgError) throw userMsgError;

        // 2. Preparar Prompt para o LLM com Persona Terapêutica
        let systemInstruction = "";
        switch (mode) {
            case 'psicanalise':
                systemInstruction = "You are a Psychoanalyst. Focus on unconscious patterns, dreams, and childhood. Ask open, deep questions in Portuguese.";
                break;
            case 'tcc':
                systemInstruction = "You are a CBT Therapist. Focus on identifying cognitive distortions and asking for evidence. Be structured and practical in Portuguese.";
                break;
            case 'gestalt':
                systemInstruction = "You are a Gestalt Therapist. Focus on the 'here and now', body sensations, and awareness. Encourage the user to feel. Speak in Portuguese.";
                break;
            case 'psicodrama':
                systemInstruction = "You are a Psychodrama director. Encourage visualization, role-play, and scene setting. Speak in Portuguese.";
                break;
            default:
                systemInstruction = "You are a empathetic AI Therapist. Listen actively and provide support in Portuguese.";
        }

        const fullPrompt = `Instruction: ${systemInstruction}\nUser: ${content}\nTherapist:`;

        // 3. Gerar resposta real via LLM Local
        let aiResponse = "";
        try {
            // Gerar resposta (max 150 tokens para ser rápido)
            aiResponse = await LocalLlmService.generate(fullPrompt, 150);
            
            // Limpeza simples caso o modelo repita o prompt
            if (aiResponse.includes("Therapist:")) {
                aiResponse = aiResponse.split("Therapist:").pop()?.trim() || aiResponse;
            }
        } catch (err) {
            console.error("Error generating AI response:", err);
            aiResponse = "Estou tendo dificuldade em processar isso agora. Podemos tentar reformular?";
        }

        // 4. Salvar resposta da IA
        const { data: aiMsg, error: aiMsgError } = await supabase
            .from('ai_chat_messages')
            .insert({
                session_id: sessionId,
                role: 'assistant',
                content: aiResponse
            })
            .select()
            .single();

        if (aiMsgError) throw aiMsgError;
        return aiMsg;
    }
};
