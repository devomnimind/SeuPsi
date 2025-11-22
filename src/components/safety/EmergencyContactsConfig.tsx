import { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type EmergencyContact = {
    id: number;
    contact_name: string;
    contact_phone: string;
    relationship: string;
    sharing_config: {
        wellness_summary: boolean;
        mood_alerts: boolean;
        panic_episodes: boolean;
        emergency_tools_usage: boolean;
        critical_risk: boolean;
        detailed_content: boolean;
    };
};

export const EmergencyContactsConfig = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newRelationship, setNewRelationship] = useState('parent');

    useEffect(() => {
        if (user) {
            fetchContacts();
        }
    }, [user]);

    const fetchContacts = async () => {
        const { data, error } = await supabase
            .from('emergency_contacts')
            .select('*')
            .eq('user_id', user!.id)
            .order('priority_order');

        if (error) {
            console.error('Error fetching contacts:', error);
        } else {
            setContacts(data || []);
        }
        setLoading(false);
    };

    const addContact = async () => {
        if (!newName || !newPhone) return;

        const { error } = await supabase
            .from('emergency_contacts')
            .insert({
                user_id: user!.id,
                contact_name: newName,
                contact_phone: newPhone,
                relationship: newRelationship,
                sharing_config: {
                    wellness_summary: false,
                    mood_alerts: false,
                    panic_episodes: false,
                    emergency_tools_usage: false,
                    critical_risk: true, // Sempre true
                    detailed_content: false
                }
            });

        if (error) {
            console.error('Error adding contact:', error);
            alert('Erro ao adicionar contato');
        } else {
            setNewName('');
            setNewPhone('');
            setShowAddForm(false);
            fetchContacts();
        }
    };

    const deleteContact = async (id: number) => {
        if (!confirm('Tem certeza que deseja remover este contato?')) return;

        const { error } = await supabase
            .from('emergency_contacts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting contact:', error);
        } else {
            fetchContacts();
        }
    };

    const updateSharing = async (id: number, key: string, value: boolean) => {
        const contact = contacts.find(c => c.id === id);
        if (!contact) return;

        const newConfig = { ...contact.sharing_config, [key]: value };

        const { error } = await supabase
            .from('emergency_contacts')
            .update({ sharing_config: newConfig })
            .eq('id', id);

        if (error) {
            console.error('Error updating sharing:', error);
        } else {
            setContacts(contacts.map(c => c.id === id ? { ...c, sharing_config: newConfig } : c));
        }
    };

    if (loading) return <div className="text-white">Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Phone className="text-red-500" />
                    Contatos de Emergência
                </h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Adicionar
                </button>
            </div>

            {showAddForm && (
                <GlassCard className="p-4 animate-fade-in">
                    <h3 className="text-white font-bold mb-4">Novo Contato</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Nome"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        />
                        <input
                            type="tel"
                            placeholder="Telefone"
                            value={newPhone}
                            onChange={e => setNewPhone(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        />
                        <select
                            value={newRelationship}
                            onChange={e => setNewRelationship(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        >
                            <option value="parent">Pai/Mãe</option>
                            <option value="friend">Amigo(a)</option>
                            <option value="therapist">Terapeuta</option>
                            <option value="sibling">Irmão/Irmã</option>
                            <option value="other">Outro</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={addContact}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                        >
                            Salvar
                        </button>
                    </div>
                </GlassCard>
            )}

            <div className="space-y-4">
                {contacts.map(contact => (
                    <GlassCard key={contact.id} className="p-0 overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="font-bold text-white text-lg">{contact.contact_name}</h3>
                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                    {contact.relationship} • {contact.contact_phone}
                                </p>
                            </div>
                            <button
                                onClick={() => deleteContact(contact.id)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="p-4">
                            <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
                                Configuração de Compartilhamento
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Toggle
                                    label="Resumo Semanal"
                                    checked={contact.sharing_config.wellness_summary}
                                    onChange={(v) => updateSharing(contact.id, 'wellness_summary', v)}
                                />
                                <Toggle
                                    label="Alertas de Humor"
                                    checked={contact.sharing_config.mood_alerts}
                                    onChange={(v) => updateSharing(contact.id, 'mood_alerts', v)}
                                />
                                <Toggle
                                    label="Episódios de Pânico"
                                    checked={contact.sharing_config.panic_episodes}
                                    onChange={(v) => updateSharing(contact.id, 'panic_episodes', v)}
                                />
                                <Toggle
                                    label="Uso Ferramentas Emergência"
                                    checked={contact.sharing_config.emergency_tools_usage}
                                    onChange={(v) => updateSharing(contact.id, 'emergency_tools_usage', v)}
                                />
                                <Toggle
                                    label="Conteúdo Detalhado (Posts)"
                                    checked={contact.sharing_config.detailed_content}
                                    onChange={(v) => updateSharing(contact.id, 'detailed_content', v)}
                                    warning={true}
                                />
                                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30 opacity-70 cursor-not-allowed">
                                    <span className="text-sm text-gray-300 flex items-center gap-2">
                                        <ShieldAlert size={16} className="text-red-400" />
                                        Risco Crítico (Obrigatório)
                                    </span>
                                    <div className="w-10 h-5 bg-red-500 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {contacts.length === 0 && !showAddForm && (
                    <div className="text-center py-8 text-gray-400">
                        <Phone size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Nenhum contato de emergência configurado.</p>
                        <p className="text-sm mt-2">Adicione pessoas de confiança para receberem alertas em caso de emergência.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Toggle = ({ label, checked, onChange, warning = false }: { label: string, checked: boolean, onChange: (v: boolean) => void, warning?: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${checked
        ? (warning ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-neon-purple/10 border-neon-purple/30')
        : 'bg-white/5 border-white/10'
        }`}>
        <div className="flex items-center gap-2">
            {warning && <AlertTriangle size={16} className="text-yellow-500" />}
            <span className={`text-sm ${checked ? 'text-white' : 'text-gray-400'}`}>{label}</span>
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`w-10 h-5 rounded-full relative transition-colors ${checked
                ? (warning ? 'bg-yellow-500' : 'bg-neon-purple')
                : 'bg-gray-600'
                }`}
        >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${checked ? 'right-1' : 'left-1'
                }`}></div>
        </button>
    </div>
);

import { AlertTriangle } from 'lucide-react';
