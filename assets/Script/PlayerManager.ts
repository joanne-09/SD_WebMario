import Player from "./Player";
const { ccclass, property } = cc._decorator;

enum PlayerDirection {
    NONE,
    LEFT,
    RIGHT,
}

@ccclass("PlayerManager")
export default class PlayerManager extends cc.Component {
    @property(Player)
    player: Player = null;

    @property(cc.Label)
    money: cc.Label = null;
    @property(cc.Label)
    life: cc.Label = null;
    @property(cc.Label)
    score: cc.Label = null;

    private moveDirection: PlayerDirection = PlayerDirection.NONE;

    private moneyCount: number = 0;
    private lifeCount: number = 5;
    private scoreCount: number = 0;

    static sceneGravity(gravity: cc.Vec2 = cc.v2(0, -1280)) {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = gravity;
    }

    public addMoney(amount: number){
        if(amount <= 0) return;
        this.moneyCount += amount;
        console.log(`add money: ${amount}, total money: ${this.moneyCount}`);
        this.updateMoneyUI();
    }

    public removeLife(amount: number){
        this.lifeCount -= amount;
        console.log(`remove life: ${amount}, total life: ${this.lifeCount}`);
        this.handleRestart();
    }

    public addScore(amount: number){
        if(amount <= 0) return;
        this.scoreCount += amount;
        console.log(`add score: ${amount}, total score: ${this.scoreCount}`);
        this.updateScoreUI();
    }

    private updateMoneyUI(){
        if(!this.money) return;
        this.money.string = `${this.moneyCount}`;
        console.log(`Current money: ${this.moneyCount}`);
    }

    private updateLifeUI(){
        if(!this.life) return;
        this.life.string = `${this.lifeCount}`;
        console.log(`Current life: ${this.lifeCount}`);
    }

    private updateScoreUI(){
        if(!this.score) return;
        const paddingScore = String(this.scoreCount).padStart(7, '0');
        this.score.string = paddingScore;
        console.log(`Current score: ${this.scoreCount}`);
    }

    private handleRestart() {
        console.log("Save data and return to GameStart scene");

        cc.sys.localStorage.setItem("playerMoney", this.moneyCount.toString());
        cc.sys.localStorage.setItem("playerLife", this.lifeCount.toString());
        cc.sys.localStorage.setItem("playerScore", this.scoreCount.toString());

        if(this.player && this.player.isValid){
            const playerRigidBody = this.player.getComponent(cc.RigidBody);
            playerRigidBody.linearVelocity = cc.v2(0, 0);
            this.player.enabled = false;
        }

        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        cc.director.loadScene("GameStart");
    }

    private reloadScene() {
        this.moneyCount = parseInt(cc.sys.localStorage.getItem("playerMoney")) || 0;
        this.lifeCount = parseInt(cc.sys.localStorage.getItem("playerLife")) || 5;
        this.scoreCount = parseInt(cc.sys.localStorage.getItem("playerScore")) || 0;
    }

    // Life cycle methods
    onLoad() {
        PlayerManager.sceneGravity();
        this.reloadScene();

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);


    }

    start(){
        // Initialize player
        this.updateMoneyUI();
        this.updateLifeUI();
        this.updateScoreUI();
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.moveDirection = PlayerDirection.LEFT;
                this.player.playerMove(this.moveDirection);
                break;
            case cc.macro.KEY.d:
                this.moveDirection = PlayerDirection.RIGHT;
                this.player.playerMove(this.moveDirection);
                break;
            case cc.macro.KEY.w:
                if (this.player.isOnGround && !this.player.isJumping) {
                    this.player.isJumping = true;
                }
                break;
        }
    }

    onKeyUp(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                if (this.moveDirection === PlayerDirection.LEFT) {
                    this.moveDirection = PlayerDirection.NONE;
                    this.player.playerMove(this.moveDirection);
                }
                break;
            case cc.macro.KEY.d:
                if (this.moveDirection === PlayerDirection.RIGHT) {
                    this.moveDirection = PlayerDirection.NONE;
                    this.player.playerMove(this.moveDirection);
                }
                break;
        }
    }

    // update(dt: number){
    //     if(this.lifeCount <= 0) return;
    // }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }
}