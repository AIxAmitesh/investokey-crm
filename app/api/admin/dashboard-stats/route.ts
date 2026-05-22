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

    // Fetch stats
    const totalLeads = await prisma.lead.count();
    const newLeads = await prisma.lead.count({
      where: { status: 'NEW' },
    });
    const interestedLeads = await prisma.lead.count({
      where: { status: 'INTERESTED' },
    });
    const convertedLeads = await prisma.lead.count({
      where: { status: 'CONVERTED' },
    });
    const totalUsers = await prisma.user.count({
      where: { role: 'SALES_USER' },
    });
    const pendingFollowUps = await prisma.lead.count({
      where: {
        nextFollowUp: {
          lte: new Date(),
        },
      },
    });

    return NextResponse.json(
      {
        totalLeads,
        newLeads,
        interestedLeads,
        convertedLeads,
        totalUsers,
        pendingFollowUps,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
