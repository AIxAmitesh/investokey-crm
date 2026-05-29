import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'SALES_USER') {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
    }

    const assignments = await prisma.leadAssignment.createMany({
      data: leadIds.map((leadId: string) => ({ leadId, userId })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `Successfully assigned ${assignments.count} leads to ${user.name}`,
      count: assignments.count,
    });
  } catch (error) {
    console.error('Bulk assign error:', error);
    return NextResponse.json({ error: 'Failed to bulk assign leads' }, { status: 500 });
  }
}
