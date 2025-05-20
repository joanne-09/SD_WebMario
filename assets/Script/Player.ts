const { ccclass, property } = cc._decorator;

enum PlayerDirection {
    NONE,
    LEFT,
    RIGHT,
}

enum PlayerState {
    STALL,
    DIE,
    SMALL,
    BIG,
}

@ccclass("Player")
export default class Player extends cc.Component {
    @property(cc.Float)
    moveSpeed: number = 200;
    @property(cc.Float)
    jumpSpeed: number = 300;
    @property(cc.Boolean)
    isOnGround: boolean = false;
    @property(cc.Boolean)
    isJumping: boolean = false;

    @property(cc.Animation)
    animation: cc.Animation = null;
    private currentAnimation: string = "";

    private rigidBody: cc.RigidBody = null;
    private moveDirection: PlayerDirection = PlayerDirection.NONE;
    private playerState: PlayerState = PlayerState.SMALL;

    private moveLock: boolean = false;
    private groundCnt: number = 0;

    playAnimation(animationName: string) {
        if(this.playerState === PlayerState.STALL) {
            this.animation.stop();
            return;
        }

        if(this.currentAnimation !== animationName) {
            this.animation.play(animationName);
            this.currentAnimation = animationName;
        }
    }

    playerMove(moveDirection: PlayerDirection) {
        this.moveDirection = moveDirection;
    }

    private playerUpdate() {
        // Horizontal movement
        let velocity = this.rigidBody.linearVelocity;
        if (this.moveDirection === PlayerDirection.LEFT) {
            if (this.moveLock){
                velocity.x = 0;
            }else{
                velocity.x = -this.moveSpeed;
            }
            this.node.scaleX = -Math.abs(this.node.scaleX);
        } else if (this.moveDirection === PlayerDirection.RIGHT) {
            if(this.moveLock){
                velocity.x = 0;
            }else{
                velocity.x = this.moveSpeed;
            }
            this.node.scaleX = Math.abs(this.node.scaleX);
        } else {
            this.moveLock = false;
            velocity.x = 0;
        }

        this.rigidBody.linearVelocity = velocity;

        // Vertical movement
        if (this.isJumping && this.isOnGround) {
            this.rigidBody.linearVelocity = cc.v2(velocity.x, this.jumpSpeed);
            this.isOnGround = false;
            this.isJumping = false;
            console.log("Player jump");
        }
    }

    private playerDie(){
        this.playerState = PlayerState.DIE;
        this.rigidBody.enabled = false;
        this.getComponent(cc.PhysicsCollider).enabled = false;

        const fallDist = -530 - (this.node.y + 100);
        const falltime = Math.abs(fallDist) / 1000;

        cc.tween(this.node)
            .by(0.5, {position: cc.v3(0, 100, 0)}, {easing: 'sineOut'})
            .delay(0.1)
            .by(falltime, {position: cc.v3(0, fallDist, 0)}, {easing: 'sineIn'})
            .call(() => {
                this.getManager().removeLife(1);
            })
            .start();
    }

    private getManager() {
        return cc.find("Canvas").getComponent("GameManager");
    }

    private onGround(collider: cc.PhysicsCollider) {
        // if standing on Question box or Background
        return collider.tag === 10 || collider.node.name === "Background";
    }

    private isEnemy(collider: cc.PhysicsCollider) {
        return collider.tag === 2 || collider.node.name === "Enemy";
    }

    private isFlower(collider: cc.PhysicsCollider, normal: cc.Vec2): boolean {
        if(collider.node.name === "EnemyFlower"){
            const flower = collider.node.getComponent("EnemyFlower");
            if(flower.moveDirection === 0 && normal.y < -0.7){
                // flower is moving up and contact from above
                return true;
            }else if(flower.moveDirection === 1 && normal.x > 0.7){
                // flower is moving down and contact from right
                return true;
            }else if(flower.moveDirection === 2 && normal.x > 0.7){
                // flower is moving left and contact from right
                return true;
            }else if(flower.moveDirection === 3 && normal.x < -0.7){
                // flower is moving right and contact from left
                return true;
            }
        }
        return false;
    }

    private isMushroom(collider: cc.PhysicsCollider) {
        return collider.tag === 4 || collider.node.name === "QuestionMushroom";
    }

    private isWinner(collider: cc.PhysicsCollider) {
        return collider.node.name === "Winner";
    }

    private playerStall() {
        this.playerState = PlayerState.STALL;
        cc.tween(this.node)
            .to(0.2, {opacity: 128})
            .to(0.2, {opacity: 255})
            .to(0.2, {opacity: 128})
            .to(0.2, {opacity: 255})
            .to(0.2, {opacity: 128})
            .to(0.2, {opacity: 255})
            .start();
    }

