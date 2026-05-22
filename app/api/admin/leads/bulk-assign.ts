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

    const { leadIds, userId } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0 || !userId) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Verify user exists and is SALES_USER
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'SALES_USER') {
      return NextResponse.json(
        { error: 'Invalid user or user is not a sales user' },
        { status: 400 }
      );
    }

    // Create assignments
    const assignments = await prisma.leadAssignment.createMany({
      data: leadIds.map((leadId) => ({
        leadId,
        userId,
      })),
      //skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: `Successfully assigned ${assignments.count} leads to ${user.name}`,
        count: assignments.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error bulk assigning leads:', error);
    return NextResponse.json(
      { error: 'Failed to bulk assign leads' },
      { status: 500 }
    );
  }
}