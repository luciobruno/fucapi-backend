import admin from '../config/firebaseConfig';

export interface SchoolData {
    courseList?: CourseData[];
    createdAt: string;
    id: string;
}

interface Time {
    dateTime: string;
    dayOfWeek: string;
}

interface ClassData {
    name: string;
    createdAt: string;
    times: Time[];
    id?: string;
}

interface Student {
    name: string;
    birthdate: string;
    registerId: string;
    document: string;
    status: 'active' | 'inactive';
}

interface CourseData {
    name: string;
    classList?: ClassData[];
    students: Student[];
    createdAt: string;
    id?: string;
}

const schoolDataRef = admin.database().ref('schoolData');

export default class SchoolDataModel {
    static async createSchoolData(schoolDataData: SchoolData): Promise<void> {
        const newRef = schoolDataRef.push();
        schoolDataData.createdAt = new Date().toISOString();
        schoolDataData.id = newRef.key;
        return newRef.set(schoolDataData);
    };

    static async listSchoolDatas(): Promise<SchoolData[]> {
        const snapshot = await schoolDataRef.once('value');
        const schoolDatas: SchoolData[] = [];
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            schoolDatas.push(data);
        });
        return schoolDatas;
    }

    static async getSchoolDataById(id: string): Promise<SchoolData | null> {
        const snapshot = await schoolDataRef.orderByChild('id').equalTo(id).once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            const id = Object.keys(data)[0];
            return { ...data[id], id: id };
        }
        return null;
    }

    static async updateSchoolDataById(id: string, updatedData: Partial<SchoolData>): Promise<void> {
        const data = await SchoolDataModel.getSchoolDataById(id);
        if (!data) {
            throw new Error('Dado não encontrado');
        }

        await schoolDataRef.child(data.id).update(updatedData);
    }

    static async deleteSchoolDataById(id: string): Promise<void> {
        const data = await SchoolDataModel.getSchoolDataById(id);
        if (!data) {
            throw new Error('Dado não encontrado');
        }

        await schoolDataRef.child(data.id).remove();
    }

}
