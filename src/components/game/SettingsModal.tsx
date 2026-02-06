import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Plus, Settings, Users, ArrowRight, Trash2, X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart?: () => void;
}

export const SettingsModal = ({ isOpen, onClose, onStart }: SettingsModalProps) => {
  const {
    teams,
    players,
    addTeam,
    removeTeam,
    addPlayer,
    removePlayer,
    setSettings,
    settings,
    startGame,
    status,
  } = useGameStore();

  const [newTeamName, setNewTeamName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [localSettings, setLocalSettings] = useState(settings);



  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    addTeam({
      id: crypto.randomUUID(),
      name: newTeamName,
      score: 0,
      color: "bg-blue-500",
      players: [],
    });
    setNewTeamName("");
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    addPlayer({
      id: crypto.randomUUID(),
      name: newPlayerName,
    });
    setNewPlayerName("");
  };

  const handleStart = () => {
    setSettings(localSettings);
    startGame();
    onStart?.();
    onClose();
  };

  const isTeamMode = localSettings.mode === "teams";
  const isIndividualMode = localSettings.mode === "individual";
  const canStart = isTeamMode 
    ? teams.length >= 2 
    : players.length >= 2 && localSettings.scoreToWin > 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 w-full max-w-lg rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <Settings className="text-yellow-400" /> Configuração
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Game Mode Selector */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-widest px-1">Modo de Jogo</h3>
              <div className="flex gap-2 p-1 bg-black/20 rounded-2xl border border-white/5">
                <button
                  onClick={() => setLocalSettings({ ...localSettings, mode: "teams" })}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    isTeamMode
                      ? "bg-yellow-400 text-purple-900 shadow-lg scale-[1.02]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Equipes
                </button>
                <button
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      mode: "individual",
                      scoreToWin: localSettings.scoreToWin <= 0 ? 10 : localSettings.scoreToWin,
                    })
                  }
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    isIndividualMode
                      ? "bg-yellow-400 text-purple-900 shadow-lg scale-[1.02]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Individual
                </button>
              </div>
            </section>

            {/* General Rules */}
            <section className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-widest flex items-center gap-2">
                <Settings size={16} /> Regras
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white/90">Tempo da Vez</span>
                  <select
                    className="bg-purple-800 border-2 border-white/10 rounded-xl p-2 font-bold text-white focus:outline-none focus:border-yellow-400"
                    value={localSettings.timePerRound}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, timePerRound: Number(e.target.value) })
                    }
                  >
                    {[30, 45, 60, 90, 120].map(t => (
                      <option key={t} value={t}>{t}s</option>
                    ))}
                  </select>
                </div>

                {/* Hide Cards Per Round in Individual Mode */}
                {!isIndividualMode && (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white/90 block">Limite de Cartas</span>
                      <span className="text-[10px] text-purple-300 uppercase font-bold">Encerra a vez ao atingir</span>
                    </div>
                    <select
                      className="bg-purple-800 border-2 border-white/10 rounded-xl p-2 font-bold text-white focus:outline-none focus:border-yellow-400"
                      value={localSettings.cardsPerRound ?? "unlimited"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocalSettings({
                          ...localSettings,
                          cardsPerRound: val === "unlimited" ? null : Number(val),
                        });
                      }}
                    >
                      <option value="unlimited">Sem Limite</option>
                      {[3, 5, 10, 15].map(c => (
                        <option key={c} value={c}>{c} Cartas</option>
                      ))}
                    </select>
                  </div>
                )}

                {isTeamMode ? (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/90">Rodadas Totais</span>
                    <div className="flex items-center gap-3">
                       <input
                        type="number"
                        min="1"
                        max="99"
                        className="bg-purple-800 border-2 border-white/10 rounded-xl p-2 w-20 text-center font-bold text-white focus:outline-none focus:border-yellow-400"
                        value={localSettings.rounds}
                        onChange={(e) => setLocalSettings({ ...localSettings, rounds: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/90">Pontos para Vencer</span>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      className="bg-purple-800 border-2 border-white/10 rounded-xl p-2 w-20 text-center font-bold text-white focus:outline-none focus:border-yellow-400"
                      value={localSettings.scoreToWin}
                      onChange={(e) => setLocalSettings({ ...localSettings, scoreToWin: Number(e.target.value) })}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold text-white/90">Modo Prendas</span>
                  <button
                    onClick={() => setLocalSettings((s) => ({ ...s, prendasEnabled: !s.prendasEnabled }))}
                    className={`w-14 h-7 rounded-full transition-all relative p-1 ${
                      localSettings.prendasEnabled ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${
                        localSettings.prendasEnabled ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Players/Teams List */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-widest flex items-center gap-2 px-1">
                <Users size={16} /> {isTeamMode ? "Equipes" : "Jogadores"}
              </h3>

              <div className="flex gap-2">
                <Input
                  placeholder={isTeamMode ? "Nome da Equipe" : "Nome do Jogador"}
                  value={isTeamMode ? newTeamName : newPlayerName}
                  onChange={(e) => isTeamMode ? setNewTeamName(e.target.value) : setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (isTeamMode) {
                        handleAddTeam();
                      } else {
                        handleAddPlayer();
                      }
                    }
                  }}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl"
                />
                <Button
                  onClick={isTeamMode ? handleAddTeam : handleAddPlayer}
                  variant="secondary"
                  className="rounded-xl px-4"
                  disabled={isTeamMode ? !newTeamName.trim() : !newPlayerName.trim()}
                >
                  <Plus size={20} />
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {(isTeamMode ? teams : players).map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between bg-white/5 border border-white/5 p-3 rounded-xl group hover:bg-white/10 transition-colors"
                    >
                      <span className="font-bold text-white/90">{item.name}</span>
                      <button
                        onClick={() => isTeamMode ? removeTeam(item.id) : removePlayer(item.id)}
                        className="text-white/20 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {(isTeamMode ? teams : players).length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-2xl">
                    <p className="text-purple-300/50 italic text-sm">
                      Nenhum {isTeamMode ? "equipe" : "jogador"} adicionado
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-black/20 border-t border-white/10">
            <Button
              className="w-full py-6 rounded-2xl text-xl font-black uppercase tracking-tighter flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              disabled={!canStart}
              onClick={handleStart}
            >
              {status !== 'setup' && status !== 'game_over' ? "Começar Novo Jogo" : "Iniciar Jogo"} <ArrowRight />
            </Button>
            {!canStart && (
              <p className="text-red-400 text-[10px] font-bold text-center mt-3 uppercase tracking-wider">
                {isTeamMode
                  ? "Adicione pelo menos 2 equipes"
                  : players.length < 2
                    ? "Adicione pelo menos 2 jogadores"
                    : "Defina os pontos para vencer (mínimo 1)"}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
