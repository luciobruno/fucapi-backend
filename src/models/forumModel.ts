import admin from '../config/firebaseConfig';

const db = admin.database();

export interface Reply {
    id: number;
    author: string;
    createdAt: number;
    text: string;
    accepted: boolean;
    topicId: number;
    forumId: number;
}
export interface Topic {
    id: number;
    title: string;
    author: string;
    createdAt: number;
    content: string;
    repliesCount: number;
    forumId: number;
}
export interface Forum {
    id: number;
    name: string;
    description: string;
    topicsCount: number;
    createdAt: number;
    tag: string;
}


export default class ForumModel {

    static async createForum(forumData: Omit<Forum, "id" | "createdAt" | "topicsCount">): Promise<Forum>{
        const counterRef = db.ref('counters/forums');

        const newId = (await counterRef.transaction((val) => (val || 0) + 1)).snapshot.val();
        
        const newForum = { 
            id: newId, 
            ...forumData,
            topicsCount: 0,
            createdAt: admin.database.ServerValue.TIMESTAMP
        };

        await db.ref(`forums/${newId}`).set(newForum);
        return (await db.ref(`forums/${newId}`).once('value')).val(); 
    }

    static async getListForums(): Promise<Forum[]>{
        const snapshot = await db.ref('forums').once('value');
        const forumsData = snapshot.val();
        if (Array.isArray(forumsData)) {
            return forumsData.filter(forum => forum !== null) as Forum[];
        }
        return forumsData ? Object.values(forumsData) as Forum[] : [];
    }

    static async getForumById(id: number): Promise<Forum | null> {
        const snapshot = await db.ref(`forums/${id}`).once('value');
        return snapshot.exists() ? snapshot.val() as Forum : null;
    }

    static async updateForum(id: number, forumData: Partial<Omit<Forum, "id" | "createdAt" | "topicsCount">>): Promise<Forum | null> {
        const forumRef = db.ref(`forums/${id}`);
        if (!(await forumRef.once('value')).exists()) {
            return null;
        }
        await forumRef.update(forumData);
        return (await forumRef.once('value')).val() as Forum;
    }

    static async deleteForumById(id: number): Promise<boolean> {
        const forumRef = db.ref(`forums/${id}`);
        if (!(await forumRef.once('value')).exists()) {
            return false;
        }

        const updates: Record<string, any> = {};
        updates[`/forums/${id}`] = null;

        const topicsSnapshot = await db.ref('topics').orderByChild('forumId').equalTo(id).once('value');
        if (topicsSnapshot.exists()) {
            const topicIds = Object.keys(topicsSnapshot.val());
            for (const topicId of topicIds) {
                updates[`/topics/${topicId}`] = null;

                const repliesSnapshot = await db.ref('replies').orderByChild('topicId').equalTo(Number(topicId)).once('value');
                if (repliesSnapshot.exists()) {
                    Object.keys(repliesSnapshot.val()).forEach(replyId => {
                        updates[`/replies/${replyId}`] = null;
                    });
                }
            }
        }
        await db.ref().update(updates);
        return true;
    }

    static async createTopic(forumId: number, topicData: Omit<Topic, "id" | "repliesCount" | "createdAt" | "forumId">): Promise<Topic | null> {
        const forumRef = db.ref(`forums/${forumId}`);
        if (!(await forumRef.once('value')).exists()) {
            return null;
        }

        const counterRef = db.ref('counters/topics');
        const newId = (await counterRef.transaction((val) => (val || 0) + 1)).snapshot.val();
        
        const newTopic: any = {
            id: newId, 
            ...topicData, 
            forumId: forumId,
            repliesCount: 0,
            createdAt: admin.database.ServerValue.TIMESTAMP
        };

        const updates: Record<string, any> = {};
        updates[`/topics/${newId}`] = newTopic; 
        
        const currentTopicsCount = (await forumRef.child('topicsCount').once('value')).val() || 0;
        updates[`/forums/${forumId}/topicsCount`] = currentTopicsCount + 1;

        await db.ref().update(updates);
        
        return (await db.ref(`topics/${newId}`).once('value')).val() as Topic;
    }

    static async getListTopics(forumId: number): Promise<Topic[] | null> {
        const forumExists = (await db.ref(`forums/${forumId}`).once('value')).exists();
        if (!forumExists) {
            return null;
        }

        const topicsQuery = db.ref('topics').orderByChild('forumId').equalTo(forumId);
        const snapshot = await topicsQuery.once('value');
        
        if (!snapshot.exists()) {
            return [];
        }
        
        const data = snapshot.val();
        return Object.values(data) as Topic[];
    }

