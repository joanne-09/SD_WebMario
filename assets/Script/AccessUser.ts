const {ccclass, property} = cc._decorator;

export interface UserData {
    email: string;
    username: string;
    highscore?: number;
    userlife?: number;
    usermoney?: number;
    userlevel?: number;
}

export default class AccessUser extends cc.Component {
    private static _instance: AccessUser = null;

    public static get instance(): AccessUser {
        return this._instance;
    }

    onLoad() {
        if (AccessUser._instance === null) {
            AccessUser._instance = this;
            cc.game.addPersistRootNode(this.node);
        } else {
            this.node.destroy();
        }
    }

    public async saveUser(userid: string, email: string, username: string) {
        const firebase = cc.find("FirebaseService").getComponent("FirebaseService").getFirebase();
        const db = firebase.firestore();

        try {
            await db.collection("users").doc(userid).set({
                email: email,
                username: username,
            }, { merge: true });
            cc.log("User saved successfully");
        } catch (error) {
            cc.error("Error saving user: ", error);
            throw error;
        }
    }
}