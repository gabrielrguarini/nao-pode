import { useGameStore } from '../../store/useGameStore';
import { Button } from '../common/Button';
import { Trophy, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GameOverScreen = () => {
  const { teams, restartGame } = useGameStore();
  const navigate = useNavigate();

  // Sort teams by score
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];

  const handleRestart = () => {
      restartGame();
      navigate('/setup'); // Go back to setup or home
  };

  return (
    <div className="h-screen bg-purple-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <Trophy size={80} className="text-yellow-400 mb-6 animate-bounce" />
        <h1 className="text-5xl font-black mb-2 uppercase">Fim de Jogo!</h1>
        
        <div className="bg-white/10 p-8 rounded-2xl border border-white/20 mb-8 w-full max-w-sm">
            <h2 className="text-2xl font-bold text-yellow-300 mb-2">Vencedores</h2>
            <h3 className="text-4xl font-black uppercase tracking-wider mb-4">{winner?.name}</h3>
            <span className="text-6xl font-black block mb-2">{winner?.score}</span>
            <span className="text-sm uppercase opacity-70">Pontos</span>
        </div>

        <div className="w-full max-w-sm space-y-4">
             {sortedTeams.slice(1).map((team, idx) => (
                 <div key={team.id} className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                     <span className="font-bold text-white/70">#{idx + 2} {team.name}</span>
                     <span className="font-bold">{team.score} pts</span>
                 </div>
             ))}
        </div>

        <Button onClick={handleRestart} className="mt-8 flex items-center gap-2" variant="secondary">
            <RotateCcw size={20} /> Jogar Novamente
        </Button>
    </div>
  );
};
