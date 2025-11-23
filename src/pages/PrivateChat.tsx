import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ModerationService } from '../services/ModerationService';
import { toast } from 'sonner';

type Conversation = {
    conversation_id: number;
    other_user_id: string;
    other_user_name: string;
    other_user_avatar: string;
    last_message_at: string;
    last_message_preview: string;
    unread_count: number;
};

type Message = {
    id: number;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
};

export const PrivateChat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const fetchConversations = useCallback(async () => {
        if (!user) return;

        const { data, error } = await supabase.rpc('get_user_conversations', {
            p_user_id: user.id
        });

        if (error) {
            console.error('Error fetching conversations:', error);
        } else {
            setConversations(data || []);
        }
        setLoading(false);
    }, [user]);

    const fetchMessages = useCallback(async (conversationId: number) => {
        const { data, error } = await supabase
            .from('private_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
        } else {
            setMessages(data || []);
        }
    }, []);

    const markAsRead = useCallback(async (conversationId: number) => {
        if (!user) return;

        await supabase.rpc('mark_messages_as_read', {
            p_conversation_id: conversationId,
            p_user_id: user.id
        });

        // Atualizar contador local
        setConversations(prev =>
            prev.map(conv =>
                conv.conversation_id === conversationId
                    ? { ...conv, unread_count: 0 }
                    : conv
            )
        );
    }, [user]);

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchConversations();
        }
    }, [user, fetchConversations]);

    useEffect(() => {
        if (selectedConversation) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchMessages(selectedConversation.conversation_id);
            markAsRead(selectedConversation.conversation_id);

            // Subscrever a realtime
            const channel = supabase
                .channel(`conversation:${selectedConversation.conversation_id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'private_messages',
                        filter: `conversation_id=eq.${selectedConversation.conversation_id}`
                    },
                    (payload) => {
                        setMessages(prev => [...prev, payload.new as Message]);
                        scrollToBottom();
                        if ((payload.new as Message).sender_id !== user?.id) {
                            markAsRead(selectedConversation.conversation_id);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedConversation, fetchMessages, markAsRead, scrollToBottom, user?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);



    const sendMessage = async () => {
        if (!user || !selectedConversation || !newMessage.trim()) return;

        // Moderação
        const moderation = ModerationService.analyzeText(newMessage);
        if (!moderation.isSafe) {
            toast.error('Mensagem bloqueada por conter termos inadequados.');
            return;
        }

        const { error } = await supabase.rpc('send_message', {
            p_sender_id: user.id,
            p_receiver_id: selectedConversation.other_user_id,
            p_content: newMessage.trim()
        });

        if (error) {
            console.error('Error sending message:', error);
            toast.error('Erro ao enviar mensagem');
        } else {
            setNewMessage('');
            fetchMessages(selectedConversation.conversation_id); // Use conversation_id
            fetchConversations(); // Atualizar preview da conversa
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return <div className="text-center text-white mt-10">Carregando...</div>;
    }

    return (
        <div className="flex gap-4 h-[calc(100vh-120px)]">
            {/* Lista de Conversas */}
            <div className={`${selectedConversation ? 'hidden md:block' : ''} md:w-80 w-full`}>
                <GlassCard className="h-full flex flex-col">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MessageCircle size={24} />
                            Mensagens
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Nenhuma conversa ainda</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.conversation_id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${selectedConversation?.conversation_id === conv.conversation_id
                                        ? 'bg-white/10'
                                        : ''
                                        }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={conv.other_user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.other_user_id}`}
                                            alt={conv.other_user_name}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        {conv.unread_count > 0 && (
                                            <div className="absolute -top-1 -right-1 bg-neon-pink text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {conv.unread_count}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <h3 className="font-semibold text-white truncate">{conv.other_user_name}</h3>
                                        <p className="text-sm text-gray-400 truncate">{conv.last_message_preview}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(conv.last_message_at).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Área de Chat */}
            {selectedConversation ? (
                <div className="flex-1">
                    <GlassCard className="h-full flex flex-col">
                        {/* Header do Chat */}
                        <div className="p-4 border-b border-white/10 flex items-center gap-3">
                            <button
                                onClick={() => setSelectedConversation(null)}
                                className="md:hidden text-gray-400 hover:text-white"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <img
                                src={selectedConversation.other_user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.other_user_id}`}
                                alt={selectedConversation.other_user_name}
                                className="w-10 h-10 rounded-full"
                            />
                            <h3 className="font-bold text-white">{selectedConversation.other_user_name}</h3>
                        </div>

                        {/* Mensagens */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => {
                                const isOwn = message.sender_id === user?.id;
                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                                                ? 'bg-neon-purple text-white'
                                                : 'bg-white/10 text-gray-200'
                                                }`}
                                        >
                                            <p className="break-words">{message.content}</p>
                                            <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'}`}>
                                                {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input de Mensagem */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="px-6 py-3 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <div className="text-center text-gray-400">
                        <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg">Selecione uma conversa para começar</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrivateChat;
