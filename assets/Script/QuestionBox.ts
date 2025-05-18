const {ccclass, property} = cc._decorator;

@ccclass("QuestionBox")
export default class QuestionBox extends cc.Component {
    @property(cc.Animation)
    animation: cc.Animation = null;
    @property(cc.SpriteFrame)
    emptyBox: cc.SpriteFrame = null;
    @property(cc.Boolean)
    specialBox: boolean = false;

    @property(cc.Prefab)
    questionMoney: cc.Prefab = null;
    @property(cc.Prefab)
    questionMushroom: cc.Prefab = null;

    private readonly boxMoney: number = 10;

    private isEmpty: boolean = false;

    private playAnimation(){
        if(!this.isEmpty){
            this.animation.play("QuestionBox");
        }else{
            this.node.getComponent(cc.Sprite).spriteFrame = this.emptyBox;
            this.animation.stop();
            console.log("Question box is empty");
        }
    }

    private getManager(){
        const manager = cc.find("Canvas").getComponent("PlayerManager");
        if(!manager){
            cc.error("PlayerManager not found");
            return null;
        }
        return manager;
    }

    private checkAdjacentBox(){
        let count = 0;

        for(const sibling of this.node.parent.children){
            if(sibling === this.node) continue;

            const siblingNode = sibling.getComponent(QuestionBox);
            if(siblingNode.node.y === this.node.y && siblingNode.node.x < this.node.x){
                count++;
            }
        }
        return count;
    }

    private spawnMoney() {
        if(!this.questionMoney) return;

        const moneyNode = cc.instantiate(this.questionMoney);
        this.node.parent.addChild(moneyNode);

        const yOffset = this.node.height / 2;
        moneyNode.setPosition(this.node.x, this.node.y + yOffset);

        cc.tween(moneyNode)
            .by(0.3, {position: cc.v3(0, 30, 0)}, {easing: 'cubicOut'})
            .delay(0.1)
            .by(0.3, {position: cc.v3(0, -30 + yOffset, 0)}, {easing: 'cubicIn'})
            .call(() => {
                moneyNode.destroy();
            })
            .start();

        console.log("Spawned money");
    }

    private spawnMushroom() {
        if(!this.questionMushroom) return;

        const cnt = this.checkAdjacentBox();
        const moveX = (cnt+1) * this.node.width + 10;
        const moveTime = moveX / 50;

        const mushroomNode = cc.instantiate(this.questionMushroom);
        const mushroomRigidBody = mushroomNode.getComponent(cc.RigidBody);
        this.node.parent.addChild(mushroomNode);

        // Initialize the speed of the node
        mushroomRigidBody.gravityScale = 0;
        mushroomRigidBody.linearVelocity = cc.v2(0, 0);

        const height = this.node.height / 2 + mushroomNode.height / 2;
        mushroomNode.setPosition(this.node.x, this.node.y + 5);

        cc.tween(mushroomNode)
            .by(0.4, {position: cc.v3(0, height, 0)}, {easing: 'cubicOut'})
            .delay(1.0)
            .by(moveTime, {position: cc.v3(-moveX, 0, 0)}, {easing: 'cubicOut'})
            .call(() => {
                mushroomRigidBody.gravityScale = 1;
                mushroomRigidBody.linearVelocity = cc.v2(0, -100);
            })
            .start();

        console.log("Spawned mushroom");
    }

    // Life cycle methods
    onLoad() {
        this.playAnimation();
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if(this.isEmpty) return;

        const normal = contact.getWorldManifold().normal;
        if(otherCollider.node.name === "Player" && normal.y < -0.9){
            this.isEmpty = true;
            this.playAnimation();

            if(this.specialBox){
                this.spawnMushroom();
                console.log("Player hit the special question box");
            }else{
                this.getManager().addMoney(this.boxMoney);
                this.spawnMoney();
                console.log("Player hit the normal question box");
            }
        }else{
            console.log("Player hit the question box but not from below");
        }
    }
}