    private becomeBig() {
        if(this.playerState === PlayerState.SMALL) {
            this.playerStall();

            this.scheduleOnce(() => {
                this.playerState = PlayerState.BIG;
                this.node.getComponent(cc.PhysicsBoxCollider).size = cc.size(14, 27);
                this.node.getComponent(cc.PhysicsBoxCollider).apply();
            }, 1.0);
            console.log("Player become big");
        }else if(this.playerState === PlayerState.BIG) {
            console.log("Player is already big");
            this.getManager().addScore(1000);
        }
    }

    private becomeSmall() {
        if(this.playerState === PlayerState.BIG) {
            this.playerStall();

            this.scheduleOnce(() => {
                this.playerState = PlayerState.SMALL;
                this.node.getComponent(cc.PhysicsBoxCollider).size = cc.size(13, 16);
                this.node.getComponent(cc.PhysicsBoxCollider).apply();
            }, 1.0);
            console.log("Player become small");
        }else if(this.playerState === PlayerState.SMALL) {
            console.log("Player is already small");
        }
    }

    checkOutOfBound() {
        if (this.node.y <= -500 || this.node.y >= 500) {
            this.getManager().removeLife(1); // do not need animation
            console.log("Player out of bounds");
        }
    }

    affectByEnemy() {
        if(this.playerState === PlayerState.STALL || this.playerState === PlayerState.DIE) return;

        if(this.playerState === PlayerState.SMALL){
            this.playerDie();
        }else{
            this.becomeSmall();
        }
    }

    // Life cycle methods
    onLoad() {
        this.rigidBody = this.node.getComponent(cc.RigidBody);
        if (!this.rigidBody) {
            cc.error("Player component must have a RigidBody component.");
            this.enabled = false;
            return;
        }
        this.rigidBody.fixedRotation = true;

        this.animation = this.getComponent(cc.Animation);
        if (!this.animation) {
            cc.error("Player component must have an Animation component.");
            this.enabled = false;
            return;
        }
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if(this.playerState === PlayerState.DIE) return;

        const normal = contact.getWorldManifold().normal;
        if (this.onGround(otherCollider)) {
            if (normal.y < -0.7) {
                this.groundCnt++;
                this.isOnGround = true;
                console.log("Player is on the ground");
            } else {
                console.log("Player is on the ground but not on the floor");
            }
        }else if(this.isEnemy(otherCollider)){
            const enemy = otherCollider.node.getComponent("Enemy");
            if(normal.y < -0.7 && enemy){
                console.log("Player hit enemy from above");
                if(!enemy.hasBeenHit){
                    enemy.getHit();
                    this.getManager().addScore(500);
                }
            }else{
                // life is deducted or it has already been hit
                console.log("Player hit enemy from other sides");
                if(!enemy.hasBeenHit) this.affectByEnemy();
            }
        }else if(this.isFlower(otherCollider, normal)){
            console.log("Player hit flower from above");
            this.affectByEnemy();
        }else if(this.isMushroom(otherCollider)){
            this.becomeBig();
            otherCollider.node.destroy();
        }else if(this.isWinner(otherCollider)){
            console.log("Player hit winner");
            this.getManager().handleGameWin();
        }
    }

    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if(this.playerState === PlayerState.DIE) return;

        if (this.onGround(otherCollider)) {
            this.groundCnt--;
            if(this.groundCnt <= 0) {
                this.isOnGround = false;
                this.groundCnt = 0;
                console.log("Player is not on the ground anymore");
            }else{
                console.log("Player is still on the ground, but different collider");
            }
        }
    }

    update(dt: number) {
        if (!this.rigidBody) return;

        if(this.playerState !== PlayerState.STALL && this.playerState !== PlayerState.DIE) {
            this.checkOutOfBound();
            this.playerUpdate();
        }else{
            this.rigidBody.linearVelocity = cc.v2(0, 0);
        }

        // Animation
        if(this.playerState === PlayerState.DIE){
            this.playAnimation("Die");
        }else if(this.playerState === PlayerState.SMALL){
            if(!this.isOnGround){
                this.playAnimation("Jump");
            }else if (this.moveDirection === PlayerDirection.LEFT) {
                this.playAnimation("Run");
            } else if (this.moveDirection === PlayerDirection.RIGHT) {
                this.playAnimation("Run");
            } else {
                this.playAnimation("Idle");
            }
        }else if(this.playerState === PlayerState.BIG){
            if(!this.isOnGround){
                this.playAnimation("BigJump");
            }else if (this.moveDirection === PlayerDirection.LEFT) {
                this.playAnimation("BigRun");
            } else if (this.moveDirection === PlayerDirection.RIGHT) {
                this.playAnimation("BigRun");
            } else {
                this.playAnimation("BigIdle");
            }
        }
    }
}