import { AsaasClient, registerAsaasClient } from '../config/asaasApi';
import admin from '../config/firebaseConfig';
import { transporter } from '../config/mailer';

// Definição da interface para o modelo de usuário
export interface ContentNote { contentId: string, itemId: number, note: string }
export interface CompleletedContent { contentId: string, itemId: number }
export interface User {
    name: string;
    email: string;
    birthdate: string;
    password: string;
    phone: string;
    cpfCnpj: string;
    postalCode: string;
    city: string;
    address: string;
    addressNumber: string;
    complement: string;
    province: string;
    state: string;
    gender: string;
    notificationDisabled: boolean;
    pendingUpdatePassword?: boolean;
    completedContent?: CompleletedContent[];
    contentNotes?: ContentNote[];
    clientToken?: string;
    profileId?: string;
    lastTestDate?: string;
    createdAt: string;
    id?: string;
}

// Referência para o nó de usuários no banco de dados
const usersRef = admin.database().ref('users');

export default class UserModel {
    // Função para criar um novo usuário
    static async createUser(userData: User): Promise<void> {
        const existsUser = await this.getUserByEmail(userData.email);
        if (existsUser) {
            throw new Error("Usuário já cadastrado.");
        } else {
            const newUserRef = usersRef.push();
            userData.createdAt = new Date().toISOString();
            userData.id = newUserRef.key;
            return newUserRef.set(userData);
        }
    };

    // Método para listar todos os usuários
    static async listUsers(): Promise<User[]> {
        const snapshot = await usersRef.once('value');
        const users: User[] = [];
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            users.push(user);
        });
        return users;
    }

    //Método para listar usuário por e-mail
    static async getUserByEmail(email: string): Promise<User | null> {
        const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const userId = Object.keys(userData)[0]; // Assume que há apenas um usuário com o mesmo email
            return { ...userData[userId], id: userId }; // Adiciona o ID do usuário ao objeto retornado
        }
        return null;
    }

    //Método para editar usuário
    static async updateUserByEmail(email: string, updatedUserData: Partial<User>): Promise<void> {
        const user = await UserModel.getUserByEmail(email);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Atualiza os dados do usuário com os novos dados fornecidos
        await usersRef.child(user.id).update(updatedUserData);
    }

    // Método para excluir um usuário pelo email
    static async deleteUserByEmail(email: string): Promise<void> {
        const user = await UserModel.getUserByEmail(email);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Remove o usuário do banco de dados
        await usersRef.child(user.id).remove();
    }

    static async sendRecoveryEmail(email: string): Promise<void> {
        const user = await UserModel.getUserByEmail(email);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        this.updateUserByEmail(email, { pendingUpdatePassword: true });

        // Envia o email de recuperação de senha
        transporter.sendMail({
            from: 'example@gmail.com',
            to: email,
            subject: 'Recuperação de senha',
            html: `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Resetar Senha</title>
                    <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .logo {
                        max-width: 150px;
                    }
                    .btn {
                        background-color: #C16130;
                        color: white !important;
                        text-decoration: none;
                        border-radius: 5px;
                        padding: 10px;
                    }
                    </style>
                </head>
                    <body>
                    <img src="https://logo.png" alt="logo" class="logo">
                    <h2>Resetar Senha</h2>
                    <p>Olá, você solicitou o reset da sua senha.</p>
                    <p>Para prosseguir com o reset da senha, clique no botão abaixo:</p>
                    <a href="https://linktofrontend/recover-password/${user.id}" class="btn">Resetar Senha</a>
                    <br>
                    <p>Se você não solicitou o reset da sua senha, ignore este e-mail.</p>
                    </body>
                </html>
        `,
        });
    }

    // Método para adicionar uma nova ContentNote ao usuário
    static async addContentNoteToUser(email: string, contentNote: ContentNote): Promise<void> {
        const user = await UserModel.getUserByEmail(email);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const updatedContentNotes = user.contentNotes ? [...user.contentNotes, contentNote] : [contentNote];
        await usersRef.child(user.id).update({ contentNotes: updatedContentNotes });
    }

    // Método para adicionar um novo CompletedContent ao usuário
    static async addCompletedContentToUser(email: string, completedContent: CompleletedContent): Promise<void> {
        const user = await UserModel.getUserByEmail(email);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const updatedCompletedContent = user.completedContent ? [...user.completedContent, completedContent] : [completedContent];
        await usersRef.child(user.id).update({ completedContent: updatedCompletedContent });
    }
}
