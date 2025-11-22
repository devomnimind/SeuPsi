import { supabase } from '../lib/supabase';

export type AudioRoom = {
    id: string;
    title: string;
    description?: string;
    host_id: string;
    is_active: boolean;
    participants_count?: number;
};

export type AudioParticipant = {
    id: number;
    user_id: string;
    role: 'host' | 'speaker' | 'listener';
    is_muted: boolean;
    is_speaking: boolean;
    raised_hand: boolean;
    user?: {
        full_name: string;
        avatar_url: string;
    };
};

export const AudioService = {
    // Listar salas ativas
    async getActiveRooms() {
        const { data, error } = await supabase
            .from('audio_rooms')
            .select('*, participants:audio_participants(count)')
            .eq('is_active', true)
            .order('started_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Criar sala
    async createRoom(title: string, description: string, hostId: string) {
        const { data, error } = await supabase
            .from('audio_rooms')
            .insert({
                title,
                description,
                host_id: hostId,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Entrar na sala (Simulado)
    async joinRoom(roomId: string, userId: string) {
        // Verificar se já está na sala
        const { data: existing } = await supabase
            .from('audio_participants')
            .select()
            .eq('room_id', roomId)
            .eq('user_id', userId)
            .single();

        if (existing) return existing;

        const { data, error } = await supabase
            .from('audio_participants')
            .insert({
                room_id: roomId,
                user_id: userId,
                role: 'listener',
                is_muted: true
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Sair da sala
    async leaveRoom(roomId: string, userId: string) {
        const { error } = await supabase
            .from('audio_participants')
            .delete()
            .eq('room_id', roomId)
            .eq('user_id', userId);

        if (error) throw error;
    },

    // Simular "Falar" (Toggle Mute)
    async toggleMute(roomId: string, userId: string, isMuted: boolean) {
        const { error } = await supabase
            .from('audio_participants')
            .update({ is_muted: isMuted, is_speaking: !isMuted }) // Se desmutar, assume que está falando para demo
            .eq('room_id', roomId)
            .eq('user_id', userId);

        if (error) throw error;
    },

    // Levantar a mão
    async toggleHand(roomId: string, userId: string, raised: boolean) {
        const { error } = await supabase
            .from('audio_participants')
            .update({ raised_hand: raised })
            .eq('room_id', roomId)
            .eq('user_id', userId);

        if (error) throw error;
    }
};
