import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import swagger_outuput from './swagger_output.json';

export function setupSwagger(app: Application): void {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger_outuput));
}