export interface BoardData {
    id?: string;
    playername: string;
    playerscore: number;
}

export default class AccessLeaderboard {
    public static async updateLeaderboard(userId: string, data: BoardData): Promise<void> {
        const db = firebase.firestore();

        try {
            const currentBoard = await this.getLeaderboard();

            if(currentBoard.length < 10) {
                await db.collection("leaderboard").doc(userId).set(data);
            }else{
                const lowestScore = Math.min(...currentBoard.map(entry => entry.playerscore));
                if(data.playerscore > lowestScore) {
                    const lowestEntry = currentBoard.find(entry => entry.playerscore === lowestScore);
                    if(lowestEntry) {
                        await db.collection("leaderboard").doc(lowestEntry.id).delete();
                    }
                    await db.collection("leaderboard").doc(userId).set(data);
                }
            }
        } catch (error) {
            cc.error("Error updating leaderboard: ", error);
            throw error;
        }
    }

    public static async getLeaderboard(): Promise<BoardData[]> {
        const db = firebase.firestore();

        try {
            const snapshot = await db.collection("leaderboard").get();
            const leaderboard: BoardData[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data() as BoardData;
                leaderboard.push(data);
            });

            leaderboard.sort((a, b) => b.playerscore - a.playerscore); // Sort by score descending
            return leaderboard;
        } catch (error) {
            cc.error("Error fetching leaderboard: ", error);
            throw error;
        }
    }

    public static async updateUserScore(userId: string, data: BoardData): Promise<void> {
        const db = firebase.firestore();
        const userRef = db.collection("leaderboard").doc(userId);
        const userDoc = await userRef.get();

        try {
            if(userDoc.exists) {
                console.log("User exists, updating score");
                await userRef.update({ playerscore: data.playerscore });
            }else{
                console.log("User does not exist, compare with leaderboard");
                await this.updateLeaderboard(userId, data);
            }
        } catch (error) {
            cc.error("Error updating user score: ", error);
            throw error;
        }
    }
}