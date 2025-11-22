import { useState } from 'react';
import { Play, Pause, Sparkles, Wand2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { MeditationGenerator } from '../../services/MeditationGenerator';
import { toast } from 'sonner';

export const MeditationPlayer = () => {
    const [topic, setTopic] = useState('');
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        try {
            const generatedScript = await MeditationGenerator.generateScript(topic);
            setScript(generatedScript);
            toast.success('Meditação gerada com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar meditação.');
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        // Aqui entraria a integração com TTS (Text-to-Speech)
        if (!isPlaying) {
            toast.info('Iniciando áudio (Simulação)...');
        }
    };

    return (
        <div className="space-y-6">
            <GlassCard className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="text-neon-purple" /> Gerador de Meditação IA
                </h2>

                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Como você está se sentindo? (ex: Ansioso, Sem sono...)"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-neon-purple hover:bg-neon-purple/80 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Gerando...' : <><Wand2 size={20} /> Criar</>}
                    </button>
                </div>

                {script && (
                    <div className="animate-fade-in">
                        <div className="bg-black/30 p-6 rounded-xl border border-white/10 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                                {script}
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={togglePlay}
                                className="w-16 h-16 rounded-full bg-white text-neon-purple flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-white/20"
                            >
                                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
