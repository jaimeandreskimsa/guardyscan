"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, Check, Crown, Zap, Building2, 
  Shield, Loader2, AlertCircle, ExternalLink,
  Receipt, Calendar, TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  plan: "FREE" | "BASIC" | "PROFESSIONAL" | "ENTERPRISE";
  status: string;
  scansUsed: number;
  scansLimit: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const PLANS = {
  FREE: {
    name: "Gratuito",
    price: 0,
    priceLabel: "Gratis",
    scansLimit: 3,
    icon: Shield,
    color: "gray",
    features: [
      "3 escaneos por mes",
      "Análisis básico de seguridad",
      "Dashboard básico",
      "1 empresa",
    ],
  },
  BASIC: {
    name: "Básico",
    price: 100,
    priceLabel: "$100/mes",
    scansLimit: 50,
    icon: Zap,
    color: "blue",
    features: [
      "50 escaneos por mes",
      "Análisis de seguridad completo",
      "Gestión de incidentes",
      "Dashboard avanzado",
      "Soporte por email",
      "1 empresa",
    ],
  },
  PROFESSIONAL: {
    name: "Profesional",
    price: 300,
    priceLabel: "$300/mes",
    scansLimit: 200,
    icon: Crown,
    color: "purple",
    popular: true,
    features: [
      "200 escaneos por mes",
      "Análisis completo + vulnerabilidades",
      "ISO 27001 compliance",
      "SIEM integrado",
      "API access",
      "Soporte prioritario",
      "1 empresa",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 900,
    priceLabel: "$900/mes",
    scansLimit: -1,
    icon: Building2,
    color: "orange",
    features: [
      "Escaneos ilimitados",
      "Todas las funcionalidades",
      "Hasta 30 empresas",
      "Multi-usuario (hasta 10)",
      "Integraciones personalizadas",
      "Consultoría incluida",
      "Soporte 24/7",
      "SLA garantizado",
    ],
  },
};

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    if (plan === "FREE") return;
    
    setUpgradeLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpgradeLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo abrir el portal de facturación",
        variant: "destructive",
      });
    }
  };

  const currentPlan = subscription?.plan || "FREE";
  const currentPlanData = PLANS[currentPlan];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Facturación y Suscripción</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu plan, uso y métodos de pago
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                currentPlan === "ENTERPRISE" ? "bg-orange-100 dark:bg-orange-900" :
                currentPlan === "PROFESSIONAL" ? "bg-purple-100 dark:bg-purple-900" :
                currentPlan === "BASIC" ? "bg-blue-100 dark:bg-blue-900" :
                "bg-gray-100 dark:bg-gray-800"
              }`}>
                <currentPlanData.icon className={`h-6 w-6 ${
                  currentPlan === "ENTERPRISE" ? "text-orange-600 dark:text-orange-400" :
                  currentPlan === "PROFESSIONAL" ? "text-purple-600 dark:text-purple-400" :
                  currentPlan === "BASIC" ? "text-blue-600 dark:text-blue-400" :
                  "text-gray-600 dark:text-gray-400"
                }`} />
              </div>
              <div>
                <CardTitle className="text-xl">Plan {currentPlanData.name}</CardTitle>
                <CardDescription>
                  {currentPlan === "FREE" ? "Plan gratuito activo" : "Suscripción activa"}
                </CardDescription>
              </div>
            </div>
            {currentPlan !== "FREE" && (
              <Button variant="outline" onClick={handleManageSubscription} className="gap-2">
                <CreditCard className="h-4 w-4" />
                Gestionar Suscripción
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Usage */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <TrendingUp className="h-4 w-4" />
                Uso este mes
              </div>
              <div className="text-2xl font-bold">
                {subscription?.scansUsed || 0}
                <span className="text-base font-normal text-gray-500">
                  /{subscription?.scansLimit === -1 ? "∞" : subscription?.scansLimit || 3} escaneos
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    (subscription?.scansUsed || 0) / (subscription?.scansLimit || 3) > 0.8 
                      ? "bg-red-500" 
                      : "bg-blue-500"
                  }`}
                  style={{ 
                    width: subscription?.scansLimit === -1 
                      ? "10%" 
                      : `${Math.min(((subscription?.scansUsed || 0) / (subscription?.scansLimit || 3)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Price */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Receipt className="h-4 w-4" />
                Precio
              </div>
              <div className="text-2xl font-bold">
                {currentPlanData.priceLabel}
              </div>
              {subscription?.cancelAtPeriodEnd && (
                <p className="text-sm text-yellow-600 mt-1">
                  Se cancelará al final del período
                </p>
              )}
            </div>

            {/* Next billing */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Calendar className="h-4 w-4" />
                {currentPlan === "FREE" ? "Estado" : "Próximo cobro"}
              </div>
              <div className="text-2xl font-bold">
                {currentPlan === "FREE" ? (
                  "Activo"
                ) : subscription?.currentPeriodEnd ? (
                  new Date(subscription.currentPeriodEnd).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {currentPlan === "FREE" ? "Elige tu plan" : "Cambiar de plan"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
            const isCurrentPlan = key === currentPlan;
            const PlanIcon = plan.icon;
            const isPopular = 'popular' in plan && plan.popular;

            return (
              <Card 
                key={key}
                className={`relative transition-all ${
                  isCurrentPlan 
                    ? "border-2 border-blue-500 shadow-lg" 
                    : isPopular 
                      ? "border-2 border-purple-300 dark:border-purple-700" 
                      : ""
                }`}
              >
                {isPopular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                      Más popular
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                      Plan actual
                    </span>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-2 ${
                    key === "ENTERPRISE" ? "bg-orange-100 dark:bg-orange-900" :
                    key === "PROFESSIONAL" ? "bg-purple-100 dark:bg-purple-900" :
                    key === "BASIC" ? "bg-blue-100 dark:bg-blue-900" :
                    "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    <PlanIcon className={`h-5 w-5 ${
                      key === "ENTERPRISE" ? "text-orange-600 dark:text-orange-400" :
                      key === "PROFESSIONAL" ? "text-purple-600 dark:text-purple-400" :
                      key === "BASIC" ? "text-blue-600 dark:text-blue-400" :
                      "text-gray-600 dark:text-gray-400"
                    }`} />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-2xl font-bold">
                    {plan.price === 0 ? "Gratis" : `$${plan.price}`}
                    {plan.price > 0 && <span className="text-sm font-normal text-gray-500">/mes</span>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          key === "ENTERPRISE" ? "text-orange-500" :
                          key === "PROFESSIONAL" ? "text-purple-500" :
                          key === "BASIC" ? "text-blue-500" :
                          "text-gray-400"
                        }`} />
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : key === "PROFESSIONAL" ? "default" : "outline"}
                    disabled={isCurrentPlan || upgradeLoading !== null}
                    onClick={() => handleUpgrade(key)}
                  >
                    {upgradeLoading === key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      "Plan actual"
                    ) : key === "FREE" ? (
                      "Cambiar a Free"
                    ) : (
                      `Elegir ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Preguntas Frecuentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">¿Puedo cambiar de plan en cualquier momento?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sí, puedes actualizar o bajar de plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratean.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">¿Qué pasa si excedo mi límite de escaneos?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No podrás realizar más escaneos hasta el próximo mes o hasta que actualices tu plan.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">¿Hay compromiso de permanencia?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No, puedes cancelar en cualquier momento. Tu suscripción seguirá activa hasta el final del período pagado.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">¿Cómo funciona la facturación?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Se cobra mensualmente a través de Stripe. Recibirás facturas automáticas por email.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
