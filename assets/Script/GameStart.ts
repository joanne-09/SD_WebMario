import AccessUser, {UserData} from "./AccessUser";
const {ccclass, property} = cc._decorator;

@ccclass("GameStart")
export default class GameStart extends cc.Component {
    private level: number = 1;

    private moneyCount: number = 0;
    private lifeCount: number = 5;

    private gotoGame(){
        if(this.level == 1){
            cc.director.loadScene("Game");
        }
        else if(this.level == 2){
            cc.director.loadScene("Game2");
        }
    }

    private async useAccessUser(){
        const currentUser = firebase.auth().currentUser.uid;

        const data: Partial<UserData> = {
            usermoney: this.moneyCount,
            userlife: this.lifeCount,
        }

        await AccessUser.updateUser(currentUser, data);
    }

    onLoad(){
        this.level = parseInt(cc.sys.localStorage.getItem("level")) || 1;
        this.moneyCount = parseInt(cc.sys.localStorage.getItem("playerMoney")) || 0;
        this.lifeCount = parseInt(cc.sys.localStorage.getItem("playerLife")) || 5;
    }

    start(){
        this.scheduleOnce(this.gotoGame, 3.0);

        this.useAccessUser().then(() => {
            console.log("User data updated successfully");
        }).catch((error) => {
            console.error("Error updating user data: ", error);
        });
    }
}