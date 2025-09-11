import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseConfig';
import { asaasApi } from '../config/asaasApi';

// Middleware para verificar a autenticação do usuário
export const paymentMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const idToken = req.headers.authorization;
    admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            req.body = { ...req.body, decodedToken };
            next();
        })
        .catch((error) => {
            res.status(403).send('Token de autenticação inválido');
        });
};

export const creditCardPaymentMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { customerId } = req.body;
    console.log('customer', customerId)
    try {
        const customerResponse = await asaasApi.get(`/customers/${customerId}`);
        req.body = { ...req.body, customerResponse: customerResponse.data };
        next();
    } catch (error) {
        try {
            const customerResponse = await asaasApi.post(`/customers`, {
                "name": "John Doe",
                "email": "john.doe@asaas.com.br",
                "phone": "4738010919",
                "mobilePhone": "4799376637",
                "cpfCnpj": "24971563792",
                "postalCode": "01310-000",
                "address": "Av. Paulista",
                "addressNumber": "150",
                "complement": "Sala 201",
                "province": "Centro",
                "externalReference": "12987382",
                "notificationDisabled": false,
                "additionalEmails": "john.doe@asaas.com,john.doe.silva@asaas.com.br",
                "municipalInscription": "46683695908",
                "stateInscription": "646681195275",
                "observations": "ótimo pagador, nenhum problema até o momento"
            });
            req.body = { ...req.body, customerResponse: customerResponse.data };
            next();
        } catch (error) {
            res.status(403).send('Não foi possível criar novo usuário');
        }
    };
}