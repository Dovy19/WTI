// src/components/game/phases/PlayerVotedOutPhase.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface playerNameProps {
  playerName: string;
}

export default function PlayerVotedOutPhase({playerName}: playerNameProps) {

  const [showPlayerName, setShowPlayerName] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPlayerName(true);
    }, 2000); // Show after 2 seconds
    return () => clearTimeout(timer);
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      <div className="text-center">
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl font-bold text-white mb-8"
        >
          Players voted out...
        </motion.h1>

        {showPlayerName && (
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            className="text-7xl font-bold text-red-500"
          >
            {playerName}
          </motion.h1>
        )}
      </div>
    </motion.div>
  );
}