import { supabase } from '../lib/supabase';

export type HeroAttributes = {
    resilience: number;
    wisdom: number;
    empathy: number;
    focus: number;
};

export type HeroProfile = {
    user_id: string;
    hero_class: string;
    level: number;
    current_xp: number;
    next_level_xp: number;
    attributes: HeroAttributes;
};

export type Quest = {
    id: number;
    title: string;
    description: string;
    xp_reward: number;
    attribute_reward?: keyof HeroAttributes;
    type: 'daily' | 'weekly' | 'story';
};

export type UserQuest = {
    id: number;
    quest_id: number;
    status: 'active' | 'completed';
    progress: number;
    quest?: Quest;
};

export const RpgService = {
    // Buscar ou criar perfil do herói
    async getHeroProfile(userId: string) {
        const { data, error } = await supabase
            .from('hero_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Perfil não existe, criar um padrão
            const { data: newProfile, error: createError } = await supabase
                .from('hero_profiles')
                .insert({ user_id: userId })
                .select()
                .single();
            
            if (createError) throw createError;
            return newProfile as HeroProfile;
        }

        if (error) throw error;
        return data as HeroProfile;
    },

    // Buscar missões disponíveis (não completadas hoje/nunca)
    async getAvailableQuests(_userId: string) {
        // Simplificação: Pega todas as quests. 
        // Em produção, filtraria as já feitas pelo usuário.
        const { data, error } = await supabase
            .from('quests')
            .select('*');
            
        if (error) throw error;
        return data as Quest[];
    },

    // Completar missão e dar recompensa
    async completeQuest(userId: string, questId: number) {
        // 1. Buscar dados da quest
        const { data: quest, error: questError } = await supabase
            .from('quests')
            .select('*')
            .eq('id', questId)
            .single();
            
        if (questError) throw questError;

        // 2. Atualizar perfil do herói (XP e Atributos)
        const { data: profile, error: profileError } = await supabase
            .from('hero_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (profileError) throw profileError;

        let newXp = profile.current_xp + quest.xp_reward;
        let newLevel = profile.level;
        let nextLevelXp = profile.next_level_xp;
        let newAttributes = { ...profile.attributes };

        // Level Up Logic
        if (newXp >= nextLevelXp) {
            newXp -= nextLevelXp;
            newLevel += 1;
            nextLevelXp = Math.floor(nextLevelXp * 1.5); // Curva de XP
        }

        // Attribute Reward
        if (quest.attribute_reward) {
            newAttributes[quest.attribute_reward] = (newAttributes[quest.attribute_reward] || 0) + 1;
        }

        // 3. Salvar alterações
        const { data: updatedProfile, error: updateError } = await supabase
            .from('hero_profiles')
            .update({
                current_xp: newXp,
                level: newLevel,
                next_level_xp: nextLevelXp,
                attributes: newAttributes,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 4. Registrar quest como completada (UserQuest)
        await supabase.from('user_quests').insert({
            user_id: userId,
            quest_id: questId,
            status: 'completed',
            completed_at: new Date().toISOString()
        });

        return { profile: updatedProfile, quest };
    }
};
