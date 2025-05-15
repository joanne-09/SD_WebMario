const {ccclass, property} = cc._decorator;

@ccclass("SignIn")
export default class SignIn extends cc.Component {

    @property(cc.Button)
    BackButton: cc.Button = null;
    @property(cc.Button)
    EnterButton: cc.Button = null;

    onBack () {
        cc.log("Back button clicked");
        cc.director.loadScene('Start');
    }

    onLoad () {
        if(this.BackButton) {
            this.stopBGM();
            this.BackButton.node.on('click', this.onBack, this);
        }else{
            cc.warn("BackButton is null");
        }
    }

    stopBGM () {
        cc.audioEngine.stopAll();
    }

    start () {

    }

    // update (dt) {}
}
