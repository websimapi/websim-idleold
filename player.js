export const ENERGY_DURATION_MS = 3600 * 1000; // 1 hour (3600 seconds)

export class Player {
    constructor(id, username, color) {
        this.id = id;
        this.username = username;
        this.color = color;
        // this.energy = 1; // Start with 1 hour of energy
        this.energyTimestamps = []; // Use timestamps for cell tracking

        // Position in grid coordinates
        this.x = Math.floor(Math.random() * 640);
        this.y = Math.floor(Math.random() * 480);

        // For smooth movement
        this.pixelX = this.x;
        this.pixelY = this.y;
        this.targetX = this.x;
        this.targetY = this.y;

        this.speed = 1; // tiles per second
        this.moveCooldown = 2 + Math.random() * 5; // time to wait before picking new target
        this.lastEnergyLogTime = 0; // Initialize log throttle
    }

    addEnergy() {
        // Add current timestamp for a new energy cell
        this.energyTimestamps.push(Date.now());
    }

    isPowered() {
        return this.energyTimestamps.length > 0;
    }

    getState() {
        return {
            id: this.id,
            username: this.username,
            color: this.color,
            energyTimestamps: this.energyTimestamps, // Store timestamps
            pixelX: this.pixelX,
            pixelY: this.pixelY
        };
    }

    loadState(state) {
        if (state.pixelX !== undefined && state.pixelY !== undefined) {
            this.pixelX = state.pixelX;
            this.pixelY = state.pixelY;
            // Set target position to the loaded smooth position so movement continues from there
            this.targetX = state.pixelX;
            this.targetY = state.pixelY;
            
            this.x = Math.round(state.pixelX);
            this.y = Math.round(state.pixelY);
        }
        
        // Load energyTimestamps
        if (state.energyTimestamps && Array.isArray(state.energyTimestamps)) {
            this.energyTimestamps = state.energyTimestamps;
            // Ensure oldest is first for draining
            this.energyTimestamps.sort((a, b) => a - b);
        } else if (state.energy !== undefined && state.energy > 0) {
            // Handle conversion from legacy 'energy' count to timestamps.
            this.energyTimestamps = [];
            for (let i = 0; i < state.energy; i++) {
                // Assume legacy energy starts draining immediately upon load
                this.energyTimestamps.push(Date.now());
            }
        }
        
        this.username = state.username || this.username;
        this.color = state.color || this.color;
    }

    update(deltaTime, mapWidth, mapHeight) {
        
        if (this.isPowered()) {
            // 1. Energy Draining Logic
            const now = Date.now();
            const oldestTimestamp = this.energyTimestamps[0];
            const expirationTime = oldestTimestamp + ENERGY_DURATION_MS;
            
            const remainingMS = expirationTime - now;

            // Console log remaining time for the current draining energy cell (as requested)
            if (remainingMS > 0) {
                // Throttle logging to once per minute (60,000 ms)
                const LOG_INTERVAL = 60000;
                
                if (now - this.lastEnergyLogTime > LOG_INTERVAL) {
                    const remainingSeconds = Math.ceil(remainingMS / 1000);
                    // Logging energy info with timer info
                    console.log(`[Energy Drain Status] Player ${this.username}: Time left on current cell: ${remainingSeconds}s. Total cells: ${this.energyTimestamps.length}`);
                    this.lastEnergyLogTime = now;
                }
            }

            if (remainingMS <= 0) {
                // Energy cell expired
                this.energyTimestamps.shift();
                console.log(`[Energy Drain] Player ${this.username} consumed one energy cell. Remaining cells: ${this.energyTimestamps.length}`);
                
                // If this was the last cell, stop movement logic execution for this frame
                if (!this.isPowered()) {
                    return; 
                }
            }

            // 2. Movement Logic (Only continues if powered)
            this.moveCooldown -= deltaTime;
            if (this.moveCooldown <= 0) {
                this.pickNewTarget(mapWidth, mapHeight);
                this.moveCooldown = 2 + Math.random() * 5; // reset cooldown
            }

            // Move towards target
            const dx = this.targetX - this.pixelX;
            const dy = this.targetY - this.pixelY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0.01) {
                const moveAmount = this.speed * deltaTime;
                this.pixelX += (dx / dist) * moveAmount;
                this.pixelY += (dy / dist) * moveAmount;
            } else {
                this.pixelX = this.targetX;
                this.pixelY = this.targetY;
            }
        }
    }

    pickNewTarget(mapWidth, mapHeight) {
        const dir = Math.floor(Math.random() * 4);
        let newX = this.targetX;
        let newY = this.targetY;

        switch (dir) {
            case 0: newY--; break; // Up
            case 1: newY++; break; // Down
            case 2: newX--; break; // Left
            case 3: newX++; break; // Right
        }

        // Clamp to map bounds
        this.targetX = Math.max(0, Math.min(mapWidth - 1, newX));
        this.targetY = Math.max(0, Math.min(mapHeight - 1, newY));
    }

    render(ctx, tileSize, cameraX, cameraY) {
        const radius = tileSize / 2.5;
        // Apply camera offset
        const screenX = (this.pixelX * tileSize + tileSize / 2) - cameraX;
        const screenY = (this.pixelY * tileSize + tileSize / 2) - cameraY;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Nametag Label
        // Use a minimum font size of 12px for readability, scaling up with tileSize
        const fontSize = Math.max(12, tileSize * 0.6); 
        ctx.font = `${fontSize}px Arial, sans-serif`;
        
        // Setup for text rendering
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        // Text color and stroke for visibility against any background
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 3; // Thicker stroke for visibility

        const tagY = screenY - radius - 5; // Position slightly above the player circle
        
        ctx.strokeText(this.username, screenX, tagY);
        ctx.fillText(this.username, screenX, tagY);
    }
}