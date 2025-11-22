import { create } from 'zustand';

interface UserState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    xp: number;
    level: number;
    addXP: (amount: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
    theme: 'light',
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
    }),
    xp: 0,
    level: 1,
    addXP: (amount) => set((state) => {
        const newXP = state.xp + amount;
        const newLevel = Math.floor(newXP / 1000) + 1; // Exemplo simples: 1000 XP por nível
        return { xp: newXP, level: newLevel };
    }),
}));
