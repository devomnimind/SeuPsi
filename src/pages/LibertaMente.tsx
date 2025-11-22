import { useState, useEffect } from 'react';
import { ShieldAlert, Phone, Heart, Wind, X, Eye, Ear, Hand, Utensils, Activity } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const LibertaMente = () => {
    const { user } = useAuth();
    const [showContent, setShowContent] = useState(false);
    const [showBreathing, setShowBreathing] = useState(false);
    const [showGrounding, setShowGrounding] = useState(false);
    const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [breathingCount, setBreathingCount] = useState(4);

    // Grounding State
    const [groundingStep, setGroundingStep] = useState(0);
    const groundingSteps = [
        { icon: <Eye size={32} />, count: 5, text: 'Coisas que você vê', color: 'text-blue-400' },
        { icon: <Hand size={32} />, count: 4, text: 'Coisas que você pode tocar', color: 'text-green-400' },
        { icon: <Ear size={32} />, count: 3, text: 'Sons que você ouve', color: 'text-yellow-400' },
        { icon: <Utensils size={32} />, count: 2, text: 'Cheiros ou gostos', color: 'text-orange-400' },
        { icon: <Heart size={32} />, count: 1, text: 'Uma emoção boa', color: 'text-pink-400' },
    ];

    const logUsage = async (tool: string, duration?: number) => {
        if (!user) return;
        await supabase.from('panic_logs').insert([{
            user_id: user.id,
            tool_used: tool,
            duration_seconds: duration
        }]);
    };

    useEffect(() => {
        if (showContent) {
            logUsage('entered_emergency_mode');
        }
    }, [showContent]);

    // Breathing Logic (4-7-8 Technique)
    useEffect(() => {
        if (!showBreathing) return;

        let timer: ReturnType<typeof setTimeout>;

        const runCycle = () => {
            // Inhale (4s)
            setBreathingPhase('inhale');
            setBreathingCount(4);
            const inhaleInterval = setInterval(() => setBreathingCount(c => c - 1), 1000);

            timer = setTimeout(() => {
                clearInterval(inhaleInterval);

                // Hold (7s)
                setBreathingPhase('hold');
                setBreathingCount(7);
                const holdInterval = setInterval(() => setBreathingCount(c => c - 1), 1000);

                timer = setTimeout(() => {
                    clearInterval(holdInterval);

                    // Exhale (8s)
                    setBreathingPhase('exhale');
                    setBreathingCount(8);
                    const exhaleInterval = setInterval(() => setBreathingCount(c => c - 1), 1000);

                    timer = setTimeout(() => {
                        clearInterval(exhaleInterval);
                        runCycle(); // Loop
                    }, 8000);
                }, 7000);
            }, 4000);
        };

        runCycle();
        logUsage('started_breathing');

        return () => {
            clearTimeout(timer);
        };
    }, [showBreathing]);

    if (!showContent) {
        return (
            <div className="max-w-2xl mx-auto pt-12 text-center space-y-6">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse-slow">
                    <ShieldAlert size={48} />
                </div>
                <h1 className="text-4xl font-bold text-white">Área Sensível</h1>
                <p className="text-gray-400 max-w-md mx-auto">
                    Esta sessão aborda temas delicados como superação de vícios e crises de ansiedade.
                </p>
                <GlassCard className="p-4 border-red-500/30 bg-red-900/10 max-w-md mx-auto">
                    <div className="text-sm text-red-400">
                        <strong>Aviso:</strong> Se você estiver em perigo imediato, ligue para 190 ou 188 (CVV).
                    </div>
                </GlassCard>
                <button
                    onClick={() => setShowContent(true)}
                    className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                    Entrar com Cuidado
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative animate-fade-in">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">LibertaMente</h1>
                    <p className="text-gray-400">Espaço seguro para sua recuperação.</p>
                </div>
                <button
                    onClick={() => setShowContent(false)}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    Sair
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6 border-red-500/20">
                    <div className="flex items-center gap-3 mb-4 text-red-500">
                        <Phone size={24} />
                        <h2 className="text-xl font-bold">Ajuda Imediata</h2>
                    </div>
                    <p className="mb-4 text-gray-400">Precisa conversar agora? Estes serviços estão disponíveis 24h.</p>
                    <div className="space-y-3">
                        <a href="tel:188" className="block w-full p-3 text-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-medium border border-red-500/20">
                            Ligar 188 (CVV)
                        </a>
                        <button
                            onClick={() => setShowBreathing(true)}
                            className="w-full p-3 flex items-center justify-center gap-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                            <Wind size={20} />
                            Respiração 4-7-8 (Calmante)
                        </button>
                        <button
                            onClick={() => setShowGrounding(true)}
                            className="w-full p-3 flex items-center justify-center gap-2 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors"
                        >
                            <Activity size={20} />
                            Técnica Grounding 5-4-3-2-1
                        </button>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-neon-purple">
                        <Heart size={24} />
                        <h2 className="text-xl font-bold">Meu Plano</h2>
                    </div>
                    <p className="mb-4 text-gray-400">Acompanhe suas metas de redução e substituição.</p>
                    <div className="space-y-4">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-sm font-medium mb-1 text-gray-300">Meta da Semana</p>
                            <p className="text-white font-bold">Reduzir consumo em 20%</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Breathing Modal */}
            {showBreathing && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <GlassCard className="p-8 max-w-sm w-full text-center relative animate-fade-in border-red-500/30">
                        <button
                            onClick={() => setShowBreathing(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-bold mb-2 text-white">Respiração 4-7-8</h3>
                        <p className="text-gray-400 mb-8 text-sm">Técnica comprovada para reduzir ansiedade rápida.</p>

                        <div className="relative w-56 h-56 mx-auto mb-8 flex items-center justify-center">
                            <div className={`absolute inset-0 border-4 border-red-500/20 rounded-full transition-all duration-[4000ms] ${breathingPhase === 'inhale' ? 'scale-110' : breathingPhase === 'hold' ? 'scale-110' : 'scale-75'
                                }`}></div>
                            <div className={`w-40 h-40 bg-red-500 rounded-full transition-all duration-[1000ms] flex flex-col items-center justify-center text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] ${breathingPhase === 'inhale' ? 'scale-125' : breathingPhase === 'hold' ? 'scale-125' : 'scale-90'
                                }`}>
                                <span className="text-4xl font-bold mb-1">{breathingCount}</span>
                                <span className="text-sm uppercase tracking-widest opacity-80">
                                    {breathingPhase === 'inhale' ? 'Inspire' : breathingPhase === 'hold' ? 'Segure' : 'Expire'}
                                </span>
                            </div>
                        </div>

                        <p className="text-gray-400">
                            Concentre-se apenas no movimento da sua respiração.
                        </p>
                    </GlassCard>
                </div>
            )}

            {/* Grounding Modal */}
            {showGrounding && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <GlassCard className="p-8 max-w-md w-full relative animate-fade-in border-blue-500/30">
                        <button
                            onClick={() => setShowGrounding(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-bold mb-6 text-white text-center">Grounding 5-4-3-2-1</h3>

                        <div className="text-center space-y-6">
                            <div className={`w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center ${groundingSteps[groundingStep].color}`}>
                                {groundingSteps[groundingStep].icon}
                            </div>

                            <div>
                                <h4 className="text-4xl font-bold text-white mb-2">{groundingSteps[groundingStep].count}</h4>
                                <p className="text-xl text-gray-300">{groundingSteps[groundingStep].text}</p>
                            </div>

                            <p className="text-sm text-gray-500">
                                Olhe ao redor e identifique {groundingSteps[groundingStep].count} itens. Diga o nome deles em voz alta se puder.
                            </p>

                            <button
                                onClick={() => {
                                    if (groundingStep < 4) {
                                        setGroundingStep(s => s + 1);
                                    } else {
                                        logUsage('completed_grounding');
                                        setShowGrounding(false);
                                        setGroundingStep(0);
                                        alert('Exercício concluído. Respire fundo.');
                                    }
                                }}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold"
                            >
                                {groundingStep < 4 ? 'Próximo Passo' : 'Concluir'}
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
