import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    scansLimit: 3,
    features: [
      "3 escaneos por mes",
      "Análisis básico",
      "Dashboard básico",
    ],
  },
  BASIC: {
    name: "Básico",
    price: 2900, // $29.00
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
    price: 9900, // $99.00
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
    price: 29900, // $299.00
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
