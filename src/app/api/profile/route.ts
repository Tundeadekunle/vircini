import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const { id, username, email, bio, avatar } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    return NextResponse.json({ id: user.id, username: user.username, email: user.email });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update user', details: (e as Error).message }, { status: 500 });
  }
}
