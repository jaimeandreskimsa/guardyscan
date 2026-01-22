"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Shield, Search, Download, Eye, 
  Globe, Lock, Server, Activity, 
  FileText, CheckCircle, AlertTriangle,
  Network, Zap, Cpu, Database,
  Map, Code, BarChart3, ExternalLink,
  Loader2
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function ScansPage() {
  const { data: session } = useSession();
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scans, setScans] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  const handleDownloadPdf = async (scanId: string) => {
    setDownloadingPdf(scanId);
    try {
      const response = await fetch(`/api/pdf/download/${scanId}`);
      
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          // No ha comprado el PDF, redirigir a la compra
          alert("Para descargar el reporte PDF profesional, primero debes adquirirlo.");
          return;
        }
        throw new Error(error.error || "Error al descargar el PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GuardyScan-Report-${scanId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Error descargando PDF:", error);
      alert(error.message || "Error al descargar el PDF");
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Agregar https:// si no tiene protocolo
      let formattedUrl = targetUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      const response = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: formattedUrl, scanType: "FULL" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el escaneo");
      }

      setMessage("¡Escaneo iniciado exitosamente!");
      setTargetUrl("");
      loadScans();
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadScans = async () => {
    try {
      const response = await fetch("/api/scans");
      const data = await response.json();
      setScans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando escaneos:", error);
      setScans([]);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  // Auto-refresh cuando hay scans procesando
  useEffect(() => {
    if (!scans.some(scan => scan.status === 'PROCESSING' || scan.status === 'PENDING')) {
      return;
    }
    
    const interval = setInterval(() => {
      loadScans();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [scans]);

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      RUNNING: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      FAILED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  // Modal de detalles del escaneo
  const ScanDetailsModal = ({ scan }: { scan: any }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Análisis Completo - {scan.targetUrl}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {new Date(scan.createdAt).toLocaleString("es-ES")}
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowDetails(false)}>
            ✕ Cerrar
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Puntuación General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Puntuación de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={scan.score >= 80 ? "#10b981" : scan.score >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="10"
                      strokeDasharray={`${(scan.score || 0) * 2.83} 283`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">{scan.score || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de análisis detallado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Información del Servidor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Información del Servidor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <InfoRow label="Dirección IP" value={scan.serverInfo?.ip || scan.dnsRecords?.a?.[0] || "No disponible"} />
                  <InfoRow label="Proveedor" value={scan.serverInfo?.provider || "No disponible"} />
                  <InfoRow label="Localización" value={scan.serverInfo?.location || "No disponible"} icon={<Map className="h-4 w-4" />} />
                  <InfoRow label="ASN" value={scan.serverInfo?.asn || "No disponible"} />
                  <InfoRow label="Tiempo de respuesta" value={scan.serverInfo?.responseTime || "No disponible"} />
                </div>
                <BusinessImpact 
                  text={`Un tiempo de respuesta de ${scan.serverInfo?.responseTime || '45ms'} impacta directamente la experiencia del usuario. Cada 100ms de retraso puede reducir las conversiones hasta un 7%. La localización del servidor afecta la velocidad de acceso para clientes en diferentes regiones geográficas.`}
                />
              </CardContent>
            </Card>

            {/* 2. SSL/TLS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Certificado SSL/TLS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <InfoRow 
                    label="Estado" 
                    value={scan.sslInfo?.valid ? "✓ Válido" : "✗ Inválido"} 
                    className={scan.sslInfo?.valid ? "text-green-600" : "text-red-600"}
                  />
                  <InfoRow label="Emisor" value={scan.sslInfo?.issuer || "No disponible"} />
                  <InfoRow label="Válido desde" value={scan.sslInfo?.validFrom ? new Date(scan.sslInfo.validFrom).toLocaleDateString('es-ES') : "No disponible"} />
                  <InfoRow label="Expira" value={scan.sslInfo?.validTo ? new Date(scan.sslInfo.validTo).toLocaleDateString('es-ES') : "No disponible"} />
                  <InfoRow label="Días restantes" value={scan.sslInfo?.daysRemaining ? `${scan.sslInfo.daysRemaining} días` : "No disponible"} />
                  <InfoRow label="Dominios alternativos" value={scan.sslInfo?.subjectAltNames || "No disponible"} />
                </div>
                <BusinessImpact 
                  text={scan.sslInfo?.valid 
                    ? "SSL válido protege la confianza del cliente. El 85% de usuarios abandonan compras en sitios sin HTTPS. Google penaliza el SEO de sitios sin certificado válido, afectando visibilidad y ventas."
                    : "⚠️ CRÍTICO: Sin SSL válido, los navegadores mostrarán advertencias de 'No seguro', causando pérdida inmediata de hasta 70% de visitantes. Datos de clientes y pagos están en riesgo, con responsabilidad legal directa."}
                  type={scan.sslInfo?.valid ? "success" : "danger"}
                />
              </CardContent>
            </Card>

            {/* 3. DNS Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Registros DNS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">A Records</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                      {scan.dnsRecords?.a?.length > 0 ? scan.dnsRecords.a.join(", ") : "No encontrados"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">MX Records</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                      {scan.dnsRecords?.mx?.length > 0 ? scan.dnsRecords.mx.map((mx: any) => mx.exchange || mx).join(", ") : "No encontrados"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">TXT Records</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 pl-3 break-all">
                      {scan.dnsRecords?.txt?.length > 0 ? scan.dnsRecords.txt.slice(0, 2).map((t: any) => Array.isArray(t) ? t.join(' ') : t).join(", ") : "No encontrados"}
                    </div>
                  </div>
                </div>
                <BusinessImpact 
                  text="DNS mal configurado puede hacer tu sitio inaccesible (pérdida de ventas 24/7). Registros MX incorrectos bloquean emails de clientes. Sin registros SPF/DMARC, tus emails van a spam, reduciendo tasa de apertura del 20% al 2%."
                />
              </CardContent>
            </Card>

            {/* 4. Encabezados de Seguridad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Encabezados HTTP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <SecurityHeader name="Strict-Transport-Security" present={!!scan.securityHeaders?.headers?.['strict-transport-security']} />
                  <SecurityHeader name="X-Content-Type-Options" present={!!scan.securityHeaders?.headers?.['x-content-type-options']} />
                  <SecurityHeader name="X-Frame-Options" present={!!scan.securityHeaders?.headers?.['x-frame-options']} />
                  <SecurityHeader name="Content-Security-Policy" present={!!scan.securityHeaders?.headers?.['content-security-policy']} />
                  <SecurityHeader name="X-XSS-Protection" present={!!scan.securityHeaders?.headers?.['x-xss-protection']} />
                  <SecurityHeader name="Referrer-Policy" present={!!scan.securityHeaders?.headers?.['referrer-policy']} />
                </div>
                <BusinessImpact 
                  text={(scan.securityHeaders?.missingHeaders?.length || 0) > 0
                    ? `⚠️ Faltan ${scan.securityHeaders.missingHeaders.length} encabezados de seguridad. Tu sitio es vulnerable a ataques XSS y clickjacking. Un solo ataque puede robar datos de clientes, resultando en multas GDPR de hasta $20.000 millones CLP o 4% de facturación anual, más pérdida total de confianza de marca.`
                    : "Encabezados de seguridad protegen contra robo de datos y ataques. Cumplimiento esencial para certificaciones PCI-DSS requeridas para procesar pagos. Evita multas regulatorias y demandas."}
                  type={(scan.securityHeaders?.missingHeaders?.length || 0) > 0 ? "warning" : "success"}
                />
              </CardContent>
            </Card>

            {/* 5. Tecnologías Detectadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Tecnologías Detectadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {(scan.technologies && scan.technologies.length > 0 ? 
                    scan.technologies.map((tech: any) => 
                      typeof tech === 'string' ? { name: tech, version: "-", category: "Detectado" } : tech
                    ) : 
                    [{ name: "No se detectaron tecnologías", version: "-", category: "N/A" }]
                  ).map((tech: any, i: number) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{tech.name}</div>
                        <div className="text-xs text-gray-500">{tech.category}</div>
                      </div>
                      <div className="text-sm text-gray-600">{tech.version}</div>
                    </div>
                  ))}
                </div>
                <BusinessImpact 
                  text="Tecnologías obsoletas tienen vulnerabilidades conocidas públicamente. Hackers las explotan automáticamente. Actualizar previene el 60% de brechas de seguridad. Versiones antiguas también ralentizan el sitio, aumentando costos de servidor y reduciendo conversiones."
                />
              </CardContent>
            </Card>

            {/* 6. Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <InfoRow label="Tiempo de carga" value={scan.performance?.loadTime || "No disponible"} />
                  <InfoRow label="Tamaño total" value={scan.performance?.size || "No disponible"} />
                  <InfoRow label="Peticiones" value={scan.performance?.requests || "No disponible"} />
                  <InfoRow label="Lighthouse Score" value={scan.performance?.lighthouse || "No disponible"} />
                </div>
                <BusinessImpact 
                  text="Cada segundo de carga adicional = -7% conversiones. Sitios lentos pierden millones anuales por retraso en carga. Google penaliza sitios lentos en búsquedas. Usuarios móviles (60% del tráfico) abandonan si carga >3s. Velocidad = dinero directo."
                  type="info"
                />
              </CardContent>
            </Card>

            {/* 7. Puertos Abiertos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Puertos y Servicios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {(scan.openPorts && scan.openPorts.length > 0 ? scan.openPorts : [
                    { port: "N/A", service: "Escaneo de puertos no implementado", status: "pending" },
                  ]).map((port: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-medium">Puerto {port.port}</span>
                      <span className="text-sm text-gray-600">{port.service}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        port.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {port.status}
                      </span>
                    </div>
                  ))}
                </div>
                <BusinessImpact 
                  text="Puertos innecesarios abiertos = puertas sin llave en tu empresa. Puerto 22 (SSH) expuesto permite acceso directo a servidores. El 70% de brechas inician por puertos mal configurados. Cada puerto abierto multiplica superficie de ataque."
                  type="warning"
                />
              </CardContent>
            </Card>

            {/* 8. Vulnerabilidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Vulnerabilidades Detectadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {(scan.vulnerabilities || []).length === 0 ? (
                    <div className="text-center py-4 text-green-600">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">No se detectaron vulnerabilidades</p>
                    </div>
                  ) : (
                    (scan.vulnerabilities || []).map((vuln: any, i: number) => {
                      const severityMap: { [key: string]: string } = {
                        'CRITICAL': 'Crítica',
                        'HIGH': 'Alta',
                        'MEDIUM': 'Media',
                        'LOW': 'Baja',
                        'INFO': 'Informativa'
                      };
                      const severidadES = severityMap[vuln.severity?.toUpperCase()] || vuln.severity;
                      
                      return (
                        <div key={i} className="border-l-4 border-red-500 pl-3 py-2">
                          <div className="font-medium text-red-700">{vuln.title}</div>
                          <div className="text-sm text-gray-600">{vuln.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Severidad: <span className="font-semibold">{severidadES}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <BusinessImpact 
                  text={(scan.vulnerabilities || []).length === 0 
                    ? "Sitio protegido contra ataques conocidos. Reduces riesgo de brechas que cuestan promedio $4.200 millones CLP. Protege reputación de marca y evita demandas colectivas."
                    : "🚨 URGENTE: Cada vulnerabilidad es una brecha potencial. Costo promedio de hackeo: $4.200 millones CLP + pérdida de clientes permanente. Tiempo medio hasta explotación: 15 días. Acción inmediata requerida."}
                  type={(scan.vulnerabilities || []).length === 0 ? "success" : "danger"}
                />
              </CardContent>
            </Card>

            {/* 9. Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Cookies y Privacidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <InfoRow label="Total de cookies" value={scan.cookies?.total || "No disponible"} />
                  <InfoRow label="Cookies seguras" value={scan.cookies?.secure || "No disponible"} />
                  <InfoRow label="HttpOnly" value={scan.cookies?.httpOnly || "No disponible"} />
                  <InfoRow label="SameSite" value={scan.cookies?.sameSite || "No disponible"} />
                </div>
                <BusinessImpact 
                  text="Cookies mal configuradas = multas GDPR inmediatas de $20.000 millones CLP. Cookies inseguras permiten robo de sesiones y acceso a cuentas de clientes. Sin HttpOnly, scripts maliciosos roban datos. Cada incumplimiento es evidencia en auditorías."
                  type="warning"
                />
              </CardContent>
            </Card>

            {/* 10. Archivos de Configuración */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Archivos de Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <ConfigFile name="robots.txt" found={scan.configFiles?.robots || false} />
                  <ConfigFile name="sitemap.xml" found={scan.configFiles?.sitemap || false} />
                  <ConfigFile name="security.txt" found={scan.configFiles?.security || false} />
                  <ConfigFile name=".well-known/security.txt" found={scan.configFiles?.wellKnown || false} />
                </div>
                <BusinessImpact 
                  text="Sin robots.txt, Google indexa páginas privadas. Sin sitemap.xml, pierdes 30-50% de visibilidad en búsquedas (= pérdida directa de clientes). Security.txt permite reportes responsables de vulnerabilidades antes de explotación pública."
                  type="info"
                />
              </CardContent>
            </Card>

            {/* 11. Firewall y Protección */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Firewall y Protección
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <InfoRow label="WAF Detectado" value={scan.firewall?.waf || "No detectado"} />
                  <InfoRow label="Protección DDoS" value={scan.firewall?.ddos ? "✓ Activa" : "✗ No detectada"} />
                  <InfoRow label="Rate Limiting" value={scan.firewall?.rateLimit ? "✓ Activo" : "✗ No detectado"} />
                </div>
                <BusinessImpact 
                  text={scan.firewall?.waf 
                    ? "WAF bloquea 99% de ataques automáticos. Sin él, sitio caería en minutos bajo ataque DDoS = pérdida total de ventas durante horas/días. Un ataque de 1 hora puede costar $300 millones CLP en ventas perdidas + recuperación."
                    : "⚠️ Sin WAF/DDoS: Competidores o atacantes pueden tumbar tu sitio por $50.000 CLP/hora. Tiempo de inactividad = 0 ventas + clientes que van con competencia. Recuperación toma días, daño reputacional permanente."}
                  type={scan.firewall?.waf ? "success" : "danger"}
                />
              </CardContent>
            </Card>

            {/* 12. Cumplimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Cumplimiento Normativo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scan.compliance?.iso27001?.score || scan.compliance?.gdpr?.compliant !== undefined ? (
                  <div className="space-y-2">
                    {scan.compliance?.iso27001?.score !== undefined && (
                      <ComplianceBar label="ISO 27001" percentage={scan.compliance.iso27001.score} />
                    )}
                    {scan.compliance?.gdpr?.compliant !== undefined && (
                      <ComplianceBar 
                        label="GDPR" 
                        percentage={scan.compliance.gdpr.compliant ? 100 : (scan.compliance.gdpr.issues?.length > 0 ? 50 : 0)} 
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No hay datos de cumplimiento normativo para este escaneo</p>
                    <p className="text-xs mt-1">Ejecuta un escaneo completo para obtener análisis de compliance</p>
                  </div>
                )}
                <BusinessImpact 
                  text="Incumplimiento GDPR = multas hasta $20.000 millones CLP. Sin PCI-DSS no puedes procesar pagos (0 ventas online). ISO 27001 requerido para contratos enterprise (90% de grandes clientes lo exigen). Cumplimiento no es opcional = es requisito de ventas."
                  type="danger"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análisis de Seguridad Web</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Análisis completo estilo web-check: SSL, DNS, tecnologías, vulnerabilidades, rendimiento y más
        </p>
      </div>

      {/* Formulario de nuevo escaneo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Nuevo Escaneo Completo
          </CardTitle>
          <CardDescription>
            Análisis exhaustivo de seguridad, infraestructura y rendimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="space-y-4">
            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.includes("exitosamente")
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="ejemplo.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Iniciar Análisis
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Este análisis incluye:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-800 dark:text-blue-400">
                <div className="flex items-center gap-1"><Server className="h-3 w-3" /> Información del servidor</div>
                <div className="flex items-center gap-1"><Lock className="h-3 w-3" /> Certificado SSL/TLS</div>
                <div className="flex items-center gap-1"><Network className="h-3 w-3" /> Registros DNS</div>
                <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> Encabezados de seguridad</div>
                <div className="flex items-center gap-1"><Code className="h-3 w-3" /> Tecnologías detectadas</div>
                <div className="flex items-center gap-1"><Zap className="h-3 w-3" /> Rendimiento</div>
                <div className="flex items-center gap-1"><Database className="h-3 w-3" /> Puertos abiertos</div>
                <div className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Vulnerabilidades</div>
                <div className="flex items-center gap-1"><FileText className="h-3 w-3" /> Cookies y archivos</div>
                <div className="flex items-center gap-1"><Globe className="h-3 w-3" /> Firewall y WAF</div>
                <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Cumplimiento</div>
                <div className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Score general</div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de escaneos */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Realizados</CardTitle>
          <CardDescription>
            Historial completo de escaneos de seguridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay análisis todavía</p>
              <p className="text-sm mt-2">¡Realiza tu primer análisis completo de seguridad!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{scan.targetUrl}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${getStatusBadge(
                            scan.status
                          )}`}
                        >
                          {scan.status === "PENDING" && "⏳ Pendiente"}
                          {scan.status === "PROCESSING" && (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              {scan.progress}% Procesando...
                            </>
                          )}
                          {scan.status === "RUNNING" && (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              {scan.progress}% Analizando...
                            </>
                          )}
                          {scan.status === "COMPLETED" && "✓ Completado"}
                          {scan.status === "FAILED" && "✗ Fallido"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(scan.createdAt).toLocaleString("es-ES", {
                          dateStyle: "long",
                          timeStyle: "short",
                        })}
                      </p>
                      
                      {/* Progress Bar for Processing/Running scans */}
                      {(scan.status === "PROCESSING" || scan.status === "RUNNING") && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progreso del análisis</span>
                            <span className="font-semibold">{scan.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${scan.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {scan.score && (
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${
                            scan.score >= 80 ? "text-green-600" : 
                            scan.score >= 60 ? "text-yellow-600" : 
                            "text-red-600"
                          }`}>
                            {scan.score}
                          </div>
                          <div className="text-xs text-gray-500">/ 100</div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {scan.status === "COMPLETED" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedScan(scan);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Análisis
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadPdf(scan.id)}
                              disabled={downloadingPdf === scan.id}
                            >
                              {downloadingPdf === scan.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              PDF
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {scan.status === "COMPLETED" && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard 
                          icon={<Lock className="h-4 w-4" />}
                          label="SSL/TLS" 
                          value={scan.sslInfo?.valid ? "Válido" : "Inválido"}
                          color={scan.sslInfo?.valid ? "green" : "red"}
                        />
                        <StatCard 
                          icon={<Shield className="h-4 w-4" />}
                          label="Encabezados" 
                          value={`${scan.headers?.count || 6}/8`}
                          color="blue"
                        />
                        <StatCard 
                          icon={<AlertTriangle className="h-4 w-4" />}
                          label="Vulnerabilidades" 
                          value={Array.isArray(scan.vulnerabilities) ? scan.vulnerabilities.length : 0}
                          color={scan.vulnerabilities?.length > 0 ? "red" : "green"}
                        />
                        <StatCard 
                          icon={<Zap className="h-4 w-4" />}
                          label="Rendimiento" 
                          value={scan.performance?.loadTime || "N/A"}
                          color="green"
                        />
                        <StatCard 
                          icon={<CheckCircle className="h-4 w-4" />}
                          label="Cumplimiento" 
                          value={scan.compliance?.iso27001?.score ? `${scan.compliance.iso27001.score}%` : 'N/A'}
                          color="blue"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      {showDetails && selectedScan && <ScanDetailsModal scan={selectedScan} />}
    </div>
  );
}

// Componentes auxiliares
const InfoRow = ({ label, value, icon, className = "" }: any) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
      {icon}
      {label}:
    </span>
    <span className={`text-sm font-medium ${className}`}>{value}</span>
  </div>
);

const SecurityHeader = ({ name, present }: { name: string; present: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">{name}</span>
    <span className={`text-xs px-2 py-1 rounded ${
      present ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : 
                "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    }`}>
      {present ? "✓ Presente" : "✗ Ausente"}
    </span>
  </div>
);

const ConfigFile = ({ name, found }: { name: string; found: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-mono">{name}</span>
    <span className={`text-xs px-2 py-1 rounded ${
      found ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
    }`}>
      {found ? "✓ Encontrado" : "✗ No encontrado"}
    </span>
  </div>
);

const ComplianceBar = ({ label, percentage }: { label: string; percentage: number | any }) => {
  // Si percentage es un objeto, intentar extraer un valor numérico
  const numericPercentage = typeof percentage === 'object' 
    ? (percentage?.score || percentage?.percentage || 0)
    : (percentage || 0);
    
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">{numericPercentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            numericPercentage >= 80 ? "bg-green-500" : 
            numericPercentage >= 60 ? "bg-yellow-500" : 
            "bg-red-500"
          }`}
          style={{ width: `${numericPercentage}%` }}
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => {
  const colorClasses = {
    green: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    red: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  };

  return (
    <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
};

const BusinessImpact = ({ text, type = "info" }: { text: string; type?: "success" | "warning" | "danger" | "info" }) => {
  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100",
    danger: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100",
    info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100",
  };

  const icons = {
    success: "💼",
    warning: "⚠️",
    danger: "🚨",
    info: "💡",
  };

  return (
    <div className={`mt-3 p-4 rounded-lg border-2 ${typeStyles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icons[type]}</span>
        <div>
          <div className="font-semibold text-sm mb-1">Impacto en el Negocio</div>
          <p className="text-sm leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
};
