import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from './store/useGameStore';
import { SetupScreen } from './components/game/SetupScreen';
import { GameScreen } from './components/game/GameScreen';
import { RulesScreen } from './components/game/RulesScreen';

// Placeholders for screens
const HomeScreen = () => {
    const navigate = useNavigate();
    const { status, restartGame, startGame } = useGameStore();

    const handleNewGame = () => {
        restartGame(true);
        navigate('/setup');
    };

    const handleRestart = () => {
        restartGame(false); // Keep teams
        startGame(); // Immediately start
        navigate('/game');
    };

    const handleContinue = () => {
        navigate('/game');
    };

    const hasActiveGame = status !== 'setup' && status !== 'game_over';

    return (
        <div className="flex flex-col items-center justify-center h-dvh bg-purple-600 text-white p-4 overflow-hidden">
             <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src="/nao-pode.png" 
                alt="Logo" 
                className="w-1/2 mb-8 max-w-sm" 
            />
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
                {hasActiveGame && (
                    <>
                        <button 
                            onClick={handleContinue}
                            className="bg-yellow-400 text-purple-900 px-8 py-4 rounded-xl font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
                        >
                            CONTINUAR
                        </button>
                        
                         <button 
                            onClick={handleRestart}
                            className="bg-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-purple-400 transition-all border border-white/20"
                        >
                            RECOMEÇAR
                        </button>
                    </>
                )}

                <button 
                    onClick={handleNewGame}
                    className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    {hasActiveGame ? 'NOVO JOGO' : 'JOGAR'}
                </button>
                
                <button 
                    onClick={() => navigate('/rules')}
                    className="bg-purple-500 text-white border-2 border-white/20 px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-purple-400 transition-all"
                >
                    REGRAS
                </button>
            </div>
        </div>
    );
};

function App() {
  const initializeContent = useGameStore(state => state.initializeContent);
  const isLoading = useGameStore(state => state.isLoading);

  useEffect(() => {
    initializeContent();
  }, [initializeContent]);

  if (isLoading) {
      return (
          <div className="h-dvh w-screen flex items-center justify-center bg-purple-600 text-white">
              <h1 className="text-2xl font-bold animate-pulse">Carregando...</h1>
          </div>
      )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/setup" element={<SetupScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/rules" element={<RulesScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
