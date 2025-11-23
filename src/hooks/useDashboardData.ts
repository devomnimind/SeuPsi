import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type DashboardData = {
    userName: string;
    level: number;
    currentXP: number;
    nextLevelXP: number;
    streakDays: number;
    mood: string;
    dailyChallenges: {
        id: number;
        title: string;
        current_progress: number;
        target_value: number;
        completed: boolean;
        xp_reward: number;
    }[];
    recentAchievement?: {
        title: string;
        icon: string;
    };
    recentActivities: {
        id: number;
        type: string;
        description: string;
        created_at: string;
    }[];
};

export const useDashboardData = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData>({
        userName: 'Viajante',
        level: 1,
        currentXP: 0,
        nextLevelXP: 100,
        streakDays: 0,
        mood: 'neutral',
        dailyChallenges: [],
        recentActivities: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDashboardData = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Parallel data fetching
            const [
                profileResponse,
                challengesResponse,
                userChallengesResponse,
                achievementResponse,
                activitiesResponse
            ] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('daily_challenges').select('*').eq('active_date', new Date().toISOString().split('T')[0]),
                supabase.from('user_challenges').select('*').eq('user_id', user.id),
                supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', user.id).order('earned_at', { ascending: false }).limit(1).single(),
                supabase.from('user_activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
            ]);

            const profile = profileResponse.data;
            const challenges = challengesResponse.data || [];
            const userChallenges = userChallengesResponse.data || [];
            const recentAchievement = achievementResponse.data;
            const activitiesData = activitiesResponse.data || [];

            // Combine challenges with progress
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const challengesWithProgress = challenges.map((c: any) => ({
                ...c,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                current_progress: userChallenges.find((uc: any) => uc.challenge_id === c.id)?.current_progress || 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                completed: userChallenges.find((uc: any) => uc.challenge_id === c.id)?.completed || false
            }));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const recentActivities = activitiesData.map((activity: any) => ({
                id: activity.id,
                type: activity.type,
                description: activity.description,
                created_at: activity.created_at,
            }));

            setData({
                userName: profile?.full_name?.split(' ')[0] || 'Viajante',
                level: profile?.level || 1,
                currentXP: profile?.current_xp || 0,
                nextLevelXP: profile?.next_level_xp || 100,
                streakDays: profile?.streak_days || 0,
                mood: 'happy', // TODO: Fetch from daily checkin
                dailyChallenges: challengesWithProgress,
                recentAchievement: recentAchievement ? {
                    title: (recentAchievement.achievement as { title: string }).title,
                    icon: (recentAchievement.achievement as { icon_url: string }).icon_url || '🏆'
                } : undefined,
                recentActivities
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user, fetchDashboardData]);

    return { data, loading, error, refresh: fetchDashboardData };
};
