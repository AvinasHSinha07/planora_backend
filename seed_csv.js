const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const jsonPath = path.join(__dirname, '../Events_Data_Fixed.json');
  if (!fs.existsSync(jsonPath)) {
      console.error(`Error: JSON file not found at ${jsonPath}`);
      return;
  }
  const eventsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log("Cleaning up existing event data...");
  // Delete in order to avoid FK issues
  await prisma.review.deleteMany({});
  await prisma.eventParticipant.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.approvalRequest.deleteMany({});
  await prisma.banList.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.eventCategory.deleteMany({});

  console.log("Setting up organizer...");
  let organizer = await prisma.user.findUnique({
    where: { email: 'organizer@planora.com' }
  });

  if (!organizer) {
    organizer = await prisma.user.create({
      data: {
        email: 'organizer@planora.com',
        name: 'Planora Organizer',
        role: 'ORGANIZER',
        passwordHash: '$2b$10$n8vR4Wf.8p1G9Y2u7UvX/O5r3yR/x1mO7yP8r9w0e1r2t3y4u5i6o',
        emailVerified: true
      }
    });
  } else {
    organizer = await prisma.user.update({
      where: { id: organizer.id },
      data: { role: 'ORGANIZER' }
    });
  }

  console.log(`Seeding ${eventsData.length} events...`);
  
  for (const item of eventsData) {
    const categoryName = item.event_category || "General";
    
    let category = await prisma.eventCategory.findUnique({
      where: { name: categoryName }
    });

    if (!category) {
      category = await prisma.eventCategory.create({
        data: { name: categoryName }
      });
    }

    let eventDate = new Date();
    if (item.event_date) {
        const match = item.event_date.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/);
        const yearMatch = item.event_date.match(/\d{4}/);
        if (match && yearMatch) {
            eventDate = new Date(`${match[0]} ${yearMatch[0]}`);
        } else {
            eventDate = new Date(item.extraction_date || '2026-05-01');
        }
    }

    await prisma.event.create({
      data: {
        title: item.event_name,
        description: item.description,
        bannerImage: item.image_link,
        date: eventDate,
        venue: item.venue_name,
        eventLink: item.event_link || item.website,
        fee: parseFloat(item.numeric_fee),
        eventType: item.planora_event_type,
        organizerId: organizer.id,
        categoryId: category.id,
        isFeatured: Math.random() > 0.8
      }
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
