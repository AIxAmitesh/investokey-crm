export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      property,
      city,
      state,
      zipCode,
      budget,
      status,
      source,
      notes,
      nextFollowUp,
    } = body;

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        phone,
        email,
        property,
        city,
        state,
        zipCode,
        budget,
        status,
        source,
        notes,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      },
    });

    return NextResponse.json(lead, { status: 200 });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}