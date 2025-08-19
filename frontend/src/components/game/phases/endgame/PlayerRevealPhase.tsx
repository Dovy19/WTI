// src/components/game/phases/PlayerRevealPhase.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PlayerRevealPhaseProps {
  playerName: string;
  isImpostor: boolean;
}

export default function PlayerRevealPhase({ playerName, isImpostor }: PlayerRevealPhaseProps) {
  const [showRole, setShowRole] = useState(false);

  // Show role after 2 seconds (the "..." delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRole(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
          className="text-5xl font-bold text-white mb-8"
        >
          {playerName} was...
        </motion.h1>
        
        {showRole && (
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            className={`text-7xl font-bold ${
              isImpostor ? 'text-red-500' : 'text-blue-400'
            }`}
          >
            {isImpostor ? 'THE IMPOSTOR!' : 'A DETECTIVE!'}
          </motion.h1>
        )}
      </div>
    </motion.div>
  );
}