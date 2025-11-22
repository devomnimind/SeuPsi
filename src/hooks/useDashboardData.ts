import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type DashboardData = {
    userName: string;
    level: number;
    xp: number;
    currentStreak: number;
    todayChallenges: {
        id: number;
        title: string;
        current_progress: number;
        target_value: number;
        completed: boolean;
    }[];
    recentAchievement?: {
        title: string;
        icon: string;
    };
};

export const useDashboardData = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData>({
        userName: 'Viajante',
        level: 1,
        xp: 0,
        currentStreak: 0,
        todayChallenges: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];

            // Parallel data fetching to avoid waterfall
            const [
                profileResponse,
                streakResponse,
                challengesResponse,
                userChallengesResponse,
                achievementResponse
            ] = await Promise.all([
                // 1. Profile
                supabase
                    .from('profiles')
                    .select('full_name, level, xp')
                    .eq('id', user.id)
                    .single(),
                
                // 2. Streak
                supabase
                    .from('user_streaks')
                    .select('current_streak')
                    .eq('user_id', user.id)
                    .single(),

                // 3. Today's Challenges
                supabase
                    .from('daily_challenges')
                    .select('id, title, target_value, xp_reward')
                    .eq('active_date', today),

                // 4. User Progress on Challenges
                supabase
                    .from('user_challenges')
                    .select('challenge_id, current_progress, completed')
                    .eq('user_id', user.id),

                // 5. Recent Achievement
                supabase
                    .from('user_achievements')
                    .select('achievement_id, achievements(title, icon)')
                    .eq('user_id', user.id)
                    .order('unlocked_at', { ascending: false })
                    .limit(1)
                    .single()
            ]);

            // Process data
            const profile = profileResponse.data;
            const streak = streakResponse.data;
            const challenges = challengesResponse.data || [];
            const userChallenges = userChallengesResponse.data || [];
            const recentAchievement = achievementResponse.data;

            // Combine challenges with progress
            const challengesWithProgress = challenges.map(c => ({
                ...c,
                current_progress: userChallenges.find(uc => uc.challenge_id === c.id)?.current_progress || 0,
                completed: userChallenges.find(uc => uc.challenge_id === c.id)?.completed || false
            }));

            setData({
                userName: profile?.full_name?.split(' ')[0] || 'Viajante',
                level: profile?.level || 1,
                xp: profile?.xp || 0,
                currentStreak: streak?.current_streak || 0,
                todayChallenges: challengesWithProgress,
                recentAchievement: recentAchievement?.achievements
                    ? { title: (recentAchievement.achievements as any).title, icon: (recentAchievement.achievements as any).icon }
                    : undefined
            });

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, refresh: fetchDashboardData };
};
