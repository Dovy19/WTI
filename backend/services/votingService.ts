// services/votingService.ts - Voting Calculation & Results
import { Server } from 'socket.io';
import { gameRooms } from './gameState';
import { clearTimer } from './timerService';
import { Player } from '@shared/types';

// Process voting results and determine winner
export function processVotingResults(roomCode: string, io: Server): void {
  const room = gameRooms.get(roomCode);
  if (!room) return;

  console.log(`Processing voting results for room ${roomCode}`);

  // Calculate voting results
  const voteCounts: { [playerId: string]: number } = {};
  const voterNames: { [playerId: string]: string[] } = {};
  
  // Count votes for each player
  Object.values(room.votes || {}).forEach((votedPlayerId: string) => {
    voteCounts[votedPlayerId] = (voteCounts[votedPlayerId] || 0) + 1;
    voterNames[votedPlayerId] = voterNames[votedPlayerId] || [];
  });

  // Add voter names for each vote
  Object.entries(room.votes || {}).forEach(([voterId, votedPlayerId]: [string, string]) => {
    const voterName = room.players.find(p => p.id === voterId)?.name || 'Unknown';
    voterNames[votedPlayerId].push(voterName);
  });

  // Find the player with the most votes
  let mostVotedPlayerId = '';
  let maxVotes = 0;
  Object.entries(voteCounts).forEach(([playerId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      mostVotedPlayerId = playerId;
    }
  });

  const mostVotedPlayer = room.players.find((p: Player) => p.id === mostVotedPlayerId);
  const impostor = room.players.find((p: Player) => p.isImpostor);
  const impostorCaught = mostVotedPlayer?.isImpostor || false;

  console.log(`Voting complete in room ${roomCode}:`);
  console.log(`Most voted: ${mostVotedPlayer?.name} (${maxVotes} votes)`);
  console.log(`Impostor: ${impostor?.name}`);
  console.log(`Impostor caught: ${impostorCaught}`);

  const results = {
    voteCounts: voteCounts || {},
    voterNames: voterNames || {},
    mostVotedPlayer: {
      id: mostVotedPlayer?.id,
      name: mostVotedPlayer?.name,
      isImpostor: mostVotedPlayer?.isImpostor
    },
    impostor: {
      id: impostor?.id,
      name: impostor?.name
    },
    impostorCaught,
    secretWord: room.secretWord || "",
    category: room.category || ""
  };

  if (impostorCaught) {
    // Impostor was caught - give them a chance to guess
    room.gameState = 'finalGuess';
    io.to(roomCode).emit('votingResults', results);
    
    // Send final guess prompt only to the impostor
    io.to(impostor!.id).emit('finalGuessPrompt', {
      secretWord: room.secretWord,
      timeLimit: 30
    });
    
    console.log(`Impostor ${impostor!.name} has 30 seconds to guess the word: ${room.secretWord}`);
    
    // Auto-submit empty guess after 35 seconds if no response
    setTimeout(() => {
      if (room.gameState === 'finalGuess') {
        console.log(`Time up! Auto-submitting empty guess for ${impostor!.name}`);
        
        room.gameState = 'finished';
        
        // Send results immediately (starts transitions)
        const finalResults = {
          ...results,
          impostorGuess: '',
          correctGuess: false,
          gameEnded: true,
          winners: 'detectives' as const,
          points: {
            impostorPoints: 0,
            detectivePoints: 2
          }
        };
        
        io.to(roomCode).emit('gameResults', finalResults);
        
        // FIXED: Delay point awarding until after transitions complete (35 seconds)
        setTimeout(() => {
          console.log('Awarding points after transitions complete...');
          
          // Award points to detectives for successful vote
          room.players.forEach(player => {
            if (!player.isImpostor) {
              player.points = (player.points || 0) + 2; // Detectives get 2 points
              console.log(`Awarded 2 points to ${player.name} (detective win) - Total: ${player.points}`);
            } else {
              console.log(`No points for ${player.name} (impostor failed final guess)`);
            }
          });
          
          io.to(roomCode).emit('roomUpdate', room);
          console.log('Updated room sent with points after transitions:', room.players.map(p => `${p.name}: ${p.points}`));
        }, 35000); // Wait 35 seconds for transitions to complete
      }
    }, 35000); // 35 seconds buffer
  } else {
    // Impostor survived - they win
    room.gameState = 'finished';
    
    // Send results immediately (starts transitions)
    const finalResults = {
      ...results,
      gameEnded: true,
      winners: 'impostor' as const,
      points: {
        impostorPoints: 2,
        detectivePoints: 0
      }
    };
    
    io.to(roomCode).emit('gameResults', finalResults);
    
    // FIXED: Delay point awarding until after transitions complete (35 seconds)
    setTimeout(() => {
      console.log('Awarding points after transitions complete...');
      
      // Award points to impostor for successful deception
      room.players.forEach(player => {
        if (player.isImpostor) {
          player.points = (player.points || 0) + 2; // Impostor gets 2 points
          console.log(`Awarded 2 points to ${player.name} (impostor win) - Total: ${player.points}`);
        } else {
          console.log(`No points for ${player.name} (detectives failed)`);
        }
      });
      
      io.to(roomCode).emit('roomUpdate', room);
      console.log('Updated room sent with points after transitions:', room.players.map(p => `${p.name}: ${p.points}`));
    }, 35000); // Wait 35 seconds for transitions to complete
  }
}

