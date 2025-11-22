import { AiChatWindow } from '../components/ai/AiChatWindow';
import { GlassCard } from '../components/ui/GlassCard';
import { Brain, ShieldCheck } from 'lucide-react';

export const AiTherapist = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-blue-500 opacity-20 blur-3xl rounded-full"></div>
                <GlassCard className="p-8 relative overflow-hidden border-neon-purple/30">
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 text-white flex items-center gap-3">
                                <Brain className="text-neon-purple" size={40} />
                                IA Terapeuta
                            </h1>
                            <p className="text-gray-300 text-lg max-w-2xl">
                                Converse com nossa inteligência artificial treinada em Terapia Cognitivo-Comportamental.
                                Um espaço seguro e sem julgamentos para você desabafar.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-2 text-neon-green mb-1">
                                    <ShieldCheck size={20} />
                                    <span className="font-bold text-sm">Ambiente Seguro</span>
                                </div>
                                <p className="text-xs text-gray-400 max-w-[200px]">
                                    Suas conversas são privadas. Em caso de risco, forneceremos ajuda humana imediata.
                                </p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </section>

            {/* Chat Interface */}
            <AiChatWindow />

            {/* Disclaimer Footer */}
            <p className="text-center text-xs text-gray-500 mt-8">
                A IA Terapeuta é uma ferramenta de apoio e não substitui o acompanhamento profissional.
                Em caso de emergência, use o botão "Emergência" no menu.
            </p>
        </div>
    );
};
