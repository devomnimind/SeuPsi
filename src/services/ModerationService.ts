export const ModerationService = {
    blockedWords: [
        'idiota', 'estupido', 'imbecil', 'burro', 'matar', 'morrer', 'suicidio', 
        'odio', 'raiva', 'bater', 'chutar', 'socar', 'droga', 'drogas'
    ],

    analyzeText(text: string): { isSafe: boolean; flaggedWords: string[] } {
        const lowerText = text.toLowerCase();
        const flaggedWords = this.blockedWords.filter(word => lowerText.includes(word));
        
        return {
            isSafe: flaggedWords.length === 0,
            flaggedWords
        };
    },

    censorText(text: string): string {
        let censoredText = text;
        this.blockedWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            censoredText = censoredText.replace(regex, '*'.repeat(word.length));
        });
        return censoredText;
    }
};
