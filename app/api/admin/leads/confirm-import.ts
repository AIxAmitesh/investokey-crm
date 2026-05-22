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

    const { importLogId, leads } = await request.json();

    if (!importLogId || !leads || leads.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Create all leads in batch
    const createdLeads = await prisma.lead.createMany({
      data: leads.map((lead: any) => ({
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        email: lead.email,
        property: lead.property,
        city: lead.city,
        state: lead.state,
        zipCode: lead.zipCode,
        budget: lead.budget,
        notes: lead.notes,
        source: lead.source || 'Bulk Import',
        status: lead.status || 'NEW',
      })),
      //skipDuplicates: true, // Skip if phone already exists
    });

    // Update import log status
    await prisma.leadImportLog.update({
      where: { id: importLogId },
      data: {
        status: 'completed',
        parseResults: JSON.stringify({
          createdCount: createdLeads.count,
          timestamp: new Date(),
        }),
      },
    });

    return NextResponse.json(
      {
        message: `Successfully imported ${createdLeads.count} leads`,
        count: createdLeads.count,
        importLogId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error confirming import:', error);
    return NextResponse.json(
      { error: 'Failed to confirm import' },
      { status: 500 }
    );
  }
}