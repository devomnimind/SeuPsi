import { useState, useEffect, useCallback } from 'react';
import { UserPlus, UserMinus, Users, UserCheck, X, Check } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type FriendRequest = {
    id: number;
    sender_id: string;
    receiver_id: string;
    sender_name: string;
    sender_avatar: string;
    created_at: string;
};

type Friend = {
    friend_id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    last_active_at: string;
};

interface SupabaseFriendRequestRow {
    id: number;
    sender_id: string;
    receiver_id: string;
    created_at: string;
    sender?: { full_name: string; avatar_url: string }[];
    receiver?: { full_name: string; avatar_url: string }[];
}

export const FriendsManager = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
    const [loading, setLoading] = useState(true);

    const fetchFriends = useCallback(async () => {
        if (!user) return;

        const { data, error } = await supabase.rpc('get_friends', { p_user_id: user.id });

        if (error) {
            console.error('Error fetching friends:', error);
        } else {
            setFriends(data || []);
        }
        setLoading(false);
    }, [user]);

    const fetchRequests = useCallback(async () => {
        if (!user) return;

        // Solicitações recebidas
        const { data: received } = await supabase
            .from('friend_requests')
            .select(`
                id,
                sender_id,
                receiver_id,
                created_at,
                sender:profiles!friend_requests_sender_id_fkey(full_name, avatar_url)
            `)
            .eq('receiver_id', user.id)
            .eq('status', 'pending');

        // Solicitações enviadas
        const { data: sent } = await supabase
            .from('friend_requests')
            .select(`
                id,
                sender_id,
                receiver_id,
                created_at,
                receiver:profiles!friend_requests_receiver_id_fkey(full_name, avatar_url)
            `)
            .eq('sender_id', user.id)
            .eq('status', 'pending');

        setPendingRequests(
            (received || []).map((r: SupabaseFriendRequestRow) => ({
                id: r.id,
                sender_id: r.sender_id,
                receiver_id: r.receiver_id,
                sender_name: r.sender?.[0]?.full_name || 'Usuário',
                sender_avatar: r.sender?.[0]?.avatar_url || '',
                created_at: r.created_at
            }))
        );

        setSentRequests(
            (sent || []).map((r: SupabaseFriendRequestRow) => ({
                id: r.id,
                sender_id: r.sender_id,
                receiver_id: r.receiver_id,
                sender_name: r.receiver?.[0]?.full_name || 'Usuário',
                sender_avatar: r.receiver?.[0]?.avatar_url || '',
                created_at: r.created_at
            }))
        );
    }, [user]);

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchFriends();
            fetchRequests();
        }
    }, [user, fetchFriends, fetchRequests]);



    const acceptRequest = async (requestId: number) => {
        const { error } = await supabase.rpc('accept_friend_request', { p_request_id: requestId });

        if (error) {
            console.error('Error accepting request:', error);
            alert('Erro ao aceitar solicitação');
        } else {
            fetchFriends();
            fetchRequests();
        }
    };

    const rejectRequest = async (requestId: number) => {
        const { error } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId);

        if (error) {
            console.error('Error rejecting request:', error);
        } else {
            fetchRequests();
        }
    };

    const cancelRequest = async (requestId: number) => {
        const { error } = await supabase
            .from('friend_requests')
            .delete()
            .eq('id', requestId);

        if (error) {
            console.error('Error canceling request:', error);
        } else {
            fetchRequests();
        }
    };

    const removeFriend = async (friendId: string) => {
        if (!user || !confirm('Remover esta amizade?')) return;

        const { error } = await supabase
            .from('friendships')
            .delete()
            .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${friendId}),and(user_id_1.eq.${friendId},user_id_2.eq.${user.id})`);

        if (error) {
            console.error('Error removing friend:', error);
        } else {
            fetchFriends();
        }
    };

    if (loading) {
        return <div className="text-center text-white">Carregando...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`px-4 py-3 font-semibold transition-colors relative ${activeTab === 'friends'
                        ? 'text-neon-purple'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users size={20} />
                        Amigos ({friends.length})
                    </div>
                    {activeTab === 'friends' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-3 font-semibold transition-colors relative ${activeTab === 'requests'
                        ? 'text-neon-purple'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <UserPlus size={20} />
                        Solicitações ({pendingRequests.length})
                    </div>
                    {activeTab === 'requests' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple"></div>
                    )}
                </button>
            </div>

            {/* Friends List */}
            {activeTab === 'friends' && (
                <div className="space-y-3">
                    {friends.length === 0 ? (
                        <GlassCard className="p-8 text-center">
                            <Users size={48} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">Você ainda não tem amigos</p>
                        </GlassCard>
                    ) : (
                        friends.map((friend) => (
                            <GlassCard key={friend.friend_id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.friend_id}`}
                                            alt={friend.full_name}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-white">{friend.full_name}</h3>
                                            <p className="text-sm text-gray-400">@{friend.username}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFriend(friend.friend_id)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <UserMinus size={20} />
                                    </button>
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            )}

            {/* Friend Requests */}
            {activeTab === 'requests' && (
                <div className="space-y-6">
                    {/* Received Requests */}
                    {pendingRequests.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Solicitações Recebidas</h3>
                            <div className="space-y-3">
                                {pendingRequests.map((request) => (
                                    <GlassCard key={request.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={request.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.sender_id}`}
                                                    alt={request.sender_name}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-white">{request.sender_name}</h3>
                                                    <p className="text-sm text-gray-400">
                                                        {new Date(request.created_at).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => acceptRequest(request.id)}
                                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                                >
                                                    <Check size={20} />
                                                </button>
                                                <button
                                                    onClick={() => rejectRequest(request.id)}
                                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sent Requests */}
                    {sentRequests.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Solicitações Enviadas</h3>
                            <div className="space-y-3">
                                {sentRequests.map((request) => (
                                    <GlassCard key={request.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={request.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.receiver_id}`}
                                                    alt={request.sender_name}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-white">{request.sender_name}</h3>
                                                    <p className="text-sm text-gray-400">Aguardando resposta</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => cancelRequest(request.id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {pendingRequests.length === 0 && sentRequests.length === 0 && (
                        <GlassCard className="p-8 text-center">
                            <UserCheck size={48} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">Nenhuma solicitação pendente</p>
                        </GlassCard>
                    )}
                </div>
            )}
        </div>
    );
};
