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

    if (!decoded || decoded.role !== 'SALES_USER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = decoded.userId;
    const { leadId, status, notes, nextFollowUp } = await request.json();

    if (!leadId || !status) {
      return NextResponse.json(
        { error: 'Lead ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['NEW', 'INTERESTED', 'NOT INTERESTED', 'NOT CONTACTED', 'FOLLOW UP', 'SITE VISIT', 'CLOSED', 'LOST'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Verify user has access to this lead
    const assignment = await prisma.leadAssignment.findUnique({
      where: {
        leadId_userId: {
          leadId,
          userId,
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'You do not have access to this lead' },
        { status: 403 }
      );
    }

    // Update lead status
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
        notes: notes || undefined,
      },
    });

    // Create activity log
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId,
        status,
        note: notes,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Lead status updated to ${status}`,
        lead: updatedLead,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating lead status:', error);
    return NextResponse.json(
      { error: 'Failed to update lead status' },
      { status: 500 }
    );
  }
}