const {ccclass, property} = cc._decorator;

@ccclass("Menu")
export default class Menu extends cc.Component {
    @property(cc.Button)
    level1: cc.Button = null;
    @property(cc.Button)
    level2: cc.Button = null;

    startLevel(lvl: number) {
        cc.sys.localStorage.setItem("level", lvl.toString());
        cc.sys.localStorage.setItem("playerMoney", "0");
        cc.sys.localStorage.setItem("playerLife", "5");
        cc.sys.localStorage.setItem("playerScore", "0");

        cc.director.loadScene("GameStart");
    }

    onLoad() {
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
    }
}