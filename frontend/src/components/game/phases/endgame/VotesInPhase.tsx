// src/components/game/phases/VotesInPhase.tsx
'use client';

import { motion } from 'framer-motion';

export default function VotesInPhase() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      <motion.h1 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-5xl font-bold text-white text-center"
      >
        Votes are in...
      </motion.h1>
    </motion.div>
  );
}