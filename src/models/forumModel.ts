import admin from '../config/firebaseConfig';

export interface Forum {
    title: string;
    createdAt: string;
    createdBy: string;
    posts: Post[];
    id?: string;
}

interface Post {
    title: string;
    content: string;
    userId: string;
    createdAt: string;
    id?: string;
}

const forumRef = admin.database().ref('forum');

export default class ForumModel {
    static async createForum(forumData: Forum): Promise<void> {
        const exists = await this.getForumById(forumData.id);
        if (exists) {
            throw new Error("Dado já cadastrado.");
        } else {
            const newRef = forumRef.push();
            forumData.createdAt = new Date().toISOString();
            forumData.id = newRef.key;
            return newRef.set(forumData);
        }
    };

    static async listForums(): Promise<Forum[]> {
        const snapshot = await forumRef.once('value');
        const forums: Forum[] = [];
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            forums.push(data);
        });
        return forums;
    }

    static async getForumById(id: string): Promise<Forum | null> {
        const snapshot = await forumRef.orderByChild('id').equalTo(id).once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            const id = Object.keys(data)[0];
            return { ...data[id], id: id };
        }
        return null;
    }

    static async updateForumById(id: string, updatedData: Partial<Forum>): Promise<void> {
        const data = await ForumModel.getForumById(id);
        if (!data) {
            throw new Error('Dado não encontrado');
        }

        await forumRef.child(data.id).update(updatedData);
    }

    static async deleteForumById(id: string): Promise<void> {
        const data = await ForumModel.getForumById(id);
        if (!data) {
            throw new Error('Dado não encontrado');
        }

        await forumRef.child(data.id).remove();
    }

}
