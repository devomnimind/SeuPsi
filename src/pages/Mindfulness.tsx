import { useState, useEffect, useRef } from 'react';
import { Play, X, Pause, Clock, Brain } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { addXP, checkAchievements, updateChallengeProgress, registerActivity, XP_VALUES, CHALLENGE_TYPES } from '../lib/gamification';

type Meditation = {
    id: number;
    title: string;
    duration_seconds: number;
};

export const Mindfulness = () => {
    const { user } = useAuth();
    const [meditations, setMeditations] = useState<Meditation[]>([]);
    const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        fetchMeditations();
    }, []);

    useEffect(() => {
        if (selectedMeditation) {
            setTimeLeft(selectedMeditation.duration_seconds);
            setIsPlaying(true);
        }
    }, [selectedMeditation]);

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && selectedMeditation) {
            handleComplete();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, timeLeft, selectedMeditation]);

    const fetchMeditations = async () => {
        const { data, error } = await supabase
            .from('meditations')
            .select('*')
            .eq('is_published', true);

        if (error) console.error('Error fetching meditations:', error);
        else setMeditations(data || []);
        setLoading(false);
    };

    const handleComplete = async () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);

        if (user && selectedMeditation) {
            await supabase.from('meditation_logs').insert([{
                user_id: user.id,
                meditation_id: selectedMeditation.id,
                duration_listened_seconds: selectedMeditation.duration_seconds
            }]);

            // Adicionar XP
            await addXP(user.id, XP_VALUES.MEDITATION_COMPLETE, 'meditation', selectedMeditation.title);

            // Registrar atividade para streak
            await registerActivity(user.id);

            // Atualizar progresso no desafio de meditação
            const { data: todayChallenge } = await supabase
                .from('daily_challenges')
                .select('id')
                .eq('challenge_type', CHALLENGE_TYPES.MEDITATION)
                .eq('active_date', new Date().toISOString().split('T')[0])
                .single();

            if (todayChallenge) {
                await updateChallengeProgress(user.id, todayChallenge.id);
            }

            // Verificar conquistas de meditação
            const { count } = await supabase
                .from('meditation_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (count) {
                await checkAchievements(user.id, 'meditation', count);
            }

            alert(`Meditação concluída! +${XP_VALUES.MEDITATION_COMPLETE} XP`);
        }

        setSelectedMeditation(null);
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="text-center text-white mt-10">Carregando...</div>;
    }

    if (selectedMeditation) {
        return (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 transition-all duration-300">
                <GlassCard className="max-w-md w-full p-8 text-center">
                    <button
                        onClick={() => {
                            setSelectedMeditation(null);
                            setIsPlaying(false);
                            if (timerRef.current) clearInterval(timerRef.current);
                        }}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-8">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-neon-purple/20 flex items-center justify-center">
                            <Brain size={64} className="text-neon-purple" />
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">{selectedMeditation.title}</h3>
                        <p className="text-4xl font-bold text-neon-purple mb-6">{formatTime(timeLeft)}</p>
                    </div>

                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 rounded-full bg-neon-purple hover:bg-neon-purple/80 transition-colors flex items-center justify-center mx-auto"
                    >
                        {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
                    </button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green">
                    Mindfulness
                </h1>
                <p className="text-gray-400">Meditações guiadas para seu bem-estar.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {meditations.map((meditation) => (
                    <button
                        key={meditation.id}
                        onClick={() => setSelectedMeditation(meditation)}
                        className="text-left w-full group"
                    >
                        <GlassCard hoverEffect className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple">
                                    <Brain size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white group-hover:text-neon-purple transition-colors">
                                        {meditation.title}
                                    </h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                                        <Clock size={14} />
                                        <span>{Math.floor(meditation.duration_seconds / 60)} min</span>
                                    </div>
                                </div>
                                <Play size={20} className="text-gray-400 group-hover:text-neon-purple transition-colors" />
                            </div>
                        </GlassCard>
                    </button>
                ))}
            </div>
        </div>
    );
};
