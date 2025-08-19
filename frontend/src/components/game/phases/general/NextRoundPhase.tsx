'use client';

import { motion } from 'framer-motion';
import FadeInText from '../shared/FadeInText';

interface NextRoundPhaseProps {
  nextRound: number;
  maxRounds: number;
}

export default function NextRoundPhase({ nextRound, maxRounds }: NextRoundPhaseProps) {
  const isLastRound = nextRound === maxRounds;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      <div className="text-center">
        <FadeInText 
          text={isLastRound ? "Final Round!" : `Preparing Round ${nextRound}...`}
          delay={0.2}
          size="large"
          className={isLastRound ? "text-yellow-400" : ""}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1, type: "spring" }}
          className="mt-8"
        >
          <div className={`inline-flex items-center px-8 py-4 rounded-lg border ${
            isLastRound 
              ? 'bg-yellow-500/20 border-yellow-500/30' 
              : 'bg-green-500/20 border-green-500/30'
          }`}>
            <span className={`font-bold text-2xl ${
              isLastRound ? 'text-yellow-300' : 'text-green-300'
            }`}>
              Round {nextRound} of {maxRounds}
            </span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="text-white/80 text-lg mt-6"
        >
          {isLastRound 
            ? "Last chance to catch the impostor!" 
            : "Submit your next clue!"
          }
        </motion.p>

        {isLastRound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="mt-4 text-4xl"
          >
            ⏰
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}