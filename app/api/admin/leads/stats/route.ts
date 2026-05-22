import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get ALL leads (not filtered by user)
    const totalLeads = await prisma.lead.count();

    // Get leads by status
    const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATING', 'CLOSED', 'LOST'];
    const stats: Record<string, number> = {};

    for (const status of statuses) {
      const count = await prisma.lead.count({
        where: { status },
      });
      stats[status] = count;
    }

    // Get leads by assigned user
    const userStats = await prisma.leadAssignment.groupBy({
      by: ['userId'],
      _count: true,
    });

    const userDetails = await prisma.user.findMany({
      where: { role: 'SALES_USER' },
      select: { id: true, name: true, email: true },
    });

    const userBreakdown = userDetails.map((user) => {
      const count = userStats.find((us) => us.userId === user.id)?._count || 0;
      return {
        ...user,
        leadCount: count,
      };
    });

    return NextResponse.json(
      {
        total: totalLeads,
        byStatus: stats,
        byUser: userBreakdown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}