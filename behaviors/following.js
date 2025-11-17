import { PLAYER_STATE } from '../player-state.js';
import { findPath } from '../pathfinding.js';
import { updateWander, updateFollowPath } from '../player-movement.js';
import { startChoppingCycle } from './chopping.js';
import { startGatheringCycle } from './gathering.js';

const WOODCUTTING_STATES = [PLAYER_STATE.MOVING_TO_TREE, PLAYER_STATE.CHOPPING];
const GATHERING_STATES = [PLAYER_STATE.MOVING_TO_LOGS, PLAYER_STATE.HARVESTING_LOGS, PLAYER_STATE.MOVING_TO_BUSHES, PLAYER_STATE.HARVESTING_BUSHES, PLAYER_STATE.SEARCHING_FOR_GATHERABLE, PLAYER_STATE.WANDERING_TO_GATHER];

export function updateFollow(player, gameMap, allPlayers, deltaTime) {
    const targetPlayer = allPlayers.get(player.followTargetId);

    if (!targetPlayer || !targetPlayer.isPowered()) {
        console.log(`[${player.username}] Follow target lost. Idling.`);
        player.state = PLAYER_STATE.IDLE;
        player.followTargetId = null;
        player.activeCommand = null;
        return;
    }

    const dx = targetPlayer.pixelX - player.pixelX;
    const dy = targetPlayer.pixelY - player.pixelY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If too far, move closer
    if (distance > 8) {
        // Only find a new path if not already moving
        if (player.path.length === 0) {
            const startX = Math.round(player.pixelX);
            const startY = Math.round(player.pixelY);
            // Find a valid spot near the target
            const targetX = Math.round(targetPlayer.pixelX);
            const targetY = Math.round(targetPlayer.pixelY);

            let bestSpot = null;
            let minPathLength = Infinity;

            for (let r = 1; r < 5; r++) {
                 for (let i = -r; i <= r; i++) {
                    for (let j = -(r-Math.abs(i)); j <= (r-Math.abs(i)); j++) {
                        if(i === 0 && j === 0) continue;
                        const spotX = targetX + i;
                        const spotY = targetY + j;

                        if (spotX >= 0 && spotX < gameMap.width && spotY >= 0 && spotY < gameMap.height && !gameMap.isColliding(spotX, spotY)) {
                            const path = findPath(startX, startY, spotX, spotY, gameMap);
                            if (path && path.length < minPathLength) {
                                minPathLength = path.length;
                                bestSpot = path;
                            }
                        }
                    }
                }
                if (bestSpot) break; // Found a path in this radius
            }

            if (bestSpot) {
                player.path = bestSpot;
            } else {
                 console.log(`[${player.username}] Can't find path to follow ${targetPlayer.username}. Idling for now.`);
            }
        }
        updateFollowPath(player, deltaTime, gameMap);
        return;
    }
    
    // Within range, so stop moving
    player.path = [];

    // Mimic target's actions
    if (WOODCUTTING_STATES.includes(targetPlayer.state)) {
        startChoppingCycle(player, gameMap);
    } else if (GATHERING_STATES.includes(targetPlayer.state)) {
        startGatheringCycle(player, gameMap);
    } else {
        // Target is idle or wandering, so follower also wanders
        updateWander(player, deltaTime, gameMap);
    }
}