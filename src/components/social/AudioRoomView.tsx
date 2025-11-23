import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Hand, PhoneOff, User as UserIcon } from 'lucide-react';
// import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { AudioService, type AudioParticipant, type AudioRoom } from '../../services/AudioService';
import { supabase } from '../../lib/supabase';

interface AudioRoomProps {
    room: AudioRoom;
    onLeave: () => void;
}

export const AudioRoomView = ({ room, onLeave }: AudioRoomProps) => {
    const { user } = useAuth();
    const [participants, setParticipants] = useState<AudioParticipant[]>([]);
    const [myStatus, setMyStatus] = useState<AudioParticipant | null>(null);

    const fetchParticipants = useCallback(async () => {
        const { data } = await supabase
            .from('audio_participants')
            .select('*, user:profiles(full_name, avatar_url)')
            .eq('room_id', room.id);

        if (data) {
            setParticipants(data);
            const me = data.find(p => p.user_id === user?.id);
            if (me) setMyStatus(me);
        }
    }, [room.id, user]);

    const joinRoom = useCallback(async () => {
        if (!user) return;
        try {
            await AudioService.joinRoom(room.id, user.id);
            fetchParticipants();
        } catch (error) {
            console.error('Error joining room:', error);
        }
    }, [user, room.id, fetchParticipants]);

    const subscribeToRoom = useCallback(() => {
        const subscription = supabase
            .channel(`room-${room.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'audio_participants',
                filter: `room_id=eq.${room.id}`
            }, () => {
                fetchParticipants();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [room.id, fetchParticipants]);

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            joinRoom();
            subscribeToRoom();
        }
        return () => {
            if (user) AudioService.leaveRoom(room.id, user.id);
        };
    }, [room.id, user, joinRoom, subscribeToRoom]);



    const toggleMute = async () => {
        if (!user || !myStatus) return;
        await AudioService.toggleMute(room.id, user.id, !myStatus.is_muted);
    };

    const toggleHand = async () => {
        if (!user || !myStatus) return;
        await AudioService.toggleHand(room.id, user.id, !myStatus.raised_hand);
    };

    const speakers = participants.filter(p => p.role === 'host' || p.role === 'speaker');
    const listeners = participants.filter(p => p.role === 'listener');

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">{room.title}</h2>
                    <p className="text-sm text-gray-400">{room.description}</p>
                </div>
                <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-xs font-bold uppercase">Ao Vivo</span>
                </div>
            </div>

            {/* Main Stage (Speakers) */}
            <div className="flex-1 p-8 overflow-y-auto">
                <h3 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider">Palco</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {speakers.map(speaker => (
                        <div key={speaker.id} className="flex flex-col items-center">
                            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center mb-3 transition-all ${speaker.is_speaking ? 'ring-4 ring-neon-green ring-offset-4 ring-offset-black' : 'ring-2 ring-white/10'
                                }`}>
                                {speaker.user?.avatar_url ? (
                                    <img src={speaker.user.avatar_url} alt={speaker.user.full_name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-neon-purple to-blue-600 flex items-center justify-center">
                                        <UserIcon size={40} className="text-white" />
                                    </div>
                                )}
                                <div className="absolute -bottom-2 right-0 bg-black/80 p-1.5 rounded-full border border-white/20">
                                    {speaker.is_muted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-neon-green" />}
                                </div>
                            </div>
                            <p className="text-white font-medium text-center">{speaker.user?.full_name || 'Usuário'}</p>
                            <span className="text-xs text-neon-purple bg-neon-purple/10 px-2 py-0.5 rounded mt-1">
                                {speaker.role === 'host' ? 'Anfitrião' : 'Orador'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Audience */}
                <h3 className="text-gray-400 text-sm font-bold mt-8 mb-4 uppercase tracking-wider flex items-center gap-2">
                    Plateia <span className="bg-white/10 px-2 rounded text-xs">{listeners.length}</span>
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    {listeners.map(listener => (
                        <div key={listener.id} className="flex flex-col items-center">
                            <div className="relative w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                {listener.user?.avatar_url ? (
                                    <img src={listener.user.avatar_url} alt={listener.user.full_name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <UserIcon size={20} className="text-gray-400" />
                                )}
                                {listener.raised_hand && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-500 p-1 rounded-full animate-bounce">
                                        <Hand size={10} className="text-black" />
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-400 text-xs truncate w-full text-center">{listener.user?.full_name || 'Usuário'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls Footer */}
            <div className="p-6 bg-black/80 border-t border-white/10 flex justify-center gap-4">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all ${myStatus?.is_muted ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-neon-green text-black hover:bg-neon-green/80'
                        }`}
                >
                    {myStatus?.is_muted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    onClick={toggleHand}
                    className={`p-4 rounded-full transition-all ${myStatus?.raised_hand ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    <Hand size={24} />
                </button>

                <button
                    onClick={onLeave}
                    className="p-4 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                    <PhoneOff size={24} />
                </button>
            </div>
        </div>
    );
};
