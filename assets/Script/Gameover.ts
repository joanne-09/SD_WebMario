const {ccclass, property} = cc._decorator;

@ccclass("Gameover")
export default class Gameover extends cc.Component {

    gotoMenu(){
        cc.director.loadScene("Menu");
    }

    start(){
        this.scheduleOnce(this.gotoMenu, 3.0);
    }
}