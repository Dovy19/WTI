// src/components/game/VotingInterface.tsx
'use client';

import { useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Vote, Clock, Crown } from 'lucide-react';
import TimerDisplay from '../ui/TimerDisplay'; // NEW: Add timer display

export default function VotingInterface() {
  const { currentRoom, submitVote, socket, currentTimer } = useSocket(); // NEW: Add currentTimer
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);

  if (!currentRoom) return null;

  const currentPlayer = currentRoom.players.find(p => p.id === socket?.id);
  const otherPlayers = currentRoom.players.filter(p => p.id !== socket?.id);

  // Count votes submitted
  const votesSubmitted = Object.keys(currentRoom.votes || {}).length;
  const totalPlayers = currentRoom.players.length;

  const handleVote = () => {
    if (selectedPlayer && !hasVoted) {
      submitVote(selectedPlayer);
      setHasVoted(true);
    }
  };

  return (
    <div className="py-6">
      {/* NEW: Timer Display */}
      {currentTimer && (
        <TimerDisplay
          timeLeft={currentTimer.timeLeft}
          phase={currentTimer.phase}
          className="mb-6"
        />
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          🗳️ Voting Phase
        </h2>
        <p className="text-white/80 text-lg mb-4">
          Who do you think is the impostor?
        </p>
        
        {/* Voting Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-white/60" />
          <span className="text-white/60">
            {votesSubmitted} of {totalPlayers} votes submitted
          </span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(votesSubmitted / totalPlayers) * 100}%` }}
          />
        </div>
      </div>

      {!hasVoted ? (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Select a player to vote for:
          </h3>
          
          <div className="grid gap-3 mb-6">
            {otherPlayers.map((player: any) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayer(player.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedPlayer === player.id
                    ? 'border-red-400 bg-red-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <span className="text-white font-medium text-lg">
                        {player.name}
                      </span>
                      {player.isHost && (
                        <div className="flex items-center mt-1">
                          <Crown className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-yellow-400 text-xs">Host</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedPlayer === player.id && (
                    <div className="text-red-400">
                      <Vote className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleVote}
              disabled={!selectedPlayer}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center mx-auto"
            >
              <Vote className="w-5 h-5 mr-2" />
              Vote to Eliminate
            </button>
            
            {selectedPlayer && (
              <p className="text-white/60 text-sm mt-2">
                You are voting for: <span className="text-white font-medium">
                  {otherPlayers.find(p => p.id === selectedPlayer)?.name}
                </span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-green-300 mb-2">
              ✓ Vote Submitted!
            </h3>
            <p className="text-white/80">
              You voted for: <span className="text-white font-medium">
                {otherPlayers.find(p => p.id === selectedPlayer)?.name}
              </span>
            </p>
          </div>
          
          <div className="text-white/60">
            <p>Waiting for other players to vote...</p>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
            </div>
          </div>
        </div>
      )}

      {/* Show current game info */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-white/60 text-sm text-center">
          <span className="font-medium">Secret Word:</span> {currentRoom.secretWord} • 
          <span className="font-medium"> Category:</span> {currentRoom.category}
        </p>
      </div>
    </div>
  );
}