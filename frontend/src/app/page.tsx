// src/app/page.tsx - New Design with Animated Background + Glow Interactivity
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation';
import { Users, Plus, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const { joinRoom, createRoom, isConnected } = useSocket();
  const router = useRouter();

  // Listen for mouse interactions globally
  useEffect(() => {
    const handleDown = () => setIsMouseDown(true);
    const handleUp = () => setIsMouseDown(false);

    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return;

    setIsJoining(true);
    createRoom(playerName.trim());

    setTimeout(() => {
      const newRoomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      router.push(`/room/${newRoomCode}`);
    }, 500);
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;

    setIsJoining(true);
    joinRoom(playerName.trim(), roomCode.trim().toUpperCase());

    setTimeout(() => {
      router.push(`/room/${roomCode.trim().toUpperCase()}`);
    }, 500);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-75">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <defs>
            {/* Gradient for the wave lines */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--purple-main)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="var(--purple-soft)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--purple-main)" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Wave Lines */}
          {[
            { id: 'wave1', d: 'M -100 200 Q 190 150 600 200 T 1200 200', opacity: 1 },
            { id: 'wave2', d: 'M -100 350 Q 200 300 900 350 T 1200 350', opacity: 0.5 },
            { id: 'wave3', d: 'M -100 500 Q 250 550 600 500 T 1200 500', opacity: 0.4 },
          ].map((wave, idx) => (
            <path
              key={idx}
              id={wave.id}
              d={wave.d}
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              fill="none"
              opacity={wave.opacity}
              style={{
                transition: 'filter 0.3s ease, stroke 0.3s ease',
                filter: isMouseDown
                  ? 'drop-shadow(0px 0px 6px var(--purple-soft))'
                  : 'none',
              }}
            />
          ))}

          {/* Particles */}
          {[
            { path: '#wave1', dur: '16s' },
            { path: '#wave2', dur: '20s' },
            { path: '#wave3', dur: '24s' },
          ].map((particle, idx) => (
            <polygon
              key={idx}
              points="0,-4 4,0 0,4 -4,0"
              fill="var(--purple-hover)"
              stroke="black"
              strokeWidth="0.5"
              opacity="0.8"
              style={{
                transition: 'transform 0.3s ease, filter 0.3s ease',
                transform: isMouseDown ? 'scale(1.5)' : 'scale(1)',
                filter: isMouseDown
                  ? 'drop-shadow(0px 0px 8px var(--purple-hover))'
                  : 'none',
              }}
            >
              <animateMotion
                dur={particle.dur}
                repeatCount="indefinite"
                begin="1s"
                rotate="auto"
              >
                <mpath href={particle.path} />
              </animateMotion>
            </polygon>
          ))}
        </svg>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Purple Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--purple-main)] rounded-2xl mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">Party Games</h1>
          <p className="text-gray-400">Join friends for epic multiplayer fun</p>
        </div>

        {/* Player Name Input */}
        <div className="mb-8">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            maxLength={20}
          />
        </div>

        {/* Join a Room Card */}
        <div className="bg-[var(--bg-surface)] border border-purple-500/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Join a Room</h2>
          <p className="text-gray-400 mb-4">
            Enter a room code to join an existing game
          </p>

          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="ENTER ROOM CODE"
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all uppercase tracking-wider"
            maxLength={6}
          />

          <button
            onClick={handleJoinRoom}
            disabled={!playerName.trim() || !roomCode.trim() || !isConnected || isJoining}
            className="w-full py-3 px-6 bg-[var(--purple-main)] hover:bg-[var(--purple-hover)] rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isJoining ? 'Joining...' : (
              <>
                Join Room
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="text-center mb-6">
          <span className="text-gray-500">or</span>
        </div>

        {/* Create New Room Card */}
        <div className="bg-[var(--bg-surface)] border border-purple-500/20 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Create New Room</h2>
          <p className="text-gray-400 mb-6">
            Start a new game and invite your friends
          </p>

          <button
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || !isConnected || isJoining}
            className="w-full py-3 px-6 bg-[var(--purple-main)] hover:bg-[var(--purple-hover)] rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isJoining ? 'Creating...' : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </>
            )}
          </button>
        </div>

        {/* Bottom Text */}
        <div className="text-center">
          <p className="text-gray-400">Invite friends and play together!</p>
        </div>

        {!isConnected && (
          <div className="text-center mt-4">
            <span className="text-red-400 text-sm">Connecting to server...</span>
          </div>
        )}
      </div>
    </div>
  );
}
