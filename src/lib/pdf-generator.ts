import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const COLORS = {
  primary: [37, 99, 235] as const,
  secondary: [6, 182, 212] as const,
  success: [34, 197, 94] as const,
  warning: [251, 191, 36] as const,
  danger: [239, 68, 68] as const,
  dark: [17, 24, 39] as const,
  light: [249, 250, 251] as const,
  muted: [107, 114, 128] as const,
};

export async function generateExecutiveReportPDF({
  company = "GuardyScan Demo S.A.",
  user = "Usuario Demo",
  email = "demo@guardyscan.com",
  period = `${dayjs().subtract(30, "day").format("DD/MM/YYYY")} - ${dayjs().format("DD/MM/YYYY")}`,
  summary = {},
  scans = [],
  incidents = [],
  vulnerabilities = [],
  compliance = [],
}: {
  company?: string;
  user?: string;
  email?: string;
  period?: string;
  summary?: any;
  scans?: any[];
  incidents?: any[];
  vulnerabilities?: any[];
  compliance?: any[];
}) {
  const doc = new jsPDF();

  // Portada
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 297, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text("Informe Ejecutivo Mensual", 105, 50, { align: "center" });
  doc.setFontSize(16);
  doc.text(company, 105, 65, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Período: ${period}`, 105, 75, { align: "center" });
  doc.text(`Generado por: ${user} (${email})`, 105, 85, { align: "center" });
  doc.setFontSize(10);
  doc.text("Confidencial - GuardyScan", 105, 270, { align: "center" });
  doc.addPage();

  // Resumen Ejecutivo
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(18);
  doc.text("Resumen Ejecutivo", 14, 20);
  doc.setFontSize(12);
  doc.text(
    "Este informe consolida el estado de ciberseguridad de la organización en los últimos 30 días, incluyendo escaneos, incidentes, vulnerabilidades y cumplimiento normativo.",
    14,
    28,
    { maxWidth: 180 }
  );
  autoTable(doc, {
    startY: 38,
    head: [["KPI", "Valor"]],
    body: [
      ["Score Seguridad", summary.score ?? "N/A"],
      ["Escaneos realizados", summary.scans ?? "N/A"],
      ["Incidentes reportados", summary.incidents ?? "N/A"],
      ["Vulnerabilidades críticas", summary.criticalVulns ?? "N/A"],
      ["Cumplimiento ISO 27001", summary.iso ?? "N/A"],
      ["Cumplimiento Ley 21.663", summary.ley ?? "N/A"],
    ],
    theme: "grid",
    headStyles: { fillColor: [...COLORS.primary] as [number, number, number] },
    styles: { fontSize: 11 },
  });

  // Escaneos
  doc.addPage();
  doc.setFontSize(16);
  doc.text("Escaneos de Seguridad", 14, 20);
  autoTable(doc, {
    startY: 28,
    head: [["Dominio", "Score", "Vulnerabilidades", "Fecha"]],
    body: scans.map((s) => [
      s.domain,
      s.score,
      s.vulns,
      dayjs(s.date).format("DD/MM/YYYY"),
    ]),
    theme: "striped",
    headStyles: { fillColor: [...COLORS.secondary] as [number, number, number] },
    styles: { fontSize: 10 },
  });
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  const scansTableY = (doc as any).lastAutoTable.finalY;
  doc.text(
    "Explicación técnica: El score refleja la postura de seguridad técnica del dominio.",
    14,
    scansTableY + 8
  );
  doc.text(
    "Impacto en el negocio: Un score bajo puede significar riesgo de multas, pérdida de clientes o incidentes.",
    14,
    scansTableY + 14
  );

  // Incidentes
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.text("Incidentes de Seguridad", 14, 20);
  autoTable(doc, {
    startY: 28,
    head: [["Título", "Severidad", "Estado", "Fecha"]],
    body: incidents.map((i) => [
      i.title,
      i.severity,
      i.status,
      dayjs(i.date).format("DD/MM/YYYY"),
    ]),
    theme: "striped",
    headStyles: { fillColor: [...COLORS.danger] as [number, number, number] },
    styles: { fontSize: 10 },
  });
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  const incidentsTableY = (doc as any).lastAutoTable.finalY;
  doc.text(
    "Explicación técnica: Incidentes clasificados por severidad y estado.",
    14,
    incidentsTableY + 8
  );
  doc.text(
    "Impacto en el negocio: Incidentes críticos pueden afectar operaciones, reputación y finanzas.",
    14,
    incidentsTableY + 14
  );

  // Vulnerabilidades
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.text("Vulnerabilidades Detectadas", 14, 20);
  autoTable(doc, {
    startY: 28,
    head: [["CVE", "Severidad", "Componente", "Fecha"]],
    body: vulnerabilities.map((v) => [
      v.cve,
      v.severity,
      v.component,
      dayjs(v.date).format("DD/MM/YYYY"),
    ]),
    theme: "striped",
    headStyles: { fillColor: [...COLORS.warning] as [number, number, number] },
    styles: { fontSize: 10 },
  });
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  const vulnsTableY = (doc as any).lastAutoTable.finalY;
  doc.text(
    "Explicación técnica: Vulnerabilidades priorizadas por severidad.",
    14,
    vulnsTableY + 8
  );
  doc.text(
    "Impacto en el negocio: Vulnerabilidades críticas pueden ser puerta de entrada a ataques y sanciones regulatorias.",
    14,
    vulnsTableY + 14
  );

  // Cumplimiento
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.text("Cumplimiento Normativo", 14, 20);
  autoTable(doc, {
    startY: 28,
    head: [["Framework", "Avance", "Gaps críticos"]],
    body: compliance.map((c) => [
      c.framework,
      c.progress,
      c.gaps,
    ]),
    theme: "striped",
    headStyles: { fillColor: [...COLORS.success] as [number, number, number] },
    styles: { fontSize: 10 },
  });
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  const complianceTableY = (doc as any).lastAutoTable.finalY;
  doc.text(
    "Explicación técnica: Avance en controles ISO 27001, Ley 21.663, PCI DSS, etc.",
    14,
    complianceTableY + 8
  );
  doc.text(
    "Impacto en el negocio: El cumplimiento reduce riesgos legales, reputacionales y habilita nuevos negocios.",
    14,
    complianceTableY + 14
  );

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    "Este informe es confidencial y solo para uso interno de la organización.",
    14,
    290
  );

  return doc.output("arraybuffer");
}

export async function generatePDF(scanData: any) {
  const doc = new jsPDF();

  // Portada
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 297, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text("Reporte de Escaneo", 105, 50, { align: "center" });
  doc.setFontSize(16);
  doc.text(scanData.domain || "Dominio Escaneado", 105, 65, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Fecha: ${dayjs(scanData.createdAt).format("DD/MM/YYYY HH:mm")}`, 105, 75, { align: "center" });
  doc.text(`Score: ${scanData.score || 0}/100`, 105, 85, { align: "center" });
  doc.setFontSize(10);
  doc.text("GuardyScan - Análisis de Seguridad", 105, 270, { align: "center" });
  doc.addPage();

  // Resumen del escaneo
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(18);
  doc.text("Resumen del Escaneo", 14, 20);
  doc.setFontSize(12);
  doc.text(
    `Este reporte contiene el análisis de seguridad completo para ${scanData.domain}.`,
    14,
    28,
    { maxWidth: 180 }
  );

  const results = scanData.results as any;
  const vulnerabilities = scanData.vulnerabilities || [];
  const technologies = scanData.technologies || [];
  const openPorts = scanData.openPorts || [];

  autoTable(doc, {
    startY: 38,
    head: [["Métrica", "Valor"]],
    body: [
      ["Dominio", scanData.domain],
      ["Score de Seguridad", `${scanData.score || 0}/100`],
      ["Estado", scanData.status],
      ["Tipo de Escaneo", scanData.type],
      ["Vulnerabilidades Totales", vulnerabilities.length.toString()],
      ["Tecnologías Detectadas", technologies.length.toString()],
      ["Puertos Abiertos", openPorts.length.toString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [...COLORS.primary] as [number, number, number] },
    styles: { fontSize: 11 },
  });

  // Vulnerabilidades
  if (vulnerabilities.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Vulnerabilidades Detectadas", 14, 20);
    autoTable(doc, {
      startY: 28,
      head: [["Severidad", "Descripción", "CVE"]],
      body: vulnerabilities.slice(0, 20).map((v: any) => [
        v.severity || "N/A",
        v.description?.substring(0, 50) || "Sin descripción",
        v.cve || "N/A",
      ]),
      theme: "striped",
      headStyles: { fillColor: [...COLORS.danger] as [number, number, number] },
      styles: { fontSize: 10 },
    });
  }

  // Tecnologías
  if (technologies.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Tecnologías Detectadas", 14, 20);
    autoTable(doc, {
      startY: 28,
      head: [["Tecnología"]],
      body: technologies.slice(0, 30).map((t: string) => [t]),
      theme: "striped",
      headStyles: { fillColor: [...COLORS.secondary] as [number, number, number] },
      styles: { fontSize: 10 },
    });
  }

  // Puertos Abiertos
  if (openPorts.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Puertos Abiertos", 14, 20);
    autoTable(doc, {
      startY: 28,
      head: [["Puerto", "Servicio", "Estado"]],
      body: openPorts.slice(0, 30).map((p: any) => [
        p.port?.toString() || "N/A",
        p.service || "N/A",
        p.state || "N/A",
      ]),
      theme: "striped",
      headStyles: { fillColor: [...COLORS.warning] as [number, number, number] },
      styles: { fontSize: 10 },
    });
  }

  // Recomendaciones
  doc.addPage();
  doc.setFontSize(16);
  doc.text("Recomendaciones", 14, 20);
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  
  let yPos = 30;
  const recommendations = [
    "• Revisar y corregir todas las vulnerabilidades críticas identificadas.",
    "• Actualizar las tecnologías obsoletas detectadas.",
    "• Cerrar puertos innecesarios y configurar firewalls adecuadamente.",
    "• Implementar un programa de gestión de parches continuo.",
    "• Realizar escaneos periódicos para monitorear cambios.",
  ];

  recommendations.forEach((rec) => {
    doc.text(rec, 14, yPos, { maxWidth: 180 });
    yPos += 10;
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    "Este reporte es confidencial y solo para uso interno de la organización.",
    14,
    290
  );

  return doc.output("arraybuffer");
}
