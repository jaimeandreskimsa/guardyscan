import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fix() {
  // Hash the password
  const password = 'ChangeMe123!';
  const hashed = await bcrypt.hash(password, 12);
  
  // Verify the hash works BEFORE saving
  const verify = await bcrypt.compare(password, hashed);
  console.log('Pre-save verification:', verify ? 'OK' : 'FAIL');
  
  // Update user
  const user = await prisma.user.update({
    where: { email: 'jaimegomez@kimsa.io' },
    data: { password: hashed },
    select: { id: true, email: true, password: true, role: true }
  });
  
  console.log('User updated:', user.email, 'Role:', user.role);
  console.log('Stored hash:', user.password);
  
  // Verify AFTER saving by reading back
  const readBack = await prisma.user.findUnique({
    where: { email: 'jaimegomez@kimsa.io' },
    select: { password: true }
  });
  
  const finalCheck = await bcrypt.compare(password, readBack.password);
  console.log('Post-save verification:', finalCheck ? 'OK' : 'FAIL');
  console.log('Hash from DB:', readBack.password);
  console.log('Hash matches stored:', readBack.password === hashed);
  
  await prisma.$disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
