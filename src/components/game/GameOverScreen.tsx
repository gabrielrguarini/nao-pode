import { useGameStore } from "../../store/useGameStore";
import { Button } from "../common/Button";
import {
  Trophy,
  RotateCcw,
  Target,
  X,
  SkipForward,
  TrendingUp,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Team, PlayerScore } from "../../types";

export const GameOverScreen = () => {
  const { teams, playerScores, restartGame, settings } = useGameStore();
  const navigate = useNavigate();

  const handleRestart = () => {
    restartGame(false);
    useGameStore.getState().startGame();
    navigate("/game");
  };

  const handleNewGame = () => {
    restartGame(true);
    navigate("/setup");
  };

  const calculateAccuracy = (
    stats: Team["statistics"] | PlayerScore["statistics"],
  ) => {
    if (!stats || stats.totalCards === 0) return 0;
    return Math.round((stats.correct / stats.totalCards) * 100);
  };

  // Individual Mode
  if (settings.mode === "individual") {
    const sortedPlayers = [...playerScores].sort((a, b) => b.score - a.score);
    const highestScore = sortedPlayers[0]?.score || 0;
    const winners = sortedPlayers.filter((p) => p.score === highestScore);
    const isTie = winners.length > 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-8">
          {/* Winner Section */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center mb-12"
          >
            <Trophy
              size={80}
              className="text-yellow-400 mb-6 mx-auto animate-bounce"
            />
            <h1 className="text-5xl font-black mb-2 uppercase">Fim de Jogo!</h1>

            <div className="bg-white/10 p-8 rounded-2xl border border-white/20 mt-8 backdrop-blur-sm">
              {isTie ? (
                <>
                  <h2 className="text-2xl font-bold text-yellow-300 mb-4">
                    🤝 Empate!
                  </h2>
                  <div className="space-y-3 mb-4">
                    {winners.map((winner) => (
                      <h3
                        key={winner.playerId}
                        className="text-3xl font-black uppercase tracking-wider"
                      >
                        {winner.playerName}
                      </h3>
                    ))}
                  </div>
                  <span className="text-6xl font-black block mb-2">
                    {highestScore}
                  </span>
                  <span className="text-sm uppercase opacity-70">Pontos</span>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-yellow-300 mb-2">
                    🏆 Vencedor
                  </h2>
                  <h3 className="text-4xl font-black uppercase tracking-wider mb-4">
                    {winners[0]?.playerName}
                  </h3>
                  <span className="text-6xl font-black block mb-2">
                    {highestScore}
                  </span>
                  <span className="text-sm uppercase opacity-70">Pontos</span>
                </>
              )}
            </div>
          </motion.div>

          {/* Detailed Statistics */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="text-yellow-400" />
              Ranking Final
            </h2>

            {sortedPlayers.map((player, idx) => {
              const stats = player.statistics;
              const accuracy = calculateAccuracy(stats);

              return (
                <motion.div
                  key={player.playerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
                >
                  {/* Player Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-yellow-400">
                        #{idx + 1}
                      </span>
                      <div>
                        <h3 className="text-2xl font-bold">
                          {player.playerName}
                        </h3>
                        <p className="text-sm text-purple-300">
                          Pontuação Final: {player.score} pts
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-green-400">
                        {accuracy}%
                      </div>
                      <div className="text-xs text-purple-300">
                        Taxa de Acerto
                      </div>
                    </div>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-purple-900/30 p-4 rounded-lg text-center">
                      <Target
                        className="mx-auto mb-2 text-blue-400"
                        size={24}
                      />
                      <div className="text-2xl font-bold">
                        {stats.totalCards}
                      </div>
                      <div className="text-xs text-purple-300 uppercase">
                        Total de Cartas
                      </div>
                    </div>

                    <div className="bg-green-900/30 p-4 rounded-lg text-center">
                      <Trophy
                        className="mx-auto mb-2 text-green-400"
                        size={24}
                      />
                      <div className="text-2xl font-bold text-green-400">
                        {stats.correct}
                      </div>
                      <div className="text-xs text-purple-300 uppercase">
                        Acertos
                      </div>
                    </div>

                    <div className="bg-red-900/30 p-4 rounded-lg text-center">
                      <X className="mx-auto mb-2 text-red-400" size={24} />
                      <div className="text-2xl font-bold text-red-400">
                        {stats.taboos}
                      </div>
                      <div className="text-xs text-purple-300 uppercase">
                        Tabus
                      </div>
                    </div>

                    <div className="bg-blue-900/30 p-4 rounded-lg text-center">
                      <SkipForward
                        className="mx-auto mb-2 text-blue-400"
                        size={24}
                      />
                      <div className="text-2xl font-bold text-blue-400">
                        {stats.skipped}
                      </div>
                      <div className="text-xs text-purple-300 uppercase">
                        Pulos
                      </div>
                    </div>
                  </div>

                  {/* Longest Streak */}
                  {stats.longestStreak > 1 && (
                    <div className="mt-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg flex items-center gap-3">
                      <TrendingUp className="text-yellow-400" size={32} />
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {stats.longestStreak} acertos
                        </div>
                        <div className="text-xs text-purple-300">
                          Maior Sequência de Acertos
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <Button
              onClick={handleRestart}
              className="flex items-center justify-center gap-2 py-4 text-lg"
              variant="secondary"
            >
              <RotateCcw size={24} /> Jogar Novamente
            </Button>

            <Button
              onClick={handleNewGame}
              className="bg-white text-purple-900 hover:bg-gray-100 flex items-center justify-center gap-2 py-3"
            >
              Novo Jogo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Team Mode
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const highestScore = sortedTeams[0]?.score || 0;
  const winners = sortedTeams.filter((team) => team.score === highestScore);
  const isTie = winners.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto py-8">
        {/* Winner Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-12"
        >
          <Trophy
            size={80}
            className="text-yellow-400 mb-6 mx-auto animate-bounce"
          />
          <h1 className="text-5xl font-black mb-2 uppercase">Fim de Jogo!</h1>

          <div className="bg-white/10 p-8 rounded-2xl border border-white/20 mt-8 backdrop-blur-sm">
            {isTie ? (
              <>
                <h2 className="text-2xl font-bold text-yellow-300 mb-4">
                  🤝 Empate!
                </h2>
                <div className="space-y-3 mb-4">
                  {winners.map((winner) => (
                    <h3
                      key={winner.id}
                      className="text-3xl font-black uppercase tracking-wider"
                    >
                      {winner.name}
                    </h3>
                  ))}
                </div>
                <span className="text-6xl font-black block mb-2">
                  {highestScore}
                </span>
                <span className="text-sm uppercase opacity-70">Pontos</span>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-yellow-300 mb-2">
                  🏆 Vencedores
                </h2>
                <h3 className="text-4xl font-black uppercase tracking-wider mb-4">
                  {winners[0]?.name}
                </h3>
                <span className="text-6xl font-black block mb-2">
                  {highestScore}
                </span>
                <span className="text-sm uppercase opacity-70">Pontos</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Detailed Statistics */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Award className="text-yellow-400" />
            Estatísticas Detalhadas
          </h2>

          {sortedTeams.map((team, idx) => {
            const stats = team.statistics || {
              totalCards: 0,
              correct: 0,
              taboos: 0,
              skipped: 0,
              longestStreak: 0,
            };
            const accuracy = calculateAccuracy(stats);

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
              >
                {/* Team Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-yellow-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold">{team.name}</h3>
                      <p className="text-sm text-purple-300">
                        Pontuação Final: {team.score} pts
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-green-400">
                      {accuracy}%
                    </div>
                    <div className="text-xs text-purple-300">
                      Taxa de Acerto
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-purple-900/30 p-4 rounded-lg text-center">
                    <Target className="mx-auto mb-2 text-blue-400" size={24} />
                    <div className="text-2xl font-bold">{stats.totalCards}</div>
                    <div className="text-xs text-purple-300 uppercase">
                      Total de Cartas
                    </div>
                  </div>

                  <div className="bg-green-900/30 p-4 rounded-lg text-center">
                    <Trophy className="mx-auto mb-2 text-green-400" size={24} />
                    <div className="text-2xl font-bold text-green-400">
                      {stats.correct}
                    </div>
                    <div className="text-xs text-purple-300 uppercase">
                      Acertos
                    </div>
                  </div>

                  <div className="bg-red-900/30 p-4 rounded-lg text-center">
                    <X className="mx-auto mb-2 text-red-400" size={24} />
                    <div className="text-2xl font-bold text-red-400">
                      {stats.taboos}
                    </div>
                    <div className="text-xs text-purple-300 uppercase">
                      Tabus
                    </div>
                  </div>

                  <div className="bg-blue-900/30 p-4 rounded-lg text-center">
                    <SkipForward
                      className="mx-auto mb-2 text-blue-400"
                      size={24}
                    />
                    <div className="text-2xl font-bold text-blue-400">
                      {stats.skipped}
                    </div>
                    <div className="text-xs text-purple-300 uppercase">
                      Pulos
                    </div>
                  </div>
                </div>

                {/* Longest Streak */}
                {stats.longestStreak > 1 && (
                  <div className="mt-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg flex items-center gap-3">
                    <TrendingUp className="text-yellow-400" size={32} />
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {stats.longestStreak} acertos
                      </div>
                      <div className="text-xs text-purple-300">
                        Maior Sequência de Acertos
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <Button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 py-4 text-lg"
            variant="secondary"
          >
            <RotateCcw size={24} /> Jogar Novamente
          </Button>

          <Button
            onClick={handleNewGame}
            className="bg-white text-purple-900 hover:bg-gray-100 flex items-center justify-center gap-2 py-3"
          >
            Novo Jogo (Zero)
          </Button>
        </div>
      </div>
    </div>
  );
};
