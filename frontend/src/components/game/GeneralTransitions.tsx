'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Import phase components
import CluesSubmittedPhase from './phases/general/CluesSubmittedPhase';
import NextRoundPhase from './phases/general/NextRoundPhase';
import ReadyToVotePhase from './phases/general/ReadyToVotePhase';

type TransitionType = 
  | 'clues-submitted'
  | 'next-round'
  | 'ready-to-vote';

interface GeneralTransitionsProps {
  transitionType: TransitionType;
  currentRound?: number;
  nextRound?: number;
  maxRounds?: number;
  onComplete: () => void;
}

export default function GeneralTransitions({ 
  transitionType,
  currentRound = 1,
  nextRound = 2,
  maxRounds = 5,
  onComplete 
}: GeneralTransitionsProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-complete after transition duration
  useEffect(() => {
    const duration = getDuration();
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Small delay before calling onComplete to let exit animation finish
      setTimeout(() => {
        onComplete();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [transitionType]);

  const getDuration = () => {
    switch (transitionType) {
      case 'clues-submitted': return 3000;  // 3s
      case 'next-round': return 3000;       // 3s
      case 'ready-to-vote': return 3000;    // 3s
      default: return 3000;
    }
  };

  const renderTransition = () => {
    switch (transitionType) {
      case 'clues-submitted':
        return (
          <CluesSubmittedPhase 
            key="clues-submitted"
            currentRound={currentRound}
          />
        );
      
      case 'next-round':
        return (
          <NextRoundPhase 
            key="next-round"
            nextRound={nextRound}
            maxRounds={maxRounds}
          />
        );
      
      case 'ready-to-vote':
        return (
          <ReadyToVotePhase key="ready-to-vote" />
        );
      
      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/100 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {renderTransition()}
      </AnimatePresence>
    </div>
  );
}