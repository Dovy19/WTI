// src/components/ui/TimerDisplay.tsx
'use client';

import { Clock, AlertTriangle } from 'lucide-react';
import { PHASE_LABELS } from '../../../../shared/types';

interface TimerDisplayProps {
  timeLeft: number;
  phase: 'waiting' | 'writing' | 'decision' | 'voting';
  className?: string;
}

export default function TimerDisplay({ timeLeft, phase, className = '' }: TimerDisplayProps) {
  // Don't show timer for waiting phase
  if (phase === 'waiting' || timeLeft <= 0) {
    return null;
  }

  // Calculate minutes and seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Determine urgency styling
  const isUrgent = timeLeft <= 30;
  const isCritical = timeLeft <= 10;

  // Phase-specific styling with purple theme
  const getPhaseColor = () => {
    switch (phase) {
      case 'writing':
        return 'bg-[#9333ea]';
      case 'decision':
        return 'bg-[#c084fc]';
      case 'voting':
        return 'bg-red-500';
      default:
        return 'bg-[#9333ea]';
    }
  };

  const getProgressPercentage = () => {
    const maxTime = {
      writing: 60,
      decision: 120,
      voting: 180
    }[phase] || 60;
    
    return (timeLeft / maxTime) * 100;
  };

  return (
    <div className={`bg-[#1a1a2e]/60 backdrop-blur-lg rounded-lg p-4 border border-[#9333ea]/30 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {isCritical ? (
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2 animate-pulse" />
          ) : (
            <Clock className="w-5 h-5 text-[#c084fc] mr-2" />
          )}
          <span className="text-[#9ca3af] text-sm font-medium">
            {PHASE_LABELS[phase]}
          </span>
        </div>
        
        <div className={`text-xl font-bold ${
          isCritical ? 'text-red-300 animate-pulse' : 
          isUrgent ? 'text-yellow-300' : 
          'text-white'
        }`}>
          {formattedTime}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#1a1a2e]/60 rounded-full h-2 mb-2 border border-[#9333ea]/20">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${getPhaseColor()} ${
            isCritical ? 'animate-pulse' : ''
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Phase Description */}
      <div className="text-[#9ca3af] text-xs text-center">
        {phase === 'writing' && 'Submit your clue'}
        {phase === 'decision' && 'Discuss and vote on next action'}
        {phase === 'voting' && 'Vote for the impostor'}
      </div>

      {/* Urgency Warning */}
      {isUrgent && (
        <div className={`mt-2 text-center text-xs ${
          isCritical ? 'text-red-300' : 'text-yellow-300'
        }`}>
          {isCritical ? 'Time almost up!' : 'Hurry up!'}
        </div>
      )}
    </div>
  );
}