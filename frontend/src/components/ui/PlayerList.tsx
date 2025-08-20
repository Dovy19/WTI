// src/components/ui/PlayerList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Crown, Users, Trophy } from 'lucide-react';
import { Player } from '../../../../shared/types';

interface PlayerListProps {
  players: Player[];
  delayPointsUpdate?: boolean; // 🆕 NEW: Flag to delay showing updated points
}

export default function PlayerList({ players, delayPointsUpdate = false }: PlayerListProps) {
  // 🆕 NEW: Store previous points to show during transitions
  const [displayPlayers, setDisplayPlayers] = useState<Player[]>(players);

  // 🆕 NEW: Update display players based on delay flag
  useEffect(() => {
    if (!delayPointsUpdate) {
      // Show current points when not delaying
      setDisplayPlayers(players);
    }
    // When delayPointsUpdate is true, keep showing the old points (don't update displayPlayers)
  }, [players, delayPointsUpdate]);

  // 🆕 NEW: Initialize displayPlayers when component first mounts
  useEffect(() => {
    setDisplayPlayers(players);
  }, []); // Only run once on mount

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
      <div className="flex items-center mb-4">
        <Users className="w-5 h-5 text-white mr-2" />
        <h2 className="text-lg font-semibold text-white">
          Players ({players.length})
        </h2>
      </div>

      <div className="space-y-3">
        {displayPlayers.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center">
                  <span className="text-white font-medium">
                    {player.name}
                  </span>
                  {player.isHost && (
                    <Crown className="w-4 h-4 text-yellow-400 ml-2" />
                  )}
                </div>
                {/* Points Display - Shows old points during transitions */}
                <div className="flex items-center mt-1">
                  <Trophy className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-xs font-medium">
                    {player.points || 0} points
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {players.length < 3 && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-300 text-sm text-center">
            Need at least 3 players to start
          </p>
        </div>
      )}

      {/* Points Leaderboard - Also uses display players */}
      {displayPlayers.some(p => (p.points || 0) > 0) && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-white/80 text-sm font-medium mb-2 text-center">
            🏆 Session Leaderboard
          </h3>
          <div className="space-y-1">
            {displayPlayers
              .sort((a, b) => (b.points || 0) - (a.points || 0))
              .slice(0, 3)
              .map((player, index) => (
                <div key={player.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <span className={`mr-2 ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-gray-300' : 
                      'text-orange-400'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="text-white/80">{player.name}</span>
                  </div>
                  <span className="text-yellow-400 font-medium">
                    {player.points || 0}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}