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

      {/* WRITING PHASE - Single Column Layout */}
      {currentRoom?.gamePhase === 'writing' && (
        <>
          {!hasSubmittedClue ? (
            <div className="bg-blue-500/10 border-2 border-blue-400/50 rounded-lg p-6 mb-6 shadow-lg">
              <label className="block text-white text-lg font-bold mb-3 text-center">
                ✏️ Enter Your Clue Below:
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={clueInput}
                  onChange={(e) => setClueInput(e.target.value)}
                  placeholder="Type your clue here..."
                  className="flex-1 px-6 py-4 bg-white/20 border-2 border-blue-400/50 rounded-lg text-white text-lg placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-300 transition-all duration-200"
                  maxLength={50}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitClue()}
                />
                <button
                  onClick={handleSubmitClue}
                  disabled={!clueInput.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Submit
                </button>
              </div>
              <p className="text-blue-200 text-sm mt-3 text-center font-medium">
                💡 Be descriptive but not too obvious! Help your team identify you.
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

      {/* DECISION PHASE - 70/30 Split Layout */}
      {currentRoom?.gamePhase === 'decision' && (
        <div className="grid grid-cols-10 gap-6">
          {/* LEFT COLUMN - 70% - Clue Table */}
          <div className="col-span-7">
            {currentRoom && clues.length > 0 && (
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">
                    📝 Review Everyone's Clues
                  </h3>
                  <p className="text-white/80 text-sm">
                    Study the clues carefully - who might be the impostor?
                  </p>
                </div>
                <div className="border-2 border-yellow-400/50 rounded-lg p-4 bg-yellow-500/10">
                  <ClueTable
                    players={currentRoom.players}
                    clues={clues}
                    currentRound={currentRound}
                    maxRounds={maxRounds}
                    currentRoundClues={currentRoom.currentRoundClues}
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - 30% - Democratic Voting */}
          <div className="col-span-3">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 h-full">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">
                What should we do next?
              </h3>
              
              <div className="space-y-3 mb-4">
                {/* Next Round Button */}
                <button
                  onClick={voteNextRound}
                  disabled={playerVotedToVote}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    playerVotedNextRound
                      ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                      : 'border-white/20 bg-white/5 hover:border-blue-400 hover:bg-blue-500/10 text-white'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-sm">Next Round</span>
                  </div>
                  <p className="text-xs opacity-80">
                    Continue with Round {currentRound + 1}
                  </p>
                  {playerVotedNextRound && (
                    <div className="mt-1 text-blue-300 text-xs">✓ You voted for this</div>
                  )}
                </button>

                {/* Ready to Vote Button */}
                <button
                  onClick={voteReadyToVote}
                  disabled={playerVotedNextRound}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    playerVotedToVote
                      ? 'border-red-400 bg-red-500/20 text-red-300'
                      : 'border-white/20 bg-white/5 hover:border-red-400 hover:bg-red-500/10 text-white'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <Vote className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-sm">Vote Now</span>
                  </div>
                  <p className="text-xs opacity-80">
                    Skip to voting phase
                  </p>
                  {playerVotedToVote && (
                    <div className="mt-1 text-red-300 text-xs">✓ You voted for this</div>
                  )}
                </button>
              </div>

              {/* Voting Progress */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-xs">Decision Progress:</span>
                  <span className="text-white text-xs font-medium">
                    {totalVotes} / {totalPlayers}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-blue-300 font-semibold text-sm">
                      {nextRoundVotes}
                    </div>
                    <div className="text-white/60 text-xs">Next Round</div>
                  </div>
                  <div>
                    <div className="text-red-300 font-semibold text-sm">
                      {readyToVoteVotes}
                    </div>
                    <div className="text-white/60 text-xs">Vote Now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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