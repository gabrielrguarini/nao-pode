import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { motion } from 'framer-motion';

export const Timer = () => {
  const { roundTimeRemaining, settings, tickTimer, status } = useGameStore();
  
  useEffect(() => {
    let interval: any;
    if (status === 'playing') {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tickTimer]);

  const progress = (roundTimeRemaining / settings.timePerRound) * 100;
  const isUrgent = roundTimeRemaining <= 10;

  return (
    <div className="w-full max-w-sm mx-auto mb-6">
        <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
                className={`absolute top-0 left-0 h-full ${isUrgent ? 'bg-red-500' : 'bg-green-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "linear" }}
            />
        </div>
        <div className={`text-center mt-2 font-mono text-3xl font-bold ${isUrgent ? 'text-red-300 animate-pulse' : 'text-white'}`}>
            {roundTimeRemaining}s
        </div>
    </div>
  );
};
