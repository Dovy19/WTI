'use client';

import { motion } from 'framer-motion';
import FadeInText from '../shared/FadeInText';

interface CluesSubmittedPhaseProps {
  currentRound: number;
}

export default function CluesSubmittedPhase({ currentRound }: CluesSubmittedPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      <div className="text-center">
        <FadeInText 
          text="All players submitted their clues..." 
          delay={0.2}
          size="large"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-6"
        >
          <div className="inline-flex items-center px-6 py-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <span className="text-blue-300 font-medium text-lg">
              Round {currentRound} Complete
            </span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="text-white/60 text-lg mt-4"
        >
          Reviewing clues...
        </motion.p>
      </div>
    </motion.div>
  );
}