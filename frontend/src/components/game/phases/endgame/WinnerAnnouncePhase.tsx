// src/components/game/phases/WinnerAnnouncePhase.tsx
'use client';

import { motion } from 'framer-motion';
import { Trophy, Target, Users } from 'lucide-react';

interface WinnerAnnouncePhaseProps {
  winners: 'impostor' | 'detectives' | 'tie';
}

export default function WinnerAnnouncePhase({ winners }: WinnerAnnouncePhaseProps) {
  const getWinnerData = () => {
    switch (winners) {
      case 'impostor':
        return {
          title: 'Impostor Wins!',
          icon: Target,
          color: 'text-red-400',
          bgColor: 'from-red-500/20 to-pink-500/20'
        };
      case 'detectives':
        return {
          title: 'Detectives Win!',
          icon: Users,
          color: 'text-blue-400',
          bgColor: 'from-blue-500/20 to-cyan-500/20'
        };
      case 'tie':
        return {
          title: "It's a Tie!",
          icon: Trophy,
          color: 'text-yellow-400',
          bgColor: 'from-yellow-500/20 to-orange-500/20'
        };
    }
  };

  const { title, icon: Icon, color, bgColor } = getWinnerData();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, type: "spring", bounce: 0.3 }}
        className={`text-center p-12 rounded-2xl bg-gradient-to-br ${bgColor} border border-white/20`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          className="mb-6"
        >
          <Icon className={`w-20 h-20 ${color} mx-auto`} />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className={`text-6xl font-bold ${color}`}
        >
          {title}
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}