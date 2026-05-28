export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get current user status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, active: true, role: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent toggling admin status
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot deactivate admin users' },
        { status: 400 }
      );
    }

    // Toggle status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { active: !user.active },
      select: { id: true, name: true, active: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: `User ${updatedUser.active ? 'activated' : 'deactivated'} successfully`,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle user status' },
      { status: 500 }
    );
  }
}