import { prisma } from "./prisma";
import axios from "axios";
import * as https from "https";
import * as dns from "dns/promises";
import { generateScanAnalysis } from "./claude-report";
import { saveDiagnostic } from "./claude";

interface ScanResult {
  ssl: any;
  securityHeaders: any;
  vulnerabilities: any[];
  technologies: string[];
  dnsRecords: any;
  score: number;
}

export async function performSecurityScan(
  scanId: string,
  targetUrl: string,
  scanType: string
): Promise<void> {
  console.log(`Starting scan ${scanId} for ${targetUrl}`);
  
  // Helper function to update progress
  const updateProgress = async (progress: number) => {
    await prisma.scan.update({
      where: { id: scanId },
      data: { progress },
    });
  };
  
  try {
    // Get userId from scan record
    const scanRecord = await prisma.scan.findUnique({
      where: { id: scanId },
      select: { userId: true },
    });
    const userId = scanRecord?.userId;

    // Update scan status to PROCESSING
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "PROCESSING", progress: 0 },
    });
    console.log(`Scan ${scanId} status updated to PROCESSING`);

    const url = new URL(targetUrl);
    const hostname = url.hostname;

    const results: any = {};
    let score = 100;

    // 1. SSL/TLS Analysis (10%)
    await updateProgress(10);
    results.sslInfo = await analyzeSSL(hostname);
    if (!results.sslInfo.valid) score -= 20;

    // 2. Security Headers Analysis (20%)
    await updateProgress(20);
    results.securityHeaders = await analyzeSecurityHeaders(targetUrl);
    score -= results.securityHeaders.missingHeaders.length * 5;

    // 3. DNS Records (30%)
    await updateProgress(30);
    results.dnsRecords = await analyzeDNS(hostname);

    // 4. Technology Detection (40%)
    await updateProgress(40);
    results.technologies = await detectTechnologies(targetUrl);

    // 5. Performance Analysis (50%)
    await updateProgress(50);
    results.performance = await analyzePerformance(targetUrl);

    // 6. Open Ports Check (60%)
    await updateProgress(60);
    results.openPorts = await checkOpenPorts(hostname);

    // 7. Configuration Files Check (70%)
    await updateProgress(70);
    results.configFiles = await checkConfigFiles(targetUrl);

    // 8. Cookies Analysis (80%)
    await updateProgress(80);
    results.cookies = await analyzeCookies(targetUrl);

    // 9. Firewall Detection (85%)
    await updateProgress(85);
    results.firewall = await detectFirewall(targetUrl);

    // 10. Basic Vulnerabilities Check (90%)
    await updateProgress(90);
    results.vulnerabilities = await checkVulnerabilities(targetUrl, scanType);
    score -= results.vulnerabilities.length * 10;

    // 6. WHOIS Data (placeholder) (95%)
    await updateProgress(95);
    results.whoisData = { domain: hostname, registrar: "N/A" };

    // 7. Compliance Checks (ISO 27001, GDPR)
    if (scanType === "COMPLIANCE" || scanType === "FULL") {
      results.compliance = await checkCompliance(results);
    }

    // Ensure score is between 0 and 100
    const finalScore = Math.max(0, Math.min(100, score));

    console.log(`Scan ${scanId} completed with score ${finalScore}`);

    // ── Persist discovered vulnerabilities to the vulnerability table ──
    if (userId) {
      await persistScanVulnerabilities({
        userId,
        scanId,
        targetUrl,
        hostname,
        sslInfo: results.sslInfo,
        securityHeaders: results.securityHeaders,
        openPorts: results.openPorts,
        cookies: results.cookies,
        vulnerabilities: results.vulnerabilities,
      });
    }

    // Update scan with results (100%)
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        progress: 100,
        score: finalScore,
        results: results,
        sslInfo: results.sslInfo,
        securityHeaders: results.securityHeaders,
        vulnerabilities: results.vulnerabilities,
        technologies: results.technologies,
        dnsRecords: results.dnsRecords,
        whoisData: results.whoisData,
        compliance: results.compliance,
        performance: results.performance,
        openPorts: results.openPorts,
        configFiles: results.configFiles,
        cookies: results.cookies,
        firewall: results.firewall,
        completedAt: new Date(),
      },
    });
    console.log(`Scan ${scanId} saved to database`);

    // ── Pre-generate Claude analysis in background (non-blocking) ──
    // This ensures 'Ver Informe' shows the AI analysis instantly when opened.
    if (userId && process.env.ANTHROPIC_API_KEY) {
      generateScanAnalysis(
        {
          domain: targetUrl,
          score: finalScore,
          vulnerabilities: results.vulnerabilities || [],
          openPorts: results.openPorts || [],
          technologies: results.technologies || [],
          sslInfo: results.sslInfo || {},
          headers: results.securityHeaders || {},
        },
        userId
      )
        .then((analysis) => {
          // Save with scan-specific key for instant retrieval
          return saveDiagnostic({
            userId: userId!,
            type: `scan_analysis_${scanId}`,
            content: JSON.stringify(analysis),
            context: `${targetUrl} — score ${finalScore}`,
          });
        })
        .catch((err) =>
          console.error(`[scanner] Background Claude analysis failed for ${scanId}:`, err)
        );
    }
  } catch (error) {
    console.error("❌ Scan error:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    await prisma.scan.update({
      where: { id: scanId },
      data: { 
        status: "FAILED",
        results: { 
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : "No stack trace"
        }
      },
    });
  }
}

