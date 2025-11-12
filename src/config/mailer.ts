import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'zoho',
    auth: {
        user: 'contato@zohomail.com',
        pass: 'yourzohoemailpassword',
    },
});

