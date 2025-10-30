import ForumModel, { Forum, Topic, Reply } from '../models/forumModel';

const forumController = {
    createForum: async (forumData: Omit<Forum, "id" | "createdAt">) => {
        try {
            await ForumModel.createForum(forumData);
            return 'Fórum criado com sucesso';
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao criar fórum');
        }
    },
    listForums: async () => {
        try {
            const forums = await ForumModel.getListForums();
            return forums;
        } catch (error) {
            throw new Error(error.message ?? "Não foi possível listar os fóruns");
        }
    },
    getForumById: async (id: number) => {
        try {
            const forum = await ForumModel.getForumById(id);
            if (!forum) {
                throw new Error('Fórum não encontrado');
            }
            return forum;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao buscar fórum');
        }
    },
    updateForum: async (id: number, forumData: Partial<Omit<Forum, "id">>) => {
        try {
            const updatedForum = await ForumModel.updateForum(id, forumData);
            if (!updatedForum) {
                throw new Error('Fórum não encontrado');
            }
            return updatedForum;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao atualizar fórum');
        }
    },
    deleteForum: async (id: number) => {
        try {
            const success = await ForumModel.deleteForumById(id);

            if (!success) {
                throw new Error('Fórum não encontrado');
            }

            return 'Fórum apagado com sucesso';

        } catch (error) {
            throw new Error(error.message ?? 'Erro ao apagar fórum');
        }
    },
    createTopic: async (forumId: number, topicData: Omit<Topic, "id" | "repliesCount" | "createdAt">) => {
        try {
            const newTopic = await ForumModel.createTopic(forumId, topicData);
            if (!newTopic) {
                throw new Error('Fórum pai não encontrado');
            }
            return newTopic;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao criar tópico');
        }
    },
    listTopics: async (forumId: number) => {
        try {
            const topics = await ForumModel.getListTopics(forumId);
            if (topics === null) {
                throw new Error('Fórum não encontrado');
            }
            return topics;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao listar tópicos');
        }
    },
    getTopicById: async (forumId: number, topicId: number) => {
        try {
            const topic = await ForumModel.getTopicById(forumId, topicId);
            if (!topic) {
                throw new Error('Tópico não encontrado');
            }
            return topic;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao buscar tópico');
        }
    },
    updateTopic: async (forumId: number, topicId: number, topicData: Partial<Omit<Topic, "id">>) => {
        try {
            const updatedTopic = await ForumModel.updateTopic(forumId, topicId, topicData);
            if (!updatedTopic) {
                throw new Error('Tópico não encontrado');
            }
            return updatedTopic;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao atualizar tópico');
        }
    },
    deleteTopic: async (forumId: number, topicId: number) => {
        try {
            const success = await ForumModel.deleteTopic(forumId, topicId);
            if (!success) {
                throw new Error('Tópico não encontrado');
            }
            return 'Tópico apagado com sucesso';
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao apagar tópico');
        }
    },
    createReply: async (forumId: number, topicId: number, replyData: Omit<Reply, "id" | "createdAt">) => {
        try {
            const newReply = await ForumModel.createReply(forumId, topicId, replyData);
            if (!newReply) {
                throw new Error('Tópico pai não encontrado');
            }
            return newReply;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao criar resposta');
        }
    },
    listReplies: async (forumId: number, topicId: number) => {
        try {
            const replies = await ForumModel.getListReplies(forumId, topicId);
            if (replies === null) {
                throw new Error('Tópico não encontrado');
            }
            return replies;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao listar respostas');
        }
    },
    updateReply: async (forumId: number, topicId: number, replyId: number, replyData: Partial<Omit<Reply, "id">>) => {
        try {
            const updatedReply = await ForumModel.updateReply(forumId, topicId, replyId, replyData);
            if (!updatedReply) {
                throw new Error('Resposta não encontrada');
            }
            return updatedReply;
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao atualizar resposta');
        }
    },
    deleteReply: async (forumId: number, topicId: number, replyId: number) => {
        try {
            const success = await ForumModel.deleteReply(forumId, topicId, replyId);
            if (!success) {
                throw new Error('Resposta não encontrada');
            }
            return 'Resposta apagada com sucesso';
        } catch (error) {
            throw new Error(error.message ?? 'Erro ao apagar resposta');
        }
    }
}

export default forumController;