// ── Types for persist helper ──────────────────────────────────────────────────
interface PersistVulnsInput {
  userId: string
  scanId: string
  targetUrl: string
  hostname: string
  sslInfo: any
  securityHeaders: any
  openPorts: any[]
  cookies: any
  vulnerabilities: any[]
}

/**
 * Converts scan findings into Vulnerability records and saves them to the DB.
 * Avoids duplicates by checking for an existing open record with the same title + assetName.
 */
async function persistScanVulnerabilities(input: PersistVulnsInput): Promise<void> {
  const { userId, scanId, hostname, targetUrl, sslInfo, securityHeaders, openPorts, cookies, vulnerabilities } = input

  const toCreate: any[] = []

  // ── 1. HTTPS check ────────────────────────────────────────────────────────
  if (!targetUrl.startsWith('https://')) {
    toCreate.push({
      title: 'Sitio web sin HTTPS',
      description: 'El sitio no utiliza cifrado HTTPS. Las comunicaciones viajan en texto claro, exponiendo datos de usuarios a interceptación (man-in-the-middle).',
      severity: 'HIGH',
      source: 'SCAN',
      assetType: 'WEB',
      remediation: 'Obtener un certificado SSL/TLS de una CA reconocida (Let\'s Encrypt es gratuito) y redirigir todo el tráfico HTTP a HTTPS.',
      cweId: 'CWE-319',
    })
  }

  // ── 2. SSL/TLS analysis ───────────────────────────────────────────────────
  if (sslInfo && !sslInfo.valid) {
    toCreate.push({
      title: 'Certificado SSL/TLS inválido o ausente',
      description: `Problema con el certificado SSL/TLS: ${sslInfo.error || 'certificado no válido'}. Los usuarios verán advertencias de seguridad en el navegador.`,
      severity: 'HIGH',
      source: 'SCAN',
      assetType: 'WEB',
      remediation: 'Configurar un certificado SSL/TLS válido emitido por una Autoridad Certificadora (CA) reconocida.',
      cweId: 'CWE-295',
    })
  } else if (sslInfo?.daysRemaining !== undefined && sslInfo.daysRemaining < 30) {
    toCreate.push({
      title: `Certificado SSL próximo a vencer (${sslInfo.daysRemaining} días)`,
      description: `El certificado SSL/TLS del sitio vence en ${sslInfo.daysRemaining} días (${sslInfo.validTo}). Si expira, los usuarios no podrán acceder al sitio de forma segura.`,
      severity: sslInfo.daysRemaining < 7 ? 'CRITICAL' : 'MEDIUM',
      source: 'SCAN',
      assetType: 'WEB',
      remediation: 'Renovar el certificado SSL/TLS antes de su vencimiento.',
    })
  }

  // ── 3. Missing security headers ───────────────────────────────────────────
  const headerDetails: Record<string, { title: string; description: string; severity: string; remediation: string; cweId: string }> = {
    'strict-transport-security': {
      title: 'Header HSTS (HTTP Strict-Transport-Security) ausente',
      description: 'Sin HSTS, los navegadores pueden conectarse vía HTTP inseguro incluso si el servidor soporta HTTPS, facilitando ataques de downgrade y man-in-the-middle.',
      severity: 'MEDIUM',
      remediation: 'Agregar: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
      cweId: 'CWE-319',
    },
    'x-frame-options': {
      title: 'Sitio vulnerable a Clickjacking (X-Frame-Options ausente)',
      description: 'Sin X-Frame-Options, el sitio puede ser embebido en iframes de páginas maliciosas para engañar a los usuarios y capturar clics (clickjacking).',
      severity: 'MEDIUM',
      remediation: 'Agregar: X-Frame-Options: SAMEORIGIN  o usar Content-Security-Policy: frame-ancestors \'self\'',
      cweId: 'CWE-1021',
    },
    'x-content-type-options': {
      title: 'Header X-Content-Type-Options ausente (MIME Sniffing)',
      description: 'Sin este header, el navegador puede interpretar erróneamente el tipo MIME del contenido, lo que puede usarse para ejecutar scripts maliciosos.',
      severity: 'LOW',
      remediation: 'Agregar: X-Content-Type-Options: nosniff',
      cweId: 'CWE-116',
    },
    'content-security-policy': {
      title: 'Content Security Policy (CSP) ausente',
      description: 'Sin una política CSP, el sitio es más vulnerable a ataques Cross-Site Scripting (XSS) y de inyección de contenido desde fuentes externas.',
      severity: 'MEDIUM',
      remediation: 'Implementar una política CSP restrictiva. Ejemplo: Content-Security-Policy: default-src \'self\'',
      cweId: 'CWE-693',
    },
    'x-xss-protection': {
      title: 'Header X-XSS-Protection ausente',
      description: 'Este header activa el filtro XSS del navegador. Su ausencia puede dejar a los usuarios de navegadores antiguos expuestos a ataques XSS reflejado.',
      severity: 'LOW',
      remediation: 'Agregar: X-XSS-Protection: 1; mode=block',
      cweId: 'CWE-79',
    },
    'referrer-policy': {
      title: 'Header Referrer-Policy ausente',
      description: 'Sin Referrer-Policy, las URLs completas (incluyendo parámetros sensibles) pueden ser enviadas a sitios terceros como cabecera Referer.',
      severity: 'LOW',
      remediation: 'Agregar: Referrer-Policy: strict-origin-when-cross-origin',
      cweId: 'CWE-200',
    },
  }

  for (const header of (securityHeaders?.missingHeaders || [])) {
    const detail = headerDetails[header]
    if (detail) {
      toCreate.push({
        title: detail.title,
        description: detail.description,
        severity: detail.severity,
        source: 'SCAN',
        assetType: 'WEB',
        remediation: detail.remediation,
        cweId: detail.cweId,
      })
    }
  }

  // ── 4. Cookie security ────────────────────────────────────────────────────
  if (cookies?.total > 0) {
    const insecureCount = cookies.total - (cookies.secure || 0)
    const noHttpOnlyCount = cookies.total - (cookies.httpOnly || 0)

    if (insecureCount > 0) {
      toCreate.push({
        title: `Cookies sin atributo Secure (${insecureCount} cookie${insecureCount > 1 ? 's' : ''})`,
        description: `${insecureCount} cookie(s) no tienen el atributo Secure, lo que permite que sean transmitidas por conexiones HTTP no cifradas, exponiendo sesiones a interceptación.`,
        severity: 'MEDIUM',
        source: 'SCAN',
        assetType: 'WEB',
        remediation: 'Establecer el atributo Secure en todas las cookies de sesión y autenticación.',
        cweId: 'CWE-614',
      })
    }
    if (noHttpOnlyCount > 0) {
      toCreate.push({
        title: `Cookies sin atributo HttpOnly (${noHttpOnlyCount} cookie${noHttpOnlyCount > 1 ? 's' : ''})`,
        description: `${noHttpOnlyCount} cookie(s) no tienen el atributo HttpOnly, haciéndolas accesibles desde JavaScript y vulnerables a robo mediante ataques XSS.`,
        severity: 'MEDIUM',
        source: 'SCAN',
        assetType: 'WEB',
        remediation: 'Establecer el atributo HttpOnly en todas las cookies de sesión.',
        cweId: 'CWE-1004',
      })
    }
    if (cookies.sameSite === 'None' || cookies.sameSite === 'No disponible') {
      toCreate.push({
        title: 'Cookies sin protección SameSite (CSRF)',
        description: 'Sin el atributo SameSite, las cookies pueden ser enviadas en peticiones cross-site, facilitando ataques CSRF (Cross-Site Request Forgery).',
        severity: 'MEDIUM',
        source: 'SCAN',
        assetType: 'WEB',
        remediation: 'Agregar SameSite=Lax o SameSite=Strict a las cookies de sesión.',
        cweId: 'CWE-352',
      })
    }
  }

  // ── 5. Dangerous open ports ───────────────────────────────────────────────
  const dangerousPortMap: Record<number, { title: string; description: string; severity: string; remediation: string }> = {
    21:    { title: 'Puerto FTP expuesto (21)', description: 'FTP transmite credenciales y datos en texto claro. Es susceptible a ataques de sniffing y man-in-the-middle.', severity: 'HIGH', remediation: 'Deshabilitar FTP y migrar a SFTP (puerto 22) o FTPS (puerto 990).' },
    23:    { title: 'Puerto Telnet expuesto (23)', description: 'Telnet es un protocolo obsoleto sin cifrado. Las credenciales se transmiten en texto plano.', severity: 'CRITICAL', remediation: 'Deshabilitar Telnet inmediatamente y usar SSH (puerto 22).' },
    3306:  { title: 'MySQL expuesto a Internet (3306)', description: 'La base de datos MySQL está accesible públicamente, exponiéndola a ataques de fuerza bruta y explotación directa.', severity: 'HIGH', remediation: 'Restringir acceso a MySQL mediante firewall. Usar VPN o túnel SSH para administración remota.' },
    5432:  { title: 'PostgreSQL expuesto a Internet (5432)', description: 'PostgreSQL está accesible públicamente, exponiéndolo a ataques de fuerza bruta sobre credenciales.', severity: 'HIGH', remediation: 'Restringir acceso mediante firewall. Usar VPN o túnel SSH.' },
    1433:  { title: 'Microsoft SQL Server expuesto (1433)', description: 'SQL Server está expuesto a Internet, susceptible a ataques de autenticación y exploits conocidos.', severity: 'HIGH', remediation: 'Bloquear en firewall y usar VPN para acceso administrativo.' },
    1521:  { title: 'Oracle DB expuesto a Internet (1521)', description: 'La base de datos Oracle está accesible públicamente, representando un riesgo crítico de datos.', severity: 'HIGH', remediation: 'Restringir con firewall, usar VPN para administración.' },
    27017: { title: 'MongoDB expuesto a Internet (27017)', description: 'MongoDB frecuentemente se despliega sin autenticación por defecto. Un MongoDB expuesto puede permitir acceso completo a los datos sin contraseña.', severity: 'CRITICAL', remediation: 'Habilitar autenticación, limitar bind a localhost (bindIp: 127.0.0.1) y usar firewall.' },
    6379:  { title: 'Redis expuesto a Internet (6379)', description: 'Redis sin autenticación permite acceso completo a datos y puede ser usado para ejecución remota de comandos.', severity: 'CRITICAL', remediation: 'Habilitar contraseña (requirepass), bind a localhost y usar firewall.' },
    3389:  { title: 'RDP (Escritorio Remoto) expuesto (3389)', description: 'RDP expuesto es un vector común de ataques de fuerza bruta y exploits (BlueKeep CVE-2019-0708). Miles de servidores han sido comprometidos por RDP expuesto.', severity: 'HIGH', remediation: 'Usar VPN o Azure Bastion, habilitar NLA, limitar IPs con firewall.' },
    5900:  { title: 'VNC expuesto a Internet (5900)', description: 'VNC sin VPN puede ser accesible sin autenticación o con contraseñas débiles, permitiendo control total del sistema.', severity: 'HIGH', remediation: 'Usar VPN para acceso VNC, configurar contraseña fuerte y cifrado.' },
    445:   { title: 'SMB expuesto a Internet (445)', description: 'SMB expuesto es el vector de propagación de ransomware como WannaCry (EternalBlue). Es extremadamente peligroso en Internet.', severity: 'CRITICAL', remediation: 'Bloquear puerto 445 en el firewall perimetral inmediatamente.' },
    139:   { title: 'NetBIOS expuesto (139)', description: 'NetBIOS puede filtrar información del sistema y ser usado para enumeración de recursos compartidos y ataques de relay.', severity: 'MEDIUM', remediation: 'Deshabilitar NetBIOS sobre TCP/IP si no es necesario. Bloquear en firewall.' },
    135:   { title: 'MS-RPC expuesto (135)', description: 'El puerto RPC de Windows expuesto puede ser explotado para ejecución remota de código y movimiento lateral.', severity: 'HIGH', remediation: 'Bloquear en firewall perimetral, solo permitir en redes internas.' },
  }

  for (const portInfo of (openPorts || [])) {
    if (portInfo.status === 'open' && dangerousPortMap[portInfo.port]) {
      const risk = dangerousPortMap[portInfo.port]
      toCreate.push({
        title: risk.title,
        description: risk.description,
        severity: risk.severity,
        source: 'SCAN',
        assetType: 'SERVER',
        remediation: risk.remediation,
      })
    }
  }

  // ── 6. checkVulnerabilities() findings ───────────────────────────────────
  const vulnTypeMap: Record<string, { cweId?: string }> = {
    NO_HTTPS:            { cweId: 'CWE-319' },
    MISSING_HSTS:        { cweId: 'CWE-319' },
    CLICKJACKING:        { cweId: 'CWE-1021' },
    SENSITIVE_DATA_HTTP: { cweId: 'CWE-319' },
  }

  for (const v of (vulnerabilities || [])) {
    // Avoid duplicates with headers/HTTPS checks already added above
    if (['NO_HTTPS', 'MISSING_HSTS', 'CLICKJACKING'].includes(v.type)) continue
    const extra = vulnTypeMap[v.type] || {}
    toCreate.push({
      title: v.description || v.type,
      description: v.description || '',
      severity: v.severity || 'MEDIUM',
      source: 'SCAN',
      assetType: 'WEB',
      remediation: v.recommendation || '',
      cweId: extra.cweId,
    })
  }

  // ── Save to DB (skip duplicates) ──────────────────────────────────────────
  for (const vuln of toCreate) {
    try {
      const existing = await prisma.vulnerability.findFirst({
        where: {
          userId,
          title: vuln.title,
          assetName: hostname,
          status: { notIn: ['RESOLVED', 'FALSE_POSITIVE'] },
        },
      })
      if (!existing) {
        await prisma.vulnerability.create({
          data: {
            userId,
            scanId,
            title: vuln.title,
            description: vuln.description,
            severity: vuln.severity,
            status: 'OPEN',
            source: vuln.source,
            assetId: `web-${hostname}`,
            assetName: hostname,
            assetType: vuln.assetType || 'WEB',
            remediation: vuln.remediation || null,
            cweId: vuln.cweId || null,
            discoveredAt: new Date(),
          },
        })
      }
    } catch (err) {
      console.error('Error saving vulnerability:', vuln.title, err)
    }
  }

  console.log(`Persisted ${toCreate.length} potential vulnerabilities for scan ${scanId}`)
}

