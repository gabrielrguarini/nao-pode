import { useState, useEffect } from "react";
import { useGameStore } from "../../store/useGameStore";
import { motion } from "framer-motion";
import { Modal } from "../common/Modal";
import { ChevronDown, Trophy } from "lucide-react";

export const Scoreboard = () => {
  const {
    teams,
    players,
    currentTeamIndex,
    currentReaderIndex,
    playerScores,
    settings,
  } = useGameStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const totalItems = settings.mode === "individual" ? playerScores.length : teams.length;
  const isCompact = isSmallScreen && totalItems > 3;

  const renderScoreItem = (name: string, score: number, isCurrent: boolean, color?: string, key?: string, onClick?: () => void) => (
    <motion.div
      key={key}
      initial={{ scale: 0.9, opacity: 0.8 }}
      animate={{
        scale: isCurrent ? 1.05 : 0.95,
        opacity: isCurrent ? 1 : 0.6,
        borderColor: isCurrent ? color || "#FBBF24" : "transparent",
      }}
      onClick={onClick}
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full border-2 transition-all flex-shrink-0 ${
        isCurrent ? "bg-white/10 shadow-lg" : "bg-transparent"
      } ${onClick ? "cursor-pointer active:scale-95" : ""}`}
    >
      {/* Circle Indicator */}
      <div
        className="w-2 sm:w-3 h-2 sm:h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] flex-shrink-0"
        style={{ backgroundColor: color || "#FBBF24" }}
      />

      {/* Name + Score */}
      <div className="flex flex-col items-start min-w-0">
        <span
          className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-wider leading-none truncate ${
            isCurrent ? "text-white" : "text-white/70"
          }`}
        >
          {name}
        </span>
        <span
          className={`text-xl sm:text-2xl font-black leading-none truncate ${
            isCurrent ? "text-white" : "text-white/60"
          }`}
        >
          {score}
        </span>
      </div>
      
      {onClick && (
        <ChevronDown size={14} className="text-white/50 ml-1" />
      )}
    </motion.div>
  );

  const getScoresForModal = () => {
    if (settings.mode === "individual") {
      return [...playerScores]
        .sort((a, b) => b.score - a.score)
        .map(p => ({
          id: p.playerId,
          name: p.playerName,
          score: p.score,
          isCurrent: p.playerId === players[currentReaderIndex]?.id,
          color: "#FBBF24"
        }));
    } else {
      return [...teams]
        .sort((a, b) => b.score - a.score)
        .map((t) => {
          const isCurrent = teams.findIndex(team => team.id === t.id) === currentTeamIndex;
          return {
            id: t.id,
            name: t.name,
            score: t.score,
            isCurrent,
            color: t.color
          };
        });
    }
  };

  if (totalItems < 2) return null;

  return (
    <div className="flex-1 flex justify-center px-2">
      <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm p-1 sm:p-2 rounded-full border border-white/10 justify-center max-w-full overflow-x-auto">
        {settings.mode === "individual" ? (
          <>
            {isCompact ? (
              renderScoreItem(
                players[currentReaderIndex]?.name || "Jogador",
                playerScores.find(p => p.playerId === players[currentReaderIndex]?.id)?.score || 0,
                true,
                "#FBBF24",
                "compact",
                () => setIsModalOpen(true)
              )
            ) : (
              [...playerScores]
                .sort((a, b) => b.score - a.score)
                .map((player) =>
                  renderScoreItem(
                    player.playerName,
                    player.score,
                    player.playerId === players[currentReaderIndex]?.id,
                    "#FBBF24",
                    player.playerId
                  )
                )
            )}
          </>
        ) : (
          <>
            {isCompact ? (
              renderScoreItem(
                teams[currentTeamIndex]?.name || "Equipe",
                teams[currentTeamIndex]?.score || 0,
                true,
                teams[currentTeamIndex]?.color,
                "compact",
                () => setIsModalOpen(true)
              )
            ) : (
              teams.map((team, index) =>
                renderScoreItem(
                  team.name,
                  team.score,
                  index === currentTeamIndex,
                  team.color,
                  team.id
                )
              )
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Classificação"
      >
        <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {getScoresForModal().map((item, idx) => (
            <div
              key={item.id}
              className={`flex justify-between items-center p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                item.isCurrent
                  ? "bg-purple-100 border-purple-300 scale-[1.02] shadow-md"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {idx === 0 && <Trophy size={16} className="text-yellow-500" />}
                        <span className={`font-black text-sm sm:text-base uppercase tracking-tight ${item.isCurrent ? "text-purple-800" : "text-gray-700"}`}>
                            {item.name}
                        </span>
                    </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full opacity-60" style={{ backgroundColor: item.color || "#FBBF24" }} />
                 <span className={`text-2xl sm:text-3xl font-black ${item.isCurrent ? "text-purple-600" : "text-gray-400"}`}>
                    {item.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
