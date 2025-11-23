import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { RpgService, type Quest } from '../../services/RpgService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export const QuestBoard = () => {
    const { user } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);

    const loadQuests = useCallback(async () => {
        if (!user) return;
        try {
            const data = await RpgService.getAvailableQuests();
            setQuests(data || []);
        } catch (error) {
            console.error('Error loading quests:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadQuests();
        }
    }, [user, loadQuests]);

    const handleCompleteQuest = async (quest: Quest) => {
        if (!user) return;
        try {
            await RpgService.completeQuest(user.id, quest.id);
            toast.success(`Missão "${quest.title}" completada! + ${quest.xp_reward} XP`);
            // Recarregar quests ou atualizar estado local
            // Por enquanto, apenas removemos visualmente para simular
            setQuests(prev => prev.filter(q => q.id !== quest.id));
        } catch (error) {
            console.error('Error completing quest:', error);
            toast.error('Erro ao completar missão');
        }
    };

    if (loading) return <div className="text-white">Carregando missões...</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="text-yellow-400" /> Quadro de Missões
            </h3>

            <div className="grid gap-4">
                {quests.map(quest => (
                    <GlassCard key={quest.id} className="p-4 flex items-center justify-between group hover:border-neon-purple/50 transition-all">
                        <div className="flex items-start gap-4">
                            <div className={`p - 3 rounded - full ${quest.type === 'story' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                } `}>
                                <Star size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white group-hover:text-neon-purple transition-colors">
                                    {quest.title}
                                </h4>
                                <p className="text-sm text-gray-400">{quest.description}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-yellow-400 font-bold">
                                        +{quest.xp_reward} XP
                                    </span>
                                    {quest.attribute_reward && (
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-blue-300 capitalize">
                                            +{quest.attribute_reward}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleCompleteQuest(quest)}
                            className="p-3 rounded-xl bg-white/5 hover:bg-neon-purple hover:text-white text-gray-400 transition-all"
                            title="Completar Missão"
                        >
                            <CheckCircle size={24} />
                        </button>
                    </GlassCard>
                ))}

                {quests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>Nenhuma missão disponível no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
