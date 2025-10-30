// middleware/validate.ts (ou no topo de forumRoutes.ts)
import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

const validate = (schema: ZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      
      return next();
    } catch (error) {
      const formattedErrors = error.issues.map((issue: any) => {
        return {
          path: issue.path.join('.'),
          message: issue.message
        };
      });
      return res.status(400).json({
        error: "Dados inválidos",
        details: formattedErrors
      });
    }
};

export default validate;