// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The default configuration data, just like in your hook.
const defaultBrandConfig = {
  name: "AWE e.V.",
  colors: {
    primary: "#d95d39",
    secondary: "#2c3e50",
    accent: "#f39c12",
  },
  social: {
    twitter: "https://twitter.com/example",
    facebook: "https://facebook.com/example",
    linkedin: "https://linkedin.com/in/example",
  },
  contact: {
    email: "info@awe-ev.org",
    phone: "+49 123 456 789",
    address: "Rosenstr 25 in 85609, Aschheim, Germany",
  },
};

async function main() {
  console.log(`Start seeding ...`);

  // Use `upsert` to create the config if it doesn't exist, or update it if it does.
  // This makes the script safe to run multiple times.
  const config = await prisma.brandConfig.upsert({
    where: { singleton: 'main' }, // Find the record with this unique key
    update: {}, // We don't need to update anything if it exists
    create: {
      singleton: 'main', // The unique key for the new record
      name: defaultBrandConfig.name,
      colors: defaultBrandConfig.colors,
      social: defaultBrandConfig.social,
      contact: defaultBrandConfig.contact,
    },
  });

  console.log(`Created/updated brand config with id: ${config.id}`);
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// // prisma/seed.ts
// import { PrismaClient, Role, ProgramCategory, ProgramStatus } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱  Seeding database …');

//   /* 1.  Brand configuration (singleton) */
//   await prisma.brandConfig.upsert({
//     where: { singleton: 'main' },
//     update: {},
//     create: {
//       singleton: 'main',
//       name: 'AWE e.V.',
//       colors: {
//         primary: '#D95D39',
//         secondary: '#1D2129',
//         accent: '#F0A202',
//       },
//       social: {
//         twitter: 'https://twitter.com/awe_ev',
//         facebook: 'https://facebook.com/awe_ev',
//         linkedin: 'https://linkedin.com/company/awe_ev',
//       },
//       contact: {
//         email: 'info@awe-ev.org',
//         phone: '+49 123 456 789',
//         address: 'Rosenstr 25, 85609 Aschheim, Germany',
//       },
//     },
//   });

//   /* 2.  Demo users (one per role) */
//   const roles = Object.values(Role);
//   for (const role of roles) {
//     await prisma.user.upsert({
//       where: { email: `${role.toLowerCase()}@example.com` },
//       update: {},
//       create: {
//         email: `${role.toLowerCase()}@example.com`,
//         hashedPassword: '$2b$10$dummyHash', // pragma: allowlist secret
//         role,
//         firstName: role.replace('_', ' '),
//         lastName: 'User',
//         isVerified: true,
//         onboardingComplete: true,
//       },
//     });
//   }

//   /* 3.  Sample programs – create (not upsert) with required Json fields */
//   const programs = [
//     {
//       name: { en: 'Digital Literacy for Women' },
//       description: { en: 'A 6-week boot-camp that teaches basic computer skills.' },
//       category: ProgramCategory.ECONOMIC_EMPOWERMENT,
//       status: ProgramStatus.OPEN,
//       rules: {},   // required
//       steps: {},   // required
//     },
//     {
//       name: { en: 'Youth Leadership Weekend' },
//       description: { en: 'Weekend workshop on soft-skills and leadership.' },
//       category: ProgramCategory.EDUCATION_YOUTH,
//       status: ProgramStatus.DRAFT,
//       rules: {},
//       steps: {},
//     },
//   ];

//   for (const p of programs) {
//     await prisma.program.create({ data: p });
//   }

//   console.log('✅  Seeding complete.');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });