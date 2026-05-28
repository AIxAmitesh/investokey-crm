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

        const nameKey = Object.keys(row).find((k) => k.toLowerCase().trim() === 'name');
        if (nameKey && row[nameKey]) {
          const parts = row[nameKey].toString().trim().split(' ');
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
        }

        const firstKey = Object.keys(row).find((k) => k.toLowerCase().trim() === 'first name' || k.toLowerCase().trim() === 'firstname');
        if (firstKey && row[firstKey]) firstName = row[firstKey].toString().trim();

        const lastKey = Object.keys(row).find((k) => k.toLowerCase().trim() === 'last name' || k.toLowerCase().trim() === 'lastname');
        if (lastKey && row[lastKey]) lastName = row[lastKey].toString().trim();

        const phoneKey = Object.keys(row).find((k) => k.toLowerCase().trim() === 'phone' || k.toLowerCase().trim() === 'mobile');
        if (phoneKey && row[phoneKey]) phone = row[phoneKey].toString().trim();

        const emailKey = Object.keys(row).find((k) => k.toLowerCase().trim() === 'email');
        if (emailKey && row[emailKey]) email = row[emailKey].toString().trim();

        const propertyKey = Object.keys(row).find((k) => k.toLowerCase().trim() === 'property');
        if (propertyKey && row[propertyKey]) property = row[propertyKey].toString().trim();

        const cityKey = Object.keys(row).find((k) => k.toLowerCase().trim() === 'city');
        if (cityKey && row[cityKey]) city = row[cityKey].toString().trim();

        const stateKey = Object.keys(row).find((k) => k.toLowerCase().trim() === 'state');
        if (stateKey && row[stateKey]) state = row[stateKey].toString().trim();

        const zipKey = Object.keys(row).find((k) => k.toLowerCase().includes('zip'));
        if (zipKey && row[zipKey]) zipCode = row[zipKey].toString().trim();

        const budgetKey = Object.keys(row).find((k) => k.toLowerCase().trim() === 'budget');
        if (budgetKey && row[budgetKey]) budget = row[budgetKey].toString().trim();

        const notesKey = Object.keys(row).find((k) => k.toLowerCase().trim() === 'notes');
        if (notesKey && row[notesKey]) notes = row[notesKey].toString().trim();

        if (!firstName && !lastName) {
          errors.push({ row: rowNumber, error: 'Name is required' });
          continue;
        }

        if (!phone) {
          errors.push({ row: rowNumber, error: 'Phone is required' });
          continue;
        }

        const existing = await prisma.lead.findFirst({ where: { phone } });
        if (existing) {
          errors.push({ row: rowNumber, error: 'Phone already exists (skipped)' });
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
      } catch {
        errors.push({ row: rowNumber, error: 'Failed to parse row' });
      }
    }

    return NextResponse.json({
      totalRows: data.length,
      validRows: parsedLeads.length,
      skippedRows: errors.length,
      leads: parsedLeads,
      errors,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}
