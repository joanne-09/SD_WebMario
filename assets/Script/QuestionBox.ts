const {ccclass, property} = cc._decorator;

@ccclass("QuestionBox")
export default class QuestionBox extends cc.Component {
    @property(cc.Animation)
    animation: cc.Animation = null;
    @property(cc.SpriteFrame)
    emptyBox: cc.SpriteFrame = null;

    @property(cc.Prefab)
    questionMoney: cc.Prefab = null;

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

    // Life cycle methods
    onLoad() {
        this.playAnimation();
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if(this.isEmpty) return;

        const normal = contact.getWorldManifold().normal;
        if(otherCollider.node.name === "Player" && normal.y < -0.9){
            this.getManager().addMoney(this.boxMoney);
            this.isEmpty = true;
            this.playAnimation();
            this.spawnMoney();
            console.log("Player hit the question box");
        }else{
            console.log("Player hit the question box but not from above");
        }
    }
}