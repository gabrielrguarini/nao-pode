import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Plus, Settings, Users, ArrowRight, Book, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SetupScreen = () => {
  const navigate = useNavigate();
  const { teams, addTeam, removeTeam, setSettings, settings, startGame, status } = useGameStore();
  const [newTeamName, setNewTeamName] = useState('');
  
  // Local state for settings form
  const [localSettings, setLocalSettings] = useState(settings);

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    addTeam({
      id: crypto.randomUUID(),
      name: newTeamName,
      score: 0,
      color: 'bg-blue-500', // Randomize later
      players: []
    });
    setNewTeamName('');
  };

  const handleRemoveTeam = (id: string) => {
    removeTeam(id);
  };

  const handleStart = () => {
    // Save settings
    setSettings(localSettings);
    startGame();
    navigate('/game');
  };

  const handleContinue = () => {
    // Save settings without restarting game
    setSettings(localSettings);
    navigate('/game');
  };

  const hasActiveGame = status !== 'setup' && status !== 'game_over';

  return (
    <div className="min-h-dvh bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6 overflow-y-auto">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Configuração</h1>
            <div className="flex gap-2">
                <button onClick={() => navigate('/rules')} className="text-purple-300 hover:text-white transition-colors">
                     <Book size={24} />
                </button>
                <Settings className="text-purple-300" />
            </div>
        </header>

        {/* Game Mode Settings */}
        <section className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings size={20} /> Regras
            </h2>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <span>Tempo da Vez</span>
                    <select 
                        className="bg-purple-800 rounded p-2"
                        value={localSettings.timePerRound}
                        onChange={(e) => setLocalSettings({...localSettings, timePerRound: Number(e.target.value)})}
                    >
                        <option value={30}>30s</option>
                        <option value={45}>45s</option>
                        <option value={60}>60s</option>
                        <option value={90}>90s</option>
                        <option value={120}>120s</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="block">Limite de Cartas</span>
                        <span className="text-xs text-purple-300">Encerra a vez ao atingir</span>
                    </div>
                    <select 
                        className="bg-purple-800 rounded p-2"
                        value={localSettings.cardsPerRound ?? 'unlimited'}
                        onChange={(e) => {
                            const val = e.target.value;
                            setLocalSettings({
                                ...localSettings, 
                                cardsPerRound: val === 'unlimited' ? null : Number(val)
                            });
                        }}
                    >
                        <option value="unlimited">Só Tempo</option>
                        <option value={3}>3 Cartas</option>
                        <option value={5}>5 Cartas</option>
                        <option value={10}>10 Cartas</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <span>Rodadas Totais</span>
                    <input 
                        type="number" 
                        min="1" 
                        max="99"
                        className="bg-purple-800 rounded p-2 w-16 text-center"
                        value={localSettings.rounds}
                        onChange={(e) => setLocalSettings({...localSettings, rounds: Number(e.target.value)})}
                    />
                </div>
                
                <div className="flex items-center justify-between">
                    <span>Modo Prendas</span>
                     <button 
                        onClick={() => setLocalSettings((s: import('../../types').GameSettings) => ({...s, prendasEnabled: !s.prendasEnabled}))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.prendasEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${localSettings.prendasEnabled ? 'left-7' : 'left-1'}`} />
                     </button>
                </div>
            </div>
        </section>

        {/* Teams Section */}
        <section className="bg-white/5 p-4 rounded-xl border border-white/10">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users size={20} /> Equipes
            </h2>
            
            <div className="flex gap-2 mb-4">
                <Input 
                    placeholder="Nome da Equipe" 
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
                />
                <Button onClick={handleAddTeam} size="sm" variant="secondary" disabled={!newTeamName.trim()}>
                    <Plus size={20} />
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                <AnimatePresence>
                    {teams.map((team: import('../../types').Team) => (
                        <motion.div 
                            key={team.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between bg-white/10 p-3 rounded-lg overflow-hidden"
                        >
                            <span className="font-semibold flex-1 min-w-0">{team.name}</span>
                            
                            <button 
                                onClick={() => handleRemoveTeam(team.id)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                <Trash2  size={20} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {teams.length === 0 && (
                    <p className="text-purple-300 text-sm text-center italic">Nenhuma equipe adicionada</p>
                )}
                
                {teams.length > 0 && (
                     <button 
                        onClick={() => useGameStore.setState({ teams: [] })}
                        className="text-white/40 text-xs hover:text-red-300 transition-colors w-full text-center mt-2 underline"
                     >
                        Limpar todas as equipes
                     </button>
                )}
            </div>
        </section>

        <section className="mt-4 flex flex-col gap-3">
            {hasActiveGame && (
                <Button 
                    className="w-full flex items-center justify-center gap-2" 
                    size="lg"
                    onClick={handleContinue}
                    variant="secondary"
                >
                    Continuar Jogo <ArrowRight />
                </Button>
            )}
            
            <Button 
                className="w-full flex items-center justify-center gap-2" 
                size="lg"
                disabled={teams.length < 2}
                onClick={handleStart}
            >
                {hasActiveGame ? 'Recomeçar Jogo' : 'Iniciar Jogo'} <ArrowRight />
            </Button>
            {teams.length < 2 && (
                <p className="text-red-300 text-xs text-center mt-2">Adicione pelo menos 2 equipes</p>
            )}
        </section>
      </div>
    </div>
  );
};
