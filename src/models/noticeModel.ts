import admin from '../config/firebaseConfig';

export interface Notice {
    title: string;
    content: string;
    createdAt: string;
    id?: string;
}

const noticeRef = admin.database().ref('notice');

export default class NoticeModel {
    static async createNotice(noticeData: Notice): Promise<void> {
        const exists = await this.getNoticeById(noticeData.id);
        if (exists) {
            throw new Error("Dado já cadastrado.");
        } else {
            const newRef = noticeRef.push();
            noticeData.createdAt = new Date().toISOString();
            noticeData.id = newRef.key;
            return newRef.set(noticeData);
        }
    };

    static async listNotices(): Promise<Notice[]> {
        const snapshot = await noticeRef.once('value');
        const notices: Notice[] = [];
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            notices.push(data);
        });
        return notices;
    }

    static async getNoticeById(id: string): Promise<Notice | null> {
        const snapshot = await noticeRef.orderByChild('id').equalTo(id).once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            const id = Object.keys(data)[0];
            return { ...data[id], id: id };
        }
        return null;
    }

    static async updateNoticeById(id: string, updatedData: Partial<Notice>): Promise<void> {
        const data = await NoticeModel.getNoticeById(id);
        if (!data) {
            throw new Error('Dado não encontrado');
        }

        await noticeRef.child(data.id).update(updatedData);
    }

    static async deleteNoticeById(id: string): Promise<void> {
        const data = await NoticeModel.getNoticeById(id);
        if (!data) {
            throw new Error('Dado não encontrado');
        }

        await noticeRef.child(data.id).remove();
    }

}
