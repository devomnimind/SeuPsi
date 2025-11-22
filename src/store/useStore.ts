import { create } from 'zustand';

interface UserState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
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
}));
