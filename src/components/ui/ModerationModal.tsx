import { AlertTriangle, Edit3 } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ModerationModalProps {
    isOpen: boolean;
    feedback: string;
    suggestion: string;
    onClose: () => void;
    onEdit: () => void;
    onDiscard: () => void;
}

export const ModerationModal = ({ isOpen, feedback, suggestion, onClose, onEdit, onDiscard }: ModerationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in">
            <GlassCard className="max-w-md w-full p-6 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <div className="flex items-center gap-3 text-red-400 mb-4">
                    <AlertTriangle size={32} />
                    <h3 className="text-xl font-bold">Pausa para Reflexão</h3>
                </div>

                <p className="text-gray-300 mb-4 leading-relaxed">
                    {feedback}
                </p>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                    <p className="text-sm text-gray-400 mb-2 font-bold uppercase tracking-wider">Sugestão da IA:</p>
                    <p className="text-neon-green italic">"{suggestion}"</p>
                </div>

                <p className="text-xs text-gray-500 mb-6 text-center">
                    No SeuPsi, acreditamos que a internet tem dono: <strong>a responsabilidade coletiva</strong>.
                    Ofensas e agressividade não têm espaço aqui.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            onEdit();
                            onClose();
                        }}
                        className="flex-1 py-3 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <Edit3 size={18} /> Editar Texto
                    </button>
                    <button
                        onClick={() => {
                            onDiscard();
                            onClose();
                        }}
                        className="px-4 py-3 bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-xl font-bold transition-all"
                    >
                        Descartar
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

