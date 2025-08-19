'use client';

import { motion } from 'framer-motion';
import WordReveal from '../shared/WordReveal';

interface WordRevealPhaseProps {
  playerRole: {
    isImpostor: boolean;
    word?: string;
    category?: string;
  };
}

export default function WordRevealPhase({ playerRole }: WordRevealPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      {playerRole.isImpostor ? (
        <WordReveal 
          type="category"
          value={playerRole.category || 'Unknown'}
          prefix="You must guess a word from..."
          delay={0.3}
          context="game-start"
        />
      ) : (
        <WordReveal 
          type="word"
          value={playerRole.word || 'Unknown'}
          prefix="The secret word is..."
          delay={0.3}
          context="game-start"
        />
      )}
    </motion.div>
  );
}
