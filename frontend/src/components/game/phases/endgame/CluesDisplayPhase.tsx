
// src/components/game/phases/CluesDisplayPhase.tsx
'use client';

import { motion } from 'framer-motion';

interface CluesDisplayPhaseProps {
  playerName: string;
  playerClues: Array<{ round: number; clue: string }>;
  secretWord: string;
}

export default function CluesDisplayPhase({ 
  playerName, 
  playerClues, 
  secretWord 
}: CluesDisplayPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full px-8"
    >
      <div className="text-center max-w-2xl">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-white mb-8"
        >
          {playerName}'s clues were:
        </motion.h1>
        
        <div className="space-y-4 mb-8">
          {playerClues.map((clue, index) => (
            <motion.div
              key={clue.round}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.5, duration: 0.6 }}
              className="bg-white/10 rounded-lg p-4 border border-white/20"
            >
              <div className="text-white/60 text-sm mb-1">Round {clue.round}</div>
              <div className="text-xl font-medium text-white">"{clue.clue}"</div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: playerClues.length * 0.5 + 0.5, duration: 0.8 }}
          className="text-white/80 text-lg"
        >
          They knew the word was <span className="font-bold text-yellow-400">"{secretWord}"</span>
        </motion.p>
      </div>
    </motion.div>
  );
}