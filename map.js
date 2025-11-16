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
        
        // We only need to draw what's visible in the viewport
        const renderWidth = Math.min(this.width * this.tileSize, this.viewportWidth);
        const renderHeight = Math.min(this.height * this.tileSize, this.viewportHeight);

        ctx.fillRect(cameraX, cameraY, renderWidth, renderHeight);
        ctx.restore();
    }
}