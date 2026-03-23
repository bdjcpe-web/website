import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function isAdmin(email?: string | null) {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  return !!email && admins.includes(email);
}

// GET /api/esport/players?gameSlug=league-of-legends
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameSlug = searchParams.get('gameSlug');
  if (!gameSlug) return NextResponse.json({ error: 'gameSlug required' }, { status: 400 });

  // @ts-ignore – players relation added via db push, types will refresh on restart
  const team = await (prisma.esportTeam as any).findUnique({
    where: { game: gameSlug },
    include: { players: true },
  });

  // @ts-ignore
  return NextResponse.json((team?.players ?? []) as any[]);
}

// POST /api/esport/players — add a player
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { gameSlug, userId, playerName, gameId, profileLink, role, isSub, rankTier, rankDivision } = body;

  if (!gameSlug || !role) {
    return NextResponse.json({ error: 'gameSlug and role are required' }, { status: 400 });
  }

  // Upsert the team
  const team = await prisma.esportTeam.upsert({
    where: { game: gameSlug },
    create: { game: gameSlug, name: gameSlug },
    update: {},
  });

  // @ts-ignore – new fields added via db push, stale client types
  const player = await (prisma.player as any).create({
    data: {
      teamId: team.id,
      userId: userId || null,
      name: playerName || '',
      gameId: gameId || null,
      profileLink: profileLink || null,
      role,
      isSub: !!isSub,
      rankTier: rankTier || null,
      rankDivision: rankDivision || null,
    },
  });

  return NextResponse.json(player, { status: 201 });
}

// DELETE /api/esport/players?id=xxx
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.player.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
