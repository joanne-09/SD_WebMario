import Player from "./Player";
import AccessUser, { UserData } from "./AccessUser";
const { ccclass, property } = cc._decorator;

enum PlayerDirection {
    NONE,
    LEFT,
    RIGHT,
}

@ccclass("GameManager")
export default class GameManager extends cc.Component {
    @property(Player)
    player: Player = null;

    @property(cc.Label)
    money: cc.Label = null;
    @property(cc.Label)
    life: cc.Label = null;
    @property(cc.Label)
    score: cc.Label = null;
    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Prefab)
    levelComplete: cc.Prefab = null;

    private moveDirection: PlayerDirection = PlayerDirection.NONE;

    private moneyCount: number = 0;
    private lifeCount: number = 5;
    private scoreCount: number = 0;
    private timeCount: number = 300;

    static sceneGravity(gravity: cc.Vec2 = cc.v2(0, -1280)) {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = gravity;
    }

    public addMoney(add: number = 0, mul: number = 1){
        this.moneyCount = this.moneyCount * mul + add;
        console.log(`total money: ${this.moneyCount}`);
        this.updateMoneyUI();
    }

    public removeLife(amount: number = 1, isRandom: boolean = false){
        if(isRandom && this.lifeCount > 1){
            this.lifeCount = 1;
        }else{
            this.lifeCount -= amount;
        }
        console.log(`remove life: ${amount}, total life: ${this.lifeCount}`);
        if(this.lifeCount <= 0){
            this.handleGameover();
        }else{
            this.handleRestart();
        }
    }

    public addScore(add: number = 0, mul: number = 1){
        this.scoreCount = this.scoreCount * mul + add;
        console.log(`total score: ${this.scoreCount}`);
        this.updateScoreUI();
    }

    public removeTime(mul: number = 1){
        this.unschedule(this.timer);
        this.timeCount = Math.floor(this.timeCount * mul);
        if(this.timeCount <= 0){
            this.removeLife(1);
            return;
        }

        this.schedule(this.timer, 1.0);
    }

    private timer(){
        if(this.timeCount <= 0){
            this.removeLife(1);
            return;
        }
        this.timeCount -= 1;
        // console.log(`Current time: ${this.timeCount}`);
        this.updateTimeUI();
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

    private updateTimeUI(){
        if(!this.time) return;
        this.time.string = `${this.timeCount}`;
        // console.log(`Current time: ${this.timeCount}`);
    }

    private async useAccessUser(){
        const currentUser = firebase.auth().currentUser.uid;
        const currentUserData = await AccessUser.getUser(currentUser);
        let newLevel = Math.max(currentUserData.userlevel + 1, 2) || 0;
        let newScore = Math.max(this.scoreCount, currentUserData.highscore || 0);

        const data: Partial<UserData> = {
            usermoney: this.moneyCount,
            userlevel: newLevel,
            highscore: newScore,
        }

        await AccessUser.updateUser(currentUser, data);
    }

    public async handleGameWin(){
        console.log("Player wins the game");

        this.addScore(5000);

        this.unschedule(this.timer);
        await this.useAccessUser();

        if(this.player && this.player.isValid){
            const playerRigidBody = this.player.getComponent(cc.RigidBody);
            playerRigidBody.linearVelocity = cc.v2(0, 0);
            this.player.enabled = false;
        }

        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        this.scheduleOnce(
            cc.director.loadScene.bind(cc.director, "Menu"),
            3.0, // Delay for 3 seconds
        );

        // set level complete node to middle of camera
        const levelCompleteNode = cc.instantiate(this.levelComplete);
        this.node.addChild(levelCompleteNode);
        const camera = cc.find("Canvas/Main Camera").getComponent(cc.Camera);
        const target = camera.node.position;
        levelCompleteNode.setPosition(target.x, -600, 0);

        cc.tween(levelCompleteNode)
            .to(0.5, { position: cc.v3(target.x, target.y, 0) }, { easing: 'cubicOut' })
            .start();
    }

    private handleGameover(){
        console.log("Player loses the game");

        this.unschedule(this.timer);
        cc.sys.localStorage.setItem("playerMoney", this.moneyCount.toString());
        cc.sys.localStorage.setItem("playerScore", this.scoreCount.toString());
        cc.sys.localStorage.setItem("playerLife", this.lifeCount.toString());

        if(this.player && this.player.isValid){
            const playerRigidBody = this.player.getComponent(cc.RigidBody);
            playerRigidBody.linearVelocity = cc.v2(0, 0);
            this.player.enabled = false;
        }

        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        cc.director.loadScene("Gameover");
    }

    private handleRestart() {
        console.log("Save data and return to GameStart scene");

        this.unschedule(this.timer);

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
        this.timeCount = 300;
    }

    // Life cycle methods
    onLoad() {
        GameManager.sceneGravity();
        this.reloadScene();

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    start(){
        // Initialize player
        this.updateMoneyUI();
        this.updateLifeUI();
        this.updateScoreUI();
        this.updateTimeUI();

        this.schedule(this.timer, 1.0);
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