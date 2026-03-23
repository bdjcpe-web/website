import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json([]);

  // @ts-ignore – filiere and registeredYear added via db push, types will refresh on next build restart
  const users = await prisma.user.findMany({
    where: {
      emailVerified: { not: null },
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, filiere: true, registeredYear: true, createdAt: true },
    take: 10,
  });

  // Compute current year for each user
  const now = new Date();
  const result = users.map((u: any) => {
    let currentYear = u.registeredYear ?? null;
    if (currentYear && u.createdAt) {
      const reg = new Date(u.createdAt);
      let septs = 0;
      for (let y = reg.getFullYear(); y <= now.getFullYear(); y++) {
        const sept = new Date(y, 8, 1);
        if (sept > reg && sept <= now) septs++;
      }
      currentYear = Math.min(5, currentYear + septs);
    }
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      filiere: u.filiere ?? null,
      currentYear,
    };
  });

  return NextResponse.json(result);
}
