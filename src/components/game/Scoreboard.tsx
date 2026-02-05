import { useGameStore } from '../../store/useGameStore';
import { motion } from 'framer-motion';

export const Scoreboard = () => {
    const { teams, currentTeamIndex } = useGameStore();

    if (teams.length < 2) return null;

    return (
        <div className="flex items-center justify-center gap-4 bg-black/20 backdrop-blur-sm p-2 rounded-full border border-white/10">
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
                        className={`
                            flex items-center px-4 py-2 rounded-full border-2 transition-all
                            ${isCurrent ? 'bg-white/10 shadow-lg' : 'bg-transparent'}
                        `}
                    >
                         {/* Circle Color Indicator */}
                        <div 
                            className="w-3 h-3 rounded-full mr-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                            style={{ backgroundColor: team.color || '#ccc' }}
                        />
                        
                        <div className="flex flex-col">
                            <span className={`text-[10px] uppercase font-bold tracking-wider leading-none ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                                {team.name}
                            </span>
                            <span className={`text-2xl font-black leading-none ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                                {team.score}
                            </span>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    );
};
