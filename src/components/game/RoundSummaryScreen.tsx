import { useGameStore } from '../../store/useGameStore';
import { Button } from '../common/Button';
import { Check, X, SkipForward } from 'lucide-react';

export const RoundSummaryScreen = () => {
    const { roundResults, nextTurn, teams, currentTeamIndex, currentRoundScore } = useGameStore();
    const currentTeam = teams[currentTeamIndex];

    const corrects = roundResults.filter((r: import('../../types').RoundResult) => r.status === 'correct').length;
    const skips = roundResults.filter((r: import('../../types').RoundResult) => r.status === 'skipped').length;
    const errors = roundResults.filter((r: import('../../types').RoundResult) => r.status === 'smashed' || r.status === 'prenda').length;

    return (
        <div className="h-screen bg-purple-900 flex flex-col items-center p-6 text-white overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2">Resumo da Rodada</h2>
            <h3 className="text-xl text-yellow-400 mb-8">{currentTeam?.name}</h3>

            <div className="w-full max-w-sm bg-white/10 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                    <span className="text-lg">Pontuação Total</span>
                    <span className="text-4xl font-bold">{currentTeam.score}</span>
                </div>
                 <div className="flex justify-between items-center text-sm opacity-80">
                    <span>Nesta rodada: +{currentRoundScore}</span>
                </div>
            </div>

            <div className="w-full max-w-sm flex gap-4 mb-8">
                <div className="flex-1 bg-green-500/20 p-4 rounded-lg flex flex-col items-center">
                    <Check className="text-green-400 mb-2" />
                    <span className="font-bold text-2xl">{corrects}</span>
                    <span className="text-xs uppercase">Acertos</span>
                </div>
                <div className="flex-1 bg-red-500/20 p-4 rounded-lg flex flex-col items-center">
                    <X className="text-red-400 mb-2" />
                    <span className="font-bold text-2xl">{errors}</span>
                    <span className="text-xs uppercase">TABUS</span>
                </div>
                 <div className="flex-1 bg-blue-500/20 p-4 rounded-lg flex flex-col items-center">
                    <SkipForward className="text-blue-400 mb-2" />
                    <span className="font-bold text-2xl">{skips}</span>
                    <span className="text-xs uppercase">Pulos</span>
                </div>
            </div>

            <Button onClick={nextTurn} size="lg" className="w-full max-w-sm">
                Próxima Vez
            </Button>
        </div>
    );
};