// Check if all votes are submitted
export function checkAllVotesSubmitted(roomCode: string, io: Server): boolean {
  const room = gameRooms.get(roomCode);
  if (!room) return false;

  const allVoted = room.players.every(p => 
    room.votes && room.votes[p.id]
  );

  if (allVoted) {
    console.log(`All votes submitted in room ${roomCode}`);
    clearTimer(roomCode);
    processVotingResults(roomCode, io);
    return true;
  }

  return false;
}

// Process final guess from impostor
export function processFinalGuess(
  roomCode: string, 
  guess: string, 
  impostorId: string, 
  io: Server
): void {
  const room = gameRooms.get(roomCode);
  if (!room) {
    console.log('ERROR: Room not found for final guess processing');
    return;
  }

  console.log(`Processing final guess for room ${roomCode}`);
  console.log(`Players before point award:`, room.players.map(p => `${p.name}: ${p.points || 0} points, isImpostor: ${p.isImpostor}`));

  const correctGuess = guess.toLowerCase().trim() === room.secretWord?.toLowerCase().trim();
  console.log(`Final guess "${guess}" vs secret word "${room.secretWord}" - Correct: ${correctGuess}`);
  
  room.gameState = 'finished';
  
  // Rebuild voting data for final results
  const voteCounts = room.votes ? Object.fromEntries(
    Object.values(room.votes).reduce((acc: Map<string, number>, playerId: string) => {
      acc.set(playerId, (acc.get(playerId) || 0) + 1);
      return acc;
    }, new Map())
  ) : {};

  const voterNames = room.votes ? Object.entries(room.votes).reduce((acc: { [key: string]: string[] }, [voterId, votedPlayerId]) => {
    if (!acc[votedPlayerId]) acc[votedPlayerId] = [];
    const voterName = room.players.find(p => p.id === voterId)?.name || 'Unknown';
    acc[votedPlayerId].push(voterName);
    return acc;
  }, {} as { [key: string]: string[] }) : {};

  const finalResults = {
    voteCounts: voteCounts || {},
    voterNames: voterNames || {},
    mostVotedPlayer: {
      id: room.players.find(p => p.isImpostor)?.id,
      name: room.players.find(p => p.isImpostor)?.name,
      isImpostor: true
    },
    impostor: {
      id: room.players.find(p => p.isImpostor)?.id,
      name: room.players.find(p => p.isImpostor)?.name
    },
    impostorCaught: true,
    secretWord: room.secretWord || "",
    category: room.category || "",
    impostorGuess: guess,
    correctGuess,
    gameEnded: true,
    winners: correctGuess ? 'tie' as const : 'detectives' as const,
    points: {
      impostorPoints: correctGuess ? 1 : 0,
      detectivePoints: correctGuess ? 1 : 2
    }
  };
  
  const player = room.players.find(p => p.id === impostorId);
  console.log(`Impostor ${player?.name} guessed: "${guess}" - ${correctGuess ? 'CORRECT' : 'WRONG'}`);
  
  clearTimer(roomCode);
  
  // Send results immediately (starts transitions)
  console.log('Sending game results to start transitions...');
  io.to(roomCode).emit('gameResults', finalResults);
  
  // FIXED: Delay point awarding until after transitions complete (35 seconds)
  setTimeout(() => {
    console.log('Awarding points after transitions complete...');
    
    // Award points based on final guess result
    room.players.forEach(player => {
      console.log(`Processing player ${player.name}: isImpostor=${player.isImpostor}, currentPoints=${player.points || 0}`);
      
      if (correctGuess) {
        // Tie - everyone gets 1 point
        const oldPoints = player.points || 0;
        player.points = oldPoints + 1;
        console.log(`Awarded 1 point to ${player.name} (tie) - ${oldPoints} → ${player.points}`);
      } else {
        // Detectives win - only they get 2 points
        if (!player.isImpostor) {
          const oldPoints = player.points || 0;
          player.points = oldPoints + 2;
          console.log(`Awarded 2 points to ${player.name} (detective win) - ${oldPoints} → ${player.points}`);
        } else {
          console.log(`No points for ${player.name} (impostor failed final guess)`);
        }
      }
    });

    console.log(`Players after point award:`, room.players.map(p => `${p.name}: ${p.points || 0} points`));
    
    io.to(roomCode).emit('roomUpdate', room);
    console.log('Updated room sent with points after transitions:', room.players.map(p => `${p.name}: ${p.points}`));
  }, 35000); // Wait 35 seconds for transitions to complete
}