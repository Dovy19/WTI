// src/components/game/ClueSubmission.tsx
'use client';

import { useState, useEffect } from 'react';
import { Send, Vote, ArrowRight, Users } from 'lucide-react';
import ClueTable from './ClueTable';
import TimerDisplay from '../ui/TimerDisplay';
import GeneralTransitions from './GeneralTransitions';
import { useSocket } from '@/contexts/SocketContext';

interface Clue {
  playerId: string;
  playerName: string;
  clue: string;
  round: number;
}

interface ClueSubmissionProps {
  currentRound: number;
  maxRounds: number;
  isImpostor: boolean;
  hasSubmittedClue: boolean;
  clues: Clue[];
  isHost: boolean;
  totalPlayers: number;
  onSubmitClue: (clue: string) => void;
}

type GeneralTransitionType = 'clues-submitted' | 'next-round' | 'ready-to-vote' | null;

export default function ClueSubmission({
  currentRound,
  maxRounds,
  isImpostor,
  hasSubmittedClue,
  clues,
  isHost,
  totalPlayers,
  onSubmitClue
}: ClueSubmissionProps) {
  const [clueInput, setClueInput] = useState('');
  const [showTransition, setShowTransition] = useState<GeneralTransitionType>(null);
  const [transitionTriggered, setTransitionTriggered] = useState<string | null>(null);
  const [previousRound, setPreviousRound] = useState(currentRound);
  const [previousPhase, setPreviousPhase] = useState<string>('');
  
  const { currentRoom, currentTimer, voteNextRound, voteReadyToVote, socket } = useSocket();

  const handleSubmitClue = () => {
    if (clueInput.trim() && !hasSubmittedClue) {
      onSubmitClue(clueInput.trim());
      setClueInput('');
    }
  };

  // Get current player's vote status
  const currentPlayerId = socket?.id;
  const playerVotedNextRound = currentRoom?.nextRoundVotes?.includes(currentPlayerId || '') || false;
  const playerVotedToVote = currentRoom?.readyToVoteVotes?.includes(currentPlayerId || '') || false;

  // Calculate submission progress
  const submittedCount = Object.keys(currentRoom?.currentRoundClues || {}).length;
  const allCluesSubmitted = submittedCount >= totalPlayers;

  // Calculate voting totals
  const nextRoundVotes = currentRoom?.nextRoundVotes?.length || 0;
  const readyToVoteVotes = currentRoom?.readyToVoteVotes?.length || 0;
  const totalVotes = nextRoundVotes + readyToVoteVotes;
  const majorityThreshold = Math.ceil(totalPlayers / 2);

  // Track phase and round changes
  useEffect(() => {
    if (currentRoom?.gamePhase && currentRoom.gamePhase !== previousPhase) {
      setPreviousPhase(currentRoom.gamePhase);
    }
    if (currentRoom?.currentRound && currentRoom.currentRound !== previousRound) {
      setPreviousRound(currentRoom.currentRound);
    }
  }, [currentRoom?.gamePhase, currentRoom?.currentRound, previousPhase, previousRound]);

  // Trigger "All clues submitted" transition
  useEffect(() => {
    const transitionKey = `clues-${currentRound}`;
    
    if (currentRoom?.gamePhase === 'decision' && 
        previousPhase === 'writing' &&
        transitionTriggered !== transitionKey) {
      setShowTransition('clues-submitted');
      setTransitionTriggered(transitionKey);
    }
  }, [currentRoom?.gamePhase, previousPhase, currentRound, transitionTriggered]);

  // Trigger "Next Round" transition
  useEffect(() => {
    const transitionKey = `next-${previousRound}`;
    
    if (currentRoom?.gamePhase === 'writing' && 
        previousPhase === 'decision' &&
        currentRoom?.currentRound > previousRound && 
        transitionTriggered !== transitionKey) {
      setShowTransition('next-round');
      setTransitionTriggered(transitionKey);
    }
  }, [currentRoom?.gamePhase, currentRoom?.currentRound, previousPhase, previousRound, transitionTriggered]);

  // Reset transition state when game state changes
  useEffect(() => {
    setTransitionTriggered(null);
    setShowTransition(null);
  }, [currentRoom?.gameState]);

  // Handle transition completion
  const handleTransitionComplete = () => {
    setShowTransition(null);
  };

  // Show transition overlay if active
  if (showTransition) {
    return (
      <GeneralTransitions
        transitionType={showTransition}
        currentRound={currentRoom?.currentRound || currentRound}
        nextRound={currentRoom?.currentRound || currentRound}
        maxRounds={maxRounds}
        onComplete={handleTransitionComplete}
      />
    );
  }

  return (
    <div className="py-6">
      {/* Timer Display */}
      {currentTimer && (
        <TimerDisplay
          timeLeft={currentTimer.timeLeft}
          phase={currentTimer.phase}
          className="mb-6"
        />
      )}

      {/* Round Info */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Round {currentRound} of {maxRounds}
        </h2>
        <p className="text-[#9ca3af]">
          {currentRoom?.gamePhase === 'writing' && `Give a clue about ${isImpostor ? 'the category' : 'the word'}`}
          {currentRoom?.gamePhase === 'decision' && 'Review clues and decide what to do next'}
        </p>
      </div>

      {/* WRITING PHASE - Single Column Layout */}
      {currentRoom?.gamePhase === 'writing' && (
        <>
          {!hasSubmittedClue ? (
            <div className="bg-[#9333ea]/10 border-2 border-[#9333ea]/50 rounded-lg p-6 mb-6 shadow-lg backdrop-blur-sm">
              <label className="block text-white text-lg font-bold mb-3 text-center">
                Enter Your Clue Below:
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={clueInput}
                  onChange={(e) => setClueInput(e.target.value)}
                  placeholder="Type your clue here..."
                  className="flex-1 px-6 py-4 bg-[#1a1a2e]/60 border-2 border-[#9333ea]/50 rounded-lg text-white text-lg placeholder-[#9ca3af] focus:outline-none focus:ring-4 focus:ring-[#9333ea]/50 focus:border-[#c084fc] transition-all duration-200 backdrop-blur-sm"
                  maxLength={50}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitClue()}
                />
                <button
                  onClick={handleSubmitClue}
                  disabled={!clueInput.trim()}
                  className="px-8 py-4 bg-[#9333ea] hover:bg-[#a855f7] text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Submit
                </button>
              </div>
              <p className="text-[#c084fc] text-sm mt-3 text-center font-medium">
                Be descriptive but not too obvious! Help your team identify you.
              </p>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <div className="text-green-300 font-medium">
                  Clue submitted! Waiting for other players...
                </div>
              </div>
              
              {/* Show submission progress */}
              <div className="mt-3 text-center">
                <p className="text-[#9ca3af] text-sm">
                  {submittedCount} of {totalPlayers} players submitted
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* DECISION PHASE - Full Width Layout (Remove voting buttons) */}
      {currentRoom?.gamePhase === 'decision' && (
        <div>
          {/* Clue Table - Full Width */}
          {currentRoom && clues.length > 0 && (
            <div>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-[#c084fc] mb-2">
                  Review Everyone's Clues
                </h3>
                <p className="text-[#9ca3af] text-sm">
                  Study the clues carefully - who might be the impostor?
                </p>
              </div>
              <div className="border-2 border-[#c084fc]/50 rounded-lg p-4 bg-[#c084fc]/10 backdrop-blur-sm">
                <ClueTable
                  players={currentRoom.players}
                  clues={clues}
                  currentRound={currentRound}
                  maxRounds={maxRounds}
                  currentRoundClues={currentRoom.currentRoundClues}
                />
              </div>
              
              {/* Instruction to use right panel */}
              <div className="mt-6 text-center">
                <p className="text-[#9ca3af] text-sm">
                  Use the Actions panel on the right to vote for the next action
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legacy host controls notice */}
      {currentRoom?.gamePhase === 'writing' && hasSubmittedClue && isHost && (
        <div className="text-center mt-4">
          <p className="text-[#9ca3af] text-sm">
            Host controls disabled during timed phases
          </p>
        </div>
      )}
    </div>
  );
}