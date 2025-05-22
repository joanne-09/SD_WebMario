import AccessUser, {UserData} from "./AccessUser";
import AccessLeaderboard, {BoardData} from "./AccessLeaderboard";
const {ccclass, property} = cc._decorator;

@ccclass("Menu")
export default class Menu extends cc.Component {
    @property(cc.AudioClip)
    bgm: cc.AudioClip = null;

    @property(cc.Button)
    level1: cc.Button = null;
    @property(cc.Button)
    level2: cc.Button = null;
    @property(cc.Button)
    logout: cc.Button = null;
    @property(cc.Button)
    leaderboardBtn: cc.Button = null;

    @property(cc.Label)
    username: cc.Label = null;
    @property(cc.Label)
    money: cc.Label = null;
    @property(cc.Label)
    life: cc.Label = null;
    @property(cc.Label)
    score: cc.Label = null;

    @property(cc.Node)
    leaderboard: cc.Node = null;
    @property(cc.Node)
    leaderList: cc.Node = null;

    private moneyCount: number = 0;
    private lifeCount: number = 5;
    private scoreCount: number = 0;

    private userData: UserData = null;
    private leaderboardData: BoardData[] = [];

    private leaderboardActive: boolean = false;

    private async loadUserData(userId: string) {
        this.userData = await AccessUser.getUser(userId);
        if (this.userData) {
            this.moneyCount = this.userData.usermoney || 0;
            this.lifeCount = this.userData.userlife || 5;
            this.scoreCount = this.userData.highscore || 0;
            this.updateUI();
        }
    }

    private loadLeaderboard(){
        AccessLeaderboard.getLeaderboard().then((data: BoardData[]) => {
            this.leaderboardData = data;
            this.setLeaderboard();
        });
        if (this.leaderboardData) {
            console.log("Leaderboard loaded successfully");
        } else {
            console.warn("No leaderboard data found");
        }
    }

    private setLeaderboard(){
        for(let i=0; i<this.leaderboardData.length; i++){
            const entry = this.leaderboardData[i];
            const rowNode = this.leaderList.getChildByName(`Row${i+1}`);
            if(rowNode){
                const usernameLabel = rowNode.getChildByName("name").getComponent(cc.Label);
                const scoreLabel = rowNode.getChildByName("score").getComponent(cc.Label);
                if(usernameLabel && scoreLabel){
                    usernameLabel.string = entry.playername.toUpperCase();
                    scoreLabel.string = entry.playerscore.toString().padStart(7, '0');
                }
            }
        }
    }

    private showLeaderboard() {
        this.leaderboard.active = true;
        this.leaderList.active = true;

        for(let i=0; i<10; i++){
            const rowNode = this.leaderList.getChildByName(`Row${i+1}`);
            if(i < this.leaderboardData.length){
                rowNode.active = true;
            }else {
                rowNode.active = false;
            }
        }
    }

    private hideLeaderboard() {
        this.leaderboard.active = false;
        this.leaderList.active = false;
    }

    private updateUI() {
        this.updateUsernameUI();
        this.updateMoneyUI();
        this.updateLifeUI();
        this.updateScoreUI();

        this.setLevelButton();
    }

    startLevel(lvl: number) {
        this.stopBGM();

        cc.sys.localStorage.setItem("level", lvl.toString());
        cc.sys.localStorage.setItem("playerMoney", this.moneyCount.toString());
        cc.sys.localStorage.setItem("playerLife", this.lifeCount.toString());
        cc.sys.localStorage.setItem("playerScore", "0");

        cc.director.loadScene("GameStart");
    }

    private updateUsernameUI(){
        if(!this.username) return;
        const name = this.userData.username || "Player";
        this.username.string = name.toUpperCase();
        console.log(`Current username: ${this.username.string}`);
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

    private setLevelButton(){
        if(this.userData){
            console.log(`User level: ${this.userData.userlevel}`);
            this.level1.interactable = this.userData.userlevel >= 0;
            this.level2.interactable = this.userData.userlevel >= 1;
        }
    }

    playBGM() {
        if (this.bgm) {
            cc.audioEngine.playMusic(this.bgm, true);
        } else {
            cc.warn("BGM is null");
        }
    }

    stopBGM() {
        cc.audioEngine.stopAll();
    }

    // Life cycle method
    onLoad() {
        // link level buttons
        if(this.level1) {
            this.level1.node.on('click', () => {
                cc.log("Level 1 button clicked");
                this.startLevel(1);
            }, this);
        } else {
            cc.warn("Level 1 button is null");
        }

        if(this.level2) {
            this.level2.node.on('click', () => {
                cc.log("Level 2 button clicked");
                this.startLevel(2);
            }, this);
        } else {
            cc.warn("Level 2 button is null");
        }

        // link logout button
        if(this.logout) {
            this.logout.node.on('click', () => {
                cc.log("Logout button clicked");
                firebase.auth().signOut().then(() => {
                    cc.log("User signed out");
                    this.stopBGM();
                    cc.director.loadScene('Start');
                }).catch((error) => {
                    cc.error("Error signing out: ", error);
                });
            }, this);
        } else {
            cc.warn("Logout button is null");
        }

        // get user data and update UI
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            this.loadUserData(currentUser.uid);
        } else {
            cc.warn("No user is currently signed in");
        }

        // load leaderboard data
        this.loadLeaderboard();
        this.leaderboard.active = false;
        this.leaderList.active = false;

        // link leaderboard button
        if(this.leaderboardBtn) {
            this.leaderboardBtn.node.on('click', () => {
                cc.log("Leaderboard button clicked");

                cc.tween(this.leaderboardBtn.node)
                    .to(0.05, { scale: 1.2 })
                    .to(0.05, { scale: 1 })
                    .start();

                this.leaderboardActive = !this.leaderboardActive;
                if(this.leaderboardActive) this.showLeaderboard();
                else this.hideLeaderboard();
            }, this);
        } else {
            cc.warn("Leaderboard button is null");
        }
    }

    start() {
        this.playBGM();
    }
}