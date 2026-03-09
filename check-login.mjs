import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'jaimegomez@kimsa.io' },
    select: { id: true, email: true, name: true, role: true, password: true }
  });

  if (!user) {
    console.log('Usuario NO encontrado. Creando usuario...');
    const hashed = await bcrypt.hash('ChangeMe123!', 12);
    const newUser = await prisma.user.create({
      data: {
        email: 'jaimegomez@kimsa.io',
        name: 'Jaime Gomez',
        password: hashed,
        role: 'admin',
      }
    });
    console.log('Usuario creado:', newUser.email);
    await prisma.$disconnect();
    return;
  }

  console.log('Usuario encontrado:', { id: user.id, email: user.email, name: user.name, role: user.role });
  const match = await bcrypt.compare('ChangeMe123!', user.password);
  console.log('Password ChangeMe123!:', match ? 'CORRECTA' : 'INCORRECTA');

  if (!match) {
    console.log('Reseteando password a ChangeMe123!...');
    const hashed = await bcrypt.hash('ChangeMe123!', 12);
    await prisma.user.update({
      where: { email: 'jaimegomez@kimsa.io' },
      data: { password: hashed }
    });
    console.log('Password actualizada correctamente');
  }

  await prisma.$disconnect();
}

check().catch(e => { console.error(e); process.exit(1); });
