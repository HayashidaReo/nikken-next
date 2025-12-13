import * as admin from "firebase-admin";

export class AuthHelper {
    /**
     * 指定されたUIDのAuthユーザーを削除します。
     * ロールバック処理などで使用されます。
     * エラーが発生してもスローせず、ログを出力して終了します。
     * 
     * @param uid 削除対象のユーザーID
     */
    static async deleteUser(uid: string): Promise<void> {
        try {
            await admin.auth().deleteUser(uid);
            console.log(`AuthHelper: Deleted auth user ${uid}`);
        } catch (error) {
            console.error(`AuthHelper Error: Failed to delete auth user ${uid}`, error);
        }
    }
}
