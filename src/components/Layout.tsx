import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Brain, BookOpen, User, ShieldAlert, FileText, Users, Menu, X, LogIn, LogOut, Target, Trophy } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { useAuth } from '../contexts/AuthContext';

export const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    type NavItem = {
        path: string;
        icon: React.ReactNode;
        label: string;
        className?: string;
    };

    const navItems: NavItem[] = [
        { path: '/', icon: <Home size={20} />, label: 'Home' },
        { path: '/mindfulness', icon: <Brain size={20} />, label: 'Mindfulness' },
        { path: '/studies', icon: <BookOpen size={20} />, label: 'Estudos' },
        { path: '/community', icon: <Users size={20} />, label: 'Comunidade' },
    ];

    const protectedItems: NavItem[] = [
        { path: '/daily-info', icon: <FileText size={20} />, label: 'Diário' },
        { path: '/meta360', icon: <Target size={20} />, label: 'Meta360' },
        { path: '/engagement', icon: <Trophy size={20} />, label: 'Engajamento' },
        { path: '/libertamente', icon: <ShieldAlert size={20} />, label: 'LibertaMente', className: 'text-red-500 hover:text-red-400' },
        { path: '/profile', icon: <User size={20} />, label: 'Perfil' },
    ];

    const allItems = user ? [...navItems, ...protectedItems] : navItems;

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="min-h-screen flex flex-col text-gray-100">
            {/* Glass Header */}
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-glass-dark border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-green">
                        SEU PSI
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-2 items-center">
                        {allItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300
                                    ${isActive(item.path)
                                        ? 'bg-white/10 text-white shadow-neon'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                    ${item.className || ''}
                                `}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}

                        {user ? (
                            <button
                                onClick={handleSignOut}
                                className="ml-2 px-4 py-2 rounded-xl flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Sair</span>
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="ml-2 px-4 py-2 rounded-xl flex items-center gap-2 bg-neon-purple/20 text-neon-purple border border-neon-purple/50 hover:bg-neon-purple/30 transition-all"
                            >
                                <LogIn size={20} />
                                <span className="font-medium">Entrar</span>
                            </Link>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden pt-20 px-4 animate-fade-in">
                    <GlassCard className="flex flex-col gap-2 p-4 border-neon-purple/30">
                        {allItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    p-4 rounded-xl flex items-center gap-4 transition-all duration-300
                                    ${isActive(item.path)
                                        ? 'bg-neon-purple/20 text-white border border-neon-purple/50'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                                    ${item.className || ''}
                                `}
                            >
                                {item.icon}
                                <span className="font-medium text-lg">{item.label}</span>
                            </Link>
                        ))}

                        {user ? (
                            <button
                                onClick={() => {
                                    handleSignOut();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="p-4 rounded-xl flex items-center gap-4 text-gray-400 hover:bg-white/5 hover:text-white transition-all w-full text-left"
                            >
                                <LogOut size={20} />
                                <span className="font-medium text-lg">Sair</span>
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-4 rounded-xl flex items-center gap-4 bg-neon-purple/20 text-neon-purple border border-neon-purple/50 hover:bg-neon-purple/30 transition-all"
                            >
                                <LogIn size={20} />
                                <span className="font-medium text-lg">Entrar</span>
                            </Link>
                        )}
                    </GlassCard>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 pt-24 pb-20">
                <Outlet />
            </main>

            {/* Mobile Bottom Nav (Quick Access) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-glass-dark backdrop-blur-md border-t border-white/10 px-4 py-3 flex justify-between items-center z-50">
                {allItems.slice(0, 5).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`p-2 rounded-xl transition-colors ${isActive(item.path) ? 'text-neon-purple bg-white/5' : 'text-gray-400'}`}
                    >
                        {item.icon}
                    </Link>
                ))}
            </nav>
        </div>
    );
};
