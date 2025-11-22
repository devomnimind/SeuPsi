import { useState } from 'react';
import { Users, MessageSquare, Activity } from 'lucide-react';
import { Feed } from '../components/social/Feed';
import { Chat } from '../components/social/Chat';

export const Community = () => {
    const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'groups'>('feed');

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green">
                    Comunidade
                </h1>
                <p className="text-gray-400 max-w-md mx-auto">
                    Conecte-se, compartilhe e evolua junto com milhares de outras mentes em busca de equilíbrio.
                </p>
            </header>

            {/* Navigation Tabs */}
            <div className="flex justify-center">
                <div className="bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-white/10 inline-flex">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`
              px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300
              ${activeTab === 'feed'
                                ? 'bg-neon-purple text-white shadow-neon'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
                    >
                        <Activity size={20} />
                        <span>Feed</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`
              px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300
              ${activeTab === 'chat'
                                ? 'bg-neon-purple text-white shadow-neon'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
                    >
                        <MessageSquare size={20} />
                        <span>Chat</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`
              px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300
              ${activeTab === 'groups'
                                ? 'bg-neon-purple text-white shadow-neon'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
                    >
                        <Users size={20} />
                        <span>Grupos</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'feed' && (
                    <div className="animate-fade-in">
                        <Feed />
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="animate-fade-in max-w-4xl mx-auto">
                        <Chat />
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
                            <Users size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Grupos em Breve</h3>
                        <p className="text-gray-400">Estamos preparando espaços temáticos para você.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
