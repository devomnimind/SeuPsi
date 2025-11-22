import { useEffect, useState } from 'react';
import { Save, Smile, Frown, Meh, Calendar, Clock } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { addXP, updateChallengeProgress, registerActivity, XP_VALUES, CHALLENGE_TYPES } from '../lib/gamification';

type DailyLog = {
    id: number;
    mood: string | null;
    note: string;
    created_at: string;
};

export const DailyInfo = () => {
    const { user } = useAuth();
    const [mood, setMood] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchLogs();
        }
    }, [user]);

    const fetchLogs = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) console.error('Error fetching logs:', error);
        else setLogs(data || []);
    };

    const handleSaveLog = async () => {
        if (!user || (!mood && !note.trim())) {
            alert('Por favor, selecione um humor ou escreva uma nota.');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('daily_logs')
                .insert([{
                    user_id: user.id,
                    mood,
                    note
                }]);

            if (error) throw error;

            // Adicionar XP
            await addXP(user.id, XP_VALUES.MOOD_CHECK, 'mood_check', 'Registro de humor');

            // Registrar atividade para streak
            await registerActivity(user.id);

            // Atualizar progresso no desafio de mood check
            const { data: todayChallenge } = await supabase
                .from('daily_challenges')
                .select('id')
                .eq('challenge_type', CHALLENGE_TYPES.MOOD_CHECK)
                .eq('active_date', new Date().toISOString().split('T')[0])
                .single();

            if (todayChallenge) {
                await updateChallengeProgress(user.id, todayChallenge.id);
            }

            alert(`Registro salvo! +${XP_VALUES.MOOD_CHECK} XP`);
            setNote('');
            setMood(null);
            fetchLogs(); // Refresh list
        } catch (error) {
            console.error('Error saving log:', error);
            alert('Erro ao salvar registro.');
        } finally {
            setLoading(false);
        }
    };

    const moodOptions = [
        { value: 'happy', label: 'Feliz', icon: Smile, color: 'text-green-500' },
        { value: 'neutral', label: 'Neutro', icon: Meh, color: 'text-yellow-500' },
        { value: 'sad', label: 'Triste', icon: Frown, color: 'text-red-500' }
    ];

    const getMoodIcon = (moodValue: string | null) => {
        const option = moodOptions.find(opt => opt.value === moodValue);
        if (!option) return null;
        const Icon = option.icon;
        return <Icon size={20} className={option.color} />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green">
                    Diário
                </h1>
                <p className="text-gray-400">Como você está se sentindo hoje?</p>
            </header>

            {/* Mood Selection */}
            <GlassCard>
                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Como você está se sentindo?</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {moodOptions.map(option => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setMood(option.value)}
                                        className={`p-4 rounded-xl border-2 transition-all ${mood === option.value
                                                ? 'border-neon-purple bg-neon-purple/10'
                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <Icon size={32} className={`mx-auto mb-2 ${option.color}`} />
                                        <p className="text-sm font-medium text-white">{option.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Note Input */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                            Escreva sobre seu dia
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="O que aconteceu hoje que você gostaria de registrar?"
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors resize-none"
                        />
                    </div>

                    <button
                        onClick={handleSaveLog}
                        disabled={loading}
                        className="w-full py-3 bg-neon-purple hover:bg-neon-purple/80 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        {loading ? 'Salvando...' : 'Salvar Registro'}
                    </button>
                </div>
            </GlassCard>

            {/* Logs History */}
            {logs.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Registros Anteriores</h3>
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <GlassCard key={log.id} className="p-4">
                                <div className="flex items-start gap-3">
                                    {log.mood && getMoodIcon(log.mood)}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                            <Clock size={14} />
                                            <span>{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                                        </div>
                                        {log.note && <p className="text-gray-200">{log.note}</p>}
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
