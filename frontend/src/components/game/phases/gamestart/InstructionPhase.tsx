'use client';

import { motion } from 'framer-motion';
import FadeInText from '../shared/FadeInText';

interface InstructionPhaseProps {
  playerRole: {
    isImpostor: boolean;
  };
}

export default function InstructionPhase({ playerRole }: InstructionPhaseProps) {
  const getInstructions = () => {
    if (playerRole.isImpostor) {
      return {
        main: "Blend in and guess the word",
        sub: "Give clues that seem helpful but don't reveal you don't know the word"
      };
    } else {
      return {
        main: "Help catch the impostor",
        sub: "Give clues that prove you know the word, but don't be too obvious"
      };
    }
  };

  const instructions = getInstructions();
  const textColor = playerRole.isImpostor ? 'text-red-300' : 'text-blue-300';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      <div className="text-center max-w-2xl px-8">
        <FadeInText 
          text={instructions.main}
          delay={0.2}
          size="large"
          className={textColor}
        />
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-white/80 text-xl mt-6 leading-relaxed"
        >
          {instructions.sub}
        </motion.p>

        {/* Ready indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="mt-8"
        >
          <div className="inline-flex items-center px-6 py-3 bg-white/10 rounded-lg border border-white/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
            />
            <span className="text-white/80">Get ready...</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}