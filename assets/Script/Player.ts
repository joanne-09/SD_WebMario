const { ccclass, property } = cc._decorator;

enum PlayerDirection {
    NONE,
    LEFT,
    RIGHT,
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

    private moveLock: boolean = false;

    playAnimation(animationName: string) {
        if(this.currentAnimation !== animationName) {
            this.animation.play(animationName);
            this.currentAnimation = animationName;
        }
    }

    playerMove(moveDirection: PlayerDirection) {
        this.moveDirection = moveDirection;
    }

    private getManager() {
        return cc.find("Canvas").getComponent("PlayerManager");
    }

    private resetPlayer() {
        if(this.node.x <= -480) {
            this.node.setPosition(this.node.x + 30, -35);
        }else if(this.node.x >= (3200-480)) {
            this.node.setPosition(this.node.x - 30, -35);
        }else{
            this.node.setPosition(this.node.x, -35);
        }

        if(this.rigidBody){
            this.rigidBody.linearVelocity = cc.v2(0, 0);
            this.rigidBody.angularVelocity = 0;
        }
        this.moveLock = true;
    }

    private onGround(collider: cc.PhysicsCollider) {
        return collider.tag === 1 || collider.node.name === "Background";
    }

    checkOutOfBound() {
        if (this.node.x <= -480 || this.node.x >= (3200-480) || this.node.y <= -400 || this.node.y >= 400) {
            this.resetPlayer();
            this.getManager().removeLife(1);
            console.log("Player out of bounds");
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
        const normal = contact.getWorldManifold().normal;
        if (this.onGround(otherCollider)) {
            if (normal.y < -0.9) {
                this.isOnGround = true;
                console.log("Player is on the ground");
            } else {
                console.log("Player is on the ground but not on the floor");
            }
        }
    }

    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (this.onGround(otherCollider)) {
            this.isOnGround = false;
            console.log("Player is not on the ground anymore");
        }
    }

    update(dt: number) {
        if (!this.rigidBody) return;

        this.checkOutOfBound();

        // Horizontal movement
        let velocity = this.rigidBody.linearVelocity;
        if (this.moveDirection === PlayerDirection.LEFT) {
            if (this.moveLock){
                velocity.x = 0;
            }else{
                velocity.x = -this.moveSpeed;
            }
            this.node.scaleX = -1;
        } else if (this.moveDirection === PlayerDirection.RIGHT) {
            if(this.moveLock){
                velocity.x = 0;
            }else{
                velocity.x = this.moveSpeed;
            }
            this.node.scaleX = 1;
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

        // Animation
        if(!this.isOnGround){
            this.playAnimation("Jump");
        }else if (this.moveDirection === PlayerDirection.LEFT) {
            this.playAnimation("Run");
        } else if (this.moveDirection === PlayerDirection.RIGHT) {
            this.playAnimation("Run");
        } else {
            this.playAnimation("Idle");
        }
    }
}