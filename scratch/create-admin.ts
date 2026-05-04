import { auth } from '../src/app/lib/auth';
import { prisma } from '../src/app/lib/prisma';

async function main() {
  try {
    const users = [
        { email: 'admin@planora.com', password: 'admin123', name: 'Planora Admin', role: 'ADMIN' },
        { email: 'organizer@planora.com', password: 'organizer123', name: 'Event Organizer', role: 'ORGANIZER' }
    ];

    for (const u of users) {
        // 1. Delete existing
        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (existing) {
            await prisma.user.delete({ where: { email: u.email } });
            console.log('Deleted existing user:', u.email);
        }

        // 2. Create via Better Auth
        await auth.api.signUpEmail({
            body: {
                email: u.email,
                password: u.password,
                name: u.name,
            },
        });

        // 3. Update role
        await prisma.user.update({
            where: { email: u.email },
            data: { role: u.role, emailVerified: true }
        });
        console.log(`User ${u.email} created successfully.`);
    }
  } catch (error) {
    console.error('Failed to recreate users:', error);
  }
}

main().finally(() => prisma.$disconnect());
