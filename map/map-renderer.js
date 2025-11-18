// This file was extracted from map.js
import { TILE_TYPE } from '../map-tile-types.js';

export class MapRenderer {
    constructor(map) {
        this.map = map;
    }

    getTallObjects(drawStartX, drawEndX, drawStartY, drawEndY) {
        const tallObjects = [];
        for (let j = drawStartY; j < drawEndY; j++) {
            for (let i = drawStartX; i < drawEndX; i++) {
                if (j < 0 || j >= this.map.height || i < 0 || i >= this.map.width) continue;
                const tileType = this.map.grid[j] ? this.map.grid[j][i] : TILE_TYPE.GRASS;
                if (tileType === TILE_TYPE.TREE) {
                    tallObjects.push({
                        type: 'tree',
                        x: i,
                        y: j,
                        image: this.map.treeTile,
                    });
                }
            }
        }
        return tallObjects;
    }

    renderBase(ctx, cameraX, cameraY, drawStartX, drawEndX, drawStartY, drawEndY) {
        if (!this.map.grassTile || !this.map.grassTile.complete) return;

        ctx.save();
        
        const ts = this.map.tileSize;

        // Apply translation to keep drawing coordinates as integers, preventing seams.
        ctx.translate(Math.round(-cameraX), Math.round(-cameraY));

        // Iterate and draw ground-level tiles
        for (let j = drawStartY; j < drawEndY; j++) {
            for (let i = drawStartX; i < drawEndX; i++) {
                if (j < 0 || j >= this.map.height || i < 0 || i >= this.map.width) continue;
                // Draw base grass tile
                ctx.drawImage(this.map.grassTile, i * ts, j * ts, ts, ts);

                // Draw ground objects
                const tileType = this.map.grid[j] ? this.map.grid[j][i] : TILE_TYPE.GRASS;
                let objectImage = null;

                switch (tileType) {
                    case TILE_TYPE.LOGS: objectImage = this.map.logsTile; break;
                    case TILE_TYPE.BUSHES: objectImage = this.map.bushesTile; break;
                    case TILE_TYPE.FLOWER_PATCH: objectImage = this.map.flowerPatchTile; break;
                }

                if (objectImage && objectImage.complete) {
                    ctx.drawImage(objectImage, i * ts, j * ts, ts, ts);
                }
            }
        }
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Subtle grid lines
        ctx.lineWidth = 1;

        // Draw visible vertical lines
        for (let i = drawStartX; i <= drawEndX; i++) {
            if (i > this.map.width) continue; 
            const x = i * ts;
            ctx.beginPath();
            ctx.moveTo(x, drawStartY * ts);
            ctx.lineTo(x, drawEndY * ts);
            ctx.stroke();
        }

        // Draw visible horizontal lines
        for (let j = drawStartY; j <= drawEndY; j++) {
            if (j > this.map.height) continue;
            const y = j * ts;
            ctx.beginPath();
            ctx.moveTo(drawStartX * ts, y);
            ctx.lineTo(drawEndX * ts, y);
            ctx.stroke();
        }

        ctx.restore();
    }
}