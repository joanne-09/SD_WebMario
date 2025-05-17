const {ccclass, property} = cc._decorator;

@ccclass("Floor")
export default class Floor extends cc.Component {
    @property(cc.Node)
    player: cc.Node = null;

    private onGround(collider: cc.PhysicsCollider){
        return collider.tag === 1 || collider.node.name === "Player";
    }

    // Life cycle methods
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        const normal = contact.getWorldManifold().normal;
        if (this.onGround(otherCollider)) {
            if(normal.y > 0.9){
                this.player.getComponent("Player").isOnGround = true;
                console.log("Player is on the ground");
            }else{
                console.log("Player is on the ground but not on the floor");
            }
        }
    }

    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (this.onGround(otherCollider)) {
            this.player.getComponent("Player").isOnGround = false;
            console.log("Player is not on the ground anymore");
        }
    }
}