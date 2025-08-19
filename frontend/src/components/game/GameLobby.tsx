// src/components/game/GameLobby.tsx
'use client';

interface GameLobbyProps {
  roomCode: string;
  playerCount: number;
  isHost: boolean;
  onStartGame: () => void;
}

export default function GameLobby({ roomCode, playerCount, isHost, onStartGame }: GameLobbyProps) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-white mb-4">
        Waiting for Players
      </h2>
      <p className="text-white/60 mb-6">
        Share the room code with your friends to get started!
      </p>
      
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 inline-block mb-6">
        <p className="text-white/80 text-sm mb-2">Room Code:</p>
        <p className="text-3xl font-bold text-white tracking-wider">
          {roomCode}
        </p>
      </div>

      {playerCount >= 3 ? (
        <div>
          {isHost ? (
            <button 
              onClick={onStartGame}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
            >
              Start Game
            </button>
          ) : (
            <p className="text-white/60">
              Waiting for host to start the game...
            </p>
          )}
        </div>
      ) : (
        <p className="text-yellow-300">
          Need at least 3 players to start
        </p>
      )}
    </div>
  );
}