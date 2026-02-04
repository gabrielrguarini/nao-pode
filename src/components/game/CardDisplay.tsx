import type { Card } from '../../types';
import { motion } from 'framer-motion';
import { Ban } from 'lucide-react';

interface CardDisplayProps {
    card: Card;
}

export const CardDisplay = ({ card }: CardDisplayProps) => {
  return (
    <motion.div 
        key={card.id}
        initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.8, opacity: 0, x: -100 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-800 flex flex-col items-center p-6 border-4 border-white"
    >
        <div className="bg-purple-100 w-full py-4 rounded-lg flex items-center justify-center mb-6 shadow-inner">
            <h2 className="text-3xl font-black text-purple-900 tracking-wider uppercase">{card.word}</h2>
        </div>

        <div className="w-full flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-500 font-bold uppercase text-sm mb-1 px-2 border-b-2 border-red-100 pb-2">
                <Ban size={16} /> Palavras Proibidas
            </div>
            {card.forbiddenWords.map((word, idx) => (
                <div key={idx} className="bg-red-50 rounded px-4 py-2 font-semibold text-gray-600 border-l-4 border-red-400">
                    {word}
                </div>
            ))}
        </div>
    </motion.div>
  );
};
