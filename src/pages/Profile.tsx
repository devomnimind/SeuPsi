import { useEffect, useState } from 'react';
import { User, Moon, Sun, Award, TrendingUp, Users, UserPlus } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useUserStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type ProfileData = {
    username: string;
    full_name: string;
    avatar_url: string;
    level: number;
    xp: number;
    followers_count: number;
    following_count: number;
};

export const Profile = () => {
    const { theme, toggleTheme } = useUserStore();
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getProfile() {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('username, full_name, avatar_url, level, xp')
                    .eq('id', user.id)
                    .single();

                // Buscar contadores sociais
                const { count: followersCount } = await supabase
                    .from('user_follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', user.id);

                const { count: followingCount } = await supabase
                    .from('user_follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', user.id);

                if (error) {
                    console.error('Error fetching profile:', error);
                } else if (data) {
                    setProfile({
                        ...data,
                        followers_count: followersCount || 0,
                        following_count: followingCount || 0
                    });
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }

        getProfile();
    }, [user]);

    if (loading) {
        return <div className="text-center text-white mt-10">Carregando perfil...</div>;
    }

    const level = profile?.level || 1;
    const xp = profile?.xp || 0;
    const nextLevelXp = level * 100;
    const progress = (xp / nextLevelXp) * 100;

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <GlassCard className="p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/10 to-transparent"></div>
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-4 text-neon-purple shadow-[0_0_20px_rgba(176,38,255,0.3)] overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} />
                        )}
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-white">{profile?.full_name || 'Usuário'}</h1>
                    <p className="text-gray-400 mb-6">@{profile?.username || 'username'}</p>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center  justify-center gap-2 text-neon-purple mb-1">
                                <TrendingUp size={20} />
                                <span className="font-bold text-2xl text-white">{level}</span>
                            </div>
                            <p className="text-xs text-gray-400 text-center">Nível</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-center gap-2 text-yellow-500 mb-1">
                                <Award size={20} />
                                <span className="font-bold text-2xl text-white">{xp}</span>
                            </div>
                            <p className="text-xs text-gray-400 text-center">XP</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-center gap-2 text-neon-green mb-1">
                                <Users size={20} />
                                <span className="font-bold text-2xl text-white">{profile?.followers_count || 0}</span>
                            </div>
                            <p className="text-xs text-gray-400 text-center">Seguidores</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-center gap-2 text-blue-500 mb-1">
                                <UserPlus size={20} />
                                <span className="font-bold text-2xl text-white">{profile?.following_count || 0}</span>
                            </div>
                            <p className="text-xs text-gray-400 text-center">Seguindo</p>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="max-w-xs mx-auto mb-6">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>XP Atual</span>
                            <span>Próximo Nível</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-neon-purple to-neon-green transition-all duration-500 shadow-[0_0_10px_rgba(176,38,255,0.5)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <section className="grid grid-cols-2 gap-4">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-2 text-neon-purple">
                        <Award size={20} />
                        <h3 className="font-semibold">Conquistas</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">3</p>
                    <p className="text-sm text-gray-400">Desbloqueadas</p>
                </GlassCard>
                <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-2 text-neon-green">
                        <TrendingUp size={20} />
                        <h3 className="font-semibold">Sequência</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">5 dias</p>
                    <p className="text-sm text-gray-400">Mantenha o foco!</p>
                </GlassCard>
            </section>

            <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Preferências</h2>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-300">
                        {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                        <span>Tema do Aplicativo</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors text-white border border-white/10"
                    >
                        {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};
