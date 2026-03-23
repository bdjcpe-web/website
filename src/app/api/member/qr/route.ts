import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

function generateToken() {
  return randomBytes(32).toString('hex');
}

// GET /api/member/qr — get (or create) the current user's QR token
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // @ts-ignore — qrToken exists after db push; client will pick it up after restart
  const user = await (prisma.user as any).findUnique({
    where: { email: session.user.email },
    select: { id: true, isMember: true, qrToken: true },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (!user.isMember) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  if (!user.qrToken) {
    const token = generateToken();
    await (prisma.user as any).update({
      where: { id: user.id },
      data: { qrToken: token, qrTokenAt: new Date() },
    });
    return NextResponse.json({ token });
  }

  return NextResponse.json({ token: user.qrToken });
}
