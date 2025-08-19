'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RoleRevealProps {
  role: 'DETECTIVE' | 'IMPOSTOR';
  delay?: number;
  context?: 'game-start' | 'game-end';
  playerName?: string; // For end game: "John was..."
}

export default function RoleReveal({ 
  role, 
  delay = 0,
  context = 'game-start',
  playerName 
}: RoleRevealProps) {
  const [showRole, setShowRole] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRole(true);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  const isImpostor = role === 'IMPOSTOR';
  const roleColor = isImpostor ? 'text-red-500' : 'text-blue-400';
  const roleText = isImpostor ? 'THE IMPOSTOR!' : 'DETECTIVE!';

  // Different layouts for different contexts
  if (context === 'game-end' && playerName) {
    return (
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
            className={`text-7xl font-bold ${roleColor}`}
          >
            {roleText}
          </motion.h1>
        )}
      </div>
    );
  }

  // Game start context
  return (
    <div className="text-center">
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold text-white mb-8"
      >
        Your role is...
      </motion.h1>
      
      {showRole && (
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className={`text-7xl font-bold ${roleColor}`}
        >
          {roleText}
        </motion.h1>
      )}
    </div>
  );
}