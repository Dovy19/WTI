// src/components/game/TransitionSequence.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Player, GameResults } from '../../../../shared/types';

// Import phase components
import VotesInPhase from './phases/endgame/VotesInPhase';
import PlayerVotedOutPhase from './phases/endgame/PlayerVotedOutPhase';
import PlayerRevealPhase from './phases/endgame/PlayerRevealPhase';
import WordRevealPhase from './phases/endgame/WordRevealPhase';
import CluesDisplayPhase from './phases/endgame/CluesDisplayPhase';
import FinalGuessPhase from './phases/endgame/FinalGuessPhase';
import WinnerAnnouncePhase from './phases/endgame/WinnerAnnouncePhase';
import PointsRevealPhase from './phases/endgame/PointsRevealPhase';

type TransitionPhase = 
  | 'votes-in'
  | 'player-voted-out' 
  | 'player-reveal'
  | 'word-reveal'
  | 'clues-show' // Only if detective eliminated
  | 'final-guess-prompt' // Only if impostor eliminated
  | 'final-guess-reveal' // Only if impostor eliminated
  | 'winner-announce'
  | 'points-reveal'
  | 'complete'; // Return to normal ResultsScreen

interface TransitionSequenceProps {
  gameResults: GameResults;
  eliminatedPlayer: Player;
  currentRoom: any; // Use your GameRoom type
  onComplete: () => void;
}

export default function TransitionSequence({ 
  gameResults, 
  eliminatedPlayer, 
  currentRoom,
  onComplete 
}: TransitionSequenceProps) {
  const [currentPhase, setCurrentPhase] = useState<TransitionPhase>('votes-in');

  // Determine the sequence based on whether impostor was caught
  const isImpostorEliminated = eliminatedPlayer.isImpostor;
  
  // Phase sequences with timing - INCREASED DURATIONS
  const getPhaseSequence = () => {
    const baseSequence = [
      { phase: 'votes-in' as TransitionPhase, duration: 3000 }, // 3s instead of 2s
      { phase: 'player-voted-out' as TransitionPhase, duration: 5000 }, // 3s instead of 2s
      { phase: 'player-reveal' as TransitionPhase, duration: 6000 }, // 6s instead of 4s (includes 2s "was..." delay)
      { phase: 'word-reveal' as TransitionPhase, duration: 5000 }, // 5s instead of 3s (includes word delay)
    ];

    if (isImpostorEliminated) {
      // Impostor caught - show final guess attempt
      baseSequence.push(
        { phase: 'final-guess-prompt' as TransitionPhase, duration: 4000 }, // 4s instead of 2s
        { phase: 'final-guess-reveal' as TransitionPhase, duration: 5000 } // 5s instead of 3s
      );
    } else {
      // Detective eliminated - show their clues
      baseSequence.push(
        { phase: 'clues-show' as TransitionPhase, duration: 6000 } // 6s instead of 4s
      );
    }

    // Common ending
    baseSequence.push(
      { phase: 'winner-announce' as TransitionPhase, duration: 4000 }, // 4s instead of 2.5s
      { phase: 'points-reveal' as TransitionPhase, duration: 5000 }, // 5s instead of 3s
      { phase: 'complete' as TransitionPhase, duration: 0 }
    );

    return baseSequence;
  };

  const phaseSequence = getPhaseSequence();

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
        // No next phase, complete the sequence
        setCurrentPhase('complete');
      }
    }, currentPhaseData.duration);

    return () => clearTimeout(timer);
  }, [currentPhase]); // REMOVED onComplete from dependencies to prevent re-runs

  // Get player clues for clues display phase
  const getPlayerClues = () => {
    return currentRoom.clues?.filter((clue: any) => 
      clue.playerId === eliminatedPlayer.id
    ) || [];
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {currentPhase === 'votes-in' && (
          <VotesInPhase key="votes-in" />
        )}

        {currentPhase === 'player-voted-out' && (
          <PlayerVotedOutPhase 
            playerName={eliminatedPlayer.name}
            key="player-voted-out" />
        )}

        {currentPhase === 'player-reveal' && (
          <PlayerRevealPhase 
            key="player-reveal" 
            playerName={eliminatedPlayer.name}
            isImpostor={eliminatedPlayer.isImpostor}
          />
        )}

        {currentPhase === 'word-reveal' && (
          <WordRevealPhase 
            key="word-reveal"
            secretWord={gameResults.secretWord}
            category={gameResults.category}
          />
        )}

        {currentPhase === 'clues-show' && (
          <CluesDisplayPhase 
            key="clues-show"
            playerName={eliminatedPlayer.name}
            playerClues={getPlayerClues()}
            secretWord={gameResults.secretWord}
          />
        )}

        {currentPhase === 'final-guess-prompt' && (
          <FinalGuessPhase 
            key="final-guess-prompt"
            playerName={eliminatedPlayer.name}
            category={gameResults.category}
          />
        )}

        {currentPhase === 'final-guess-reveal' && (
          <FinalGuessPhase 
            key="final-guess-reveal"
            playerName={eliminatedPlayer.name}
            category={gameResults.category}
            impostorGuess={gameResults.impostorGuess}
            correctGuess={gameResults.correctGuess}
            secretWord={gameResults.secretWord}
            showResult={true}
          />
        )}

        {currentPhase === 'winner-announce' && (
          <WinnerAnnouncePhase 
            key="winner-announce"
            winners={gameResults.winners}
          />
        )}

        {currentPhase === 'points-reveal' && (
          <PointsRevealPhase 
            key="points-reveal"
            points={gameResults.points}
            winners={gameResults.winners}
          />
        )}
      </AnimatePresence>
    </div>
  );
}