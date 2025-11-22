import { useEffect, useState } from 'react';
import { Shield, Zap, Heart, Book, Trophy } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { RpgService, type HeroProfile } from '../../services/RpgService';
import { useAuth } from '../../contexts/AuthContext';

export const HeroProfileView = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<HeroProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;
        try {
            const data = await RpgService.getHeroProfile(user.id);
            setProfile(data);
        } catch (error) {
            console.error('Error loading hero profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white">Carregando perfil...</div>;
    if (!profile) return null;

    const xpPercentage = (profile.current_xp / profile.next_level_xp) * 100;

    return (
        <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={120} className="text-yellow-500" />
            </div>

            <div className="flex items-center gap-6 relative z-10">
                {/* Avatar / Class Icon */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-purple to-blue-500 flex items-center justify-center shadow-lg border-4 border-white/10">
                    <Shield size={48} className="text-white" />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{profile.hero_class}</h2>
                            <p className="text-neon-purple font-bold">Nível {profile.level}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">XP {profile.current_xp} / {profile.next_level_xp}</p>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-neon-purple to-neon-green transition-all duration-1000"
                            style={{ width: `${xpPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                        <Shield size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Resiliência</p>
                        <p className="text-lg font-bold text-white">{profile.attributes.resilience}</p>
                    </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                        <Book size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Sabedoria</p>
                        <p className="text-lg font-bold text-white">{profile.attributes.wisdom}</p>
                    </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3">
                    <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                        <Heart size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Empatia</p>
                        <p className="text-lg font-bold text-white">{profile.attributes.empathy}</p>
                    </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Foco</p>
                        <p className="text-lg font-bold text-white">{profile.attributes.focus}</p>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
