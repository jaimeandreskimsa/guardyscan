import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuración optimizada de Prisma
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Solo loggear errores en producción, queries en desarrollo
    log: process.env.NODE_ENV === "production" 
      ? ["error"] 
      : ["error", "warn"],
    // Optimizar conexiones
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Evitar múltiples instancias en desarrollo
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Cleanup en cierre de aplicación
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
