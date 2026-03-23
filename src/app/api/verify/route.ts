import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token de vérification manquant.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { verificationToken: token } });

    if (!user) {
      return NextResponse.json({ error: 'Token invalide ou compte déjà activé.' }, { status: 400 });
    }

    const ageMs = Date.now() - user.createdAt.getTime();
    if (ageMs > 5 * 60 * 1000) {
      // Délai de 5 minutes dépassé : suppression du compte non-validé
      await prisma.user.delete({ where: { id: user.id } });
      const expireHtml = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Lien Expiré - BDJ</title>
          <style>
            body { background-color: #0a0a0f; color: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; }
            .card { background: rgba(255,255,255,0.05); padding: 3rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); text-align: center; }
            h1 { color: #ff1a3c; margin-top: 0; font-size: 2rem; }
            a { display: inline-block; margin-top: 1.5rem; padding: 12px 24px; background-color: #e1b82f; color: #111; text-decoration: none; border-radius: 12px; font-weight: bold; transition: opacity 0.2s; }
            a:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⏳ Ce lien a expiré</h1>
            <p>Le délai de 5 minutes pour valider l'inscription est dépassé.<br>Pour des raisons de sécurité, tes données ont été supprimées.</p>
            <a href="/register">Recommencer l'inscription</a>
          </div>
        </body>
      </html>
      `;
      return new NextResponse(expireHtml, { headers: { 'Content-Type': 'text/html' } });
    }

    // Mark email as verified and clear the token to prevent reuse
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Compte Activé - BDJ</title>
          <style>
            body { background-color: #0a0a0f; color: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; }
            .card { background: rgba(255,255,255,0.05); padding: 3rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); text-align: center; }
            h1 { color: #E1306C; margin-top: 0; font-size: 2rem; }
            a { display: inline-block; margin-top: 1.5rem; padding: 12px 24px; background-color: #e1b82f; color: #111; text-decoration: none; border-radius: 12px; font-weight: bold; transition: opacity 0.2s; }
            a:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 style="color: var(--c-bordeaux) !important;">✅ Compte activé avec succès !</h1>
            <p>Ta présence à CPE Lyon est validée. Tu peux maintenant te connecter.</p>
            <a href="/login">Accéder à mon espace BDJ</a>
          </div>
        </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Une erreur serveur est survenue lors de la vérification.' }, { status: 500 });
  }
}
