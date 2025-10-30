import express, { Request, Response } from 'express';
import forumController from '../controllers/forumController';
import validate from '../middleware/schemaValidate';
import {
    createForumSchema,
    updateForumSchema,
    createTopicSchema,
    updateTopicSchema,
    createReplySchema,
    updateReplySchema
  } from '../schemas/forumSchemas';

const forumRoutes = express.Router();

const parseIds = (req: Request) => {
    const forumId = req.params.forumId ? parseInt(req.params.forumId, 10) : undefined;
    const topicId = req.params.topicId ? parseInt(req.params.topicId, 10) : undefined;
    const replyId = req.params.replyId ? parseInt(req.params.replyId, 10) : undefined;
    
    if (req.params.forumId && isNaN(forumId)) throw new Error('ID do Fórum inválido.');
    if (req.params.topicId && isNaN(topicId)) throw new Error('ID do Tópico inválido.');
    if (req.params.replyId && isNaN(replyId)) throw new Error('ID da Resposta inválido.');

    return { forumId, topicId, replyId };
}

const handle404 = (error: Error, res: Response) => {
    const notFoundMessages = [
        'Fórum não encontrado',
        'Tópico não encontrado',
        'Resposta não encontrada',
        'Fórum pai não encontrado',
        'Tópico pai não encontrado'
    ];
    if (notFoundMessages.includes(error.message)) {
        return res.status(404).json({ error: error.message });
    }
    return null;
}

forumRoutes.post('/', validate(createForumSchema), async (req: Request, res: Response) => {
    try {
        const message = await forumController.createForum(req.body);
        res.status(201).json({ message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.get('/', async (req: Request, res: Response) => {
    try {
        const forums = await forumController.listForums();
        res.status(200).json(forums);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.get('/:forumId', async (req: Request, res: Response) => {
    try {
        const { forumId } = parseIds(req);
        const forum = await forumController.getForumById(forumId);
        res.status(200).json(forum);
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.patch('/:forumId', validate(updateForumSchema), async (req: Request, res: Response) => {
    try {
        const { forumId } = parseIds(req);
        const updatedForum = await forumController.updateForum(forumId, req.body);
        res.status(200).json(updatedForum);
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.delete('/:forumId', async (req: Request, res: Response) => {
    try {
        const { forumId } = parseIds(req);
        const message = await forumController.deleteForum(forumId);
        res.status(200).json({ message });
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.post('/:forumId/topics', validate(createTopicSchema), async (req: Request, res: Response) => {
    try {
        const { forumId } = parseIds(req);
        const newTopic = await forumController.createTopic(forumId, req.body);
        res.status(201).json(newTopic);
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.get('/:forumId/topics', async (req: Request, res: Response) => {
    try {
        const { forumId } = parseIds(req);
        const topics = await forumController.listTopics(forumId);
        res.status(200).json(topics);
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.get('/:forumId/topics/:topicId', async (req: Request, res: Response) => {
    try {
        const { forumId, topicId } = parseIds(req);
        const topic = await forumController.getTopicById(forumId, topicId);
        res.status(200).json(topic);
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.patch('/:forumId/topics/:topicId', validate(updateTopicSchema), async (req: Request, res: Response) => {
    try {
        const { forumId, topicId } = parseIds(req);
        const updatedTopic = await forumController.updateTopic(forumId, topicId, req.body);
        res.status(200).json(updatedTopic);
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.delete('/:forumId/topics/:topicId', async (req: Request, res: Response) => {
    try {
        const { forumId, topicId } = parseIds(req);
        const message = await forumController.deleteTopic(forumId, topicId);
        res.status(200).json({ message });
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.post('/:forumId/topics/:topicId/replies', validate(createReplySchema), async (req: Request, res: Response) => {
    try {
        const { forumId, topicId } = parseIds(req);
        const newReply = await forumController.createReply(forumId, topicId, req.body);
        res.status(201).json(newReply);
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.get('/:forumId/topics/:topicId/replies', async (req: Request, res: Response) => {
    try {
        const { forumId, topicId } = parseIds(req);
        const replies = await forumController.listReplies(forumId, topicId);
        res.status(200).json(replies);
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.patch('/:forumId/topics/:topicId/replies/:replyId', validate(updateReplySchema), async (req: Request, res: Response) => {
    try {
        const { forumId, topicId, replyId } = parseIds(req);
        const updatedReply = await forumController.updateReply(forumId, topicId, replyId, req.body);
        res.status(200).json(updatedReply);
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

forumRoutes.delete('/:forumId/topics/:topicId/replies/:replyId', async (req: Request, res: Response) => {
    try {
        const { forumId, topicId, replyId } = parseIds(req);
        const message = await forumController.deleteReply(forumId, topicId, replyId);
        res.status(200).json({ message });
    } catch (error) {
        if (handle404(error, res)) return;
        res.status(500).json({ error: error.message });
    }
});

export default forumRoutes;