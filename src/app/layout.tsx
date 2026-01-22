import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GuardyScan - Plataforma de Ciberseguridad Empresarial",
  description: "Análisis de seguridad, gestión de incidentes y cumplimiento ISO 27001 para empresas",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <WhatsAppButton />
      </body>
    </html>
  );
}
