// src/components/game/RoleDisplay.tsx
'use client';

interface RoleDisplayProps {
  isImpostor: boolean;
  category?: string;
  word?: string;
}

export default function RoleDisplay({ isImpostor, category, word }: RoleDisplayProps) {
  if (isImpostor) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold text-red-300 mb-1">
          🎭 You are the IMPOSTOR!
        </h3>
        <p className="text-white/80 text-sm mb-1">Category:</p>
        <p className="text-white font-semibold">{category}</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-blue-300 mb-1">
        🕵️ You are a DETECTIVE!
      </h3>
      <p className="text-white/80 text-sm mb-1">Secret word:</p>
      <p className="text-white font-semibold">{word}</p>
    </div>
  );
}