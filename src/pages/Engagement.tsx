import { useEffect, useState, useCallback } from 'react';
import type { ElementType } from 'react';
import { Trophy, Target, Flame, Star, Lock } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Achievement = {
    id: number;
    title: string;
    description: string;
    icon: string;
    category: string;
    xp_reward: number;
    badge_color: string;
    unlocked: boolean;
    unlocked_at?: string;
};

type Challenge = {
    id: number;
    title: string;
    description: string;
    challenge_type: string;
    target_value: number;
    xp_reward: number;
    icon: string;
    current_progress: number;
    completed: boolean;
};

type Streak = {
    current_streak: number;
    longest_streak: number;
};

export const Engagement = () => {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'achievements' | 'challenges' | 'streak'>('challenges');

    const fetchData = useCallback(async () => {
        if (!user) return;

        // Buscar conquistas
        const { data: achievementsData } = await supabase
            .from('achievements')
            .select('*')
            .order('xp_reward', { ascending: true });

        // Buscar conquistas desbloqueadas do usuário
        const { data: userAchievements } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at')
            .eq('user_id', user.id);

        const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
        const achievementsWithStatus = achievementsData?.map(a => ({
            ...a,
            unlocked: unlockedIds.has(a.id),
            unlocked_at: userAchievements?.find(ua => ua.achievement_id === a.id)?.unlocked_at
        })) || [];

        setAchievements(achievementsWithStatus);

        // Buscar desafios de hoje
        const { data: challengesData } = await supabase
            .from('daily_challenges')
            .select('*')
            .eq('active_date', new Date().toISOString().split('T')[0]);

        // Buscar progresso do usuário nos desafios
        const { data: userChallenges } = await supabase
            .from('user_challenges')
            .select('challenge_id, current_progress, completed')
            .eq('user_id', user.id);

        const challengesWithProgress = challengesData?.map(c => ({
            ...c,
            current_progress: userChallenges?.find(uc => uc.challenge_id === c.id)?.current_progress || 0,
            completed: userChallenges?.find(uc => uc.challenge_id === c.id)?.completed || false
        })) || [];

        setChallenges(challengesWithProgress);

        // Buscar streak
        const { data: streakData } = await supabase
            .from('user_streaks')
            .select('current_streak, longest_streak')
            .eq('user_id', user.id)
            .single();

        if (streakData) {
            setStreak(streakData);
        }

        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchData();
        }
    }, [user, fetchData]);

    const getIconComponent = (iconName: string, size: number = 24) => {
        const icons: Record<string, ElementType> = {
            Trophy, Target, Flame, Star, Lock
        };
        const Icon = icons[iconName] || Star;
        return <Icon size={size} />;
    };

    if (loading) {
        return <div className="text-center text-white mt-10">Carregando...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green">
                    Engajamento
                </h1>
                <p className="text-gray-400">Acompanhe seu progresso e conquistas</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('challenges')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'challenges'
                        ? 'bg-neon-purple text-white shadow-neon'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <Target className="inline mr-2" size={20} />
                    Desafios
                </button>
                <button
                    onClick={() => setActiveTab('achievements')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'achievements'
                        ? 'bg-neon-purple text-white shadow-neon'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <Trophy className="inline mr-2" size={20} />
                    Conquistas
                </button>
                <button
                    onClick={() => setActiveTab('streak')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'streak'
                        ? 'bg-neon-purple text-white shadow-neon'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <Flame className="inline mr-2" size={20} />
                    Sequência
                </button>
            </div>

            {/* Desafios Diários */}
            {activeTab === 'challenges' && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white mb-4">Desafios de Hoje</h2>
                    {challenges.length === 0 ? (
                        <GlassCard className="p-6 text-center">
                            <p className="text-gray-400">Nenhum desafio disponível hoje</p>
                        </GlassCard>
                    ) : (
                        challenges.map(challenge => (
                            <GlassCard key={challenge.id} className={`p-6 ${challenge.completed ? 'border-neon-green' : ''}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${challenge.completed ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-purple/20 text-neon-purple'
                                            }`}>
                                            {getIconComponent(challenge.icon)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white mb-1">{challenge.title}</h3>
                                            <p className="text-sm text-gray-400 mb-3">{challenge.description}</p>

                                            {/* Progress Bar */}
                                            <div className="mb-2">
                                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                    <span>Progresso</span>
                                                    <span>{challenge.current_progress}/{challenge.target_value}</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${challenge.completed ? 'bg-neon-green' : 'bg-neon-purple'
                                                            }`}
                                                        style={{ width: `${(challenge.current_progress / challenge.target_value) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Star size={16} className="text-yellow-500" />
                                                <span className="text-gray-300">{challenge.xp_reward} XP</span>
                                                {challenge.completed && (
                                                    <span className="ml-auto text-neon-green font-semibold">✓ Completo!</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            )}

            {/* Conquistas */}
            {activeTab === 'achievements' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Conquistas</h2>
                        <span className="text-gray-400">
                            {achievements.filter(a => a.unlocked).length}/{achievements.length} desbloqueadas
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map(achievement => (
                            <GlassCard
                                key={achievement.id}
                                className={`p-6 ${achievement.unlocked ? 'border-neon-purple' : 'opacity-60'}`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${achievement.unlocked ? achievement.badge_color : 'bg-gray-700'
                                        } text-white`}>
                                        {achievement.unlocked ? getIconComponent(achievement.icon, 32) : <Lock size={32} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white mb-1">{achievement.title}</h3>
                                        <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Star size={16} className="text-yellow-500" />
                                            <span className="text-gray-300">{achievement.xp_reward} XP</span>
                                            {achievement.unlocked && achievement.unlocked_at && (
                                                <span className="ml-auto text-xs text-gray-500">
                                                    {new Date(achievement.unlocked_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}

            {/* Sequência */}
            {activeTab === 'streak' && (
                <div className="space-y-6">
                    <GlassCard className="p-8 text-center">
                        <Flame size={64} className="mx-auto mb-4 text-orange-500" />
                        <h2 className="text-4xl font-bold text-white mb-2">{streak.current_streak} dias</h2>
                        <p className="text-gray-400 mb-6">Sequência atual</p>

                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-1">Melhor sequência</p>
                                <p className="text-2xl font-bold text-neon-purple">{streak.longest_streak}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-1">Próxima meta</p>
                                <p className="text-2xl font-bold text-neon-green">
                                    {streak.current_streak < 3 ? 3 : streak.current_streak < 7 ? 7 : 30}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-bold text-white mb-4">Como manter sua sequência</h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-neon-green">•</span>
                                <span>Faça login todos os dias</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-neon-green">•</span>
                                <span>Complete pelo menos uma atividade (meditação, estudo, ou registro de humor)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-neon-green">•</span>
                                <span>Ganhe XP bônus a cada marco de sequência (3, 7, 30 dias)</span>
                            </li>
                        </ul>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default Engagement;
