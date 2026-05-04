import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seed started...');

  // 1. Create Categories
  const categoriesData = [
    { name: "Technology", description: "All things tech, coding, and innovation" },
    { name: "Music & Arts", description: "Concerts, exhibitions, and creative workshops" },
    { name: "Business", description: "Networking, conferences, and startup events" },
    { name: "Photography", description: "Photo walks, workshops, and exhibitions" },
    { name: "Health & Wellness", description: "Yoga, fitness, and mental health workshops" },
    { name: "Food & Drink", description: "Tastings, cooking classes, and food festivals" },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const category = await prisma.eventCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories.push(category);
  }
  console.log(`Created ${categories.length} categories`);

  // 2. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@planora.com' },
    update: {},
    create: {
      email: 'admin@planora.com',
      name: 'Planora Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('Admin user created');

  // 3. Create Organizer User
  const organizerPassword = await bcrypt.hash('organizer123', 10);
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@planora.com' },
    update: {},
    create: {
      email: 'organizer@planora.com',
      name: 'Event Organizer',
      passwordHash: organizerPassword,
      role: 'ORGANIZER',
      emailVerified: true,
    },
  });
  console.log('Organizer user created');

  // 4. Create Some Events
  const events = [
    {
      title: "Global Tech Summit 2026",
      description: "Join industry leaders for a two-day summit on the future of AI and Web3.",
      date: new Date('2026-06-15T09:00:00Z'),
      venue: "Tech Convention Center, SF",
      fee: 299.99,
      eventType: "PUBLIC_PAID",
      categoryId: categories.find(c => c.name === "Technology")!.id,
      organizerId: organizer.id,
      isFeatured: true,
    },
    {
      title: "Art in the Park",
      description: "A free community art exhibition featuring local artists.",
      date: new Date('2026-05-20T10:00:00Z'),
      venue: "Central Park, NY",
      fee: 0,
      eventType: "PUBLIC_FREE",
      categoryId: categories.find(c => c.name === "Music & Arts")!.id,
      organizerId: organizer.id,
    },
    {
      title: "Startup Networking Night",
      description: "Connect with founders and investors in a casual setting.",
      date: new Date('2026-05-10T18:30:00Z'),
      venue: "The Hub Coworking Space",
      fee: 25.00,
      eventType: "PRIVATE_PAID",
      categoryId: categories.find(c => c.name === "Business")!.id,
      organizerId: organizer.id,
    }
  ];

  for (const eventData of events) {
    // Check if event already exists to avoid duplicates during re-seeding
    const existing = await prisma.event.findFirst({ where: { title: eventData.title }});
    if (!existing) {
       await prisma.event.create({ data: eventData as any });
    }
  }
  console.log('Events seeded');

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
