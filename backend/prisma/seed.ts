import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin1234!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lionsclub.org' },
    update: {},
    create: {
      email: 'admin@lionsclub.org',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Lions',
      role: 'admin',
      membershipNumber: 'LC-0001',
      isActive: true,
    },
  });

  console.log(`✅ Admin user: ${admin.email}`);

  // Create a sample board member
  const boardMember = await prisma.user.upsert({
    where: { email: 'board@lionsclub.org' },
    update: {},
    create: {
      email: 'board@lionsclub.org',
      password: await bcrypt.hash('Board1234!', 12),
      firstName: 'Sophie',
      lastName: 'Martin',
      role: 'board_member',
      membershipNumber: 'LC-0002',
      phone: '+33 6 12 34 56 78',
      isActive: true,
    },
  });

  console.log(`✅ Board member: ${boardMember.email}`);

  // Create a sample club member
  const clubMember = await prisma.user.upsert({
    where: { email: 'member@lionsclub.org' },
    update: {},
    create: {
      email: 'member@lionsclub.org',
      password: await bcrypt.hash('Member1234!', 12),
      firstName: 'Lucas',
      lastName: 'Dubois',
      role: 'club_member',
      membershipNumber: 'LC-0003',
      phone: '+33 6 98 76 54 32',
      isActive: true,
    },
  });

  console.log(`✅ Club member: ${clubMember.email}`);

  // Create sample events
  const now = new Date();

  const event1 = await prisma.event.upsert({
    where: { slug: 'gala-annuel-2025' },
    update: {},
    create: {
      title: 'Gala Annuel Lions 2025',
      slug: 'gala-annuel-2025',
      description: 'Notre gala annuel réunit membres et partenaires pour une soirée de prestige au profit de nos causes humanitaires. Une soirée inoubliable avec dîner, spectacles et ventes aux enchères.',
      location: 'Hôtel Le Méridien, Paris',
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 19, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 23, 0),
      category: 'fundraising',
      capacity: 200,
      isPublished: true,
    },
  });

  const event2 = await prisma.event.upsert({
    where: { slug: 'journee-service-communautaire' },
    update: {},
    create: {
      title: 'Journée Service Communautaire',
      slug: 'journee-service-communautaire',
      description: 'Rejoignez-nous pour une journée de service auprès des communautés défavorisées. Distribution alimentaire, aide aux sans-abri et sensibilisation.',
      location: 'Centre Social Municipal, Lyon',
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 8, 9, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 8, 17, 0),
      category: 'service',
      capacity: 50,
      isPublished: true,
    },
  });

  console.log(`✅ Events created: ${event1.slug}, ${event2.slug}`);

  // Create sample meetings
  const meeting1 = await prisma.meeting.upsert({
    where: { id: 'meeting-seed-001' },
    update: {},
    create: {
      id: 'meeting-seed-001',
      title: 'Réunion Mensuelle — Octobre',
      description: 'Réunion mensuelle du conseil de direction pour discuter des projets en cours et planifier les prochaines activités.',
      location: 'Siège du Club, Salle de Conférence A',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 5, 18, 30),
      agenda: '1. Revue des actions précédentes\n2. Projets humanitaires Q4\n3. Budget annuel\n4. Questions diverses',
      isPublished: true,
    },
  });

  console.log(`✅ Meeting created: ${meeting1.title}`);

  // Create sample finance transactions
  const transactionCount = await prisma.transaction.count();
  if (transactionCount === 0) {
    await prisma.transaction.create({ data: { type: 'income', category: 'cotisations', amount: 5000, description: 'Cotisations annuelles membres', date: new Date(now.getFullYear(), 0, 15), userId: admin.id } });
    await prisma.transaction.create({ data: { type: 'income', category: 'donations', amount: 2500, description: "Don d'entreprise partenaire", date: new Date(now.getFullYear(), 1, 20), userId: admin.id } });
    await prisma.transaction.create({ data: { type: 'expense', category: 'projets', amount: 1800, description: 'Matériel aide alimentaire', date: new Date(now.getFullYear(), 2, 10), userId: admin.id } });
    await prisma.transaction.create({ data: { type: 'expense', category: 'evenements', amount: 3200, description: 'Organisation gala caritatif', date: new Date(now.getFullYear(), 3, 5), userId: admin.id } });
  }

  console.log('✅ Finance transactions seeded');

  // Create sample notifications for admin
  const notifCount = await prisma.notification.count({ where: { userId: admin.id } });
  if (notifCount === 0) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        title: 'Bienvenue !',
        message: 'Bienvenue sur la plateforme Lions Club. Votre compte administrateur est actif.',
        type: 'success',
        isRead: false,
      },
    });
  }

  console.log('✅ Notifications seeded');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:        admin@lionsclub.org    / Admin1234!');
  console.log('  Board member: board@lionsclub.org    / Board1234!');
  console.log('  Club member:  member@lionsclub.org   / Member1234!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
