import { Request, Response } from 'express';
import UserModel, { CompleletedContent, ContentNote, User } from '../models/userModel';
import bcrypt from 'bcrypt';

async function hashPassword(plainTextPassword: string): Promise<string> {
    const saltRounds = 10; // Número de rounds para gerar o salt
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
    return hashedPassword;
}

async function comparePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
    return isMatch;
}

// Controlador para operações relacionadas aos usuários
const userController = {
    // Método para criar um novo usuário
    createUser: async (userData: User) => {
        try {
            userData.password = await hashPassword(userData.password);
            await UserModel.createUser(userData);
            return 'Usuário criado com sucesso';
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao criar usuário');
        }
    },
    listUsers: async () => {
        try {
            const users = await UserModel.listUsers();
            return users;
        } catch (error) {
            throw new Error(error.message ?? "Não foi possível listar usuários");
        }
    },
    listUserByEmail: async (email: string) => {
        try {
            const user = await UserModel.getUserByEmail(email);
            return user;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao listar usuário por e-mail');
        }
    },
    deleteUser: async (email: string) => {
        try {
            await UserModel.deleteUserByEmail(email);
            return "Usuário excluído com sucesso";
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao deletar usuário por e-mail');
        }
    },
    updateUser: async (email: string, userEdit: User) => {
        try {
            await UserModel.updateUserByEmail(email, userEdit);
            return "Usuário editado com sucesso";
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao atualizar usuário por e-mail');
        }
    },
    login: async (email: string, password: string) => {
        try {
            const user = await UserModel.getUserByEmail(email);
            const isMatch = await comparePassword(password, user.password);
            if (isMatch) {
                return user;
            } else {
                throw new Error('Dados de login incorretos.');
            }
        } catch (error) {
            throw new Error(error.message ?? 'Dados de login incorretos.');
        }
    },
    recoverPassword: async (email: string) => {
        try {
            await UserModel.sendRecoveryEmail(email);
            return 'E-mail de recuperação de senha enviado com sucesso';
        } catch (error) {
            throw new Error(error.message ?? 'Dados de usuário incorretos.');
        }
    },
    addContentNote: async (email: string, contentNote: ContentNote) => {
        try {
            await UserModel.addContentNoteToUser(email, contentNote);
            return 'ContentNote adicionada com sucesso';
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao adicionar ContentNote');
        }
    },

    addCompletedContent: async (email: string, completedContent: CompleletedContent) => {
        try {
            await UserModel.addCompletedContentToUser(email, completedContent);
            return 'CompletedContent adicionada com sucesso';
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao adicionar CompletedContent');
        }
    },
};

export default userController;