const {ccclass, property} = cc._decorator;

@ccclass("Menu")
export default class Menu extends cc.Component {

    @property(cc.Node)
    player: cc.Node = null;
    @property(cc.Node)
    floor: cc.Node = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, -320);
    }
}