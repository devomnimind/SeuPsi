import { useState, useEffect } from 'react';
import { Mic, Plus } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { AudioService, type AudioRoom } from '../../services/AudioService';
import { AudioRoomView } from './AudioRoomView';
import { useAuth } from '../../contexts/AuthContext';

export const AudioSpaces = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<AudioRoom[]>([]);
    const [activeRoom, setActiveRoom] = useState<AudioRoom | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomTitle, setNewRoomTitle] = useState('');

    useEffect(() => {
        loadRooms();
        // Poll for updates every 10s
        const interval = setInterval(loadRooms, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadRooms = async () => {
        try {
            const data = await AudioService.getActiveRooms();
            setRooms(data || []);
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    };

    const handleCreateRoom = async () => {
        if (!user || !newRoomTitle.trim()) return;
        try {
            const room = await AudioService.createRoom(newRoomTitle, 'Roda de conversa aberta', user.id);
            setNewRoomTitle('');
            setShowCreateModal(false);
            setActiveRoom(room);
            loadRooms();
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    if (activeRoom) {
        return <AudioRoomView room={activeRoom} onLeave={() => setActiveRoom(null)} />;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Mic className="text-neon-purple" /> Rodas de Conversa
                </h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-neon-purple hover:bg-neon-purple/80 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors"
                >
                    <Plus size={16} /> Criar Sala
                </button>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <GlassCard className="p-4 mb-4 border-neon-purple/50 animate-fade-in">
                    <h3 className="text-white font-bold mb-2">Nova Roda de Conversa</h3>
                    <input
                        type="text"
                        value={newRoomTitle}
                        onChange={(e) => setNewRoomTitle(e.target.value)}
                        placeholder="Sobre o que vamos conversar?"
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white mb-3 focus:border-neon-purple outline-none"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="text-gray-400 hover:text-white text-sm px-3 py-1"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateRoom}
                            className="bg-neon-green text-black font-bold px-4 py-1 rounded-lg text-sm hover:bg-neon-green/90"
                        >
                            Iniciar
                        </button>
                    </div>
                </GlassCard>
            )}

            {/* Room List */}
            <div className="grid gap-3">
                {rooms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <Mic size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Nenhuma roda de conversa ativa no momento.</p>
                        <p className="text-sm">Que tal começar uma?</p>
                    </div>
                ) : (
                    rooms.map(room => (
                        <GlassCard key={room.id} className="p-4 flex justify-between items-center hover:border-neon-purple/30 transition-colors group">
                            <div>
                                <h3 className="text-white font-bold group-hover:text-neon-purple transition-colors">{room.title}</h3>
                                <p className="text-xs text-gray-400">{room.description}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-black" />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setActiveRoom(room)}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-sm transition-colors"
                                >
                                    Entrar
                                </button>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
};
