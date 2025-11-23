import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Plus, Loader2, Brain, Sparkles, Theater, Sofa, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AiService, type Message, type Session, type TherapyMode } from '../../services/AiService';
import { ModerationService } from '../../services/ModerationService';
import { toast } from 'sonner';
import { useVoiceInteraction } from '../../hooks/useVoiceInteraction';

export const AiChatWindow = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { isListening, isSpeaking, startListening, stopListening, speak, cancelSpeech, transcript } = useVoiceInteraction({
        onTranscript: (text) => setInput(text)
    });

    // Update input when transcript changes (redundant with onTranscript but safe)
    useEffect(() => {
        if (transcript) setInput(transcript);
    }, [transcript]);



    useEffect(() => {
        if (currentSession) {
            loadMessages(currentSession.id);
        } else {
            setMessages([]);
        }
    }, [currentSession]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadSessions = useCallback(async () => {
        if (!user) return;
        try {
            // Assuming 'supabase' is available in this scope or will be imported.
            // This part of the code was provided in the instruction.
            const { data } = await supabase
                .from('ai_chat_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (data) {
                setSessions(data);
                if (data.length > 0 && !currentSession) {
                    setCurrentSession(data[0]);
                }
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    }, [user, currentSession]);

    useEffect(() => {
        if (user) {
            loadSessions();
        }
    }, [user, loadSessions]);

    const loadMessages = async (sessionId: string) => {
        setLoading(true);
        try {
            const data = await AiService.getMessages(sessionId);
            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (mode: TherapyMode) => {
        if (!user) return;
        try {
            const newSession = await AiService.createSession(user.id, mode);
            setSessions([newSession, ...sessions]);
            setCurrentSession(newSession);
            setShowNewChatModal(false);
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !user || sending) return;

        // Moderação
        const moderation = await ModerationService.analyzeText(input);
        if (!moderation.isSafe) {
            toast.error('Sua mensagem contém termos inadequados. Por favor, reformule.');
            return;
        }

        const content = input.trim();
        setInput('');
        setSending(true);

        try {
            let sessionId = currentSession?.id;
            let mode = currentSession?.therapy_mode || 'tcc';

            // Se não houver sessão, cria uma padrão (TCC)
            if (!sessionId) {
                const newSession = await AiService.createSession(user.id, 'tcc', content);
                setSessions([newSession, ...sessions]);
                setCurrentSession(newSession);
                sessionId = newSession.id;
                mode = 'tcc';
            }

            // Otimistic update for user message
            const tempUserMsg: Message = {
                id: Date.now(),
                role: 'user',
                content: content,
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempUserMsg]);

            // Send to API
            if (sessionId) {
                const aiMsg = await AiService.sendMessage(sessionId, content, mode);
                // Update with real AI response
                setMessages(prev => [...prev, aiMsg]);
                
                // Speak response if audio enabled
                if (audioEnabled) {
                    speak(aiMsg.content);
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);
            // TODO: Show error toast
        } finally {
            setSending(false);
        }
    };

    const getModeIcon = (mode: TherapyMode) => {
        switch (mode) {
            case 'psicanalise': return <Sofa size={18} />;
            case 'gestalt': return <Sparkles size={18} />;
            case 'psicodrama': return <Theater size={18} />;
            case 'tcc': default: return <Brain size={18} />;
        }
    };

    const getModeName = (mode: TherapyMode) => {
        switch (mode) {
            case 'psicanalise': return 'Psicanálise';
            case 'gestalt': return 'Gestalt-Terapia';
            case 'psicodrama': return 'Psicodrama';
            case 'tcc': default: return 'TCC';
        }
    };

    return (
        <div className="flex h-[600px] gap-4 relative">
            {/* Sidebar - Lista de Sessões */}
            <div className="w-1/3 hidden md:flex flex-col gap-2">
                <button
                    onClick={() => setShowNewChatModal(true)}
                    className="flex items-center justify-center gap-2 p-3 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-xl transition-all font-bold mb-2"
                >
                    <Plus size={20} /> Nova Conversa
                </button>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {sessions.map(session => (
                        <button
                            key={session.id}
                            onClick={() => setCurrentSession(session)}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${currentSession?.id === session.id
                                ? 'bg-white/10 border border-neon-purple/50 text-white'
                                : 'bg-white/5 border border-transparent hover:bg-white/10 text-gray-400'
                                }`}
                        >
                            <div className="text-neon-purple">
                                {getModeIcon(session.therapy_mode)}
                            </div>
                            <div className="truncate flex-1">
                                <p className="font-medium truncate">{session.title}</p>
                                <p className="text-xs opacity-60 flex justify-between">
                                    <span>{getModeName(session.therapy_mode)}</span>
                                    <span>{new Date(session.updated_at).toLocaleDateString()}</span>
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <GlassCard className="flex-1 flex flex-col overflow-hidden border-neon-purple/20 relative">
                {/* Header Mobile */}
                <div className="md:hidden p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-white font-bold">IA Terapeuta</h3>
                    <button onClick={() => setShowNewChatModal(true)} className="p-2 bg-neon-purple rounded-lg">
                        <Plus size={16} className="text-white" />
                    </button>
                </div>

                {/* Desktop Header (Active Mode) */}
                {currentSession && (
                    <div className="hidden md:flex p-3 border-b border-white/10 items-center justify-between gap-2 text-gray-300 bg-black/20">
                        <div className="flex items-center gap-2">
                            <span className="text-neon-purple">{getModeIcon(currentSession.therapy_mode)}</span>
                            <span className="text-sm font-medium">Modo: {getModeName(currentSession.therapy_mode)}</span>
                        </div>
                        <button 
                            onClick={() => {
                                setAudioEnabled(!audioEnabled);
                                if (audioEnabled) cancelSpeech();
                            }}
                            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${audioEnabled ? 'text-neon-green' : 'text-gray-500'} ${isSpeaking ? 'animate-pulse' : ''}`}
                            title={audioEnabled ? "Desativar voz" : "Ativar voz"}
                        >
                            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.length === 0 && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                            <Bot size={48} className="mb-4 text-neon-purple" />
                            <p>Olá! Sou sua IA Terapeuta.</p>
                            <p className="text-sm">Escolha uma abordagem e comece a conversar.</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={msg.id || idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
                                    <Bot size={16} className="text-neon-purple" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-neon-purple text-white rounded-tr-none'
                                    : 'bg-white/10 text-gray-200 rounded-tl-none'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <p className="text-[10px] opacity-50 mt-1 text-right">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <User size={16} className="text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {sending && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
                                <Bot size={16} className="text-neon-purple" />
                            </div>
                            <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-neon-purple" />
                                <span className="text-xs text-gray-400">Digitando...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`p-3 rounded-xl transition-all ${
                                isListening 
                                ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500' 
                                : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10'
                            }`}
                            title="Falar"
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isListening ? "Ouvindo..." : "Digite sua mensagem..."}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-purple transition-colors"
                            disabled={sending}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || sending}
                            className="p-2 bg-neon-purple hover:bg-neon-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </GlassCard>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl">
                    <GlassCard className="w-full max-w-md p-6 border-neon-purple/50 animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-4 text-center">Escolha a Abordagem</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => handleCreateSession('tcc')}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-purple transition-all group"
                            >
                                <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <Brain size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-white">TCC</h4>
                                    <p className="text-xs text-gray-400">Foco em pensamentos e reestruturação cognitiva.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleCreateSession('psicanalise')}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-purple transition-all group"
                            >
                                <div className="p-3 rounded-full bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    <Sofa size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-white">Psicanálise</h4>
                                    <p className="text-xs text-gray-400">Exploração do inconsciente e livre associação.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleCreateSession('gestalt')}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-purple transition-all group"
                            >
                                <div className="p-3 rounded-full bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <Sparkles size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-white">Gestalt-Terapia</h4>
                                    <p className="text-xs text-gray-400">Foco no "aqui e agora" e consciência.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleCreateSession('psicodrama')}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-purple transition-all group"
                            >
                                <div className="p-3 rounded-full bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                    <Theater size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-white">Psicodrama</h4>
                                    <p className="text-xs text-gray-400">Ação, papéis e dramatização.</p>
                                </div>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowNewChatModal(false)}
                            className="mt-4 w-full py-2 text-gray-400 hover:text-white text-sm"
                        >
                            Cancelar
                        </button>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
