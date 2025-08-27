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
      <p className="text-[#9ca3af] mb-6">
        Share the room code with your friends to get started!
      </p>
      
      <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#9333ea]/30 inline-block mb-6">
        <p className="text-[#c084fc] text-sm mb-2">Room Code:</p>
        <p className="text-3xl font-bold text-white tracking-wider">
          {roomCode}
        </p>
      </div>

      {playerCount >= 3 ? (
        <div>
          {isHost ? (
            <button 
              onClick={onStartGame}
              className="px-6 py-3 bg-[#9333ea] text-white font-semibold rounded-lg hover:bg-[#a855f7] transition-all duration-200"
            >
              Start Game
            </button>
          ) : (
            <p className="text-[#9ca3af]">
              Waiting for host to start the game...
            </p>
          )}
        </div>
      ) : (
        <p className="text-[#c084fc]">
          Need at least 3 players to start
        </p>
      )}
    </div>
  );
}