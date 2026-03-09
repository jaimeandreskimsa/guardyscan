import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Simular lo que hace Next.js: .env.local tiene prioridad
// Pero Prisma CLI usa .env
// Probemos AMBAS bases de datos

const envs = [
  { name: '.env', url: 'postgresql://neondb_owner:npg_jeAglu1K6iUR@ep-tiny-dew-aegju0ti.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require' },
  { name: '.env.local', url: 'postgresql://neondb_owner:npg_jeAglu1K6iUR@ep-falling-frog-aebj5b92-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require' },
];

const password = 'ChangeMe123!';

for (const env of envs) {
  console.log(`\n=== Testing ${env.name} (${env.url.split('@')[1].split('.')[0]}) ===`);
  const prisma = new PrismaClient({ datasources: { db: { url: env.url } } });
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'jaimegomez@kimsa.io' },
      select: { id: true, email: true, password: true, role: true }
    });
    
    if (!user) {
      console.log('  User NOT found in this DB');
    } else {
      console.log('  User found:', user.email, 'Role:', user.role);
      console.log('  Hash:', user.password.substring(0, 20) + '...');
      const match = await bcrypt.compare(password, user.password);
      console.log('  Password match:', match ? 'YES' : 'NO');
      
      if (!match) {
        console.log('  -> Fixing password...');
        const hashed = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { email: 'jaimegomez@kimsa.io' },
          data: { password: hashed }
        });
        const verify = await bcrypt.compare(password, hashed);
        console.log('  -> Fixed! Verify:', verify ? 'OK' : 'FAIL');
      }
    }
    
    await prisma.$disconnect();
  } catch (e) {
    console.log('  Error:', e.message);
    await prisma.$disconnect();
  }
}
