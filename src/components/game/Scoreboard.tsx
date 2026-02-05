import { useGameStore } from '../../store/useGameStore';
import { motion } from 'framer-motion';

export const Scoreboard = () => {
    const { teams, currentTeamIndex } = useGameStore();

    if (teams.length < 2) return null;

    return (
        <div className="flex-1 flex justify-center px-2">
    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm p-1 sm:p-2 rounded-full border border-white/10  justify-center max-w-full">
      {teams.map((team, index) => {
        const isCurrent = index === currentTeamIndex;
        return (
          <motion.div
            key={team.id}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{
              scale: isCurrent ? 1.05 : 0.95,
              opacity: isCurrent ? 1 : 0.6,
              borderColor: isCurrent ? team.color || '#FBBF24' : 'transparent'
            }}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full border-2 transition-all flex-shrink-0 ${isCurrent ? 'bg-white/10 shadow-lg' : 'bg-transparent'}`}
          >
            {/* Circle Indicator */}
            <div
              className="w-2 sm:w-3 h-2 sm:h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] flex-shrink-0"
              style={{ backgroundColor: team.color || '#ccc' }}
            />

            {/* Name + Score */}
            <div className="flex flex-col items-start min-w-0">
              <span className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-wider leading-none truncate ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                {team.name}
              </span>
              <span className={`text-xl sm:text-2xl font-black leading-none truncate ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                {team.score}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
    );
};
