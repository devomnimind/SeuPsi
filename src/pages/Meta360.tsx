import { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, Award, Plus, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Goal = {
    id: number;
    title: string;
    description: string;
    target_date: string;
    progress: number;
    category: string;
    is_completed: boolean;
};

export const Meta360 = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', description: '', target_date: '', category: 'personal' });

    useEffect(() => {
        if (user) {
            fetchGoals();
        }
    }, [user]);

    const fetchGoals = async () => {
        if (!user) return;

        // Simulando goals até criar a tabela específica
        setGoals([
            {
                id: 1,
                title: 'Meditar 30 dias seguidos',
                description: 'Completar uma meditação por dia durante 30 dias',
                target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                progress: 40,
                category: 'wellness',
                is_completed: false
            },
            {
                id: 2,
                title: 'Completar trilha de Ansiedade',
                description: 'Finalizar todas as lições sobre manejo de ansiedade',
                target_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                progress: 65,
                category: 'study',
                is_completed: false
            },
            {
                id: 3,
                title: '7 dias sem recaída',
                description: 'Manter sequência de 7 dias limpo',
                progress: 100,
                category: 'recovery',
                is_completed: true,
                target_date: new Date().toISOString()
            }
        ]);
    };

    const categoryColors = {
        wellness: 'from-purple-500 to-pink-500',
        study: 'from-blue-500 to-cyan-500',
        recovery: 'from-green-500 to-emerald-500',
        personal: 'from-orange-500 to-yellow-500'
    };

    const categoryIcons = {
        wellness: TrendingUp,
        study: Award,
        recovery: Target,
        personal: Calendar
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green">
                        Meta360
                    </h1>
                    <p className="text-gray-400">Acompanhe suas metas e objetivos</p>
                </div>
                <button
                    onClick={() => setShowNewGoal(!showNewGoal)}
                    className="px-4 py-2 bg-neon-purple hover:bg-neon-purple/80 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nova Meta
                </button>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-500/20 w-12 h-12 rounded-xl flex items-center justify-center">
                            <CheckCircle size={24} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Concluídas</p>
                            <p className="text-2xl font-bold text-white">{goals.filter(g => g.is_completed).length}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-500/20 w-12 h-12 rounded-xl flex items-center justify-center">
                            <Target size={24} className="text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Em Progresso</p>
                            <p className="text-2xl font-bold text-white">{goals.filter(g => !g.is_completed).length}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Taxa de Sucesso</p>
                            <p className="text-2xl font-bold text-white">
                                {goals.length > 0 ? Math.round((goals.filter(g => g.is_completed).length / goals.length) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Suas Metas</h2>
                {goals.map(goal => {
                    const Icon = categoryIcons[goal.category as keyof typeof categoryIcons];
                    const gradient = categoryColors[goal.category as keyof typeof categoryColors];
                    const daysLeft = goal.target_date ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

                    return (
                        <GlassCard key={goal.id} className={`p-6 ${goal.is_completed ? 'border-green-500/30' : ''}`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} bg-opacity-20`}>
                                    {goal.is_completed ? (
                                        <CheckCircle size={24} className="text-green-400" />
                                    ) : (
                                        <Icon size={24} className="text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className={`font-bold text-lg ${goal.is_completed ? 'text-green-400' : 'text-white'}`}>
                                                {goal.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
                                        </div>
                                        {!goal.is_completed && daysLeft > 0 && (
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-neon-purple">{daysLeft}</p>
                                                <p className="text-xs text-gray-400">dias restantes</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                                            <span>Progresso</span>
                                            <span>{goal.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                                                style={{ width: `${goal.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {goal.is_completed && (
                                        <p className="text-sm text-green-400 mt-2 font-semibold">✓ Meta concluída!</p>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>

            {/* New Goal Form */}
            {showNewGoal && (
                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Nova Meta</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                            <input
                                type="text"
                                value={newGoal.title}
                                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                placeholder="Ex: Meditar 30 dias seguidos"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                            <textarea
                                value={newGoal.description}
                                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                placeholder="Descreva sua meta..."
                                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Data Alvo</label>
                                <input
                                    type="date"
                                    value={newGoal.target_date}
                                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                                <select
                                    value={newGoal.category}
                                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                >
                                    <option value="wellness">Bem-Estar</option>
                                    <option value="study">Estudos</option>
                                    <option value="recovery">Recuperação</option>
                                    <option value="personal">Pessoal</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    // TODO: Salvar no banco
                                    setShowNewGoal(false);
                                    setNewGoal({ title: '', description: '', target_date: '', category: 'personal' });
                                }}
                                className="flex-1 py-3 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold rounded-xl transition-colors"
                            >
                                Criar Meta
                            </button>
                            <button
                                onClick={() => setShowNewGoal(false)}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};
