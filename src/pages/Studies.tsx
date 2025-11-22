import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Play, Clock, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { addXP, checkAchievements, updateChallengeProgress, registerActivity, XP_VALUES, CHALLENGE_TYPES } from '../lib/gamification';

type StudyTrack = {
    id: number;
    title: string;
    description: string;
    icon_name: string;
    color: string;
    glow: string;
};

type Lesson = {
    id: number;
    title: string;
    duration: string;
    type: string;
    order_index: number;
};

export const Studies = () => {
    const { user } = useAuth();
    const [tracks, setTracks] = useState<StudyTrack[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<StudyTrack | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTracks();
    }, []);

    useEffect(() => {
        if (selectedTrack && user) {
            fetchLessons(selectedTrack.id);
            fetchProgress();
        }
    }, [selectedTrack, user]);

    const fetchTracks = async () => {
        const { data, error } = await supabase
            .from('studies')
            .select('*')
            .order('id');

        if (error) console.error('Error fetching tracks:', error);
        else setTracks(data || []);
        setLoading(false);
    };

    const fetchLessons = async (trackId: number) => {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('study_id', trackId)
            .order('order_index');

        if (error) console.error('Error fetching lessons:', error);
        else setLessons(data || []);
    };

    const fetchProgress = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('study_progress')
            .select('lesson_id')
            .eq('user_id', user.id);

        if (error) console.error('Error fetching progress:', error);
        else setCompletedLessonIds(data?.map(p => p.lesson_id) || []);
    };

    const handleCompleteLesson = async (lessonId: number, lessonTitle: string) => {
        if (!user) return;

        if (completedLessonIds.includes(lessonId)) {
            alert('Você já completou esta lição!');
            return;
        }

        try {
            const { error } = await supabase
                .from('study_progress')
                .insert([{ user_id: user.id, lesson_id: lessonId }]);

            if (error) {
                console.error('Error marking lesson complete:', error);
                alert('Erro ao concluir lição.');
            } else {
                // Adicionar XP
                await addXP(user.id, XP_VALUES.STUDY_LESSON_COMPLETE, 'study', `Lição: ${lessonTitle}`);

                // Registrar atividade para streak
                await registerActivity(user.id);

                // Atualizar progresso no desafio de estudos
                const { data: todayChallenge } = await supabase
                    .from('daily_challenges')
                    .select('id')
                    .eq('challenge_type', CHALLENGE_TYPES.STUDY)
                    .eq('active_date', new Date().toISOString().split('T')[0])
                    .single();

                if (todayChallenge) {
                    await updateChallengeProgress(user.id, todayChallenge.id);
                }

                // Verificar conquistas de estudo
                const { count } = await supabase
                    .from('study_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (count) {
                    await checkAchievements(user.id, 'study', count);
                }

                // Update completed lessons state immediately
                setCompletedLessonIds([...completedLessonIds, lessonId]);

                // Refresh lessons to show updated completion status
                if (selectedTrack) {
                    fetchLessons(selectedTrack.id);
                }

                alert(`Lição concluída! +${XP_VALUES.STUDY_LESSON_COMPLETE} XP`);
            }
        } catch (error) {
            console.error('Error completing lesson:', error);
            alert('Erro ao concluir lição.');
        }
    };

    if (loading) {
        return <div className="text-center text-white mt-10">Carregando trilhas...</div>;
    }

    if (selectedTrack) {
        return (
            <div className="space-y-6 animate-fade-in">
                <button
                    onClick={() => setSelectedTrack(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Voltar para Trilhas
                </button>

                <header className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-white">{selectedTrack.title}</h1>
                    <p className="text-gray-400">{selectedTrack.description}</p>
                </header>

                <div className="space-y-4">
                    {lessons.map((lesson, index) => {
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        const isLocked = index > 0 && !completedLessonIds.includes(lessons[index - 1].id);

                        return (
                            <GlassCard
                                key={lesson.id}
                                className={`p-6 ${isCompleted ? 'border-neon-green' : ''} ${isLocked ? 'opacity-50' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-purple/20 text-neon-purple'
                                            }`}>
                                            {isCompleted ? <CheckCircle size={24} /> : index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-medium ${isCompleted ? 'text-neon-green' : 'text-white'}`}>
                                                {lesson.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                                <Clock size={14} />
                                                <span>{lesson.duration}</span>
                                                <span>•</span>
                                                <span className="capitalize">{lesson.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCompleteLesson(lesson.id, lesson.title)}
                                        disabled={isCompleted || isLocked}
                                        className={`p-2 rounded-full transition-colors ${isCompleted
                                                ? 'text-neon-green cursor-default'
                                                : isLocked
                                                    ? 'text-gray-600 cursor-not-allowed'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle size={24} /> : <Play size={24} />}
                                    </button>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green">
                    Estudos
                </h1>
                <p className="text-gray-400">Aprenda algo novo todos os dias.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tracks.map((track) => (
                    <button
                        key={track.id}
                        onClick={() => setSelectedTrack(track)}
                        className="text-left w-full group"
                    >
                        <GlassCard hoverEffect className="p-6 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className={`absolute inset-0 ${track.glow}`}></div>
                            <div className="relative z-10">
                                <div className={`w-16 h-16 rounded-full ${track.color} flex items-center justify-center mx-auto mb-4 text-white ${track.glow}`}>
                                    <BookOpen size={32} />
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-white group-hover:text-neon-purple transition-colors">
                                    {track.title}
                                </h3>
                                <p className="text-sm text-gray-400">{track.description}</p>
                            </div>
                        </GlassCard>
                    </button>
                ))}
            </div>
        </div>
    );
};
