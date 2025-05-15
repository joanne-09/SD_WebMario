const { ccclass, property } = cc._decorator;

@ccclass("FirebaseService")
export default class FirebaseService extends cc.Component {
    private static _instance: FirebaseService = null;

    // Your web app's Firebase configuration
    private firebaseConfig = {
        apiKey: "AIzaSyCQIboBJ6h4EJ9Jy5psUj-_2z_khACnd40",
        authDomain: "webmario-2826a.firebaseapp.com",
        projectId: "webmario-2826a",
        storageBucket: "webmario-2826a.firebasestorage.app",
        messagingSenderId: "538095669496",
        appId: "1:538095669496:web:18adf9b7038b5d809dab0d",
        measurementId: "G-0FD5KM82FQ"
    };

    onLoad() {
        if (FirebaseService._instance === null) {
            FirebaseService._instance = this;
        } else {
            this.node.destroy();
            return;
        }

        this.initializeFirebase();
    }

    private initializeFirebase() {
        if (typeof window !== 'undefined' && window.firebase) {
            // Initialize Firebase
            window.firebase.initializeApp(this.firebaseConfig);
            if (window.firebase.analytics) {
                window.firebase.analytics();
            }
        } else {
            console.warn("Firebase is not available in this environment.");
        }
    }

    public getFirebase() {
        return window.firebase;
    }
}

declare global {
    interface Window {
        firebase: any;
    }
}