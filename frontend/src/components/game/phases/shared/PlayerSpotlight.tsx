'use client';

import { motion } from 'framer-motion';

interface PlayerSpotlightProps {
  playerName: string;
  delay?: number;
  showRole?: boolean;
  isImpostor?: boolean;
  size?: 'medium' | 'large';
}

export default function PlayerSpotlight({ 
  playerName, 
  delay = 0,
  showRole = false,
  isImpostor = false,
  size = 'large'
}: PlayerSpotlightProps) {
  const sizeClasses = {
    medium: { text: 'text-4xl', avatar: 'w-12 h-12' },
    large: { text: 'text-6xl', avatar: 'w-16 h-16' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 1, type: "spring", bounce: 0.4 }}
      className="text-center"
    >
      <div className="flex items-center justify-center mb-4">
        <div className={`bg-gradient-to-r ${isImpostor ? 'from-red-400 to-pink-400' : 'from-purple-400 to-pink-400'} rounded-full flex items-center justify-center text-white font-semibold mr-4 ${sizeClasses[size].avatar}`}>
          {playerName.charAt(0).toUpperCase()}
        </div>
        <span className={`font-bold text-white ${sizeClasses[size].text}`}>
          {playerName}
        </span>
      </div>
      {showRole && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5, duration: 0.5 }}
          className={`text-lg ${isImpostor ? 'text-red-400' : 'text-blue-400'}`}
        >
          {isImpostor ? '(Impostor)' : '(Detective)'}
        </motion.div>
      )}
    </motion.div>
  );
}