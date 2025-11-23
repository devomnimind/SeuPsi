import { useState } from 'react';
import { Calendar, CheckCircle, Brain, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { StudyGenerator, type Question, type StudySchedule } from '../../services/StudyGenerator';
import { toast } from 'sonner';

export const StudyDashboard = () => {
    const { user } = useAuth();
    const [mode, setMode] = useState<'menu' | 'quiz' | 'schedule'>('menu');
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);

    // Quiz State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);

    // Schedule State
    const [schedule, setSchedule] = useState<StudySchedule | null>(null);

    const handleStartQuiz = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        try {
            const data = await StudyGenerator.generateQuestions(topic, user?.id);
            setQuestions(data);
            setMode('quiz');
            setCurrentQuestion(0);
            setScore(0);
            setShowExplanation(false);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar quiz.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        try {
            const data = await StudyGenerator.generateSchedule(topic, '2 horas');
            setSchedule(data);
            setMode('schedule');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar cronograma.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        if (showExplanation) return;

        if (optionIndex === questions[currentQuestion].correctAnswer) {
            setScore(s => s + 1);
            toast.success('Correto!');
        } else {
            toast.error('Incorreto.');
        }
        setShowExplanation(true);
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(c => c + 1);
            setShowExplanation(false);
        } else {
            toast.success(`Quiz finalizado! Pontuação: ${score}/${questions.length}`);
            setMode('menu');
        }
    };

    return (
        <div className="space-y-6">
            {mode === 'menu' && (
                <GlassCard className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Brain className="text-neon-green" /> Mentor de Estudos IA
                    </h2>

                    <div className="flex gap-2 mb-8">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="O que você quer estudar hoje? (ex: Direito Constitucional, Biologia...)"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleStartQuiz}
                            disabled={loading || !topic}
                            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-green transition-all text-left group disabled:opacity-50"
                        >
                            <div className="bg-neon-green/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-neon-green group-hover:scale-110 transition-all">
                                <CheckCircle size={24} />
                            </div>
                            <h3 className="font-bold text-white text-lg mb-1">Gerar Quiz</h3>
                            <p className="text-gray-400 text-sm">Teste seus conhecimentos com questões geradas pela IA.</p>
                        </button>

                        <button
                            onClick={handleCreateSchedule}
                            disabled={loading || !topic}
                            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400 transition-all text-left group disabled:opacity-50"
                        >
                            <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-all">
                                <Calendar size={24} />
                            </div>
                            <h3 className="font-bold text-white text-lg mb-1">Criar Cronograma</h3>
                            <p className="text-gray-400 text-sm">Organize sua rotina com um plano de estudos personalizado.</p>
                        </button>
                    </div>
                </GlassCard>
            )}

            {mode === 'quiz' && questions.length > 0 && (
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-400">Questão {currentQuestion + 1}/{questions.length}</span>
                        <span className="text-neon-green font-bold">Pontos: {score}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-6">{questions[currentQuestion].text}</h3>

                    <div className="space-y-3">
                        {questions[currentQuestion].options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={showExplanation}
                                className={`w-full p-4 rounded-xl text-left transition-all ${showExplanation
                                    ? idx === questions[currentQuestion].correctAnswer
                                        ? 'bg-neon-green/20 border-neon-green text-white'
                                        : 'bg-white/5 text-gray-400'
                                    : 'bg-white/5 hover:bg-white/10 text-white'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    {showExplanation && (
                        <div className="mt-6 p-4 bg-white/5 rounded-xl border-l-4 border-neon-green animate-fade-in">
                            <p className="text-white font-bold mb-1">Explicação:</p>
                            <p className="text-gray-300">{questions[currentQuestion].explanation}</p>
                            <button
                                onClick={nextQuestion}
                                className="mt-4 bg-neon-green text-black px-6 py-2 rounded-lg font-bold hover:bg-neon-green/80 transition-colors flex items-center gap-2"
                            >
                                Próxima <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </GlassCard>
            )}

            {mode === 'schedule' && schedule && (
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">{schedule.title}</h2>
                        <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-white">Voltar</button>
                    </div>

                    <div className="space-y-4">
                        {schedule.days.map((day, idx) => (
                            <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="flex justify-between mb-2">
                                    <h3 className="font-bold text-neon-green">{day.day}</h3>
                                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{day.duration}</span>
                                </div>
                                <ul className="list-disc list-inside text-gray-300 space-y-1">
                                    {day.topics.map((t, i) => (
                                        <li key={i}>{t}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};
