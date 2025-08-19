'use client';

import { motion } from 'framer-motion';
import FadeInText from '../shared/FadeInText';

export default function GameStartingPhase() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      <div className="text-center">
        <FadeInText 
          text="Game starting..." 
          delay={0.2}
          size="xl"
        />
        
        {/* Optional: Add some sparkle effects */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-8 text-6xl"
        >
          🎮
        </motion.div>
      </div>
    </motion.div>
  );
}