// src/components/game/phases/WordRevealPhase.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WordRevealPhaseProps {
  secretWord: string;
  category: string;
}

export default function WordRevealPhase({ secretWord, category }: WordRevealPhaseProps) {
  const [showWord, setShowWord] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWord(true);
    }, 1500);
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
          className="text-4xl font-bold text-white mb-8"
        >
          The secret word was...
        </motion.h1>
        
        {showWord && (
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-6xl font-bold text-yellow-400 mb-4"
            >
              "{secretWord}"
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-2xl text-white/80"
            >
              Imposter was given the category: {category}
            </motion.p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
