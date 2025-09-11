import axios from "axios";
import { addDays, format } from "date-fns";

const asaasApi = axios.create({
    baseURL: process.env.ASAAS_API ?? 'https://sandbox.asaas.com/api/v3/',
});
asaasApi.defaults.headers.common['access_token'] = process.env.ASAAS_API_KEY ?? '$aact_....example...==';
asaasApi.defaults.headers.common['Content-Type'] = 'application/json';
asaasApi.defaults.headers.common['accept'] = 'application/json';

export interface AsaasClient {
    name: string;
    phone: string;
    cpfCnpj: string;
    email: string;
    postalCode: string;
    address: string;
    addressNumber: string;
    province: string;
    state: string;
    city: string;
}

export interface AsaasPaymentCard {
    cardNumber: string;
    validity: string;
    cvv: string;
    name: string;
    email: string;
    birthday: string;
    cellphone: string;
    cpf: string;
    cep: string;
    address: string;
    addressNumber: string;
    province: string;
    state: string;
    city: string;
    clientToken: string;
    ip: string;
}

export interface AsaasCreditCardPurchase {
    email: string;
    cardToken: string;
    clientToken: string;
    value: number;
    description: string;
    installmentCount?: number;
    period?: string;
    ip: string;
}

export interface AsaasPixPurchase {
    email: string;
    clientToken: string;
    value: number;
    description: string;
    ip: string;
    cpf: string;
}

export function registerAsaasClient(paymentData: AsaasClient): Promise<any> {
    return asaasApi.post('customers', {
        "name": paymentData.name,
        "email": paymentData.email,
        "phone": paymentData.phone,
        "mobilePhone": paymentData.phone,
        "cpfCnpj": paymentData.cpfCnpj,
        "postalCode": paymentData.postalCode,
        "address": paymentData.address,
        "addressNumber": paymentData.addressNumber,
        "complement": " ",
        "province": paymentData.province,
        "externalReference": paymentData.email,
        "notificationDisabled": false,
        "observations": "app arteterapia"
    });
}

export function tokenizeAsaasCard(paymentData: AsaasPaymentCard): Promise<any> {
    return asaasApi.post('creditCard/tokenize', {
        "creditCard": {
            "holderName": paymentData.name,
            "number": paymentData.cardNumber,
            "expiryMonth": paymentData.validity.split('/')[0],
            "expiryYear": `20${paymentData.validity.split('/')[1]}`,
            "ccv": paymentData.cvv
        },
        "creditCardHolderInfo": {
            "name": paymentData.name,
            "email": paymentData.email,
            "cpfCnpj": paymentData.cpf,
            "postalCode": paymentData.cep,
            "addressNumber": paymentData.addressNumber,
            "addressComplement": " ",
            "phone": paymentData.cellphone,
            "mobilePhone": paymentData.cellphone
        },
        "customer": paymentData.clientToken,
        "remoteIp": paymentData.ip
    });
}

export function purchaseAssasCreditCard(purchaseData: AsaasCreditCardPurchase): Promise<any> {
    if (purchaseData?.installmentCount ?? 1 > 1) {
        return asaasApi.post('payments', {
            "billingType": "CREDIT_CARD",
            "customer": purchaseData.clientToken,
            "dueDate": addDays(new Date(), 1).toISOString().split('T')[0],
            "installmentValue": purchaseData.value,
            "installmentCount": purchaseData.installmentCount,
            "description": purchaseData.description,
            "externalReference": purchaseData.email,
            "postalService": false,
            "creditCardToken": purchaseData.cardToken,
            "remoteIp": purchaseData.ip
        });
    } else {
        return asaasApi.post('payments', {
            "billingType": "CREDIT_CARD",
            "customer": purchaseData.clientToken,
            "dueDate": addDays(new Date(), 1).toISOString().split('T')[0],
            "value": purchaseData.value,
            "description": purchaseData.description,
            "externalReference": purchaseData.email,
            "postalService": false,
            "creditCardToken": purchaseData.cardToken,
            "remoteIp": purchaseData.ip
        });
    }

}

export function purchaseAsaasPix(purchaseData: AsaasPixPurchase): Promise<any> {
    return asaasApi.post('payments', {
        "billingType": "PIX",
        "customer": purchaseData.clientToken,
        "dueDate": addDays(new Date(), 1).toISOString().split('T')[0],
        "value": purchaseData.value,
        "description": purchaseData.description,
        "daysAfterDueDateToCancellationRegistration": 1,
        "externalReference": purchaseData.email,
        "postalService": false,
        "cpfCnpj": purchaseData.cpf,
    })
}

export function generateAsaasPixQRCode(paymentId: string): Promise<any> {
    return asaasApi.get(`payments/${paymentId}/pixQrCode`);
}

export function checkAsaasPaymentStatus(paymentId: string): Promise<any> {
    return asaasApi.get(`payments/${paymentId}/status`);
}

export function makeSubscription(purchaseData: AsaasCreditCardPurchase): Promise<any> {
    return asaasApi.post('subscriptions', {
        "billingType": "CREDIT_CARD",
        "cycle": purchaseData.period,
        "customer": purchaseData.clientToken,
        "value": purchaseData.value,
        "nextDueDate": format(new Date(), 'yyyy-MM-dd'),
        "description": purchaseData.description,
        "creditCardToken": purchaseData.cardToken,
        "remoteIp": purchaseData.ip,
    });
}

export function cancelSubscription(subscriptionId: string): Promise<any> {
    return asaasApi.delete(`subscriptions/${subscriptionId}`);
}

export { asaasApi }