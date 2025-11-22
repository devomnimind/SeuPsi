import { useState } from 'react';
import { Shield, Lock, Users } from 'lucide-react';
import { GuardianDashboard } from '../components/safety/GuardianDashboard';
import { EmergencyContactsConfig } from '../components/safety/EmergencyContactsConfig';
import { useAuth } from '../contexts/AuthContext';

export const SafetyCenter = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'guardian' | 'contacts'>('guardian');

    return (
        <div className="max-w-4xl mx-auto pb-20 pt-6 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Shield className="text-neon-purple" size={32} />
                    Central de Segurança
                </h1>
                <p className="text-gray-400">
                    Gerencie contatos de emergência e configurações de proteção familiar.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('guardian')}
                    className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === 'guardian' ? 'text-neon-purple' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users size={20} />
                        Área do Responsável
                    </div>
                    {activeTab === 'guardian' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`pb-4 px-2 font-semibold transition-colors relative ${activeTab === 'contacts' ? 'text-neon-purple' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Lock size={20} />
                        Contatos de Emergência
                    </div>
                    {activeTab === 'contacts' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple"></div>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="animate-fade-in">
                {activeTab === 'guardian' ? (
                    <GuardianDashboard />
                ) : (
                    <EmergencyContactsConfig />
                )}
            </div>
        </div>
    );
};
