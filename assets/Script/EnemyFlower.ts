const {ccclass, property} = cc._decorator;

enum FlowerDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

@ccclass("EnemyFlower")
export default class EnemyFlower extends cc.Component {
    @property(cc.Float)
    moveDirection: FlowerDirection = FlowerDirection.UP;
    @property(cc.Float)
    downStall: number = 2.0;
    @property(cc.Float)
    upStall: number = 1.5;

    private initialPos: cc.Vec2 = cc.v2(0, 0);
    private moveDistance: number = 0;

    private move: cc.Tween = null;

    moving(){
        this.node.y = this.initialPos.y;
        this.move = cc.tween(this.node)
            .delay(this.upStall)
        
        if(this.moveDirection === FlowerDirection.UP) {
            const lowPos = this.initialPos.y - this.moveDistance;
            this.move
                .to(1, {position: cc.v3(this.node.x, lowPos, this.node.z)}, {easing: 'sineIn'})
        }else if(this.moveDirection === FlowerDirection.LEFT) {
            const lowPos = this.initialPos.x + this.moveDistance;
            this.move
                .to(1, {position: cc.v3(lowPos, this.node.y, this.node.z)}, {easing: 'sineIn'})
        }

        this.move
            .delay(this.downStall)
            .to(1, {position: cc.v3(this.initialPos.x, this.initialPos.y, this.node.z)}, {easing: 'sineOut'})
            .union()
            .repeatForever()
            .start();
    }

    // Life cycle methods
    onLoad() {
        this.initialPos = cc.v2(this.node.x, this.node.y);
        this.moveDistance = this.node.height + 5;
    }

    start() {
        this.moving();
    }

    onDestroy() {
        this.move.stop();
        this.move = null;
    }
}