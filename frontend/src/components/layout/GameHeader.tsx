// src/components/layout/GameHeader.tsx
'use client';

import { ArrowLeft, Copy } from 'lucide-react';

interface GameHeaderProps {
  roomCode: string;
  isConnected: boolean;
  onLeaveRoom: () => void;
  onCopyCode: () => void;
}

export default function GameHeader({ roomCode, isConnected, onLeaveRoom, onCopyCode }: GameHeaderProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20 mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onLeaveRoom}
          className="flex items-center text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Leave Room
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">
            Room {roomCode}
          </h1>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <button
          onClick={onCopyCode}
          className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Code
        </button>
      </div>
    </div>
  );
}