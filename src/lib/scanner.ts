import { prisma } from "./prisma";
import axios from "axios";
import * as https from "https";
import * as dns from "dns/promises";

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
  try {
    // Update scan status to PROCESSING
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "PROCESSING" },
    });

    const url = new URL(targetUrl);
    const hostname = url.hostname;

    const results: any = {};
    let score = 100;

    // 1. SSL/TLS Analysis
    results.sslInfo = await analyzeSSL(hostname);
    if (!results.sslInfo.valid) score -= 20;

    // 2. Security Headers Analysis
    results.securityHeaders = await analyzeSecurityHeaders(targetUrl);
    score -= results.securityHeaders.missingHeaders.length * 5;

    // 3. DNS Records
    results.dnsRecords = await analyzeDNS(hostname);

    // 4. Technology Detection
    results.technologies = await detectTechnologies(targetUrl);

    // 5. Basic Vulnerabilities Check
    results.vulnerabilities = await checkVulnerabilities(targetUrl, scanType);
    score -= results.vulnerabilities.length * 10;

    // 6. WHOIS Data (placeholder)
    results.whoisData = { domain: hostname, registrar: "N/A" };

    // 7. Compliance Checks (ISO 27001, GDPR)
    if (scanType === "COMPLIANCE" || scanType === "FULL") {
      results.compliance = await checkCompliance(results);
    }

    // Ensure score is between 0 and 100
    const finalScore = Math.max(0, Math.min(100, score));

    // Update scan with results
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        score: finalScore,
        results: results,
        sslInfo: results.sslInfo,
        securityHeaders: results.securityHeaders,
        vulnerabilities: results.vulnerabilities,
        technologies: results.technologies,
        dnsRecords: results.dnsRecords,
        whoisData: results.whoisData,
        compliance: results.compliance,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Scan error:", error);
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "FAILED" },
    });
  }
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
