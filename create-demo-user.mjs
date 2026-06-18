import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

// Load .env.local manually
const envContent = readFileSync('.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
}

const prisma = new PrismaClient();

// bcrypt-compatible hash using built-in crypto (bcryptjs format)
// We'll use a known bcrypt hash for "Demo2026!"
// Generated externally: bcrypt.hashSync("Demo2026!", 10)
const PASSWORD = "Demo2026!";
const HASHED_PASSWORD = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi."; // bcrypt for "password" - we'll generate correctly

// We need to hash properly - use a simple approach with bcryptjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch {
  bcrypt = require('bcrypt');
}

const hashedPwd = await bcrypt.hash(PASSWORD, 10);

const EMAIL = "demo@guardyscan.app";
const NAME = "Demo GuardyScan";
const COMPANY = "Demo Company S.A.";
const WEBSITE = "https://demo.guardyscan.app";

// Delete if already exists
const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
if (existing) {
  await prisma.subscription.deleteMany({ where: { userId: existing.id } });
  await prisma.user.delete({ where: { email: EMAIL } });
  console.log("🗑️  Usuario demo anterior eliminado");
}

// Create user
const user = await prisma.user.create({
  data: {
    name: NAME,
    email: EMAIL,
    password: hashedPwd,
    company: COMPANY,
    website: WEBSITE,
    industry: "Tecnología",
    companySize: "11-50",
    onboardingCompleted: true,
    role: "user",
  }
});

// Create ENTERPRISE subscription
await prisma.subscription.create({
  data: {
    userId: user.id,
    plan: "ENTERPRISE",
    status: "ACTIVE",
    scansUsed: 0,
    scansLimit: -1,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  }
});

console.log("\n✅ Cuenta demo creada exitosamente");
console.log("──────────────────────────────────");
console.log(`📧 Email:      ${EMAIL}`);
console.log(`🔑 Contraseña: ${PASSWORD}`);
console.log(`📦 Plan:       ENTERPRISE`);
console.log(`🏢 Empresa:    ${COMPANY}`);
console.log("──────────────────────────────────\n");

await prisma.$disconnect();
