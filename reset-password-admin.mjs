// Script para resetear contraseña del usuario jaimegomez@kimsa.io
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'jaimegomez@kimsa.io';
  const newPassword = 'GuardyScan2026!'; // Cambia esta contraseña si quieres otra
  
  try {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✓ Usuario encontrado:', user.email);
    console.log('✓ Nombre:', user.name);
    console.log('✓ ID:', user.id);

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log('\n✅ ¡CONTRASEÑA ACTUALIZADA EXITOSAMENTE!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', email);
    console.log('🔑 Nueva Contraseña:', newPassword);
    console.log('═══════════════════════════════════════');
    console.log('\n🌐 Inicia sesión en: https://www.guardyscan.com/auth/login\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
