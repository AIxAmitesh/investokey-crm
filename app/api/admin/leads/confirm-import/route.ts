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

    const { leads } = await request.json();

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No leads provided' }, { status: 400 });
    }

    // Create leads individually in a transaction so we get their IDs back
    const createdLeads = await prisma.$transaction(
      leads.map((lead: any) =>
        prisma.lead.create({
          data: {
            firstName: lead.firstName,
            lastName: lead.lastName,
            phone: lead.phone,
            email: lead.email ?? null,
            property: lead.property ?? null,
            city: lead.city ?? null,
            state: lead.state ?? null,
            zipCode: lead.zipCode ?? null,
            budget: lead.budget ?? null,
            notes: lead.notes ?? null,
            source: lead.source || 'Bulk Import',
            status: lead.status || 'NEW',
          },
          select: { id: true },
        })
      )
    );

    const leadIds = createdLeads.map((l: { id: string }) => l.id);

    return NextResponse.json({
      message: `Successfully imported ${leadIds.length} leads`,
      count: leadIds.length,
      leadIds,
    });
  } catch (error) {
    console.error('Confirm import error:', error);
    return NextResponse.json({ error: 'Failed to confirm import' }, { status: 500 });
  }
}
