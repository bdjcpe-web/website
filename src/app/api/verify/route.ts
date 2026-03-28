/**
 * @file src/app/api/verify/route.ts
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @architecture Server Component
 * @description API Route pour la gestion de la vérification du compte.
 * @requires
 * - 'next/server' : Pour la gestion des réponses HTTP.
 * - '@prisma/client' : Client Prisma pour l'accès à la base de données.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token de vérification manquant.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { verificationToken: token } });

    if (!user) {
      // Si le token n'existe pas, c'est soit une erreur, soit déjà validé
      return NextResponse.json({ error: 'Token invalide ou compte déjà activé.' }, { status: 400 });
    }

    const ageMs = Date.now() - user.createdAt.getTime();

    // ── 15 minutes de validité du token ──
    if (ageMs > 15 * 60 * 1000) {
      await prisma.user.delete({ where: { id: user.id } });

      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="utf-8">
            <title>Lien Expiré - BDJ</title>
            <style>
              body { background-color: #0a0a0f; color: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0; }
              .card { background: rgba(255,255,255,0.05); padding: 3rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); text-align: center; max-width: 400px; }
              h1 { color: #ff1a3c; margin-top: 0; }
              a { display: inline-block; margin-top: 1.5rem; padding: 12px 24px; background-color: #e1b82f; color: #111; text-decoration: none; border-radius: 12px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>⏳ Lien expiré</h1>
              <p>Le délai de validation est dépassé. Tes données ont été supprimées par sécurité.</p>
              <a href="/register">Recommencer l'inscription</a>
            </div>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    // Validation du compte
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // On vide le token pour qu'il ne serve plus
      },
    });

    // ── PAGE DE SUCCÈS (Couleurs fixées en HEX) ──
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Compte Activé - BDJ</title>
          <style>
            body { background-color: #0a0a0f; color: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0; }
            .card { background: rgba(255,255,255,0.05); padding: 3rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); text-align: center; max-width: 400px; }
            h1 { color: #6d0c24; margin-top: 0; } /* Couleur Bordeaux en HEX */
            a { display: inline-block; margin-top: 1.5rem; padding: 12px 24px; background-color: #e1b82f; color: #111; text-decoration: none; border-radius: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 style="color: #6d0c24;">✅ Compte activé !</h1>
            <p>Ton adresse CPE Lyon est validée. Bienvenue au Bureau des Jeux !</p>
            <a href="/login">Se connecter</a>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
