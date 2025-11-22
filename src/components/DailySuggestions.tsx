import type { DailySuggestion } from '../lib/ai-agent';
import { Sparkles, Quote, PlayCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DailySuggestionsProps {
    suggestion: DailySuggestion;
}

export const DailySuggestions = ({ suggestion }: DailySuggestionsProps) => {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                <Sparkles size={20} />
                <h2 className="font-bold text-lg">Sugestões para Você</h2>
            </div>

            <div className="space-y-6">
                {/* Quote */}
                <div className="relative pl-4 border-l-4 border-indigo-200 dark:border-indigo-700">
                    <Quote size={16} className="absolute -top-2 -left-2 text-indigo-300 dark:text-indigo-600 opacity-50" />
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200 italic mb-1">
                        "{suggestion.quote.text}"
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        — {suggestion.quote.author}
                    </p>
                </div>

                {/* Tip */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                        💡 <strong>Dica do dia:</strong> {suggestion.tip}
                    </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        to="/mindfulness"
                        className="flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        <PlayCircle size={18} />
                        Meditar
                    </Link>
                    <Link
                        to="/studies"
                        className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-gray-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                        <BookOpen size={18} />
                        Estudar
                    </Link>
                </div>
            </div>
        </div>
    );
};
