import admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';

const keyPath = 'fucapiweb-firebase-adminsdk.json';

// Configure o Firebase Admin SDK com suas credenciais
const serviceAccount = require(`../../${keyPath}`);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fucapiweb-default-rtdb.firebaseio.com",
    storageBucket: 'gs://fucapiweb.firebasestorage.app'
});

// Inicialize o Storage usando o arquivo de credenciais
export const storage = new Storage({
    keyFilename: keyPath, // Altere para o caminho real
});

export default admin;
