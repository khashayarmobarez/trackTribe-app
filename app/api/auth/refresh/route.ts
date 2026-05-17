import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { JWTExpired } from 'jose/errors';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const cookiesStore = await cookies();
    const refreshToken = cookiesStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 401 });
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    // Find user
    const user = await prisma.user.findUnique({ where: { id: payload.sub as string } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Sign new tokens
    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await signRefreshToken({
      sub: user.id,
    });

    // Set new cookies
    cookiesStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 min
      path: '/',
    });

    cookiesStore.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/api/auth/refresh',
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    if (err instanceof JWTExpired) {
      return NextResponse.json({ error: 'Refresh token expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
