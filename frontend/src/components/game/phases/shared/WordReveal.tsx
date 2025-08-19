'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WordRevealProps {
  type: 'word' | 'category';
  value: string;
  prefix?: string;
  delay?: number;
  context?: 'game-start' | 'game-end';
}

export default function WordReveal({ 
  type, 
  value, 
  prefix,
  delay = 0,
  context = 'game-start'
}: WordRevealProps) {
  const [showValue, setShowValue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowValue(true);
    }, (delay + 1.5) * 1000); // 1.5s after the prefix appears
    return () => clearTimeout(timer);
  }, [delay]);

  // Default prefixes based on type and context
  const getPrefix = () => {
    if (prefix) return prefix;
    
    if (context === 'game-end') {
      return type === 'word' ? 'The secret word was...' : 'The category was...';
    }
    
    // Game start context
    return type === 'word' ? 'The secret word is...' : 'You must guess a word from...';
  };

  const getValueColor = () => {
    return type === 'word' ? 'text-yellow-400' : 'text-orange-400';
  };

  return (
    <div className="text-center">
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, duration: 0.8 }}
        className="text-4xl font-bold text-white mb-8"
      >
        {getPrefix()}
      </motion.h1>
      
      {showValue && (
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className={`text-6xl font-bold mb-4 ${getValueColor()}`}
        >
          "{value}"
        </motion.h1>
      )}
    </div>
  );
}