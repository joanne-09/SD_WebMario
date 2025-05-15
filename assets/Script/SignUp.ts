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

        this.signUpFirebase(email, username, password);
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

    signUpFirebase(email: string, username: string, password: string) {
        const firebase = cc.find("FirebaseService").getComponent("FirebaseService").getFirebase();
        if (firebase) {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    cc.log("User signed up:", user);

                    const accessUser = cc.find("AccessUser").getComponent("AccessUser");
                    if (accessUser) {
                        accessUser.saveUser(user.uid, email, username);
                    }

                    cc.director.loadScene('Menu');
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    cc.error("Error signing up:", errorCode, errorMessage);
                });
        } else {
            cc.error("Firebase is not initialized.");
        }
    }
}
