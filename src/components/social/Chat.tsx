import { useState, useEffect, useCallback } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ChatMessage {
    id: number;
    user_id: string;
    type: string;
    text: string;
    created_at: string;
}

export const Chat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');

    const fetchMessages = useCallback(async () => {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) console.error('Error fetching messages:', error);
        else setMessages(data || []);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMessages();
    }, [fetchMessages]);



    const handleSend = async () => {
        if (!input.trim() || !user) return;

        // Insert user message
        const { error } = await supabase.from('chat_messages').insert([{
            user_id: user.id,
            type: 'user',
            text: input
        }]);

        if (error) {
            console.error('Error sending message:', error);
            return;
        }

        setInput('');

        // Refresh messages
        await fetchMessages();

        // Simulate bot response
        setTimeout(async () => {
            await supabase.from('chat_messages').insert([{
                user_id: null,
                type: 'bot',
                text: 'Estou aqui para te ouvir. Continue...'
            }]);
            await fetchMessages();
        }, 1000);
    };

    return (
        <GlassCard className="h-[600px] flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple">
                    <Bot size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-white">PsiBot & Comunidade</h3>
                    <p className="text-xs text-neon-green flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                        Online agora
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.type === 'user' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-purple/20 text-neon-purple'}
            `}>
                            {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={`
              max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
              ${msg.type === 'user'
                                ? 'bg-neon-green/10 text-white rounded-tr-none border border-neon-green/20'
                                : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/10'}
            `}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors"
                    />
                    <button
                        onClick={handleSend}
                        className="p-2 bg-neon-purple text-white rounded-xl hover:bg-neon-purple/80 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </GlassCard>
    );
};
