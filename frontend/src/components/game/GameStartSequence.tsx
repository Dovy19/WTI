'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Import phase components
import GameStartingPhase from './phases/gamestart/GameStartingPhase';
import RoleAssignmentPhase from './phases/gamestart/RoleAssignmentPhase';
import WordRevealPhase from './phases/gamestart/WordRevealPhase';
import InstructionPhase from './phases/gamestart/InstructionPhase';

type GameStartPhase = 
  | 'game-starting'
  | 'role-assignment'
  | 'word-reveal'
  | 'instructions'
  | 'complete';

interface GameStartSequenceProps {
  playerRole: {
    isImpostor: boolean;
    word?: string;
    category?: string;
  };
  onComplete: () => void;
}

export default function GameStartSequence({ 
  playerRole, 
  onComplete 
}: GameStartSequenceProps) {
  const [currentPhase, setCurrentPhase] = useState<GameStartPhase>('game-starting');

  // Phase sequences with timing
  const phaseSequence = [
    { phase: 'game-starting' as GameStartPhase, duration: 3000 },    // 3s
    { phase: 'role-assignment' as GameStartPhase, duration: 4500 },  // 4.5s
    { phase: 'word-reveal' as GameStartPhase, duration: 4500 },      // 4.5s
    { phase: 'instructions' as GameStartPhase, duration: 4500 },     // 4.5s
    { phase: 'complete' as GameStartPhase, duration: 0 }
  ];

  // Auto-advance through phases
  useEffect(() => {
    if (currentPhase === 'complete') {
      onComplete();
      return;
    }

    const currentPhaseData = phaseSequence.find(p => p.phase === currentPhase);
    if (!currentPhaseData) return;

    const timer = setTimeout(() => {
      const currentIndex = phaseSequence.findIndex(p => p.phase === currentPhase);
      const nextPhase = phaseSequence[currentIndex + 1];
      
      if (nextPhase) {
        setCurrentPhase(nextPhase.phase);
      } else {
        setCurrentPhase('complete');
      }
    }, currentPhaseData.duration);

    return () => clearTimeout(timer);
  }, [currentPhase]);

  return (
    <div className="py-6">
      <AnimatePresence mode="wait">
        {currentPhase === 'game-starting' && (
          <GameStartingPhase key="game-starting" />
        )}

        {currentPhase === 'role-assignment' && (
          <RoleAssignmentPhase 
            key="role-assignment" 
            playerRole={playerRole}
          />
        )}

        {currentPhase === 'word-reveal' && (
          <WordRevealPhase 
            key="word-reveal"
            playerRole={playerRole}
          />
        )}

        {currentPhase === 'instructions' && (
          <InstructionPhase 
            key="instructions"
            playerRole={playerRole}
          />
        )}
      </AnimatePresence>
    </div>
  );
}