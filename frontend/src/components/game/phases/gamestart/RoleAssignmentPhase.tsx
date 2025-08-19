'use client';

import { motion } from 'framer-motion';
import RoleReveal from '../shared/RoleReveal';

interface RoleAssignmentPhaseProps {
  playerRole: {
    isImpostor: boolean;
  };
}

export default function RoleAssignmentPhase({ playerRole }: RoleAssignmentPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full"
    >
      <RoleReveal 
        role={playerRole.isImpostor ? 'IMPOSTOR' : 'DETECTIVE'}
        delay={0.5}
        context="game-start"
      />
    </motion.div>
  );
}