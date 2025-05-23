import AccessUser, {UserData} from "./AccessUser";
const {ccclass, property} = cc._decorator;

@ccclass("Gameover")
export default class Gameover extends cc.Component {

    private moneyCount: number = 0;

    gotoMenu(){
        cc.director.loadScene("Menu");
    }

    private async useAccessUser(){
        const currentUser = firebase.auth().currentUser.uid;
        const currentUserData = await AccessUser.getUser(currentUser);
        const currentLevel = parseInt(cc.sys.localStorage.getItem("level")) || 1;
        let newLevel = currentLevel;

        if(currentLevel < currentUserData.userlevel) newLevel = Math.max(currentLevel - 1, currentUserData.userlevel) || 0;

        const data: Partial<UserData> = {
            usermoney: this.moneyCount,
            userlife: 5,
            userlevel: newLevel
        }

        await AccessUser.updateUser(currentUser, data);
    }

    onLoad() {
        this.moneyCount = parseInt(cc.sys.localStorage.getItem("playerMoney")) || 0;
    }

    start(){
        this.scheduleOnce(this.gotoMenu, 3.0);

        this.useAccessUser().then(() => {
            console.log("User data updated successfully");
        }).catch((error) => {
            console.error("Error updating user data: ", error);
        });
    }
}