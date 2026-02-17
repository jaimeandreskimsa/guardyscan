import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: "", // Plan gratuito sin priceId
    scansLimit: -1,
    features: [
      "Escaneos ilimitados",
      "Análisis básico",
      "Dashboard básico",
    ],
  },
  BASIC: {
    name: "Básico",
    price: 10000, // $100.00
    priceId: process.env.STRIPE_PRICE_BASIC!,
    scansLimit: 50,
    features: [
      "50 escaneos/mes",
      "Análisis de seguridad básico",
      "Gestión de incidentes",
      "Dashboard básico",
      "Soporte por email",
    ],
  },
  PROFESSIONAL: {
    name: "Profesional",
    price: 30000, // $300.00
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
    scansLimit: 200,
    features: [
      "200 escaneos/mes",
      "Análisis completo + vulnerabilidades",
      "ISO 27001 compliance",
      "Dashboard avanzado",
      "API access",
      "Soporte prioritario",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 90000, // $900.00
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    scansLimit: -1, // unlimited
    features: [
      "Escaneos ilimitados",
      "Todas las funcionalidades",
      "Multi-usuario (hasta 10)",
      "Integraciones personalizadas",
      "Consultoría incluida",
      "Soporte 24/7",
    ],
  },
};

export const PDF_REPORT_PRICE = 999; // $9.99
export const PDF_REPORT_PRICE_ID = process.env.STRIPE_PRICE_PDF_REPORT!;
