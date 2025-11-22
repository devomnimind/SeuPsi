import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const GlassCard = ({ children, className = '', hoverEffect = false }: GlassCardProps) => {
    return (
        <div
            className={`
        backdrop-blur-md 
        bg-glass-white 
        dark:bg-glass-dark 
        border border-white/10 
        rounded-2xl 
        shadow-glass
        ${hoverEffect ? 'hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};
