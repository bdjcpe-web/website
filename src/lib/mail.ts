/**
 * @file src/lib/mail.ts
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @architecture Server Component
 * @description Librairie pour l'envoi d'emails.
 * @requires
 * - 'nodemailer' : Pour l'envoi d'emails.
 */

import nodemailer from 'nodemailer';

// Configuration unique du transporteur
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Générateur de template HTML aux couleurs du BDJ
export const buildBdjEmail = (title: string, contentHtml: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
    <div style="background-color: #6d0c24; padding: 20px; text-align: center;">
      <h1 style="color: #e1b82f; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">
        BDJ CPE Lyon
      </h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="margin-top: 0; color: #fff;">${title}</h2>
      <div style="font-size: 16px; line-height: 1.5; color: #e5e7eb;">
        ${contentHtml}
      </div>
    </div>
  </div>
`;

// La fonction d'envoi prête à l'emploi
export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn(`[Mail-Dev] SMTP non configuré. Destinataire: ${to} | Sujet: ${subject}`);
        return false;
    }

    try {
        await transporter.sendMail({
            from: '"Bureau des Jeux CPE" <' + process.env.SMTP_USER + '>',
            to,
            subject,
            html,
        });
        console.log(`[Email Envoyé] Mail envoyé avec succès à ${to}`);
        return true;
    } catch (error) {
        console.error(`[Erreur Email] Impossible d'envoyer à ${to}:`, error);
        return false;
    }
};