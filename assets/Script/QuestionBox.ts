const {ccclass, property} = cc._decorator;

@ccclass("QuestionBox")
export default class QuestionBox extends cc.Component {
    @property(cc.Animation)
    animation: cc.Animation = null;
    @property(cc.SpriteFrame)
    emptyBox: cc.SpriteFrame = null;

    private boxMoney: number = 10;

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
            console.log("Player hit the question box");
        }else{
            console.log("Player hit the question box but not from above");
        }
    }
}