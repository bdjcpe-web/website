import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

function generateToken() {
  return randomBytes(32).toString('hex');
}

// POST /api/member/verify — called when merchant verifies the QR
export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 400 });

  // @ts-ignore — qrToken exists after db push; client will pick it up after restart
  const user = await (prisma.user as any).findUnique({
    where: { qrToken: token },
    select: { id: true, firstName: true, lastName: true, filiere: true, registeredYear: true, isMember: true },
  });

  if (!user || !user.isMember) {
    return NextResponse.json({ error: 'QR invalide ou déjà utilisé' }, { status: 404 });
  }

  const newToken = generateToken();
  await (prisma.user as any).update({
    where: { id: user.id },
    data: { qrToken: newToken, qrTokenAt: new Date() },
  });

  return NextResponse.json({
    valid: true,
    firstName: user.firstName,
    lastName: user.lastName,
    filiere: user.filiere,
    registeredYear: user.registeredYear,
  });
}
