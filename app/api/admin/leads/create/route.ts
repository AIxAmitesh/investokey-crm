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
      userId,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'First name, last name, and phone are required' },
        { status: 400 }
      );
    }

    // Create lead
    const lead = await prisma.lead.create({
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
        status: status || 'NEW',
        source: source || 'Manual',
        notes,
      },
    });

    // Assign to user if provided
    if (userId) {
      await prisma.leadAssignment.create({
        data: {
          leadId: lead.id,
          userId,
        },
      });
    }

    // Create initial activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: decoded.userId,
        status: status || 'NEW',
        note: 'Lead created',
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}