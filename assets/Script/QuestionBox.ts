const {ccclass, property} = cc._decorator;

enum BoxType {
    NORMAL,
    SPECIAL,
    RANDOM,
}

@ccclass("QuestionBox")
export default class QuestionBox extends cc.Component {
    @property(cc.AudioClip)
    mushroomBGM: cc.AudioClip = null;

    @property(cc.Animation)
    animation: cc.Animation = null;
    @property(cc.SpriteFrame)
    emptyBox: cc.SpriteFrame = null;
    @property(cc.Float)
    boxType: BoxType = BoxType.NORMAL;

    @property(cc.Prefab)
    questionMoney: cc.Prefab = null;
    @property(cc.Prefab)
    questionMushroom: cc.Prefab = null;
    @property(cc.Prefab)
    questionRandom: cc.Prefab = null;

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
        const manager = cc.find("Canvas").getComponent("GameManager");
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

    private spawnMushroom(isRandom: boolean = false) {
        if(!this.questionMushroom || !this.questionRandom) return;
        cc.audioEngine.playEffect(this.mushroomBGM, false);

        const mushroomPrefab = isRandom ? this.questionRandom : this.questionMushroom;
        const mushroomNode = cc.instantiate(mushroomPrefab);
        const mushroomRigidBody = mushroomNode.getComponent(cc.RigidBody);
        this.node.parent.addChild(mushroomNode);

        // Initialize the speed of the node
        mushroomRigidBody.linearDamping = 0;
        mushroomRigidBody.gravityScale = 0;
        mushroomRigidBody.linearVelocity = cc.v2(0, 0);

        const height = this.node.height / 2 + mushroomNode.height / 2;
        mushroomNode.setPosition(this.node.x, this.node.y + 5);

        cc.tween(mushroomNode)
            .by(0.4, {position: cc.v3(0, height, 0)}, {easing: 'cubicOut'})
            .delay(1.0)
            .call(() => {
                mushroomRigidBody.gravityScale = 1;
                mushroomRigidBody.linearVelocity = cc.v2(250, 0);
                mushroomNode.getComponent(cc.PhysicsCollider).friction = 0;
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
        if(otherCollider.node.name === "Player" && normal.y < -0.7){
            this.isEmpty = true;
            this.playAnimation();

            if(this.boxType === BoxType.SPECIAL){
                this.spawnMushroom();
                console.log("Player hit the special question box");
            }else if(this.boxType === BoxType.RANDOM){
                this.spawnMushroom(true);
                console.log("Player hit the random question box");
            }else{
                this.getManager().addScore(100);
                this.getManager().addMoney(this.boxMoney);
                this.spawnMoney();
                console.log("Player hit the normal question box");
            }
        }else{
            console.log("Player hit the question box but not from below");
        }
    }
}