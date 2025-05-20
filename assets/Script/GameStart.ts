const {ccclass, property} = cc._decorator;

@ccclass("GameStart")
export default class GameStart extends cc.Component {
    private level: number = 1;

    private gotoGame(){
        if(this.level == 1){
            cc.director.loadScene("Game");
        }
        else if(this.level == 2){
            cc.director.loadScene("Game2");
        }
    }

    onLoad(){
        this.level = cc.sys.localStorage.getItem("level") || 1;
    }

    start(){
        this.scheduleOnce(this.gotoGame, 3.0);
    }
}