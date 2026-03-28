import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  // Sécurité : On vérifie que l'utilisateur est bien connecté (Admin)
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Récupération de la requête (?q=Loann)
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // Recherche Prisma flexible sur le Prénom OU le Nom
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        // Adaptez ces champs selon le nom exact dans votre schéma Prisma
        filiere: true,
        registeredYear: true,
        createdAt: true,
      },
      take: 5, // On limite à 5 résultats pour ne pas surcharger l'UI
    });

    // On formate les données pour le composant
    const formattedUsers = users.map(u => {
      // Calcul de l'année (3A, 4A) si vous l'utilisez
      let currentYear = null;
      if (u.registeredYear) {
        const reg = new Date(u.createdAt);
        const now = new Date();
        let septs = 0;
        for (let y = reg.getFullYear(); y <= now.getFullYear(); y++) {
          if (new Date(y, 8, 1) > reg && new Date(y, 8, 1) <= now) septs++;
        }
        currentYear = Math.min(5, u.registeredYear + septs);
      }

      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        filiere: u.filiere,
        currentYear: currentYear,
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Erreur Search API:", error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}