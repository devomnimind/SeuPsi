import { supabase } from '../lib/supabase';

// Adicionar XP ao usuário
export async function addXP(userId: string, amount: number, source: string, description?: string) {
    try {
        const { error } = await supabase.rpc('add_user_xp', {
            p_user_id: userId,
            p_amount: amount,
            p_source: source,
            p_description: description
        });

        if (error) {
            console.error('Error adding XP:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// Atualizar streak do usuário
export async function updateStreak(userId: string) {
    try {
        const { error } = await supabase.rpc('update_user_streak', {
            p_user_id: userId
        });

        if (error) {
            console.error('Error updating streak:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// Verificar e desbloquear conquistas
export async function checkAchievements(userId: string, category: string, count: number) {
    try {
        const { error } = await supabase.rpc('check_and_unlock_achievements', {
            p_user_id: userId,
            p_category: category,
            p_count: count
        });

        if (error) {
            console.error('Error checking achievements:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// Atualizar progresso em desafio
export async function updateChallengeProgress(
    userId: string,
    challengeId: number,
    increment: number = 1
) {
    try {
        // Buscar progresso atual
        const { data: existing } = await supabase
            .from('user_challenges')
            .select('*')
            .eq('user_id', userId)
            .eq('challenge_id', challengeId)
            .single();

        if (existing) {
            // Atualizar progresso
            const newProgress = existing.current_progress + increment;
            
            // Buscar informações do desafio
            const { data: challenge } = await supabase
                .from('daily_challenges')
                .select('target_value, xp_reward')
                .eq('id', challengeId)
                .single();

            const completed = challenge && newProgress >= challenge.target_value;

            const { error } = await supabase
                .from('user_challenges')
                .update({
                    current_progress: newProgress,
                    completed: completed,
                    completed_at: completed ? new Date().toISOString() : null
                })
                .eq('user_id', userId)
                .eq('challenge_id', challengeId);

            if (error) {
                console.error('Error updating challenge:', error);
                return false;
            }

            // Se completou, adicionar XP
            if (completed && challenge && !existing.completed) {
                await addXP(userId, challenge.xp_reward, 'challenge', `Desafio completado`);
            }
        } else {
            // Criar novo progresso
            const { error } = await supabase
                .from('user_challenges')
                .insert([{
                    user_id: userId,
                    challenge_id: challengeId,
                    current_progress: increment
                }]);

            if (error) {
                console.error('Error creating challenge progress:', error);
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// Registrar atividade e atualizar streak
export async function registerActivity(userId: string) {
    await updateStreak(userId);
}

// Buscar histórico de XP
export async function getXPHistory(userId: string, limit: number = 10) {
    try {
        const { data, error } = await supabase
            .from('xp_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching XP history:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Valores de XP por ação
export const XP_VALUES = {
    MEDITATION_COMPLETE: 50,
    STUDY_LESSON_COMPLETE: 40,
    MOOD_CHECK: 20,
    POST_CREATE: 15,
    POST_LIKE_RECEIVED: 5,
    COMMENT_CREATE: 10,
    DAILY_LOGIN: 10,
    STREAK_3_DAYS: 30,
    STREAK_7_DAYS: 70,
    STREAK_30_DAYS: 300
};

// Tipos de desafios
export const CHALLENGE_TYPES = {
    MEDITATION: 'meditation',
    STUDY: 'study',
    MOOD_CHECK: 'mood_check',
    POST: 'post'
};