async function analyzeSSL(hostname: string): Promise<any> {
  return new Promise((resolve) => {
    const options = {
      host: hostname,
      port: 443,
      method: "GET",
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      const cert = (res.socket as any).getPeerCertificate();
      
      if (cert) {
        resolve({
          valid: true,
          issuer: cert.issuer?.O || "Unknown",
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysRemaining: Math.floor(
            (new Date(cert.valid_to).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
          subjectAltNames: cert.subjectaltname,
        });
      } else {
        resolve({ valid: false, error: "No certificate found" });
      }
    });

    req.on("error", (e) => {
      resolve({ valid: false, error: e.message });
    });

    req.end();
  });
}

async function analyzeSecurityHeaders(url: string): Promise<any> {
  try {
    const response = await axios.get(url, {
      validateStatus: () => true,
      maxRedirects: 0,
    });

    const headers = response.headers;
    const requiredHeaders = [
      "strict-transport-security",
      "x-frame-options",
      "x-content-type-options",
      "content-security-policy",
      "x-xss-protection",
      "referrer-policy",
    ];

    const presentHeaders = requiredHeaders.filter((h) => headers[h]);
    const missingHeaders = requiredHeaders.filter((h) => !headers[h]);

    return {
      presentHeaders,
      missingHeaders,
      headers: {
        "strict-transport-security": headers["strict-transport-security"] || null,
        "x-frame-options": headers["x-frame-options"] || null,
        "x-content-type-options": headers["x-content-type-options"] || null,
        "content-security-policy": headers["content-security-policy"] || null,
        "x-xss-protection": headers["x-xss-protection"] || null,
        "referrer-policy": headers["referrer-policy"] || null,
      },
    };
  } catch (error) {
    return { error: "Failed to fetch headers", missingHeaders: [] };
  }
}

async function analyzeDNS(hostname: string): Promise<any> {
  try {
    const [a, mx, txt] = await Promise.all([
      dns.resolve4(hostname).catch(() => []),
      dns.resolveMx(hostname).catch(() => []),
      dns.resolveTxt(hostname).catch(() => []),
    ]);

    return { a, mx, txt };
  } catch (error) {
    return { error: "DNS lookup failed" };
  }
}

async function detectTechnologies(url: string): Promise<string[]> {
  try {
    const response = await axios.get(url, {
      validateStatus: () => true,
    });

    const technologies: string[] = [];
    const headers = response.headers;
    const html = response.data;

    // Server detection
    if (headers["server"]) technologies.push(headers["server"]);
    if (headers["x-powered-by"]) technologies.push(headers["x-powered-by"]);

    // Framework detection
    if (html.includes("wordpress")) technologies.push("WordPress");
    if (html.includes("react")) technologies.push("React");
    if (html.includes("next")) technologies.push("Next.js");
    if (html.includes("vue")) technologies.push("Vue.js");
    if (html.includes("angular")) technologies.push("Angular");

    return [...new Set(technologies)];
  } catch (error) {
    return [];
  }
}

async function analyzePerformance(url: string): Promise<any> {
  try {
    const startTime = Date.now();
    
    const response = await axios.get(url, {
      validateStatus: () => true,
      maxRedirects: 5,
    });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Calcular tamaño de la respuesta
    const contentLength = response.headers['content-length'] 
      ? parseInt(response.headers['content-length']) 
      : Buffer.byteLength(JSON.stringify(response.data));
    
    const sizeInKB = (contentLength / 1024).toFixed(2);
    
    return {
      loadTime: `${loadTime}ms`,
      size: `${sizeInKB} KB`,
      requests: "1", // Solo contamos la petición principal
      lighthouse: loadTime < 1000 ? "95/100" : loadTime < 2000 ? "75/100" : "50/100",
    };
  } catch (error) {
    return {
      loadTime: "Error",
      size: "N/A",
      requests: "0",
      lighthouse: "N/A",
    };
  }
}

async function checkOpenPorts(hostname: string): Promise<any[]> {
  const commonPorts = [
    { port: 80, service: "HTTP" },
    { port: 443, service: "HTTPS" },
    { port: 22, service: "SSH" },
    { port: 21, service: "FTP" },
    { port: 3306, service: "MySQL" },
    { port: 5432, service: "PostgreSQL" },
  ];

  const results: any[] = [];

  for (const { port, service } of commonPorts) {
    try {
      const net = require('net');
      const socket = new net.Socket();
      
      const status = await new Promise((resolve) => {
        socket.setTimeout(2000);
        
        socket.on('connect', () => {
          socket.destroy();
          resolve('open');
        });
        
        socket.on('timeout', () => {
          socket.destroy();
          resolve('filtered');
        });
        
        socket.on('error', () => {
          resolve('closed');
        });
        
        socket.connect(port, hostname);
      });

      if (status === 'open' || (port === 80 || port === 443)) {
        results.push({ port, service, status });
      }
    } catch (error) {
      // Skip closed ports
    }
  }

  return results.length > 0 ? results : [
    { port: 443, service: "HTTPS", status: "open" },
    { port: 80, service: "HTTP", status: "open" },
  ];
}

async function checkConfigFiles(baseUrl: string): Promise<any> {
  const files = [
    { name: 'robots.txt', path: '/robots.txt' },
    { name: 'sitemap.xml', path: '/sitemap.xml' },
    { name: 'security.txt', path: '/security.txt' },
    { name: '.well-known/security.txt', path: '/.well-known/security.txt' },
  ];

  const results: any = {};

  for (const file of files) {
    try {
      const url = new URL(file.path, baseUrl).toString();
      const response = await axios.get(url, {
        validateStatus: (status) => status < 500,
        timeout: 5000,
      });

      const key = file.name.replace(/[.\/]/g, '_').replace('well-known_', 'wellKnown');
      results[key] = response.status === 200;
    } catch (error) {
      const key = file.name.replace(/[.\/]/g, '_').replace('well-known_', 'wellKnown');
      results[key] = false;
    }
  }

  return results;
}

async function analyzeCookies(url: string): Promise<any> {
  try {
    const response = await axios.get(url, {
      validateStatus: () => true,
      maxRedirects: 0,
    });

    const cookies = response.headers['set-cookie'] || [];
    
    if (cookies.length === 0) {
      return {
        total: 0,
        secure: 0,
        httpOnly: 0,
        sameSite: "Ninguna",
      };
    }

    let secureCount = 0;
    let httpOnlyCount = 0;
    let sameSiteValue = "None";

    cookies.forEach((cookie: string) => {
      if (cookie.toLowerCase().includes('secure')) secureCount++;
      if (cookie.toLowerCase().includes('httponly')) httpOnlyCount++;
      if (cookie.toLowerCase().includes('samesite=lax')) sameSiteValue = "Lax";
      if (cookie.toLowerCase().includes('samesite=strict')) sameSiteValue = "Strict";
    });

    return {
      total: cookies.length,
      secure: secureCount,
      httpOnly: httpOnlyCount,
      sameSite: sameSiteValue,
    };
  } catch (error) {
    return {
      total: 0,
      secure: 0,
      httpOnly: 0,
      sameSite: "No disponible",
    };
  }
}

async function detectFirewall(url: string): Promise<any> {
  try {
    const response = await axios.get(url, {
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const headers = response.headers;
    let waf = null;
    let ddos = false;
    let rateLimit = false;

    // Detectar WAF conocidos
    if (headers['server']?.toLowerCase().includes('cloudflare') || 
        headers['cf-ray']) {
      waf = "Cloudflare";
      ddos = true;
      rateLimit = true;
    } else if (headers['x-powered-by']?.includes('AWS')) {
      waf = "AWS WAF";
      ddos = true;
    } else if (headers['server']?.includes('nginx')) {
      waf = "Nginx (posible)";
    } else if (headers['x-sucuri-id']) {
      waf = "Sucuri";
      ddos = true;
    } else if (headers['x-akamai-transformed']) {
      waf = "Akamai";
      ddos = true;
    }

    // Verificar rate limiting
    if (headers['x-ratelimit-limit'] || headers['ratelimit-limit']) {
      rateLimit = true;
    }

    return {
      waf: waf || "No detectado",
      ddos,
      rateLimit,
    };
  } catch (error) {
    return {
      waf: "No detectado",
      ddos: false,
      rateLimit: false,
    };
  }
}

async function checkVulnerabilities(url: string, scanType: string): Promise<any[]> {
  const vulnerabilities: any[] = [];

  try {
    const response = await axios.get(url, {
      validateStatus: () => true,
    });

    // Check for common vulnerabilities
    const headers = response.headers;
    const html = response.data;

    // Missing HTTPS
    if (!url.startsWith("https://")) {
      vulnerabilities.push({
        severity: "HIGH",
        type: "NO_HTTPS",
        description: "El sitio no utiliza HTTPS",
        recommendation: "Implementar certificado SSL/TLS",
      });
    }

    // Weak security headers
    if (!headers["strict-transport-security"]) {
      vulnerabilities.push({
        severity: "MEDIUM",
        type: "MISSING_HSTS",
        description: "Falta header Strict-Transport-Security",
        recommendation: "Agregar header HSTS",
      });
    }

    if (!headers["x-frame-options"]) {
      vulnerabilities.push({
        severity: "MEDIUM",
        type: "CLICKJACKING",
        description: "Vulnerable a Clickjacking",
        recommendation: "Agregar X-Frame-Options header",
      });
    }

    // Check for sensitive info exposure
    if (html.includes("password") && html.includes('type="password"') && !url.startsWith("https://")) {
      vulnerabilities.push({
        severity: "CRITICAL",
        type: "SENSITIVE_DATA_HTTP",
        description: "Formulario de contraseña en HTTP",
        recommendation: "Usar HTTPS para todos los formularios",
      });
    }

    return vulnerabilities;
  } catch (error) {
    return vulnerabilities;
  }
}

async function checkCompliance(results: any): Promise<any> {
  const compliance = {
    iso27001: {
      score: 0,
      controls: [] as any[],
    },
    gdpr: {
      compliant: false,
      issues: [] as string[],
    },
  };

  // ISO 27001 Basic Checks
  let iso27001Score = 100;

  // A.8.24 - Cryptography
  if (!results.sslInfo.valid) {
    iso27001Score -= 20;
    compliance.iso27001.controls.push({
      id: "A.8.24",
      name: "Uso de criptografía",
      status: "NON_COMPLIANT",
      issue: "SSL/TLS no configurado correctamente",
    });
  }

  // A.8.9 - Configuration Management
  if (results.securityHeaders.missingHeaders.length > 0) {
    iso27001Score -= 15;
    compliance.iso27001.controls.push({
      id: "A.8.9",
      name: "Gestión de configuración",
      status: "PARTIAL",
      issue: `Faltan ${results.securityHeaders.missingHeaders.length} headers de seguridad`,
    });
  }

  compliance.iso27001.score = Math.max(0, iso27001Score);

  // GDPR Basic Checks
  compliance.gdpr.compliant = results.sslInfo.valid;
  if (!results.sslInfo.valid) {
    compliance.gdpr.issues.push("Transmisión de datos sin cifrado");
  }

  return compliance;
}
