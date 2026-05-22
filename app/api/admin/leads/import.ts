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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const parsedLeads: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      const rowNumber = i + 2;

      try {
        let firstName = '';
        let lastName = '';
        let phone = '';
        let email = '';
        let property = '';
        let city = '';
        let state = '';
        let zipCode = '';
        let budget = '';
        let notes = '';

        // Find name column (case-insensitive)
        const nameKey = Object.keys(row).find((key) =>
          key.toLowerCase().trim() === 'name'
        );
        if (nameKey && row[nameKey]) {
          const fullName = row[nameKey].toString().trim();
          const nameParts = fullName.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        // Find phone column (case-insensitive)
        const phoneKey = Object.keys(row).find((key) =>
          key.toLowerCase().trim() === 'phone'
        );
        if (phoneKey && row[phoneKey]) {
          phone = row[phoneKey].toString().trim();
        }

        // Find email column
        const emailKey = Object.keys(row).find((key) =>
          key.toLowerCase().trim() === 'email'
        );
        if (emailKey && row[emailKey]) {
          email = row[emailKey].toString().trim();
        }

        // Find property column
        const propertyKey = Object.keys(row).find((key) =>
          key.toLowerCase().trim() === 'property'
        );
        if (propertyKey && row[propertyKey]) {
          property = row[propertyKey].toString().trim();
        }

        // Find city column
        const cityKey = Object.keys(row).find((key) =>
          key.toLowerCase().trim() === 'city'
        );
        if (cityKey && row[cityKey]) {
          city = row[cityKey].toString().trim();
        }

        // Find state column
        const stateKey = Object.keys(row).find((key) =>
          key.toLowerCase().trim() === 'state'
        );
        if (stateKey && row[stateKey]) {
          state = row[stateKey].toString().trim();
        }

        // Find zipcode column
        const zipKey = Object.keys(row).find((key) =>
          key.toLowerCase().includes('zip')
        );
        if (zipKey && row[zipKey]) {
          zipCode = row[zipKey].toString().trim();
        }

        // Find budget column
        const budgetKey = Object.keys(row).find((key) =>
          key.toLowerCase().trim() === 'budget'
        );
        if (budgetKey && row[budgetKey]) {
          budget = row[budgetKey].toString().trim();
        }

        // Find notes column
        const notesKey = Object.keys(row).find((key) =>
          key.toLowerCase().trim() === 'notes'
        );
        if (notesKey && row[notesKey]) {
          notes = row[notesKey].toString().trim();
        }

        // Validation
        if (!firstName && !lastName) {
          errors.push({
            row: rowNumber,
            error: 'Name is required',
          });
          continue;
        }

        if (!phone) {
          errors.push({
            row: rowNumber,
            error: 'Phone is required',
          });
          continue;
        }

        // Check duplicate
        const existingLead = await prisma.lead.findFirst({
          where: { phone },
        });

        if (existingLead) {
          errors.push({
            row: rowNumber,
            error: 'Phone already exists (skipped)',
          });
          continue;
        }

        parsedLeads.push({
          firstName: firstName || 'N/A',
          lastName: lastName || 'N/A',
          phone,
          email: email || null,
          property: property || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          budget: budget || null,
          notes: notes || null,
          source: 'Bulk Import',
          status: 'NEW',
        });
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: 'Failed to parse row',
        });
      }
    }

    return NextResponse.json(
      {
        totalRows: data.length,
        validRows: parsedLeads.length,
        skippedRows: errors.length,
        leads: parsedLeads,
        errors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}