    static async getTopicById(forumId: number, topicId: number): Promise<Topic | null> {
        const snapshot = await db.ref(`topics/${topicId}`).once('value');
        if (!snapshot.exists()) {
            return null;
        }
        
        const topic = snapshot.val() as Topic;
        return (topic.forumId === forumId) ? topic : null;
    }

    static async updateTopic(forumId: number, topicId: number, topicData: Partial<Omit<Topic, "id" | "createdAt" | "repliesCount" | "forumId">>): Promise<Topic | null> {
        const topicRef = db.ref(`topics/${topicId}`);
        const topic = (await topicRef.once('value')).val() as Topic;
        
        if (!topic || topic.forumId !== forumId) {
            return null;
        }

        await topicRef.update(topicData);
        return (await topicRef.once('value')).val() as Topic;
    }

    static async deleteTopic(forumId: number, topicId: number): Promise<boolean> {
        const topicRef = db.ref(`topics/${topicId}`);
        const topicSnapshot = await topicRef.once('value');
        
        if (!topicSnapshot.exists() || topicSnapshot.val().forumId !== forumId) {
            return false;
        }

        const updates: Record<string, any> = {};
        updates[`/topics/${topicId}`] = null;

        const forumRef = db.ref(`forums/${forumId}`);
        const currentTopicsCount = (await forumRef.child('topicsCount').once('value')).val() || 0;
        updates[`/forums/${forumId}/topicsCount`] = Math.max(0, currentTopicsCount - 1);

        const repliesSnapshot = await db.ref('replies').orderByChild('topicId').equalTo(topicId).once('value');
        if (repliesSnapshot.exists()) {
            Object.keys(repliesSnapshot.val()).forEach(replyId => {
                updates[`/replies/${replyId}`] = null;
            });
        }

        await db.ref().update(updates);
        return true;
    }
    
    static async createReply(forumId: number, topicId: number, replyData: Omit<Reply, "id" | "createdAt" | "topicId" | "forumId">): Promise<Reply | null> {
        const topicRef = db.ref(`topics/${topicId}`);
        const topicSnapshot = await topicRef.once('value');
        
        if (!topicSnapshot.exists() || topicSnapshot.val().forumId !== forumId) {
            return null;
        }

        const counterRef = db.ref('counters/replies');
        const newId = (await counterRef.transaction((val) => (val || 0) + 1)).snapshot.val();
        
        const newReply: any = {
            id: newId, 
            ...replyData,
            topicId: topicId,
            forumId: forumId,
            createdAt: admin.database.ServerValue.TIMESTAMP
        };

        const updates: Record<string, any> = {};
        updates[`/replies/${newId}`] = newReply;
        
        const currentRepliesCount = topicSnapshot.child('repliesCount').val() || 0;
        updates[`/topics/${topicId}/repliesCount`] = currentRepliesCount + 1;

        await db.ref().update(updates);
        
        return (await db.ref(`replies/${newId}`).once('value')).val() as Reply;
    }

    static async getListReplies(forumId: number, topicId: number): Promise<Reply[] | null> {
        const topicRef = db.ref(`topics/${topicId}`);
        const topicSnapshot = await topicRef.once('value');
        if (!topicSnapshot.exists() || topicSnapshot.val().forumId !== forumId) {
            return null;
        }

        const repliesQuery = db.ref('replies').orderByChild('topicId').equalTo(topicId);
        const snapshot = await repliesQuery.once('value');

        if (!snapshot.exists()) {
            return [];
        }
        
        const data = snapshot.val();
        if (Array.isArray(data)) {
            return data.filter(reply => reply !== null) as Reply[];
        }
        return Object.values(data) as Reply[];
    }

    static async updateReply(forumId: number, topicId: number, replyId: number, replyData: Partial<Omit<Reply, "id" | "createdAt" | "topicId" | "forumId">>): Promise<Reply | null> {
        const replyRef = db.ref(`replies/${replyId}`);
        const reply = (await replyRef.once('value')).val() as Reply;
        
        if (!reply || reply.topicId !== topicId || reply.forumId !== forumId) {
            return null;
        }

        await replyRef.update(replyData);
        return (await replyRef.once('value')).val() as Reply;
    }

    static async deleteReply(forumId: number, topicId: number, replyId: number): Promise<boolean> {
        const replyRef = db.ref(`replies/${replyId}`);
        const reply = (await replyRef.once('value')).val() as Reply;

        if (!reply || reply.topicId !== topicId || reply.forumId !== forumId) {
            return false;
        }

        const updates: Record<string, any> = {};
        updates[`/replies/${replyId}`] = null;

        const topicRef = db.ref(`topics/${topicId}`);
        const currentRepliesCount = (await topicRef.child('repliesCount').once('value')).val() || 0;
        updates[`/topics/${topicId}/repliesCount`] = Math.max(0, currentRepliesCount - 1);

        await db.ref().update(updates);
        return true;
    }
}
