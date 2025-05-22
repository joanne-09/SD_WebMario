import AccessUser from "./AccessUser";
const {ccclass, property} = cc._decorator;

@ccclass("SignUp")
export default class SignUp extends cc.Component {

    @property(cc.Button)
    BackButton: cc.Button = null;
    @property(cc.Button)
    EnterButton: cc.Button = null;

    @property(cc.EditBox)
    emailInput: cc.EditBox = null;
    @property(cc.EditBox)
    usernameInput: cc.EditBox = null;
    @property(cc.EditBox)
    passwordInput: cc.EditBox = null;

    onBack () {
        cc.log("Back button clicked");
        this.stopBGM();
        cc.director.loadScene('Start');
    }

    onEnter () {
        cc.log("Enter button clicked");

        if(!this.emailInput || !this.usernameInput || !this.passwordInput) {
            cc.warn("Some is missing")
            return;
        }

        const email = this.emailInput.string;
        const username = this.usernameInput.string;
        const password = this.passwordInput.string;

        if(!email || !username || !password) {
            cc.warn("Some is empty")
            return;
        }

        this.stopBGM();
        this.signUpFirebase(email, username, password);
    }

    onLoad () {
        if(this.BackButton) {
            this.BackButton.node.on('click', this.onBack, this);
        }else{
            cc.warn("BackButton is null");
        }

        if(this.EnterButton) {
            this.EnterButton.node.on('click', this.onEnter, this);
        }else{
            cc.warn("EnterButton is null");
        }

        // enter button listener
        this.EnterButton.node.on(cc.Node.EventType.MOUSE_ENTER, () => {
            cc.log("Enter button mouse enter");
            this.EnterButton.node.getChildByName("Background").color = cc.color(226, 136, 86);
        }, this);
        this.EnterButton.node.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            cc.log("Enter button mouse leave");
            this.EnterButton.node.getChildByName("Background").color = cc.color(228, 102, 31);
        }, this);

        // back button listener
        this.BackButton.node.on(cc.Node.EventType.MOUSE_ENTER, () => {
            cc.log("Back button mouse enter");
            this.BackButton.node.getChildByName("Background").color = cc.color(226, 136, 86);
        }, this);
        this.BackButton.node.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            cc.log("Back button mouse leave");
            this.BackButton.node.getChildByName("Background").color = cc.color(228, 102, 31);
        }, this);
    }

    stopBGM () {
        cc.audioEngine.stopAll();
    }

    start () {

    }

    signUpFirebase(email: string, username: string, password: string) {
        const auth = firebase.auth();
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                cc.log("User signed up:", user);

                AccessUser.saveUser(user.uid, email, username)
                    .then(() => {
                        cc.director.loadScene('Menu');
                    })
                    .catch((error) => {
                        cc.error("Error saving user data:", error);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                cc.error("Error signing up:", errorCode, errorMessage);
            });
    }
}
