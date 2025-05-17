const {ccclass, property} = cc._decorator;

@ccclass("CameraFollow")
export default class CameraFollow extends cc.Component {
    @property(cc.Node)
    player: cc.Node = null;
    
    @property(cc.Node)
    background: cc.Node = null;
    
    @property
    smoothFollow: number = 0.1;
    
    // Camera bounds
    private minX: number = 0;
    private maxX: number = 0;
    private minY: number = 0;
    private maxY: number = 0;
    
    onLoad() {
        if (!this.player) {
            cc.warn("CameraFollow: Player is not assigned!");
            return;
        }
        
        if (!this.background) {
            cc.warn("CameraFollow: Background is not assigned!");
            return;
        }
        
        // Calculate the camera bounds
        this.calculateBounds();
    }
    
    calculateBounds() {
        // Get the viewport size
        const visibleSize = cc.view.getVisibleSize();
        const halfWidth = visibleSize.width / 2;
        const halfHeight = visibleSize.height / 2;
        
        // Adjust bounds based on background size
        this.minX = this.background.x - (this.background.width / 2) + halfWidth;
        this.maxX = this.background.x + (this.background.width / 2) - halfWidth;
        this.minY = this.background.y - (this.background.height / 2) + halfHeight;
        this.maxY = this.background.y + (this.background.height / 2) - halfHeight;
    }
    
    lateUpdate(dt) {
        if (!this.player) return;
        
        // Get target position (player position)
        let targetX = this.player.x;
        let targetY = this.player.y;
        
        // Clamp position within bounds
        targetX = cc.misc.clampf(targetX, this.minX, this.maxX);
        targetY = cc.misc.clampf(targetY, this.minY, this.maxY);
        
        // Smooth follow
        const currentX = cc.misc.lerp(this.node.x, targetX, this.smoothFollow);
        const currentY = cc.misc.lerp(this.node.y, targetY, this.smoothFollow);
        
        // Apply position to camera
        this.node.setPosition(currentX, currentY);
    }
}