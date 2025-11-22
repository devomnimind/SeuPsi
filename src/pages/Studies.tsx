import { StudyDashboard } from '../components/studies/StudyDashboard';

export const Studies = () => {
    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Estudos & Conhecimento</h1>
                <p className="text-gray-400">Potencialize seu aprendizado com inteligência artificial.</p>
            </header>

            <StudyDashboard />

            {/* Conteúdo estático anterior pode ficar abaixo como "Trilhas Recomendadas" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 pointer-events-none grayscale">
                {/* ... placeholders ... */}
            </div>
        </div>
    );
};
