import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function getReportData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      scans: {
        where: {
          createdAt: {
            gte: dayjs().subtract(30, "day").toDate(),
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      incidents: {
        where: {
          createdAt: {
            gte: dayjs().subtract(30, "day").toDate(),
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Calcular score promedio de seguridad
  const avgScore =
    user.scans.length > 0
      ? Math.round(
          user.scans.reduce((acc: number, s: any) => acc + (s.score || 0), 0) /
            user.scans.length
        )
      : 0;

  // Contar vulnerabilidades críticas
  const criticalVulns = user.scans.reduce((acc: number, scan: any) => {
    const scanData = scan.results as any;
    return acc + (scanData?.criticalVulns || 0);
  }, 0);

  // Datos de resumen
  const summary = {
    score: `${avgScore}/100`,
    scans: user.scans.length,
    incidents: user.incidents.length,
    criticalVulns,
    iso: "75%",
    ley: "68%",
  };

  // Datos de escaneos
  const scans = user.scans.map((scan: any) => {
    const results = scan.results as any;
    return {
      domain: scan.domain,
      score: scan.score || 0,
      vulns: results?.totalVulns || 0,
      date: scan.createdAt,
    };
  });

  // Datos de incidentes
  const incidents = user.incidents.map((incident: any) => ({
    title: incident.title,
    severity: incident.severity,
    status: incident.status,
    date: incident.createdAt,
  }));

  // Vulnerabilidades (mock para el demo)
  const vulnerabilities = [
    {
      cve: "CVE-2024-1234",
      severity: "CRITICAL",
      component: "OpenSSL 3.0.0",
      date: dayjs().subtract(5, "day").toDate(),
    },
    {
      cve: "CVE-2024-5678",
      severity: "HIGH",
      component: "Apache 2.4.50",
      date: dayjs().subtract(12, "day").toDate(),
    },
  ];

  // Cumplimiento (mock para el demo)
  const compliance = [
    { framework: "ISO 27001", progress: "75%", gaps: "12" },
    { framework: "Ley 21.663", progress: "68%", gaps: "8" },
    { framework: "PCI DSS", progress: "82%", gaps: "5" },
  ];

  return {
    company: user.company || "GuardyScan Demo S.A.",
    user: user.name || user.email || "demo@guardyscan.com",
    email: user.email || "demo@guardyscan.com",
    period: `${dayjs().subtract(30, "day").format("DD/MM/YYYY")} - ${dayjs().format("DD/MM/YYYY")}`,
    summary,
    scans,
    incidents,
    vulnerabilities,
    compliance,
  };
}

export async function getDashboardReportData(userId: string, days: number) {
  const since = dayjs().subtract(days, "day").toDate();
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Scans
  const scans = await prisma.scan.findMany({
    where: { userId, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  // Incidents
  const incidents = await prisma.incident.findMany({
    where: { userId, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  // Vulnerabilities
  const vulnerabilities = await prisma.vulnerability.findMany({
    where: { userId, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  // Third Parties
  const thirdParties = await prisma.thirdPartyRisk.findMany({
    where: { userId },
    orderBy: { riskScore: "desc" },
  });

  // Security Score
  const securityScore = scans.length > 0
    ? Math.round(scans.reduce((acc, s) => acc + (s.score || 0), 0) / scans.length)
    : 0;

  return {
    companyName: user?.company || "",
    userName: user?.name || "",
    totalScans: scans.length,
    totalIncidents: incidents.length,
    securityScore,
    scans,
    incidents,
    vulnerabilities,
    thirdParties,
  };
}
