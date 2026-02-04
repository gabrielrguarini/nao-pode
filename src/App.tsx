import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';
import { SetupScreen } from './components/game/SetupScreen';
import { GameScreen } from './components/game/GameScreen';

// Placeholders for screens
const HomeScreen = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-purple-600 text-white p-4">
            <h1 className="text-6xl font-black mb-8 text-yellow-400 drop-shadow-lg tracking-wider transform -rotate-2">
                NÃO<br/>PODE!
            </h1>
            <button 
                onClick={() => window.location.href = '/setup'}
                className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
                JOGAR
            </button>
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
          <div className="h-screen w-screen flex items-center justify-center bg-purple-600 text-white">
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
