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
        <p className="text-white/60">
          {currentRoom?.gamePhase === 'writing' && `Give a clue about ${isImpostor ? 'the category' : 'the word'}`}
          {currentRoom?.gamePhase === 'decision' && 'Review clues and decide what to do next'}
        </p>
      </div>

      {/* WRITING PHASE */}
      {currentRoom?.gamePhase === 'writing' && (
        <>
          {!hasSubmittedClue ? (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Your Clue:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={clueInput}
                  onChange={(e) => setClueInput(e.target.value)}
                  placeholder="Enter your clue..."
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  maxLength={50}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitClue()}
                />
                <button
                  onClick={handleSubmitClue}
                  disabled={!clueInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-white/40 text-xs mt-1">
                Be descriptive but not too obvious!
              </p>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <div className="text-green-300 font-medium">
                  ✓ Clue submitted! Waiting for other players...
                </div>
              </div>
              
              {/* Show submission progress */}
              <div className="mt-3 text-center">
                <p className="text-white/60 text-sm">
                  {submittedCount} of {totalPlayers} players submitted
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* DECISION PHASE */}
      {currentRoom?.gamePhase === 'decision' && (
        <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            What should we do next?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Next Round Button */}
            <button
              onClick={voteNextRound}
              disabled={playerVotedToVote}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                playerVotedNextRound
                  ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                  : 'border-white/20 bg-white/5 hover:border-blue-400 hover:bg-blue-500/10 text-white'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-center mb-2">
                <ArrowRight className="w-6 h-6 mr-2" />
                <span className="font-semibold">Next Round</span>
              </div>
              <p className="text-sm opacity-80">
                Continue with Round {currentRound + 1}
              </p>
              {playerVotedNextRound && (
                <div className="mt-2 text-blue-300 text-sm">✓ You voted for this</div>
              )}
            </button>

            {/* Ready to Vote Button */}
            <button
              onClick={voteReadyToVote}
              disabled={playerVotedNextRound}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                playerVotedToVote
                  ? 'border-red-400 bg-red-500/20 text-red-300'
                  : 'border-white/20 bg-white/5 hover:border-red-400 hover:bg-red-500/10 text-white'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-center mb-2">
                <Vote className="w-6 h-6 mr-2" />
                <span className="font-semibold">Vote Now</span>
              </div>
              <p className="text-sm opacity-80">
                Skip to voting phase
              </p>
              {playerVotedToVote && (
                <div className="mt-2 text-red-300 text-sm">✓ You voted for this</div>
              )}
            </button>
          </div>

          {/* Voting Progress */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm">Decision Progress:</span>
              <span className="text-white text-sm font-medium">
                {totalVotes} / {totalPlayers}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-blue-300 font-semibold">
                  {nextRoundVotes}
                </div>
                <div className="text-white/60 text-xs">Next Round</div>
              </div>
              <div>
                <div className="text-red-300 font-semibold">
                  {readyToVoteVotes}
                </div>
                <div className="text-white/60 text-xs">Vote Now</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clue Table - Show for all phases where clues exist */}
      {currentRoom && clues.length > 0 && (
        <ClueTable
          players={currentRoom.players}
          clues={clues}
          currentRound={currentRound}
          maxRounds={maxRounds}
          currentRoundClues={currentRoom.currentRoundClues}
        />
      )}

      {/* Legacy host controls notice */}
      {currentRoom?.gamePhase === 'writing' && hasSubmittedClue && isHost && (
        <div className="text-center mt-4">
          <p className="text-white/40 text-sm">
            Host controls disabled during timed phases
          </p>
        </div>
      )}
    </div>
  );
}