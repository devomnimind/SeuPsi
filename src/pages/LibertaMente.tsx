import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Wind, Eye, Heart, Phone, Target, Calendar, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type AddictionProfile = {
    addiction_type: string;
    severity_level: number;
    goal_type: string;
    confidential_mode: boolean;
};

type CleanStreak = {
    current_days: number;
    longest_streak: number;
    total_relapses: number;
};

type Goal = {
    id: number;
    goal_description: string;
    target_value: number;
    current_progress: number;
    status: string;
};

export const LibertaMente = () => {
    const { user } = useAuth();
    const [hasProfile, setHasProfile] = useState(false);
    const [profile, setProfile] = useState<AddictionProfile | null>(null);
    const [cleanStreak, setCleanStreak] = useState<CleanStreak | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'tools' | 'journal' | 'goals'>('dashboard');

    // Onboarding state
    const [selectedAddiction, setSelectedAddiction] = useState('');
    const [selectedSeverity, setSelectedSeverity] = useState(3);
    const [selectedGoal, setSelectedGoal] = useState('abstinence');

    const fetchDashboardData = useCallback(async () => {
        if (!user || !profile) return;

        // Buscar clean streak
        const { data: streakData } = await supabase
            .from('clean_streaks')
            .select('*')
            .eq('user_id', user.id)
            .eq('addiction_type', profile.addiction_type)
            .single();

        if (streakData) {
            setCleanStreak(streakData);
        }

        // Buscar metas
        const { data: goalsData } = await supabase
            .from('addiction_goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        setGoals(goalsData || []);
    }, [user, profile]);

    const checkProfile = useCallback(async () => {
        if (!user) return;

        const { data } = await supabase
            .from('addiction_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) {
            setHasProfile(true);
            setProfile(data);
            // fetchDashboardData will be called by useEffect when profile changes
        } else {
            setShowOnboarding(true);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            checkProfile();
        }
    }, [user, checkProfile]);

    useEffect(() => {
        if (hasProfile && profile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchDashboardData();
        }
    }, [hasProfile, profile, fetchDashboardData]);

    const createProfile = async () => {
        if (!user || !selectedAddiction) return;

        try {
            // Criar perfil
            await supabase.from('addiction_profiles').insert([{
                user_id: user.id,
                addiction_type: selectedAddiction,
                severity_level: selectedSeverity,
                goal_type: selectedGoal,
                confidential_mode: true
            }]);

            // Criar clean streak inicial
            await supabase.from('clean_streaks').insert([{
                user_id: user.id,
                addiction_type: selectedAddiction,
                current_days: 0,
                longest_streak: 0
            }]);

            setShowOnboarding(false);
            checkProfile();
        } catch (error) {
            console.error('Error creating profile:', error);
            alert('Erro ao criar perfil. Tente novamente.');
        }
    };

    const handleBreathingExercise = async () => {
        if (!user) return;

        await supabase.from('emergency_tool_usage').insert([{
            user_id: user.id,
            tool_type: 'breathing',
            situation_context: 'Quick access button'
        }]);

        alert('Exercício de respiração 4-7-8 iniciado. Inspire por 4s, segure por 7s, expire por 8s.');
    };

    const addictionTypes = [
        { value: 'alcohol', label: 'Álcool', icon: '🍺' },
        { value: 'drugs', label: 'Drogas', icon: '💊' },
        { value: 'smoking', label: 'Cigarro', icon: '🚬' },
        { value: 'pornography', label: 'Pornografia', icon: '🔞' },
        { value: 'other', label: 'Outro', icon: '📝' }
    ];

    if (showOnboarding) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert size={40} className="text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao LibertaMente</h1>
                        <p className="text-gray-400">Um espaço seguro e confidencial para seu processo de superação</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-3 text-gray-300">
                                Qual desafio você gostaria de trabalhar?
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {addictionTypes.map(type => (
                                    <button
                                        key={type.value}
                                        onClick={() => setSelectedAddiction(type.value)}
                                        className={`p-4 rounded-xl border-2 transition-all ${selectedAddiction === type.value
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{type.icon}</div>
                                        <p className="text-sm font-medium text-white">{type.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3 text-gray-300">
                                Como você avalia a gravidade? (1-5)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={selectedSeverity}
                                onChange={(e) => setSelectedSeverity(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>Leve</span>
                                <span className="font-bold text-white">{selectedSeverity}</span>
                                <span>Grave</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3 text-gray-300">
                                Qual é seu objetivo?
                            </label>
                            <div className="space-y-2">
                                {[
                                    { value: 'abstinence', label: 'Abstinência Total', desc: 'Parar completamente' },
                                    { value: 'reduction', label: 'Redução Gradual', desc: 'Diminuir frequência' },
                                    { value: 'moderation', label: 'Moderação', desc: 'Controlar uso' }
                                ].map(goal => (
                                    <button
                                        key={goal.value}
                                        onClick={() => setSelectedGoal(goal.value)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedGoal === goal.value
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <p className="font-semibold text-white">{goal.label}</p>
                                        <p className="text-sm text-gray-400">{goal.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Importante
                            </h3>
                            <p className="text-sm text-gray-300">
                                Este módulo é uma ferramenta de apoio. Para casos graves, sempre procure ajuda profissional (psicólogo, psiquiatra, grupos de apoio).
                            </p>
                        </div>

                        <button
                            onClick={createProfile}
                            disabled={!selectedAddiction}
                            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Começar Jornada
                        </button>
                    </div>
                </GlassCard>
            </div>
        );
    }

    if (!hasProfile) {
        return <div className="text-center text-white mt-10">Carregando...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <section>
                <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                    LibertaMente
                </h1>
                <p className="text-gray-400">Sua jornada de superação, um dia de cada vez</p>
            </section>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto">
                {[
                    { id: 'dashboard', label: 'Painel', icon: Target },
                    { id: 'tools', label: 'Ferramentas', icon: ShieldAlert },
                    { id: 'journal', label: 'Diário', icon: Heart },
                    { id: 'goals', label: 'Metas', icon: CheckCircle }
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'dashboard' | 'goals' | 'tools' | 'journal')}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-red-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Icon size={20} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    {/* Clean Streak */}
                    <GlassCard className="p-8 text-center border-green-500/30">
                        <div className="bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={40} className="text-green-400" />
                        </div>
                        <h2 className="text-5xl font-bold text-white mb-2">{cleanStreak?.current_days || 0} dias</h2>
                        <p className="text-gray-400 mb-6">Sem {profile?.addiction_type}</p>

                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-1">Melhor sequência</p>
                                <p className="text-2xl font-bold text-green-400">{cleanStreak?.longest_streak || 0}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-gray-400 text-sm mb-1">Total de recaídas</p>
                                <p className="text-2xl font-bold text-orange-400">{cleanStreak?.total_relapses || 0}</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Goals Progress */}
                    {goals.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Metas Ativas</h3>
                            <div className="space-y-3">
                                {goals.map(goal => (
                                    <GlassCard key={goal.id} className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-white">{goal.goal_description}</h4>
                                            <span className="text-sm text-gray-400">
                                                {goal.current_progress}/{goal.target_value}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                                style={{ width: `${(goal.current_progress / goal.target_value) * 100}%` }}
                                            ></div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tools Tab */}
            {activeTab === 'tools' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={handleBreathingExercise}
                        className="text-left"
                    >
                        <GlassCard hoverEffect className="p-6 border-blue-500/20 hover:border-blue-500/50">
                            <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                <Wind size={24} className="text-blue-400" />
                            </div>
                            <h3 className="font-bold text-lg text-white mb-2">Respiração 4-7-8</h3>
                            <p className="text-sm text-gray-400">Técnica rápida para acalmar ansiedade e urgência</p>
                        </GlassCard>
                    </button>

                    <GlassCard hoverEffect className="p-6 border-purple-500/20 hover:border-purple-500/50">
                        <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <Eye size={24} className="text-purple-400" />
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">Grounding 5-4-3-2-1</h3>
                        <p className="text-sm text-gray-400">Reconecte-se com o presente em momentos difíceis</p>
                    </GlassCard>

                    <GlassCard hoverEffect className="p-6 border-green-500/20 hover:border-green-500/50">
                        <div className="bg-green-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <Phone size={24} className="text-green-400" />
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">Contatos de Apoio</h3>
                        <p className="text-sm text-gray-400">Pessoas que você pode ligar em emergências</p>
                    </GlassCard>

                    <GlassCard hoverEffect className="p-6 border-orange-500/20 hover:border-orange-500/50">
                        <div className="bg-orange-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <TrendingDown size={24} className="text-orange-400" />
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">Distrações Saudáveis</h3>
                        <p className="text-sm text-gray-400">Atividades alternativas para substituir o hábito</p>
                    </GlassCard>
                </div>
            )}

            {/* Journal Tab */}
            {activeTab === 'journal' && (
                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Diário de Gatilhos</h3>
                    <p className="text-gray-400 mb-6">
                        Registre situações que despertaram vontade. Identificar padrões ajuda a prevenir recaídas.
                    </p>
                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors border border-white/10">
                        + Registrar Gatilho
                    </button>
                </GlassCard>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && (
                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Minhas Metas</h3>
                    <p className="text-gray-400 mb-6">
                        Defina metas alcançáveis e acompanhe seu progresso.
                    </p>
                    <button className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors">
                        + Nova Meta
                    </button>
                </GlassCard>
            )}
        </div>
    );
};

export default LibertaMente;
