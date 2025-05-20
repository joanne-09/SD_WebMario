import { config } from "./FirebaseService";
const {ccclass, property} = cc._decorator;

@ccclass("Start")
export default class Start extends cc.Component {

    @property({type: cc.AudioClip})
    bgm: cc.AudioClip = null;

    @property(cc.Button)
    SignUpButton: cc.Button = null;
    @property(cc.Button)
    LoginButton: cc.Button = null;

    onSignUp () {
        cc.log("Sign Up button clicked");
        cc.director.loadScene('SignUp');
    }

    onSignIn () {
        cc.log("Sign In button clicked");
        cc.director.loadScene('SignIn');
    }

    playBGM () {
        if (this.bgm) {
            cc.audioEngine.play(this.bgm, true, 1);
        } else {
            cc.warn("BGM is null");
        }
    }

    onLoad () {
        if(this.SignUpButton) {
            this.SignUpButton.node.on('click', this.onSignUp, this);
        }else{
            cc.warn("SignUpButton is null");
        }

        if(this.LoginButton) {
            this.LoginButton.node.on('click', this.onSignIn, this);
        }else{
            cc.warn("LoginButton is null");
        }
    }

    start () {
        const app = firebase.initializeApp(config);
        console.log("Firebase initialized successfully");

        this.playBGM();
    }

    // update (dt) {}
}
