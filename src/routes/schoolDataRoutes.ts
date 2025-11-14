import express, { Request, Response } from 'express';
import schoolDataController from '../controllers/schoolDataController';

const schoolDataRoutes = express.Router();

schoolDataRoutes.get('/', async (req: Request, res: Response) => {
    try {
        const response = await schoolDataController.list();
        return res.status(200).send(response);
    } catch (error) {
        res.status(500).send(error.message ?? "Não foi possível realizar essa ação");
    }
});

schoolDataRoutes.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const response = await schoolDataController.listById(id);
        return res.status(200).send(response);
    } catch (error) {
        res.status(500).send(error.message ?? "Não foi possível realizar essa ação");
    }
});

schoolDataRoutes.post('/', async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const response = await schoolDataController.create(data);
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send(error.message ?? "Não foi possível registrar");
    }

});

schoolDataRoutes.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const response = await schoolDataController.update(id, data);
        return res.status(200).send(response);
    } catch (error) {
        res.status(500).send(error.message ?? "Não foi possível realizar essa ação");
    }

});

schoolDataRoutes.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const response = await schoolDataController.delete(id);
        return res.status(200).send(response);
    } catch (error) {
        res.status(500).send(error.message ?? "Não foi possível realizar essa ação");
    }

});

export default schoolDataRoutes;