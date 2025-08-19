// src/components/game/ResultsScreen.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Crown, Trophy, Target, Users, RotateCcw } from 'lucide-react';
import { Player, GameResults } from '../../../../shared/types';
import TransitionSequence from './TransitionSequence';

interface ResultsScreenProps {
  gameState: 'finalGuess' | 'finished';
  results?: GameResults | null;
}

export default function ResultsScreen({ gameState, results: propsResults }: ResultsScreenProps) {
  const { currentRoom, socket, playAgain } = useSocket();
  const [results, setResults] = useState<GameResults | null>(propsResults || null);
  const [showFinalGuess, setShowFinalGuess] = useState(false);
  const [finalGuess, setFinalGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  
  // NEW: Transition system state
  const [showTransitions, setShowTransitions] = useState(false);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  const [transitionsTriggered, setTransitionsTriggered] = useState(false); // PREVENT MULTIPLE TRIGGERS

  const currentPlayer = currentRoom?.players.find((p: Player) => p.id === socket?.id);
  const isHost = currentPlayer?.isHost || false;
  const isImpostor = currentPlayer?.isImpostor || false;

  // Debug logging
  useEffect(() => {
    console.log('ResultsScreen Debug:', {
      gameState,
      isImpostor,
      showFinalGuess,
      showTransitions,
      transitionsTriggered,
      eliminatedPlayer,
      currentPlayerId: socket?.id,
      currentPlayer,
      allPlayers: currentRoom?.players
    });
  }, [gameState, isImpostor, showFinalGuess, showTransitions, transitionsTriggered, eliminatedPlayer, socket?.id, currentPlayer]);

  // Reset transition state when game starts over
  useEffect(() => {
    if (currentRoom?.gameState === 'waiting' || currentRoom?.gameState === 'playing') {
      console.log('🔄 Game restarted, resetting transition state');
      setShowTransitions(false);
      setTransitionsTriggered(false);
      setEliminatedPlayer(null);
    }
  }, [currentRoom?.gameState]);

  // If we're in finalGuess state and we're the impostor, show the interface immediately
  useEffect(() => {
    if (gameState === 'finalGuess' && isImpostor && !showFinalGuess) {
      console.log('Auto-showing final guess interface for impostor');
      setShowFinalGuess(true);
      setTimeLeft(30); // Default 30 seconds
    }
  }, [gameState, isImpostor, showFinalGuess]);

  // Listen for final guess prompt
  useEffect(() => {
    if (!socket) return;

    const handleFinalGuessPrompt = (data: { secretWord: string; timeLimit: number }) => {
      console.log('Final guess prompt received by impostor:', data);
      console.log('Is impostor?', isImpostor);
      if (isImpostor) {
        setShowFinalGuess(true);
        setTimeLeft(data.timeLimit);
        console.log('Showing final guess interface');
      }
    };

    const handleGameResults = (data: GameResults) => {
      console.log('🔥 SOCKET Game results received:', data);
      console.log('🔥 Current showTransitions state:', showTransitions);
      setResults(data);
      setShowFinalGuess(false);
      
      // NEW: Trigger transitions when we get final results
      if (data.gameEnded && currentRoom && !showTransitions && !transitionsTriggered) {
        console.log('🔥 SOCKET triggering transitions - showTransitions was:', showTransitions);
        const mostVoted = currentRoom.players.find((p: Player) => 
          p.id === data.mostVotedPlayer?.id
        );
        
        if (mostVoted) {
          console.log('🔥 SOCKET Found eliminated player:', mostVoted.name);
          setEliminatedPlayer(mostVoted);
          setShowTransitions(true);
          setTransitionsTriggered(true); // PREVENT FUTURE TRIGGERS
        } else {
          console.log('🔥 SOCKET No eliminated player found');
        }
      } else {
        console.log('🔥 SOCKET NOT triggering transitions - gameEnded:', data.gameEnded, 'currentRoom:', !!currentRoom, 'showTransitions:', showTransitions, 'transitionsTriggered:', transitionsTriggered);
      }
    };

    socket.on('finalGuessPrompt', handleFinalGuessPrompt);
    socket.on('gameResults', handleGameResults);

    return () => {
      socket.off('finalGuessPrompt', handleFinalGuessPrompt);
      socket.off('gameResults', handleGameResults);
    };
  }, [socket, isImpostor, currentRoom]);

  // Update results when props change
  useEffect(() => {
    if (propsResults) {
      console.log('🟡 PROPS results received:', propsResults);
      console.log('🟡 Current showTransitions state:', showTransitions);
      setResults(propsResults);
      
      // NEW: Also trigger transitions for props results if game ended
      if (propsResults.gameEnded && currentRoom && !showTransitions && !transitionsTriggered) {
        console.log('🟡 PROPS triggering transitions - showTransitions was:', showTransitions);
        const mostVoted = currentRoom.players.find((p: Player) => 
          p.id === propsResults.mostVotedPlayer?.id
        );
        
        if (mostVoted) {
          console.log('🟡 PROPS Found eliminated player:', mostVoted.name);
          setEliminatedPlayer(mostVoted);
          setShowTransitions(true);
          setTransitionsTriggered(true); // PREVENT FUTURE TRIGGERS
        }
      } else {
        console.log('🟡 PROPS NOT triggering transitions - gameEnded:', propsResults.gameEnded, 'currentRoom:', !!currentRoom, 'showTransitions:', showTransitions, 'transitionsTriggered:', transitionsTriggered);
      }
    }
  }, [propsResults, currentRoom, showTransitions, transitionsTriggered]);

  // Countdown timer for final guess - FIXED: Split into two separate effects
  useEffect(() => {
    if (!showFinalGuess || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showFinalGuess, timeLeft]);

  // Separate useEffect for auto-submit when timer expires
  useEffect(() => {
    if (showFinalGuess && timeLeft === 0 && socket && currentRoom) {
      console.log('Time up! Auto-submitting empty guess');
      socket.emit('submitFinalGuess', { guess: '', roomCode: currentRoom.code });
      setShowFinalGuess(false);
    }
  }, [showFinalGuess, timeLeft, socket, currentRoom]);

  const handleFinalGuess = () => {
    if (socket && currentRoom) {
      socket.emit('submitFinalGuess', { guess: finalGuess.trim(), roomCode: currentRoom.code });
      setShowFinalGuess(false);
    }
  };

  const handlePlayAgain = () => {
    // Reset transition state for next game
    setShowTransitions(false);
    setTransitionsTriggered(false);
    setEliminatedPlayer(null);
    playAgain();
  };

  // NEW: Handle transition completion
  const handleTransitionComplete = () => {
    console.log('🟢 Transitions completed, showing final results');
    console.log('🟢 Before: showTransitions =', showTransitions);
    setShowTransitions(false);
    console.log('🟢 After: showTransitions should be false');
  };

  if (!currentRoom || !results) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white">
          Processing results...
        </h2>
        <div className="text-xs text-white/50 mt-4">
          Debug: gameState={gameState}, isImpostor={isImpostor}, showFinalGuess={showFinalGuess}
        </div>
      </div>
    );
  }

  // NEW: Show transitions instead of immediate results when game is finished
  if (showTransitions && results && eliminatedPlayer && gameState === 'finished') {
    console.log('Rendering transition sequence');
    return (
      <TransitionSequence
        gameResults={results}
        eliminatedPlayer={eliminatedPlayer}
        currentRoom={currentRoom}
        onComplete={handleTransitionComplete}
      />
    );
  }

  // Final Guess Phase (unchanged - your existing logic)
  if (gameState === 'finalGuess' && showFinalGuess && isImpostor) {
    return (
      <div className="py-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-red-300 mb-4">
            🎭 You've Been Caught!
          </h2>
          <p className="text-white/80 text-lg mb-2">
            But you have one last chance to redeem yourself...
          </p>
          <p className="text-white mb-6">
            Guess the secret word to earn points for everyone!
          </p>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="text-red-300 text-2xl font-bold mb-2">
              ⏰ {timeLeft} seconds left
            </div>
            <div className="w-full bg-red-500/20 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Your Final Guess:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={finalGuess}
              onChange={(e) => setFinalGuess(e.target.value)}
              placeholder="Enter the secret word..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400"
              onKeyPress={(e) => e.key === 'Enter' && handleFinalGuess()}
              disabled={timeLeft === 0}
            />
            <button
              onClick={handleFinalGuess}
              disabled={timeLeft === 0}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 transition-all duration-200"
            >
              Guess!
            </button>
          </div>
          <p className="text-white/40 text-xs mt-2">
            Category: {currentRoom.category}
          </p>
        </div>
      </div>
    );
  }

  // Waiting for final guess from impostor (unchanged - your existing logic)
  if (gameState === 'finalGuess' && !isImpostor) {
    const impostorPlayer = currentRoom?.players.find((p: Player) => p.isImpostor);
    
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">
          ⏰ Final Guess Time!
        </h2>
        <p className="text-white/80 mb-6">
          <span className="font-medium text-red-300">{impostorPlayer?.name || 'The impostor'}</span> has been caught!
        </p>
        <p className="text-white/60 mb-8">
          They have 30 seconds to guess the secret word for redemption...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
        </div>
      </div>
    );
  }

  // Final Results - UPDATED LAYOUT
  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-6">
          🎉 Game Results
        </h2>

        {/* Voting Results + Truth Revealed in 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Voting Results */}
          {results.voteCounts && (
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Voting Results</h3>
              <div className="space-y-3">
                {Object.entries(results.voteCounts).map(([playerId, count]) => {
                  const player = currentRoom.players.find((p: Player) => p.id === playerId);
                  const voters = results.voterNames?.[playerId] || [];
                  return (
                    <div key={playerId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {player?.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{player?.name}</span>
                        {player?.id === results.mostVotedPlayer?.id && (
                          <Target className="w-4 h-4 text-red-400 ml-2" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{count} vote{count !== 1 ? 's' : ''}</div>
                        <div className="text-white/60 text-xs">
                          {voters.join(', ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Truth Revealed */}
          {results.impostor && results.mostVotedPlayer && (
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">The Truth Revealed</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-white/80 mb-2">The Impostor Was:</p>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {results.impostor.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-red-300 font-bold text-lg">{results.impostor.name}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white/80 mb-2">Most Voted:</p>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {results.mostVotedPlayer.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-bold text-lg">{results.mostVotedPlayer.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="text-white/80">
                  <span className="font-medium">Secret Word:</span> {results.secretWord || currentRoom.secretWord}
                  <br />
                  <span className="font-medium">Impostor was given the category:</span> {results.category || currentRoom.category}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Final Guess Results (if applicable) */}
        {results.impostorGuess !== undefined && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
            <h4 className="text-lg font-semibold text-white mb-2">Final Guess</h4>
            <p className="text-white/80">
              <span className="font-medium">{currentRoom.players.find((p: Player) => p.isImpostor)?.name || 'The impostor'}</span> guessed: 
              <span className="font-bold mx-2">"{results.impostorGuess}"</span>
              {results.correctGuess ? (
                <span className="text-green-400">✓ CORRECT!</span>
              ) : (
                <span className="text-red-400">✗ WRONG</span>
              )}
            </p>
          </div>
        )}

        {/* Winners & Points - Only show if game is finished and has points */}
        {gameState === 'finished' && results.points && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
              <h3 className="text-2xl font-semibold text-white">
                {results.winners === 'impostor' && 'Impostor Wins!'}
                {results.winners === 'detectives' && 'Detectives Win!'}
                {results.winners === 'tie' && "It's a Tie!"}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-300 mb-1">
                  +{results.points.impostorPoints}
                </div>
                <p className="text-white/80">Impostor Points</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300 mb-1">
                  +{results.points.detectivePoints}
                </div>
                <p className="text-white/80">Detective Points</p>
              </div>
            </div>
          </div>
        )}

       {/* Player Clues Summary Table */}
{gameState === 'finished' && currentRoom.clues && (
  <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-6">
    <h3 className="text-xl font-semibold text-white mb-4">Player Clues Summary</h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 border-b border-white/20 text-white font-semibold">
              Player
            </th>
            {[1, 2, 3, 4, 5].map((roundNum) => (
              <th key={roundNum} className="text-center p-3 border-b border-white/20 text-white font-semibold min-w-24">
                Round {roundNum}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRoom.players.map((player) => {
            // Get all clues for this player
            const playerClues = currentRoom.clues?.filter((clue: any) => 
              clue.playerId === player.id
            ) || [];
            
            return (
              <tr key={player.id} className="border-b border-white/10">
                <td className="p-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{player.name}</span>
                    {player.isImpostor && (
                      <span className="ml-2 text-red-400 text-sm">(Impostor)</span>
                    )}
                  </div>
                </td>
                {[1, 2, 3, 4, 5].map((roundNum) => {
                  const roundClue = playerClues.find((c: any) => c.round === roundNum);
                  return (
                    <td key={roundNum} className="p-3 text-center">
                      <span className="text-white text-sm">
                        {roundClue?.clue || '-'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}

        {/* Play Again - Only show if game is completely finished */}
        {gameState === 'finished' && (
          <div className="text-center">
            {isHost ? (
              <button
                onClick={handlePlayAgain}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center mx-auto"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </button>
            ) : (
              <p className="text-white/60">
                Waiting for host to start next game...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}