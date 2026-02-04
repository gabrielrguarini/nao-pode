import { useGameStore } from '../../store/useGameStore';
import { Timer } from './Timer';
import { CardDisplay } from './CardDisplay';
import { RoundSummaryScreen } from './RoundSummaryScreen';
import { GameOverScreen } from './GameOverScreen';
import { Button } from '../common/Button';
import { Ban, Check, SkipForward, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GameScreen = () => {
  const { 
    status, 
    currentCard, 
    teams, 
    currentTeamIndex, 
    startRound, 
    scoreCard, 
    skipCard, 
    recordRefusal,
    handlePrendaDone,
    currentRoundScore
  } = useGameStore();

  const currentTeam = teams[currentTeamIndex];

  if (status === 'game_over') {
    return <GameOverScreen />;
  }

  if (status === 'turn_ready') {
      return (
          <div className="h-screen bg-purple-900 flex flex-col items-center justify-center text-white p-6">
              <h2 className="text-4xl font-bold mb-4">Vez da Equipe</h2>
              <h1 className="text-6xl font-black text-yellow-400 mb-8 uppercase tracking-widest text-center">{currentTeam?.name}</h1>
              <p className="text-xl mb-12 opacity-80">Prepare-se para dar as dicas!</p>
              <Button onClick={startRound} size="lg">COMEÇAR RODADA</Button>
          </div>
      );
  }

  if (status === 'prenda_alert') {
      return (
          <div className="h-screen bg-red-600 flex flex-col items-center justify-center text-white p-6 text-center animate-pulse-slow">
              <AlertTriangle size={80} className="mb-6 mx-auto text-yellow-300" />
              <h1 className="text-5xl font-black mb-4 uppercase">NÃO PODE!</h1>
              <p className="text-2xl font-bold mb-8">Palavra proibida dita!</p>
              
              <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm mb-8 border border-white/30">
                  <h3 className="text-xl font-bold mb-2 text-yellow-200">Prenda:</h3>
                  <p className="text-2xl">Imite uma galinha por 10 segundos!</p> 
                  {/* TODO: Integrate random prenda from store */}
              </div>

              <Button onClick={handlePrendaDone} variant="secondary" className="bg-white text-red-600 hover:bg-red-100">
                  Cumpri a Prenda
              </Button>
          </div>
      );
  }

  if (status === 'round_summary') {
      return <RoundSummaryScreen />;
  }

  // playing
  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="h-screen bg-purple-800 flex flex-col items-center p-4 relative overflow-hidden"
    >
        {/* Header */}
        <header className="w-full flex items-center justify-between mb-4 z-10">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-purple-300 uppercase">Equipe</span>
                <span className="text-xl font-bold text-white">{currentTeam?.name}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-purple-300 uppercase">Pontos</span>
                <span className="text-3xl font-black text-yellow-400">{currentRoundScore}</span>
            </div>
        </header>

        <Timer />
        
        <div className="flex-1 w-full flex items-center justify-center z-10 relative">
            <AnimatePresence mode='wait'>
                {currentCard ? (
                    <CardDisplay card={currentCard} key={currentCard.id} />
                ) : (
                    <div className="text-white text-xl animate-pulse">Carregando carta...</div>
                )}
            </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-4 mt-6 mb-4 z-20">
             <Button 
                variant="danger" 
                className="flex flex-col items-center justify-center py-6"
                onClick={recordRefusal}
             >
                <Ban size={24} className="mb-1" />
                <span className="text-xs">TABU</span>
             </Button>

             <Button 
                variant="ghost" 
                className="flex flex-col items-center justify-center py-6 bg-purple-700 hover:bg-purple-600 text-white"
                onClick={skipCard}
             >
                <SkipForward size={24} className="mb-1" />
                <span className="text-xs">PULAR</span>
             </Button>

             <Button 
                variant="primary" 
                className="flex flex-col items-center justify-center py-6"
                onClick={scoreCard}
             >
                <Check size={24} className="mb-1" />
                <span className="text-xs">ACERTOU</span>
             </Button>
        </div>
    </motion.div>
  );
};
