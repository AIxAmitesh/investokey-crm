const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear data
  await prisma.leadActivity.deleteMany();
  await prisma.leadAssignment.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@investokey.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      active: true,
    },
  });

  // Create sales users
  const salesPassword = await bcrypt.hash('sales123', 10);

  const john = await prisma.user.create({
    data: {
      email: 'john@investokey.com',
      name: 'John Smith',
      password: salesPassword,
      role: 'SALES_USER',
      active: true,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah@investokey.com',
      name: 'Sarah Johnson',
      password: salesPassword,
      role: 'SALES_USER',
      active: true,
    },
  });

  const mike = await prisma.user.create({
    data: {
      email: 'mike@investokey.com',
      name: 'Mike Davis',
      password: salesPassword,
      role: 'SALES_USER',
      active: true,
    },
  });

  // Create sample leads
  const lead1 = await prisma.lead.create({
    data: {
      firstName: 'James',
      lastName: 'Wilson',
      phone: '555-0101',
      email: 'james@email.com',
      property: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      budget: '500000-750000',
      status: 'NEW',
      source: 'Website',
      notes: 'Interested in residential property',
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      firstName: 'Jennifer',
      lastName: 'Brown',
      phone: '555-0102',
      email: 'jennifer@email.com',
      property: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      budget: '1000000',
      status: 'INTERESTED',
      source: 'Referral',
      notes: 'Looking for commercial space',
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      firstName: 'Robert',
      lastName: 'Taylor',
      phone: '555-0103',
      email: 'robert@email.com',
      property: '789 Pine Road',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101',
      budget: '300000-500000',
      status: 'FOLLOW_UP',
      source: 'Cold Call',
      notes: 'Needs follow-up call',
    },
  });

  const lead4 = await prisma.lead.create({
    data: {
      firstName: 'Maria',
      lastName: 'Garcia',
      phone: '555-0104',
      email: null,
      property: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      budget: '250000-400000',
      status: 'NEW',
      source: 'LinkedIn',
      notes: 'First-time buyer',
    },
  });

  const lead5 = await prisma.lead.create({
    data: {
      firstName: 'David',
      lastName: 'Martinez',
      phone: '555-0105',
      email: 'david@email.com',
      property: '654 Cedar Lane',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      budget: '600000-900000',
      status: 'INTERESTED',
      source: 'Website',
      notes: 'Investor interested in multi-unit',
    },
  });

  const lead6 = await prisma.lead.create({
    data: {
      firstName: 'Lisa',
      lastName: 'Anderson',
      phone: '555-0106',
      email: 'lisa@email.com',
      property: null,
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      budget: '400000-600000',
      status: 'NO_ANSWER',
      source: 'Email Campaign',
      notes: 'No answer on last 2 calls',
    },
  });

  const lead7 = await prisma.lead.create({
    data: {
      firstName: 'Thomas',
      lastName: 'White',
      phone: '555-0107',
      email: 'thomas@email.com',
      property: '987 Birch Drive',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      budget: '750000-1000000',
      status: 'CONVERTED',
      source: 'Referral',
      notes: 'Closed deal on 2024-01-15',
    },
  });

  // Assign leads
  await prisma.leadAssignment.create({
    data: { leadId: lead1.id, userId: john.id },
  });

  await prisma.leadAssignment.create({
    data: { leadId: lead2.id, userId: john.id },
  });

  await prisma.leadAssignment.create({
    data: { leadId: lead3.id, userId: sarah.id },
  });

  await prisma.leadAssignment.create({
    data: { leadId: lead4.id, userId: sarah.id },
  });

  await prisma.leadAssignment.create({
    data: { leadId: lead5.id, userId: mike.id },
  });

  await prisma.leadAssignment.create({
    data: { leadId: lead6.id, userId: mike.id },
  });

  await prisma.leadAssignment.create({
    data: { leadId: lead7.id, userId: john.id },
  });

  // Create activities
  await prisma.leadActivity.create({
    data: {
      leadId: lead1.id,
      userId: john.id,
      status: 'NEW',
      note: 'Initial contact made',
      nextFollowUp: new Date(Date.now() + 2 * 86400000),
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead2.id,
      userId: john.id,
      status: 'INTERESTED',
      note: 'Scheduled property tour',
      nextFollowUp: new Date(Date.now() + 7 * 86400000),
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead7.id,
      userId: john.id,
      status: 'CONVERTED',
      note: 'Deal closed successfully',
    },
  });

  console.log('Seed complete!');
  console.log('\nAdmin: admin@investokey.com / admin123');
  console.log('Sales: john@investokey.com / sales123');
  console.log('       sarah@investokey.com / sales123');
  console.log('       mike@investokey.com / sales123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });