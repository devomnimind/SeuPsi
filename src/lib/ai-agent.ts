import type { UserProfile } from '../types';

export interface DailySuggestion {
    quote: {
        text: string;
        author: string;
    };
    meditationId: string; // ID of a recommended meditation
    studyTrackId: string; // ID of a recommended study track
    tip: string;
}

const QUOTES = {
    good: [
        { text: "A gratidão transforma o que temos em suficiente.", author: "Melody Beattie" },
        { text: "Continue espalhando sua luz.", author: "Desconhecido" },
    ],
    neutral: [
        { text: "Cada dia é uma nova oportunidade para recomeçar.", author: "Desconhecido" },
        { text: "O equilíbrio é a chave para uma vida saudável.", author: "Desconhecido" },
    ],
    bad: [
        { text: "Isso também passará.", author: "Provérbio Persa" },
        { text: "Seja gentil consigo mesmo. Você está fazendo o melhor que pode.", author: "Desconhecido" },
    ]
};

const TIPS = {
    good: "Aproveite sua energia positiva para aprender algo novo hoje!",
    neutral: "Que tal uma breve caminhada para clarear a mente?",
    bad: "Tire um momento para respirar fundo. Não se cobre tanto hoje."
};

export const generateDailySuggestions = (mood: 'good' | 'neutral' | 'bad', _userProfile?: UserProfile): DailySuggestion => {
    // Simple mock logic: select content based on mood
    // In a real app, this would use an LLM and userProfile history

    const quotes = QUOTES[mood];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    let meditationId = '1'; // Default focus
    let studyTrackId = '1'; // Default Biology

    if (mood === 'bad') {
        meditationId = '3'; // Anxiety/Calm
        studyTrackId = '2'; // Philosophy (Stoicism)
    } else if (mood === 'good') {
        meditationId = '4'; // Morning Energy
        studyTrackId = '3'; // Finance
    }

    return {
        quote: randomQuote,
        meditationId,
        studyTrackId,
        tip: TIPS[mood]
    };
};
