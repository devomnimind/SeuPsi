import { useState } from 'react';
import { Brain, BookOpen, ShieldAlert, Target, Flame, Trophy, TrendingUp, Clock, Bot, Sword, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { useDashboardData } from '../hooks/useDashboardData';

export const Home = () => {
    const { data, loading, refresh } = useDashboardData();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);
    const [pullDistance, setPullDistance] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY > 0 && window.scrollY === 0) {
            const currentY = e.touches[0].clientY;
            const distance = Math.max(0, currentY - startY);
            // Add resistance
            setPullDistance(Math.min(distance * 0.4, 80));
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            setIsRefreshing(true);
            await refresh();
            setIsRefreshing(false);
        }
        setStartY(0);
        setPullDistance(0);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const nextLevelXp = data.level * 100;
    const xpProgress = (data.currentXP / nextLevelXp) * 100;

    if (loading && !isRefreshing) {
        return <div className="text-center text-white mt-10">Carregando...</div>;
    }

    return (
        <div
            className="space-y-6 animate-fade-in relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull to Refresh Indicator */}
            {pullDistance > 0 && (
                <div
                    className="absolute left-0 right-0 flex justify-center items-center z-50 pointer-events-none"
                    style={{ top: `${pullDistance - 40}px`, opacity: pullDistance / 60 }}
                >
                    <div className="bg-neon-purple p-2 rounded-full shadow-lg shadow-neon-purple/50">
                        <div className={`w-6 h-6 border-2 border-white border-t-transparent rounded-full ${isRefreshing ? 'animate-spin' : ''}`} />
                    </div>
                </div>
            )}

            {/* Header com saudação */}
            <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-green opacity-20 blur-3xl rounded-full"></div>
                <GlassCard className="p-8 relative overflow-hidden border-neon-purple/30">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-2 text-white">
                            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green">{data.userName}</span>!
                        </h1>
                        <p className="text-gray-300 mb-6 text-lg">Pronto para mais um dia de crescimento?</p>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={20} className="text-neon-purple" />
                                    <span className="text-sm text-gray-400">Nível</span>
                                </div>
                                <p className="text-sm font-medium text-gray-300">Nível {data.level} • {data.currentXP} XP</p>
                                <div className="mt-2">
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-neon-purple to-neon-green transition-all duration-500"
                                            style={{ width: `${xpProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{data.currentXP}/{nextLevelXp} XP</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame size={20} className="text-orange-500" />
                                    <span className="text-sm text-gray-400">Sequência</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{data.streakDays} dias</p>
                                <p className="text-xs text-gray-500 mt-1">Continue assim!</p>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target size={20} className="text-neon-green" />
                                    <span className="text-sm text-gray-400">Desafios Hoje</span>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {data.dailyChallenges.filter((c: any) => c.completed).length}/{data.dailyChallenges.length}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {data.dailyChallenges.filter((c: any) => c.completed).length === data.dailyChallenges.length
                                        ? 'Todos completos!'
                                        : 'Vamos lá!'}
                                </p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </section>

            {/* Desafios de Hoje */}
            {data.dailyChallenges.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Desafios de Hoje</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.dailyChallenges.map((challenge: any) => (
                            <GlassCard key={challenge.id} className={`p-4 ${challenge.completed ? 'border-neon-green' : ''}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-white">{challenge.title}</h3>
                                    {challenge.completed && (
                                        <span className="text-neon-green text-sm font-semibold">✓ Completo</span>
                                    )}
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full transition-all duration-500 ${challenge.completed ? 'bg-neon-green' : 'bg-neon-purple'
                                            }`}
                                        style={{ width: `${(challenge.current_progress / challenge.target_value) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-400">
                                    {challenge.current_progress}/{challenge.target_value} {challenge.completed ? '- Parabéns!' : ''}
                                </p>
                            </GlassCard>
                        ))}
                    </div>
                </section>
            )}

            {/* Quick Actions */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">Início Rápido</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/ai-therapist">
                        <GlassCard hoverEffect className="p-4 text-center group border-purple-500/20 hover:border-purple-500/50">
                            <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-purple-400 group-hover:scale-110 transition-all">
                                <Bot size={24} />
                            </div>
                            <h3 className="font-semibold text-white text-sm">IA Terapeuta</h3>
                        </GlassCard>
                    </Link>

                    <Link to="/hero-journey">
                        <GlassCard hoverEffect className="p-4 text-center group border-yellow-500/20 hover:border-yellow-500/50">
                            <div className="bg-yellow-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-yellow-400 group-hover:scale-110 transition-all">
                                <Sword size={24} />
                            </div>
                            <h3 className="font-semibold text-white text-sm">RPG</h3>
                        </GlassCard>
                    </Link>

                    <Link to="/daily-info">
                        <GlassCard hoverEffect className="p-4 text-center group border-pink-500/20 hover:border-pink-500/50">
                            <div className="bg-pink-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-pink-400 group-hover:scale-110 transition-all">
                                <Clock size={24} />
                            </div>
                            <h3 className="font-semibold text-white text-sm">Diário</h3>
                        </GlassCard>
                    </Link>

                    <Link to="/libertamente">
                        <GlassCard hoverEffect className="p-4 text-center group border-red-500/20 hover:border-red-500/50">
                            <div className="bg-red-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-red-400 group-hover:scale-110 transition-all">
                                <ShieldAlert size={24} />
                            </div>
                            <h3 className="font-semibold text-white text-sm">Emergência</h3>
                        </GlassCard>
                    </Link>
                </div>
            </section>

            {/* Última Conquista */}
            {data.recentAchievement && (
                <GlassCard className="p-6 border-neon-purple/30">
                    <div className="flex items-center gap-4">
                        <div className="bg-neon-purple/20 w-16 h-16 rounded-full flex items-center justify-center">
                            <Trophy size={32} className="text-neon-purple" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Última Conquista Desbloqueada</p>
                            <h3 className="text-xl font-bold text-white">{data.recentAchievement.title}</h3>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Módulos Principais */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">Explorar</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/mindfulness">
                        <GlassCard hoverEffect className="p-6 h-full group border-indigo-500/20 hover:border-indigo-500/50">
                            <div className="bg-indigo-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                <Brain size={28} />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-white">Mindfulness</h3>
                            <p className="text-sm text-gray-400">Meditações e respiração para acalmar a mente.</p>
                        </GlassCard>
                    </Link>

                    <Link to="/social">
                        <GlassCard hoverEffect className="p-6 h-full group border-blue-500/20 hover:border-blue-500/50">
                            <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                <Users size={28} />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-white">Comunidade</h3>
                            <p className="text-sm text-gray-400">Conecte-se com outros e participe de rodas de conversa.</p>
                        </GlassCard>
                    </Link>

                    <Link to="/studies">
                        <GlassCard hoverEffect className="p-6 h-full group border-emerald-500/20 hover:border-emerald-500/50">
                            <div className="bg-emerald-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <BookOpen size={28} />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-white">Estudos</h3>
                            <p className="text-sm text-gray-400">Trilhas de conhecimento personalizadas.</p>
                        </GlassCard>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
