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

    playAnimation(animationName: string) {
        if(this.currentAnimation !== animationName) {
            this.animation.play(animationName);
            this.currentAnimation = animationName;
        }
    }

    playerMove(moveDirection: PlayerDirection) {
        this.moveDirection = moveDirection;
    }

    // private getManager() {
    //     return cc.find("Canvas").getComponent("PlayerManager");
    // }

    // private resetPlayer() {
    //     const visibleSize = cc.view.getVisibleSize();
    //     const halfWidth = visibleSize.width / 2;

    //     if(this.node.x < 0 && this.node.x < -halfWidth) {
    //         this.node.setPosition(this.node.x + 30, -35);
    //     }else if(this.node.x > 0 && this.node.x > halfWidth) {
    //         this.node.setPosition(this.node.x - 30, -35);
    //     }else{
    //         this.node.setPosition(this.node.x, -35);
    //     }

    //     if(this.rigidBody){
    //         this.rigidBody.linearVelocity = cc.v2(0, 0);
    //         this.rigidBody.angularVelocity = 0;
    //     }
    // }

    // checkOutOfBound() {
    //     const visibleSize = cc.view.getVisibleSize();
    //     const halfWidth = visibleSize.width / 2;
    //     const halfHeight = visibleSize.height / 2;

    //     if (this.node.x < -halfWidth || this.node.x > halfWidth || this.node.y < -halfHeight || this.node.y > halfHeight) {
    //         this.resetPlayer();
    //         this.getManager().removeLife(1);
    //         console.log("Player out of bounds");
    //     }
    // }

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

    update(dt: number) {
        if (!this.rigidBody) return;

        // this.checkOutOfBound();

        // Horizontal movement
        let velocity = this.rigidBody.linearVelocity;
        if (this.moveDirection === PlayerDirection.LEFT) {
            velocity.x = -this.moveSpeed;
            this.node.scaleX = -1;
        } else if (this.moveDirection === PlayerDirection.RIGHT) {
            velocity.x = this.moveSpeed;
            this.node.scaleX = 1;
        } else {
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