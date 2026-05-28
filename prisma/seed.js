const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.leadActivity.deleteMany();
  await prisma.leadAssignment.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: { email: 'admin@investokey.com', name: 'Admin User', password: adminPassword, role: 'ADMIN', active: true },
  });

  const salesPassword = await bcrypt.hash('sales123', 10);
  const john = await prisma.user.create({
    data: { email: 'john@investokey.com', name: 'John Smith', password: salesPassword, role: 'SALES_USER', active: true },
  });
  const sarah = await prisma.user.create({
    data: { email: 'sarah@investokey.com', name: 'Sarah Johnson', password: salesPassword, role: 'SALES_USER', active: true },
  });
  const mike = await prisma.user.create({
    data: { email: 'mike@investokey.com', name: 'Mike Davis', password: salesPassword, role: 'SALES_USER', active: true },
  });

  // Leads — all using the new status lifecycle
  const lead1 = await prisma.lead.create({
    data: { firstName: 'James', lastName: 'Wilson', phone: '555-0101', email: 'james@email.com', property: '123 Main Street', city: 'Los Angeles', state: 'CA', zipCode: '90001', budget: '$500k–$750k', status: 'NEW', source: 'Website', notes: 'Interested in residential property' },
  });
  const lead2 = await prisma.lead.create({
    data: { firstName: 'Jennifer', lastName: 'Brown', phone: '555-0102', email: 'jennifer@email.com', property: '456 Oak Avenue', city: 'San Francisco', state: 'CA', zipCode: '94102', budget: '$1M+', status: 'INTERESTED', source: 'Referral', notes: 'Looking for commercial space' },
  });
  const lead3 = await prisma.lead.create({
    data: { firstName: 'Robert', lastName: 'Taylor', phone: '555-0103', email: 'robert@email.com', property: '789 Pine Road', city: 'San Diego', state: 'CA', zipCode: '92101', budget: '$300k–$500k', status: 'FOLLOW UP', source: 'Cold Call', notes: 'Needs follow-up call next week' },
  });
  const lead4 = await prisma.lead.create({
    data: { firstName: 'Maria', lastName: 'Garcia', phone: '555-0104', city: 'Houston', state: 'TX', zipCode: '77001', budget: '$250k–$400k', status: 'NEW', source: 'LinkedIn', notes: 'First-time buyer' },
  });
  const lead5 = await prisma.lead.create({
    data: { firstName: 'David', lastName: 'Martinez', phone: '555-0105', email: 'david@email.com', property: '654 Cedar Lane', city: 'Phoenix', state: 'AZ', zipCode: '85001', budget: '$600k–$900k', status: 'INTERESTED', source: 'Website', notes: 'Investor interested in multi-unit' },
  });
  const lead6 = await prisma.lead.create({
    data: { firstName: 'Lisa', lastName: 'Anderson', phone: '555-0106', email: 'lisa@email.com', city: 'Austin', state: 'TX', zipCode: '78701', budget: '$400k–$600k', status: 'NOT CONTACTED', source: 'Email Campaign', notes: 'No answer on last 2 calls' },
  });
  const lead7 = await prisma.lead.create({
    data: { firstName: 'Thomas', lastName: 'White', phone: '555-0107', email: 'thomas@email.com', property: '987 Birch Drive', city: 'Miami', state: 'FL', zipCode: '33101', budget: '$750k–$1M', status: 'CLOSED', source: 'Referral', notes: 'Deal closed successfully' },
  });
  const lead8 = await prisma.lead.create({
    data: { firstName: 'Emily', lastName: 'Chen', phone: '555-0108', email: 'emily@email.com', city: 'Seattle', state: 'WA', zipCode: '98101', budget: '$500k–$700k', status: 'SITE VISIT', source: 'Google Ads', notes: 'Site visit scheduled' },
  });
  const lead9 = await prisma.lead.create({
    data: { firstName: 'Carlos', lastName: 'Rivera', phone: '555-0109', email: 'carlos@email.com', city: 'Denver', state: 'CO', zipCode: '80201', budget: '$300k–$450k', status: 'NOT INTERESTED', source: 'Facebook', notes: 'Budget does not match available inventory' },
  });
  const lead10 = await prisma.lead.create({
    data: { firstName: 'Amanda', lastName: 'Foster', phone: '555-0110', email: 'amanda@email.com', property: '321 Maple Ave', city: 'Dallas', state: 'TX', zipCode: '75201', budget: '$800k–$1.2M', status: 'LOST', source: 'Referral', notes: 'Went with a competitor' },
  });

  // Assignments
  await prisma.leadAssignment.createMany({
    data: [
      { leadId: lead1.id, userId: john.id },
      { leadId: lead2.id, userId: john.id },
      { leadId: lead7.id, userId: john.id },
      { leadId: lead8.id, userId: john.id },
      { leadId: lead3.id, userId: sarah.id },
      { leadId: lead4.id, userId: sarah.id },
      { leadId: lead9.id, userId: sarah.id },
      { leadId: lead5.id, userId: mike.id },
      { leadId: lead6.id, userId: mike.id },
      { leadId: lead10.id, userId: mike.id },
    ],
  });

  // Activities
  await prisma.leadActivity.createMany({
    data: [
      { leadId: lead1.id, userId: john.id, status: 'NEW', note: 'Initial contact made' },
      { leadId: lead2.id, userId: john.id, status: 'INTERESTED', note: 'Scheduled property tour' },
      { leadId: lead3.id, userId: sarah.id, status: 'FOLLOW UP', note: 'Left voicemail, will call again' },
      { leadId: lead7.id, userId: john.id, status: 'CLOSED', note: 'Deal closed successfully' },
      { leadId: lead8.id, userId: john.id, status: 'SITE VISIT', note: 'Site visit confirmed for next week' },
    ],
  });

  console.log('\n✓ Seed complete!');
  console.log('\nAdmin:  admin@investokey.com  /  admin123');
  console.log('Sales:  john@investokey.com   /  sales123');
  console.log('        sarah@investokey.com  /  sales123');
  console.log('        mike@investokey.com   /  sales123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
