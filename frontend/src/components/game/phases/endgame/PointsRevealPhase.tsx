// src/components/game/phases/PointsRevealPhase.tsx
'use client';

import { motion } from 'framer-motion';

interface PointsRevealPhaseProps {
  points: {
    impostorPoints: number;
    detectivePoints: number;
  };
  winners: 'impostor' | 'detectives' | 'tie';
}

export default function PointsRevealPhase({ points, winners }: PointsRevealPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      <div className="text-center">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-white mb-12"
        >
          Points Awarded
        </motion.h1>
        
        <div className="grid grid-cols-2 gap-12 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.8, type: "spring" }}
              className="text-5xl font-bold text-red-300 mb-2"
            >
              +{points.impostorPoints}
            </motion.div>
            <div className="text-white/80">Impostor Points</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
              className="text-5xl font-bold text-blue-300 mb-2"
            >
              +{points.detectivePoints}
            </motion.div>
            <div className="text-white/80">Detective Points</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}