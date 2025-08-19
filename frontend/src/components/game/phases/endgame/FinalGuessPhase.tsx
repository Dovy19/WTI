// src/components/game/phases/FinalGuessPhase.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FinalGuessPhaseProps {
  playerName: string;
  category: string;
  impostorGuess?: string;
  correctGuess?: boolean;
  secretWord?: string;
  showResult?: boolean;
}

export default function FinalGuessPhase({ 
  playerName, 
  category, 
  impostorGuess,
  correctGuess,
  secretWord,
  showResult = false
}: FinalGuessPhaseProps) {
  const [showGuess, setShowGuess] = useState(false);

  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        setShowGuess(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showResult]);

  if (showResult) {
    // Show the result of the guess
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
            {playerName} guessed...
          </motion.h1>
          
          {showGuess && (
            <div>
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="text-6xl font-bold text-yellow-400 mb-6"
              >
                "{impostorGuess || 'Nothing'}"
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center"
              >
                {correctGuess ? (
                  <div className="text-green-400 text-3xl font-bold">
                    ✓ CORRECT!
                  </div>
                ) : (
                  <div>
                    <div className="text-red-400 text-3xl font-bold mb-4">
                      ✗ WRONG
                    </div>
                    <div className="text-white/80 text-xl">
                      The word was: <span className="font-bold text-yellow-400">"{secretWord}"</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Show the initial prompt
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
          className="text-4xl font-bold text-white mb-4"
        >
          {playerName} had 30 seconds...
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-2xl text-white/80"
        >
          to guess the secret word for redemption!
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-white/60 text-lg mt-4"
        >
          Imposter was given the category: {category}
        </motion.p>
      </div>
    </motion.div>
  );
}