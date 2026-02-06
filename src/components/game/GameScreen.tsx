import { useGameStore } from "../../store/useGameStore";
import { Timer } from "./Timer";
import { CardDisplay } from "./CardDisplay";
import { RoundSummaryScreen } from "./RoundSummaryScreen";
import { GameOverScreen } from "./GameOverScreen";
import { IndividualGameScreen } from "./IndividualGameScreen";
import { Button } from "../common/Button";
import { Ban, Check, SkipForward, AlertTriangle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useState } from "react";

import { Scoreboard } from "./Scoreboard";
import { SettingsModal } from "./SettingsModal";

const handleCardAction = ({
  action,
  setButtonState,
}: {
  action: () => void;
  setButtonState: (state: boolean) => void;
}) => {
  action();
  setButtonState(true);
  setTimeout(() => {
    setButtonState(false);
  }, 1000);
};

export const GameScreen = () => {
  const {
    status,
    currentCard,
    teams,
    settings,
    currentTeamIndex,
    startRound,
    scoreCard,
    skipCard,
    recordRefusal,
    handlePrendaDone,
    failPrenda,
    currentRoundScore,
    currentPrenda,
  } = useGameStore();

  const [showExitModal, setShowExitModal] = useState(false);
  const [buttonState, setButtonState] = useState(false);

  // Redirect if game state is invalid for this screen
  if (status === "setup") {
    return <Navigate to="/setup" replace />;
  }

  // Render individual game mode
  if (settings.mode === "individual") {
    return <IndividualGameScreen />;
  }

  const currentTeam = teams[currentTeamIndex];



  if (status === "game_over") {
    return <GameOverScreen />;
  }

  if (status === "turn_ready") {
    return (
      <div className="h-screen bg-purple-900 flex flex-col items-center justify-center text-white p-6 relative">
        <div className="absolute top-4 left-4 ">
          <button
            onClick={() => setShowExitModal(true)}
            className="text-white/50 hover:text-white p-2 transition-colors flex items-center"
          >
            <XCircle size={24} />
            <span className="ml-2 text-white/50 hover:text-white transition-colors text-sm font-bold">
              MENU
            </span>
          </button>
        </div>

        <h2 className="text-4xl-fluid font-bold mb-4">Vez da Equipe</h2>
        <h1 className="text-6xl-fluid font-black text-yellow-400 mb-8 uppercase tracking-widest text-center">
          {currentTeam?.name}
        </h1>

        {/* Show Global Scoreboard here too so they know the score before starting */}
        <div className="mb-12 transform scale-125">
          <Scoreboard />
        </div>

        <p className="text-xl mb-12 opacity-80">
          Prepare-se para dar as dicas!
        </p>
        <Button onClick={startRound} size="lg">
          COMEÇAR RODADA
        </Button>

        <SettingsModal
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
        />
      </div>
    );
  }

  if (status === "prenda_alert") {
    return (
      <div className="h-screen bg-red-600 flex flex-col items-center justify-center text-white p-6 text-center animate-pulse-slow">
        <AlertTriangle size={80} className="mb-6 mx-auto text-yellow-300" />
        <h1 className="text-5xl font-black mb-4 uppercase">NÃO PODE!</h1>
        <p className="text-2xl font-bold mb-8">Palavra proibida dita!</p>

        <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm mb-8 border border-white/30 max-w-lg w-full">
          <h3 className="text-xl font-bold mb-2 text-yellow-200">
            Dica de Prenda:
          </h3>
          <p className="text-2xl">
            {currentPrenda?.description || "Prenda Misteriosa"}
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button
            onClick={handlePrendaDone}
            variant="secondary"
            className="bg-white text-red-600 hover:bg-red-100 w-full py-4 text-lg"
          >
            Cumpri a Prenda
          </Button>

          <Button
            onClick={failPrenda}
            variant="ghost"
            className="border-2 border-white/50 text-white hover:bg-white/10 w-full py-3"
          >
            Não Cumpriu (-1 Ponto)
          </Button>
        </div>
      </div>
    );
  }

  if (status === "round_summary") {
    return <RoundSummaryScreen />;
  }

  // playing
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-dvh bg-purple-800 flex flex-col items-center p-4 relative overflow-hidden"
    >
      <SettingsModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
      />

      {/* Header */}
      <header className="w-full relative mb-4 px-2 flex items-center">
        {/* Left: Exit */}
        <div className="w-[80px]">
          <button
            onClick={() => setShowExitModal(true)}
            className="text-white/50 p-2 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        {/* Center: Scoreboard (centralizado e responsivo) */}
        <div className="flex-1 flex justify-center">
          <div className="truncate w-full">
            <Scoreboard />
          </div>
        </div>

        {/* Right: Round Score */}
        <div className="w-[80px] flex flex-col items-end">
          <span className="text-xs sm:text-xl font-bold text-purple-300 uppercase">
            Pontos
          </span>
          <span className="text-xs sm:text-xl font-black text-yellow-400">
            {currentRoundScore}
          </span>
        </div>
      </header>

      <Timer />

      <div className="flex-1 w-full flex items-center justify-center z-10 relative">
        <AnimatePresence mode="wait">
          {currentCard ? (
            <CardDisplay card={currentCard} key={currentCard.id} />
          ) : (
            <div className="text-white text-xl animate-pulse">
              Carregando carta...
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-4 mt-6 mb-4 z-20">
        <Button
          variant="danger"
          className="flex flex-col items-center justify-center py-6"
          onClick={() => {
            handleCardAction({ action: recordRefusal, setButtonState });
          }}
          disabled={buttonState}
        >
          <Ban size={24} className="mb-1" />
          <span className="text-xs">TABU</span>
        </Button>

        <Button
          variant="ghost"
          className="flex flex-col items-center justify-center py-6 bg-purple-700 hover:bg-purple-600 text-white"
          onClick={() => {
            handleCardAction({ action: skipCard, setButtonState });
          }}
          disabled={buttonState}
        >
          <SkipForward size={24} className="mb-1" />
          <span className="text-xs">PULAR</span>
        </Button>

        <Button
          variant="primary"
          className="flex flex-col items-center justify-center py-6"
          onClick={() => {
            handleCardAction({ action: scoreCard, setButtonState });
          }}
          disabled={buttonState}
        >
          <Check size={24} className="mb-1" />
          <span className="text-xs">ACERTOU</span>
        </Button>
      </div>
    </motion.div>
  );
};
