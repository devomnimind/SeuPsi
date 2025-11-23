import { useEffect, useState, useCallback } from 'react';
import type { ElementType } from 'react';
import { Save, Smile, Frown, Meh, Clock, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUserStore } from '../store/useStore';
import { AiService } from '../services/AiService';
import { toast } from 'sonner';

type Mood = 'happy' | 'neutral' | 'sad';

const MOOD_OPTIONS: { value: Mood; label: string; icon: ElementType; color: string }[] = [
    { value: 'happy', label: 'Bem', icon: Smile, color: 'text-green-400' },
    { value: 'neutral', label: 'Normal', icon: Meh, color: 'text-yellow-400' },
    { value: 'sad', label: 'Mal', icon: Frown, color: 'text-red-400' },
];

const XP_VALUES = {
    DAILY_CHECKIN: 50,
};

export const DailyInfo = () => {
    const { user } = useAuth();
    const { addXP } = useUserStore();
    const [mood, setMood] = useState<Mood | null>(null);
    const [sleepHours, setSleepHours] = useState<number>(7);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<string>('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [todayEntry, setTodayEntry] = useState<any>(null);

    const checkTodayEntry = useCallback(async () => {
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];

        const { data } = await supabase
            .from('daily_checkins')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .single();

        if (data) {
            setTodayEntry(data);
            setMood(data.mood);
            setSleepHours(data.sleep_hours);
            setNotes(data.notes || '');
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            checkTodayEntry();
        }
    }, [user, checkTodayEntry]);

    const handleSave = async () => {
        if (!user || !mood) {
            toast.error('Por favor, selecione como está se sentindo.');
            return;
        }

        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            const entry = {
                user_id: user.id,
                date: today,
                mood,
                sleep_hours: sleepHours,
                notes,
                updated_at: new Date().toISOString()
            };

            let error;

            if (todayEntry) {
                const { error: updateError } = await supabase
                    .from('daily_checkins')
                    .update(entry)
                    .eq('id', todayEntry.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('daily_checkins')
                    .insert(entry);
                error = insertError;

                if (!error) {
                    if (addXP) addXP(XP_VALUES.DAILY_CHECKIN);
                    toast.success(`+${XP_VALUES.DAILY_CHECKIN} XP!`);
                }
            }

            if (error) throw error;

            toast.success(todayEntry ? 'Registro atualizado!' : 'Registro salvo!');
            checkTodayEntry();

            // Gerar Feedback da IA
            const feedback = await AiService.analyzeDiaryEntry({ mood, notes, sleep_hours: sleepHours });
            setAiFeedback(feedback);

        } catch (error) {
            console.error('Error saving daily info:', error);
            toast.error('Erro ao salvar registro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Registro Diário</h1>
                <p className="text-gray-400">Acompanhe seu bem-estar e ganhe XP.</p>
            </header>

            <GlassCard className="p-6 space-y-8">
                {/* Mood Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-300">
                        Como você está se sentindo hoje?
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {MOOD_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setMood(option.value)}
                                className={`p-4 rounded-xl border transition-all ${mood === option.value
                                    ? 'bg-white/10 border-neon-purple scale-105'
                                    : 'bg-white/5 border-transparent hover:bg-white/10'
                                    }`}
                            >
                                <option.icon
                                    size={32}
                                    className={`mx-auto mb-2 ${mood === option.value ? option.color : 'text-gray-400'
                                        }`}
                                />
                                <span className={`block text-center text-sm ${mood === option.value ? 'text-white font-bold' : 'text-gray-400'
                                    }`}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sleep Hours */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-300">
                        Horas de sono
                    </label>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                        <Clock className="text-neon-purple" />
                        <input
                            type="range"
                            min="0"
                            max="12"
                            step="0.5"
                            value={sleepHours}
                            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                            className="flex-1 accent-neon-purple"
                        />
                        <span className="text-xl font-bold text-white w-16 text-right">
                            {sleepHours}h
                        </span>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-300">
                        Notas (opcional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Como foi seu dia? Algum pensamento importante?"
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors resize-none"
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full py-4 bg-neon-purple hover:bg-neon-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                    <Save size={24} />
                    {loading ? 'Salvando...' : (todayEntry ? 'Atualizar Registro' : 'Salvar Registro')}
                </button>

                {aiFeedback && (
                    <div className="bg-white/10 border border-neon-purple/30 rounded-xl p-6 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2 text-neon-purple">
                            <Sparkles size={24} />
                            <h3 className="font-bold text-lg">Mensagem para você</h3>
                        </div>
                        <p className="text-gray-200 italic leading-relaxed">"{aiFeedback}"</p>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default DailyInfo;
