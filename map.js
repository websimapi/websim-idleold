export class Map {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.grassTile = null;
        this.pattern = null;
        this.viewportWidth = 0;
        this.viewportHeight = 0;
    }

    setViewport(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;
    }

    setTileSize(size) {
        this.tileSize = size;
    }

    async loadAssets() {
        return new Promise((resolve) => {
            this.grassTile = new Image();
            this.grassTile.src = './grass_tile.png';
            this.grassTile.onload = () => {
                // Create pattern after image is loaded
                const tempCtx = document.createElement('canvas').getContext('2d');
                this.pattern = tempCtx.createPattern(this.grassTile, 'repeat');
                resolve();
            };
        });
    }

    render(ctx, cameraX, cameraY) {
        if (!this.pattern) return;

        ctx.save();
        // Translate to camera position
        // This is a simple camera that just shows the top-left of the map
        ctx.translate(-cameraX, -cameraY);

        ctx.fillStyle = this.pattern;
        
        // Calculate the total pixel size of the map
        const mapPixelWidth = this.width * this.tileSize;
        const mapPixelHeight = this.height * this.tileSize;

        ctx.fillRect(0, 0, mapPixelWidth, mapPixelHeight);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Subtle grid lines
        ctx.lineWidth = 1;

        // Vertical lines
        for (let i = 0; i <= this.width; i++) {
            const x = i * this.tileSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, mapPixelHeight);
            ctx.stroke();
        }

        // Horizontal lines
        for (let j = 0; j <= this.height; j++) {
            const y = j * this.tileSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(mapPixelWidth, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}