// src/components/ui/CategorySelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { CategoryGroup, WordCategory } from '../../../../shared/types';

interface CategoryCardProps {
  category: WordCategory;
  isSelected: boolean;
  onSelect: (categoryId: string) => void; // Changed from onToggle to onSelect
  disabled: boolean;
}

function CategoryCard({ category, isSelected, onSelect, disabled }: CategoryCardProps) {
  return (
    <button
      onClick={() => {
        console.log('🔧 CARD CLICKED:', category.id);
        onSelect(category.id);
      }}
      disabled={disabled}
      className={`
        p-4 rounded-xl border transition-all duration-200 text-left
        ${isSelected 
          ? 'bg-purple-500/20 border-purple-500/60 ring-2 ring-purple-500/40' 
          : 'bg-surface/60 border-purple-500/20 hover:border-purple-500/40'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500/10'}
        backdrop-blur-lg
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-white text-sm">{category.name}</h4>
        <div className={`
          w-4 h-4 rounded-full border-2 flex items-center justify-center
          ${isSelected 
            ? 'bg-purple-500 border-purple-500' 
            : 'border-purple-500/40'
          }
        `}>
          {isSelected && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </div>
      </div>
      
      <p className="text-xs text-gray-400 mb-2">{category.description}</p>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{category.words.length} words</span>
        {isSelected && (
          <span className="text-purple-400 font-medium">Selected</span>
        )}
      </div>
    </button>
  );
}

export default function CategorySelector() {
  const { currentRoom, updateCategorySelection, socket } = useSocket();
  const [currentSelection, setCurrentSelection] = useState<string>(''); // Single string, not array

  // Get current player to check if they're the host
  const currentPlayer = currentRoom?.players.find(p => p.id === socket?.id);
  const isHost = currentPlayer?.isHost || false;

  // Initialize from room state
  useEffect(() => {
    if (currentRoom?.selectedCategories && currentRoom.selectedCategories.length > 0) {
      console.log('🔧 INIT: Room categories from server:', currentRoom.selectedCategories);
      setCurrentSelection(currentRoom.selectedCategories[0]); // Take first category only
    }
  }, [currentRoom?.selectedCategories]);

  const handleCategorySelect = (categoryId: string) => {
    console.log('🔧 HANDLE SELECT CALLED:', categoryId);
    console.log('🔧 Is host:', isHost);
    console.log('🔧 Game state:', currentRoom?.gameState);
    
    if (!isHost || currentRoom?.gameState !== 'waiting') {
      console.log('🔧 BLOCKED: Not host or game not waiting');
      return;
    }

    console.log('🔧 SETTING NEW SELECTION:', categoryId);
    setCurrentSelection(categoryId);
    updateCategorySelection([categoryId]); // Always send array with single item
  };

  if (!currentRoom?.availableGroups || currentRoom.availableGroups.length === 0) {
    return null;
  }

  const isGameActive = currentRoom.gameState !== 'waiting';
  
  // Calculate total words for selected category
  const totalWords = currentRoom.availableGroups
    .flatMap(group => group.categories)
    .find(cat => cat.id === currentSelection)?.words.length || 0;

  return (
    <div className="bg-surface/80 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Game Category</h2>
          <p className="text-sm text-gray-400">
            {isHost && !isGameActive 
              ? 'Choose one category to use in this game' 
              : isGameActive
              ? 'Category for this game'
              : 'Only the host can change the category'
            }
          </p>
        </div>
        
        {/* Total word count */}
        <div className="text-right">
          <div className="text-lg font-semibold text-purple-400">
            {totalWords}
          </div>
          <div className="text-xs text-gray-500">total words</div>
        </div>
      </div>

      <div className="space-y-8">
        {currentRoom.availableGroups.map((group) => (
          <div key={group.id} className="space-y-3">
            {/* Group Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {group.id === 'tft' ? '🎮' : '🌍'} {group.name}
                </h3>
                <p className="text-sm text-gray-400">{group.description}</p>
              </div>
              <div className="text-xs text-purple-400">
                {group.categories.some(cat => cat.id === currentSelection) ? '●' : '○'} {group.categories.length} options
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={category.id === currentSelection}
                  onSelect={handleCategorySelect}
                  disabled={!isHost || isGameActive}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {currentSelection && (
        <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <h4 className="font-semibold text-purple-300 mb-2">Selected Category:</h4>
          <div className="flex flex-wrap gap-2">
            {currentRoom.availableGroups
              .flatMap(group => group.categories)
              .filter(cat => cat.id === currentSelection)
              .map((category) => (
                <span
                  key={category.id}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                >
                  {category.name} ({category.words.length} words)
                </span>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}