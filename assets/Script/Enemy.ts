const {ccclass, property} = cc._decorator;

@ccclass("Enemy")
export default class Enemy extends cc.Component {
    @property(cc.Float)
    moveSpeed: number = 100;
    @property(cc.Float)
    moveRange: number = 200;

    private initial: number = 0;
    private minX: number = 0;
    private maxX: number = 0;

    private moveDirection: number = 1; // 1 for right, -1 for left
    private rigidBody: cc.RigidBody = null;

    private turnAround() {
        this.moveDirection *= -1;
        this.node.scaleX *= -1;
    }

    private isFloor(collider: cc.PhysicsCollider) {
        return collider.tag === 1 || collider.node.name === "Background";
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
    }

    update(dt: number){
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
        }
    }
}