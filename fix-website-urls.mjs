import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

// Parse .env.local and strip surrounding quotes from values
const envLocal = readFileSync('.env.local', 'utf8');
for (const line of envLocal.split('\n')) {
  const match = line.match(/^([A-Z_][A-Z0-9_]*)=("?)([^"]*)\2\s*$/);
  if (match) process.env[match[1]] = match[3];
}

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { website: { not: null } },
    select: { id: true, email: true, website: true }
  });

  for (const u of users) {
    const w = u.website;
    if (w && !w.startsWith('http://') && !w.startsWith('https://')) {
      const fixed = 'https://' + w;
      await prisma.user.update({ where: { id: u.id }, data: { website: fixed } });
      console.log('Fixed:', u.email, `"${w}" → "${fixed}"`);
    } else {
      console.log('OK:', u.email, w);
    }
  }
  await prisma.$disconnect();
}

main().catch(console.error);
