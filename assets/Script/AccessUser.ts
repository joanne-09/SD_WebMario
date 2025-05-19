export interface UserData {
    email: string;
    username: string;
    usermoney?: number;
    userlevel?: number;
    createdAt?: any;
}

export default class AccessUser {
    public static async saveUser(userId: string, email: string, username: string, initialMoney: number = 0, initialLevel: number = 1): Promise<void> {
        const db = firebase.firestore();

        const userData: UserData = {
            email: email,
            username: username,
            usermoney: initialMoney,
            userlevel: initialLevel,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection("users").doc(userId).set(userData, { merge: true });
            cc.log("User saved successfully");
        } catch (error) {
            cc.error("Error saving user: ", error);
            throw error;
        }
    }
}