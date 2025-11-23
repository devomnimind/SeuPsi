import { HeroProfileView } from '../components/gamification/HeroProfileView';
import { QuestBoard } from '../components/gamification/QuestBoard';

export const HeroJourney = () => {
    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Jornada do Herói</h1>
                <p className="text-gray-400">Transforme sua evolução pessoal em uma aventura épica.</p>
            </header>

            <HeroProfileView />

            <QuestBoard />
        </div>
    );
};

export default HeroJourney;
