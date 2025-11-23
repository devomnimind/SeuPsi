import { Shield, AlertTriangle, Activity, Heart, Phone, UserCheck } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useGuardianData } from '../../hooks/useGuardianData';



export const GuardianDashboard = () => {
    const { minors, selectedMinor, setSelectedMinor, metrics, alerts, loading } = useGuardianData();

    if (loading) return <div className="text-white">Carregando...</div>;

    if (minors.length === 0) {
        return (
            <GlassCard className="p-8 text-center">
                <Shield size={48} className="mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-bold text-white mb-2">Área do Responsável</h2>
                <p className="text-gray-400">Você não tem adolescentes vinculados no momento.</p>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-6">
            {/* Seletor de Menor */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {minors.map(minor => (
                    <button
                        key={minor.id}
                        onClick={() => setSelectedMinor(minor)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedMinor?.id === minor.id
                            ? 'bg-neon-purple/20 border-neon-purple'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <img
                            src={minor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${minor.id}`}
                            alt={minor.full_name}
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="text-left">
                            <p className="font-bold text-white">{minor.full_name}</p>
                            <p className="text-xs text-gray-400 capitalize">{minor.relationship_type}</p>
                        </div>
                    </button>
                ))}
            </div>

            {selectedMinor && (
                <>
                    {/* Resumo de Bem-Estar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <GlassCard className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Heart className="text-neon-pink" />
                                <h3 className="text-gray-400">Humor Médio</h3>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {metrics ? `${metrics.mood_score}/100` : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
                        </GlassCard>

                        <GlassCard className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="text-neon-blue" />
                                <h3 className="text-gray-400">Engajamento</h3>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {metrics ? `${metrics.engagement_score}/100` : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Participação na plataforma</p>
                        </GlassCard>

                        <GlassCard className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className={metrics?.risk_score && metrics.risk_score > 50 ? 'text-red-500' : 'text-green-500'} />
                                <h3 className="text-gray-400">Nível de Risco</h3>
                            </div>
                            <p className={`text-2xl font-bold ${metrics?.risk_score && metrics.risk_score > 50 ? 'text-red-500' : 'text-green-500'}`}>
                                {metrics ? (metrics.risk_score > 50 ? 'Alto' : 'Baixo') : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Baseado em múltiplos fatores</p>
                        </GlassCard>
                    </div>

                    {/* Alertas Recentes */}
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Shield size={24} className="text-neon-purple" />
                            Alertas e Notificações
                        </h3>

                        <div className="space-y-3">
                            {alerts.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">Nenhum alerta recente.</p>
                            ) : (
                                alerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 rounded-lg border ${alert.alert_type === 'critical_risk'
                                            ? 'bg-red-500/10 border-red-500/50'
                                            : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className={`font-bold ${alert.alert_type === 'critical_risk' ? 'text-red-400' : 'text-white'
                                                    }`}>
                                                    {alert.alert_type === 'critical_risk' ? '⚠️ ALERTA CRÍTICO' :
                                                        alert.alert_type === 'moderate_risk' ? 'Atenção Necessária' :
                                                            alert.alert_type === 'concern_detected' ? 'Preocupação Detectada' :
                                                                'Resumo Semanal'}
                                                </h4>
                                                <p className="text-gray-300 mt-1">{alert.message}</p>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>

                                        {alert.alert_type === 'critical_risk' && (
                                            <div className="mt-3 flex gap-2">
                                                <a href="tel:188" className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm flex items-center gap-1">
                                                    <Phone size={14} /> Ligar CVV (188)
                                                </a>
                                                <a href="tel:192" className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm">
                                                    Emergência (192)
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>

                    {/* Nota de Privacidade */}
                    <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-sm text-blue-200">
                        <p className="flex items-center gap-2 font-bold mb-1">
                            <UserCheck size={16} />
                            Privacidade Protegida
                        </p>
                        <p className="opacity-80">
                            Para proteger a privacidade e confiança de {selectedMinor.full_name}, você recebe apenas resumos e alertas de risco.
                            Conteúdos específicos como diários, mensagens e posts permanecem privados, exceto em situações de risco de vida iminente.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default GuardianDashboard;
