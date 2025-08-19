// src/components/game/ClueTable.tsx
'use client';

import { Player } from '../../../../shared/types';

interface Clue {
  playerId: string;
  playerName: string;
  clue: string;
  round: number;
}

interface ClueTableProps {
  players: Player[];
  clues: Clue[];
  currentRound: number;
  maxRounds: number;
  currentRoundClues?: { [playerId: string]: string };
}

export default function ClueTable({ 
  players, 
  clues, 
  currentRound, 
  maxRounds,
  currentRoundClues = {}
}: ClueTableProps) {
  // Create a matrix of clues organized by player and round
  const clueMatrix: { [playerId: string]: { [round: number]: string } } = {};
  
  // Initialize matrix
  players.forEach(player => {
    clueMatrix[player.id] = {};
  });
  
  // Fill matrix with submitted clues
  clues.forEach(clue => {
    if (clueMatrix[clue.playerId]) {
      clueMatrix[clue.playerId][clue.round] = clue.clue;
    }
  });
  
  // Add current round clues (not yet in the main clues array)
  Object.entries(currentRoundClues).forEach(([playerId, clue]) => {
    if (clueMatrix[playerId]) {
      clueMatrix[playerId][currentRound] = clue;
    }
  });

  // Generate array of round numbers
  const rounds = Array.from({ length: maxRounds }, (_, i) => i + 1);

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
      <h3 className="text-white font-semibold mb-4 text-center">
        📝 Clue History
      </h3>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          {/* Header Row */}
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left text-white/80 font-medium p-3 min-w-[100px]">
                Player
              </th>
              {rounds.map(round => (
                <th 
                  key={round} 
                  className={`text-center text-white/80 font-medium p-3 min-w-[120px] ${
                    round === currentRound ? 'text-blue-300' : ''
                  }`}
                >
                  Round {round}
                  {round === currentRound && (
                    <div className="text-xs text-blue-300 mt-1">Current</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Player Rows */}
          <tbody>
            {players.map(player => (
              <tr key={player.id} className="border-b border-white/10">
                {/* Player Name */}
                <td className="p-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-medium text-sm">
                      {player.name}
                    </span>
                  </div>
                </td>
                
                {/* Clue Cells */}
                {rounds.map(round => {
                  const clue = clueMatrix[player.id]?.[round];
                  const isCurrentRound = round === currentRound;
                  const hasClue = Boolean(clue);
                  
                  return (
                    <td key={round} className="p-3 text-center">
                      {hasClue ? (
                        <div className={`p-2 rounded text-sm ${
                          isCurrentRound 
                            ? 'bg-blue-500/20 border border-blue-500/40 text-blue-200' 
                            : 'bg-white/10 text-white/90'
                        }`}>
                          "{clue}"
                        </div>
                      ) : round <= currentRound ? (
                        <div className="text-white/30 text-xs">
                          {isCurrentRound ? 'Waiting...' : '---'}
                        </div>
                      ) : (
                        <div className="text-white/20 text-xs">---</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {players.map(player => (
          <div key={player.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
            {/* Player Header */}
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-white font-medium">{player.name}</span>
            </div>
            
            {/* Clues Grid */}
            <div className="grid grid-cols-2 gap-2">
              {rounds.map(round => {
                const clue = clueMatrix[player.id]?.[round];
                const isCurrentRound = round === currentRound;
                const hasClue = Boolean(clue);
                
                return (
                  <div key={round} className="text-center">
                    <div className={`text-xs mb-1 ${
                      isCurrentRound ? 'text-blue-300' : 'text-white/60'
                    }`}>
                      R{round}
                    </div>
                    {hasClue ? (
                      <div className={`p-2 rounded text-xs ${
                        isCurrentRound 
                          ? 'bg-blue-500/20 border border-blue-500/40 text-blue-200' 
                          : 'bg-white/10 text-white/90'
                      }`}>
                        "{clue}"
                      </div>
                    ) : round <= currentRound ? (
                      <div className="text-white/30 text-xs p-2">
                        {isCurrentRound ? 'Waiting...' : '---'}
                      </div>
                    ) : (
                      <div className="text-white/20 text-xs p-2">---</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-white/60">
            <span className="font-medium">Round:</span> {currentRound}/{maxRounds}
          </div>
          <div className="text-white/60">
            <span className="font-medium">Total Clues:</span> {clues.length + Object.keys(currentRoundClues).length}
          </div>
          <div className="text-white/60">
            <span className="font-medium">Players:</span> {players.length}
          </div>
        </div>
      </div>
    </div>
  );
}