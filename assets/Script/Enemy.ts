const {ccclass, property} = cc._decorator;

@ccclass("Enemy")
export default class Enemy extends cc.Component {
    @property(cc.Float)
    moveSpeed: number = 100;
    @property(cc.Float)
    moveRange: number = 200;

    @property(cc.Animation)
    animation: cc.Animation = null;

    @property(cc.Boolean)
    hasBeenHit: boolean = false;

    private initial: number = 0;
    private minX: number = 0;
    private maxX: number = 0;

    private moveDirection: number = 1; // 1 for right, -1 for left
    private rigidBody: cc.RigidBody = null;

    private dieTimer: boolean = false;

    private playAnimation(){
        if(!this.hasBeenHit){
            this.animation.play("Turtle");
        }else{
            this.animation.play("TurtleHit");
        }
    }

    private turnAround() {
        this.moveDirection *= -1;
        this.node.scaleX *= -1;
    }

    private isFloor(collider: cc.PhysicsCollider) {
        return collider.tag === 1 || collider.node.name === "Background";
    }

    private isPlayer(collider: cc.PhysicsCollider){
        return collider.node.name === "Player";
    }

    private enemyDie() {
        this.rigidBody.linearVelocity = cc.v2(0, 0);
        this.rigidBody.enabled = false;
        this.getComponent(cc.PhysicsCollider).enabled = false;

        const fallDist = -530 - this.node.y - 50;
        const fallTime = Math.abs(fallDist) / 1000;

        cc.tween(this.node)
            .by(0.3, {position: cc.v3(0, 50, 0)}, {easing: 'cubicOut'})
            .delay(0.1)
            .by(fallTime, {position: cc.v3(0, fallDist, 0)}, {easing: 'cubicIn'})
            .call(() => {
                this.node.destroy();
            })
            .start();
    }

    public getHit() {
        if(!this.hasBeenHit){
            this.hasBeenHit = true;
            this.playAnimation();

            this.moveDirection = -1;
            this.node.scaleX = 1;
            this.rigidBody.gravityScale = 1;

            if(!this.dieTimer){
                console.log("Schedule die timer");
                this.dieTimer = true;
                this.scheduleOnce(
                    this.enemyDie,
                    3.0
                );
            }
        }
    }

    // Life cycle methods
    onLoad() {
        this.initial = this.node.x;
        this.minX = this.initial - this.moveRange;
        this.maxX = this.initial + this.moveRange;

        this.rigidBody = this.node.getComponent(cc.RigidBody);

        if(this.moveDirection === 1) {
            this.node.scaleX = -1;
        }else{
            this.node.scaleX = 1;
        }

        this.playAnimation();
    }

    update(dt: number){
        if(this.hasBeenHit && this.dieTimer){
            if(this.node.y <= -530){
                this.unschedule(this.enemyDie);
                this.dieTimer = false;
                this.node.destroy();
            }
            this.rigidBody.linearVelocity = cc.v2(300 * this.moveDirection, this.rigidBody.linearVelocity.y);
            return;
        }

        this.rigidBody.linearVelocity = cc.v2(this.moveSpeed * this.moveDirection, this.rigidBody.linearVelocity.y);

        if(this.moveDirection === 1 && this.node.x >= this.maxX) {
            this.turnAround();
            this.node.x = this.maxX;
        }else if(this.moveDirection === -1 && this.node.x <= this.minX) {
            this.turnAround();
            this.node.x = this.minX;
        }
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if(this.isFloor(otherCollider)) {
            const normal = contact.getWorldManifold().normal;
            if(this.moveDirection === 1 && normal.x > 0.7){
                console.log("Enemy hit wall on its right.");
                this.turnAround();
            }else if(this.moveDirection === -1 && normal.x < -0.7){
                console.log("Enemy hit wall on its left.");
                this.turnAround();
            }
        }else if(this.isPlayer(otherCollider) && this.hasBeenHit){
            const normal = contact.getWorldManifold().normal;
            if((this.moveDirection === 1 && normal.x > 0.7) || (this.moveDirection === -1 && normal.x < -0.7)){
                console.log("Player hit enemy from the side.");
                this.turnAround();
            }
        }
    }
}