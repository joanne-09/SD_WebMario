const {ccclass, property} = cc._decorator;

@ccclass("SignIn")
export default class SignIn extends cc.Component {

    @property(cc.Button)
    BackButton: cc.Button = null;
    @property(cc.Button)
    EnterButton: cc.Button = null;

    @property(cc.EditBox)
    emailInput: cc.EditBox = null;
    @property(cc.EditBox)
    passwordInput: cc.EditBox = null;

    onBack () {
        cc.log("Back button clicked");
        cc.director.loadScene('Start');
    }

    onEnter () {
        cc.log("Enter button clicked");

        if(!this.emailInput || !this.passwordInput) {
            cc.warn("Some is missing")
            return;
        }

        const email = this.emailInput.string;
        const password = this.passwordInput.string;

        if(!email || !password) {
            cc.warn("Some is empty")
            return;
        }

        this.signInFirebase(email, password);
    }

    onLoad () {
        if(this.BackButton) {
            this.stopBGM();
            this.BackButton.node.on('click', this.onBack, this);
        }else{
            cc.warn("BackButton is null");
        }

        if(this.EnterButton) {
            this.stopBGM();
            this.EnterButton.node.on('click', this.onEnter, this);
        }else{
            cc.warn("EnterButton is null");
        }
    }

    stopBGM () {
        cc.audioEngine.stopAll();
    }

    start () {

    }

    signInFirebase (email: string, password: string) {
        cc.log("signInFirebase");
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                cc.log("User signed in: ", user);
                cc.director.loadScene('Menu');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                cc.error("Error signing in: ", errorCode, errorMessage);
            });
    }
}
