// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { joinRoom, createRoom, isConnected } = useSocket();
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return;
    
    setIsJoining(true);
    createRoom(playerName.trim());
    
    // Wait a bit for room creation, then navigate
    setTimeout(() => {
      const newRoomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      router.push(`/room/${newRoomCode}`);
    }, 500);
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    
    setIsJoining(true);
    joinRoom(playerName.trim(), roomCode.trim().toUpperCase());
    
    // Navigate to room
    setTimeout(() => {
      router.push(`/room/${roomCode.trim().toUpperCase()}`);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Who's The Impostor?
          </h1>
          <p className="text-white/80">
            Can you spot the fake among your friends?
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6 text-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        {/* Player Name Input */}
        <div className="mb-6">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            maxLength={20}
          />
        </div>

        {/* Create Room Button */}
        <button
          onClick={handleCreateRoom}
          disabled={!playerName.trim() || !isConnected || isJoining}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4"
        >
          {isJoining ? 'Creating...' : 'Create New Room'}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-white/60">or</span>
          </div>
        </div>

        {/* Join Room */}
        <div className="mb-4">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Room Code
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent uppercase"
            maxLength={6}
          />
        </div>

        <button
          onClick={handleJoinRoom}
          disabled={!playerName.trim() || !roomCode.trim() || !isConnected || isJoining}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isJoining ? 'Joining...' : 'Join Room'}
        </button>

        {/* Game Rules */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            3-6 players • Social deduction • Spot the impostor!
          </p>
        </div>
      </div>
    </div>
  );
}