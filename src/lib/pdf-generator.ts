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
  claudeAnalysis = null,
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
  claudeAnalysis?: {
    resumenEjecutivo?: string;
    analisisEscaneos?: string;
    analisisIncidentes?: string;
    analisisVulnerabilidades?: string;
    analisisCumplimiento?: string;
    conclusionesYPlan?: string;
  } | null;
}) {
  const doc = new jsPDF();
  const W = 210, H = 297, M = 14, CW = 182;

  // Strip markdown/emoji from Claude text before inserting in PDF
  const cleanAI = (t: string) =>
    t.replace(/^#{1,6}\s*/gm, "")
     .replace(/\*\*(.*?)\*\*/g, "$1")
     .replace(/\*(.*?)\*/g, "$1")
     .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
     .replace(/[\u{2600}-\u{27BF}]/gu, "")
     .replace(/[\u{1FA00}-\u{1FA9F}]/gu, "")
     .trim();

  const scoreVal = typeof summary.score === "number" ? summary.score : null;
  const scoreColor: [number, number, number] =
    scoreVal === null ? [37, 99, 235] :
    scoreVal >= 80 ? [16, 185, 129] :
    scoreVal >= 60 ? [245, 158, 11] : [239, 68, 68];
  const scoreLabel =
    scoreVal === null ? "SIN DATOS" :
    scoreVal >= 80 ? "RIESGO BAJO" :
    scoreVal >= 60 ? "RIESGO MEDIO" : "RIESGO ALTO";

  // ── HELPER: colored section header band ────────────────────────
  const addSectionHeader = (title: string, subtitle: string, color: [number, number, number]) => {
    doc.setFillColor(...color);
    doc.rect(0, 0, W, 44, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, M, 24);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(210, 228, 255);
    doc.text(subtitle, M, 35);
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 40, W, 4, "F");
  };

  // ── HELPER: Guardy AI callout box ───────────────────────────────
  const addCallout = (raw: string, y: number): number => {
    const text = cleanAI(raw);
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(text, CW - 16);
    const bh = Math.max(lines.length * 5.8 + 20, 28);
    // Box background
    doc.setFillColor(237, 244, 255);
    doc.roundedRect(M, y, CW, bh, 3, 3, "F");
    // Left accent bar
    doc.setFillColor(...COLORS.primary);
    doc.rect(M, y, 3, bh, "F");
    // Label
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text("ANALISIS GUARDY AI  \u2014  CLAUDE SONNET", M + 8, y + 7.5);
    // Separator line
    doc.setDrawColor(196, 213, 245);
    doc.setLineWidth(0.3);
    doc.line(M + 8, y + 9.5, M + CW - 6, y + 9.5);
    // Content
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(9);
    doc.text(lines, M + 8, y + 16);
    return y + bh + 8;
  };

  // ── HELPER: KPI row of cards ────────────────────────────────────
  const addKPIs = (kpis: { label: string; value: string; color: [number, number, number] }[], y: number): number => {
    const n = kpis.length;
    const cw = (CW - (n - 1) * 5) / n;
    kpis.forEach((k, i) => {
      const x = M + i * (cw + 5);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, cw, 24, 3, 3, "F");
      // Top color bar
      doc.setFillColor(...k.color);
      doc.roundedRect(x, y, cw, 4, 2, 2, "F");
      // Value
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.text(k.value, x + cw / 2, y + 16, { align: "center" });
      // Label
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.muted);
      const lbl = doc.splitTextToSize(k.label, cw - 4);
      doc.text(lbl[0], x + cw / 2, y + 22, { align: "center" });
    });
    return y + 30;
  };

  // ══════════════════════════════════════════════════════════════
  // PORTADA
  // ══════════════════════════════════════════════════════════════
  // Background dark layers
  doc.setFillColor(8, 15, 38);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(12, 22, 52);
  doc.rect(0, H * 0.55, W, H * 0.45, "F");

  // Left accent bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 5, H, "F");

  // GuardyScan brand mark (logo box)
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(M + 5, 52, 38, 38, 9, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("GS", M + 5 + 19, 76, { align: "center" });

  // Brand name (next to logo)
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184);
  doc.text("GUARDYSCAN", M + 5 + 43, 64);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("CYBERSECURITY INTELLIGENCE PLATFORM", M + 5 + 43, 72);

  // Report type label
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("INFORME EJECUTIVO MENSUAL DE CIBERSEGURIDAD", M + 5, 108);

  // Accent underline
  doc.setFillColor(...COLORS.primary);
  doc.rect(M + 5, 113, 60, 1.5, "F");

  // Main title
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Ciberseguridad", M + 5, 134);
  doc.text("Corporativa", M + 5, 151);

  // Company name
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184);
  doc.text(company, M + 5, 167);

  // Period and author
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Periodo analizado: ${period}`, M + 5, 178);
  doc.text(`Elaborado por: ${user}`, M + 5, 186);
  doc.text(email, M + 5, 193);

  // Security score badge (right side)
  doc.setFillColor(...scoreColor);
  doc.roundedRect(W - 62, 52, 48, 48, 11, 11, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.text(scoreVal !== null ? `${scoreVal}` : "—", W - 38, 78, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("/100", W - 38, 86, { align: "center" });
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(scoreLabel, W - 38, 94, { align: "center" });

  // Bottom confidential footer on cover
  doc.setFillColor(17, 24, 50);
  doc.rect(0, H - 28, W, 28, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Clasificacion: CONFIDENCIAL — Uso exclusivo de la Direccion y Comite de Seguridad", W / 2, H - 15, { align: "center" });
  doc.text(`GuardyScan  ·  guardyscan.com  ·  ${dayjs().format("DD/MM/YYYY")}`, W / 2, H - 7, { align: "center" });

  // ══════════════════════════════════════════════════════════════
  // PÁG 2 — DASHBOARD EJECUTIVO
  // ══════════════════════════════════════════════════════════════
  doc.addPage();
  addSectionHeader(
    "Dashboard Ejecutivo",
    `Indicadores clave de seguridad  |  Periodo: ${period}`,
    [...COLORS.primary] as [number, number, number]
  );
  let y = 52;

  y = addKPIs([
    { label: "Score de Seguridad", value: scoreVal !== null ? `${scoreVal}` : "N/A", color: scoreColor },
    { label: "Escaneos realizados", value: String(summary.scans ?? "0"), color: [...COLORS.secondary] as [number, number, number] },
    { label: "Incidentes reportados", value: String(summary.incidents ?? "0"), color: [...COLORS.danger] as [number, number, number] },
  ], y);
  y += 5;
  y = addKPIs([
    { label: "Vulnerabilidades criticas", value: String(summary.criticalVulns ?? "0"), color: [...COLORS.danger] as [number, number, number] },
    { label: "Cumplimiento ISO 27001", value: String(summary.iso ?? "N/A"), color: [...COLORS.success] as [number, number, number] },
    { label: "Cumplimiento Ley 21.663", value: String(summary.ley ?? "N/A"), color: [...COLORS.success] as [number, number, number] },
  ], y);
  y += 10;

  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Diagnostico del Periodo", M, y);
  y += 7;
  addCallout(
    claudeAnalysis?.resumenEjecutivo ?? "Analisis ejecutivo no disponible para este periodo. Ejecute el informe nuevamente para obtener el diagnostico inteligente.",
    y
  );

  // ══════════════════════════════════════════════════════════════
  // PÁG 3 — ESCANEOS DE SEGURIDAD
  // ══════════════════════════════════════════════════════════════
  doc.addPage();
  addSectionHeader(
    "Escaneos de Seguridad",
    "Analisis de dominios y superficies de ataque expuestas durante el periodo",
    [...COLORS.secondary] as [number, number, number]
  );
  autoTable(doc, {
    startY: 50,
    head: [["Dominio / URL", "Score", "Vulnerabilidades", "Fecha"]],
    body: scans.length > 0
      ? scans.map((s) => [s.domain ?? "—", s.score ?? "—", s.vulns ?? "—", dayjs(s.date).format("DD/MM/YYYY")])
      : [["Sin escaneos registrados en el periodo", "—", "—", "—"]],
    theme: "grid",
    headStyles: { fillColor: [...COLORS.secondary] as [number, number, number], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4, lineColor: [220, 228, 240], lineWidth: 0.2 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 72 }, 1: { cellWidth: 22, halign: "center" }, 2: { cellWidth: 36, halign: "center" }, 3: { cellWidth: 30 } },
  });
  addCallout(
    claudeAnalysis?.analisisEscaneos ?? "Analisis de escaneos no disponible para este periodo.",
    (doc as any).lastAutoTable.finalY + 8
  );

  // ══════════════════════════════════════════════════════════════
  // PÁG 4 — INCIDENTES DE SEGURIDAD
  // ══════════════════════════════════════════════════════════════
  doc.addPage();
  addSectionHeader(
    "Incidentes de Seguridad",
    "Estado y evolucion de los incidentes detectados y gestionados en el periodo",
    [...COLORS.danger] as [number, number, number]
  );
  autoTable(doc, {
    startY: 50,
    head: [["Titulo del Incidente", "Severidad", "Estado", "Fecha"]],
    body: incidents.length > 0
      ? incidents.map((i) => [i.title ?? "—", i.severity ?? "—", i.status ?? "—", dayjs(i.date).format("DD/MM/YYYY")])
      : [["Sin incidentes registrados en el periodo", "—", "—", "—"]],
    theme: "grid",
    headStyles: { fillColor: [...COLORS.danger] as [number, number, number], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4, lineColor: [240, 220, 220], lineWidth: 0.2 },
    alternateRowStyles: { fillColor: [254, 250, 250] },
    columnStyles: { 0: { cellWidth: 82 }, 1: { cellWidth: 28 }, 2: { cellWidth: 26 }, 3: { cellWidth: 30 } },
    didParseCell: (d) => {
      if (d.column.index === 1 && d.section === "body") {
        const s = String(d.cell.raw).toLowerCase();
        if (["critical", "high", "alto", "critico"].some((x) => s.includes(x))) d.cell.styles.textColor = [220, 38, 38];
        else if (["medium", "medio"].some((x) => s.includes(x))) d.cell.styles.textColor = [180, 90, 0];
        else d.cell.styles.textColor = [22, 163, 74];
      }
    },
  });
  addCallout(
    claudeAnalysis?.analisisIncidentes ?? "Analisis de incidentes no disponible para este periodo.",
    (doc as any).lastAutoTable.finalY + 8
  );

  // ══════════════════════════════════════════════════════════════
  // PÁG 5 — VULNERABILIDADES
  // ══════════════════════════════════════════════════════════════
  doc.addPage();
  addSectionHeader(
    "Vulnerabilidades Detectadas",
    "Inventario priorizado por severidad y riesgo potencial para la organizacion",
    [...COLORS.warning] as [number, number, number]
  );
  autoTable(doc, {
    startY: 50,
    head: [["CVE / Codigo", "Severidad", "Componente Afectado", "Fecha"]],
    body: vulnerabilities.length > 0
      ? vulnerabilities.map((v) => [v.cve ?? "—", v.severity ?? "—", v.component ?? "—", dayjs(v.date).format("DD/MM/YYYY")])
      : [["Sin vulnerabilidades registradas en el periodo", "—", "—", "—"]],
    theme: "grid",
    headStyles: { fillColor: [...COLORS.warning] as [number, number, number], textColor: [20, 20, 20], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4, lineColor: [240, 235, 210], lineWidth: 0.2 },
    alternateRowStyles: { fillColor: [255, 253, 245] },
    columnStyles: { 0: { cellWidth: 44 }, 1: { cellWidth: 28 }, 2: { cellWidth: 78 }, 3: { cellWidth: 30 } },
    didParseCell: (d) => {
      if (d.column.index === 1 && d.section === "body") {
        const s = String(d.cell.raw).toLowerCase();
        if (["critical", "high", "alto", "critico"].some((x) => s.includes(x))) d.cell.styles.textColor = [220, 38, 38];
        else if (["medium", "medio"].some((x) => s.includes(x))) d.cell.styles.textColor = [180, 90, 0];
        else d.cell.styles.textColor = [22, 163, 74];
      }
    },
  });
  addCallout(
    claudeAnalysis?.analisisVulnerabilidades ?? "Analisis de vulnerabilidades no disponible para este periodo.",
    (doc as any).lastAutoTable.finalY + 8
  );

  // ══════════════════════════════════════════════════════════════
  // PÁG 6 — CUMPLIMIENTO NORMATIVO
  // ══════════════════════════════════════════════════════════════
  doc.addPage();
  addSectionHeader(
    "Cumplimiento Normativo",
    "Estado de controles y marcos regulatorios vigentes aplicables a la organizacion",
    [...COLORS.success] as [number, number, number]
  );
  autoTable(doc, {
    startY: 50,
    head: [["Framework / Normativa", "Avance (%)", "Gaps Criticos"]],
    body: compliance.length > 0
      ? compliance.map((c) => [c.framework ?? "—", c.progress ?? "—", c.gaps ?? "—"])
      : [["Sin evaluaciones de cumplimiento registradas", "—", "—"]],
    theme: "grid",
    headStyles: { fillColor: [...COLORS.success] as [number, number, number], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4, lineColor: [210, 240, 215], lineWidth: 0.2 },
    alternateRowStyles: { fillColor: [245, 253, 247] },
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 36, halign: "center" }, 2: { cellWidth: 56 } },
  });
  addCallout(
    claudeAnalysis?.analisisCumplimiento ?? "Analisis de cumplimiento no disponible para este periodo.",
    (doc as any).lastAutoTable.finalY + 8
  );

  // ══════════════════════════════════════════════════════════════
  // PÁG 7 — CONCLUSIONES Y PLAN DE ACCION (solo si hay análisis)
  // ══════════════════════════════════════════════════════════════
  if (claudeAnalysis?.conclusionesYPlan) {
    doc.addPage();
    addSectionHeader(
      "Conclusiones y Plan de Accion",
      "Recomendaciones estrategicas y plan de mejora generados por Guardy AI",
      [79, 70, 229] as [number, number, number]
    );
    let yC = 52;
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    const conclusLines = doc.splitTextToSize(cleanAI(claudeAnalysis.conclusionesYPlan), CW);
    doc.text(conclusLines, M, yC);
    yC += conclusLines.length * 5.8 + 10;

    // AI attribution
    doc.setFillColor(237, 244, 255);
    doc.roundedRect(M, yC, CW, 14, 3, 3, "F");
    doc.setFillColor(...COLORS.primary);
    doc.rect(M, yC, 3, 14, "F");
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("Informe generado con Guardy AI (Claude Sonnet)  \u2014  Analisis basado en datos reales de GuardyScan.", M + 8, yC + 9);
  }

  // ══════════════════════════════════════════════════════════════
  // FOOTERS — todas las páginas excepto portada
  // ══════════════════════════════════════════════════════════════
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let pg = 2; pg <= totalPages; pg++) {
    doc.setPage(pg);
    doc.setDrawColor(220, 226, 236);
    doc.setLineWidth(0.25);
    doc.line(M, H - 11, W - M, H - 11);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text(`GuardyScan  \u00b7  ${company}`, M, H - 5.5);
    doc.text("DOCUMENTO CONFIDENCIAL", W / 2, H - 5.5, { align: "center" });
    doc.text(`Pag. ${pg - 1} / ${totalPages - 1}`, W - M, H - 5.5, { align: "right" });
  }

  return doc.output("arraybuffer");
}

export async function generatePDF(
  scanData: any,
  claudeAnalysis?: {
    diagnosticoEjecutivo?: string;
    analisisTecnico?: string;
    impactoNegocio?: string;
    planRemediacion?: string;
  } | null
) {
  const doc = new jsPDF();
  const score = scanData.score || 0;
  const domain = scanData.domain || scanData.targetUrl || "Dominio Escaneado";
  const vulnerabilities: any[] = scanData.vulnerabilities || [];
  const technologies: any[] = (scanData.technologies || []).map((t: any) =>
    typeof t === "string" ? { name: t, version: "-" } : t
  );
  const openPorts: any[] = scanData.openPorts || [];
  const critVulns = vulnerabilities.filter((v) =>
    ["critical", "crítico", "critico", "high", "alto"].includes(
      (v.severity || "").toLowerCase()
    )
  );
  const medVulns = vulnerabilities.filter((v) =>
    ["medium", "medio", "moderate"].includes((v.severity || "").toLowerCase())
  );

  const PORTS_CRITICAL = [21, 23, 3389, 445, 135, 139, 1080, 8080, 8443];
  const PORTS_SENSITIVE = [22, 3306, 5432, 6379, 27017, 1433];
  const critPorts = openPorts.filter((p) =>
    PORTS_CRITICAL.includes(parseInt(p.port, 10))
  );
  const sensPorts = openPorts.filter((p) =>
    PORTS_SENSITIVE.includes(parseInt(p.port, 10))
  );

  const scoreColor: [number, number, number] =
    score >= 80
      ? [16, 185, 129]
      : score >= 60
      ? [245, 158, 11]
      : [239, 68, 68];
  const scoreLabel =
    score >= 80 ? "Nivel de Riesgo: BAJO" : score >= 60 ? "Nivel de Riesgo: MEDIO" : "Nivel de Riesgo: ALTO";
  const scoreDesc =
    score >= 80
      ? "La organización mantiene una postura de seguridad sólida. Se recomienda continuar con el monitoreo preventivo."
      : score >= 60
      ? "Se han detectado vulnerabilidades que requieren atención. Existen riesgos que podrían ser explotados si no se corrigen."
      : "La organización presenta vulnerabilidades críticas que requieren acción inmediata para proteger los activos digitales y la continuidad del negocio.";

  // ─── Portada (Diseño Elegante) ──────────────────────────────────
  // Fondo blanco limpio
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, "F");

  // Banda superior oscura
  doc.setFillColor(8, 15, 38);
  doc.rect(0, 0, 210, 54, "F");

  // Barra de acento azul (izquierda, altura completa)
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 5, 297, "F");

  // Insignia "GS" en banda superior
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(170, 11, 32, 32, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("GS", 186, 31, { align: "center" });

  // Nombre de marca en banda superior
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("GUARDY", 18, 27);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(147, 179, 255);
  doc.text("SCAN", 47, 27);
  doc.setFontSize(8);
  doc.setTextColor(130, 155, 210);
  doc.text("Plataforma de Ciberseguridad Empresarial", 18, 39);

  // Etiqueta de tipo de informe
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("INFORME EJECUTIVO DE CIBERSEGURIDAD", 18, 72);

  // Línea divisora delgada
  doc.setDrawColor(214, 228, 255);
  doc.setLineWidth(0.4);
  doc.line(18, 77, 195, 77);

  // Dominio (grande, oscuro)
  const domainDisplay = domain.length > 34 ? domain.substring(0, 31) + "..." : domain;
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(domainDisplay, 18, 97);

  // Fecha
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(`Fecha del análisis: ${dayjs(scanData.createdAt).format("DD [de] MMMM [de] YYYY")}`, 18, 111);

  // Segunda línea divisora
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(18, 119, 195, 119);

  // Caja de puntaje (izquierda)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(18, 131, 62, 72, 6, 6, "F");
  doc.setDrawColor(...scoreColor);
  doc.setLineWidth(2);
  doc.roundedRect(18, 131, 62, 72, 6, 6, "S");
  doc.setTextColor(...scoreColor);
  doc.setFontSize(38);
  doc.setFont("helvetica", "bold");
  doc.text(`${score}`, 49, 165, { align: "center" });
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.muted);
  doc.text("PUNTAJE DE", 49, 175, { align: "center" });
  doc.text("SEGURIDAD", 49, 182, { align: "center" });
  doc.text("/ 100", 49, 189, { align: "center" });

  // Detalles del puntaje (derecha)
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("Evaluación de Seguridad", 92, 143);
  doc.setFillColor(...scoreColor);
  doc.roundedRect(92, 149, 90, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(scoreLabel, 137, 158, { align: "center" });
  const descLines = doc.splitTextToSize(scoreDesc, 100);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(descLines, 92, 172);

  // Franja inferior
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 265, 210, 32, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(18, 265, 195, 265);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Documento Confidencial — Solo para uso de la Dirección", 105, 276, { align: "center" });
  doc.text("GuardyScan  ·  Análisis de Ciberseguridad  ·  guardyscan.com", 105, 284, { align: "center" });

  // ─── Pág 2: Análisis Guardy AI (Claude) ─────────────────────────────
  // Always added — shows placeholder message if Claude wasn’t available
  {
    const cleanAI = (t: string) =>
      t.replace(/^#{1,6}\s*/gm, "")
       .replace(/\*\*(.*?)\*\*/g, "$1")
       .replace(/\*(.*?)\*/g, "$1")
       .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
       .replace(/[\u{2600}-\u{27BF}]/gu, "")
       .trim();

    doc.addPage();

    // Header strip — deep navy
    doc.setFillColor(8, 15, 38);
    doc.rect(0, 0, 210, 48, "F");
    // Blue left accent
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, 5, 48, "F");
    // "AI" badge
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(168, 10, 30, 28, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("AI", 183, 27, { align: "center" });
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.text("Análisis Guardy AI", 14, 24);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(147, 179, 255);
    doc.text(`Diagnóstico personalizado para ${domain}  ·  Claude Sonnet  ·  Lenguaje ejecutivo y técnico`, 14, 36);

    let yAI = 58;

    if (!claudeAnalysis) {
      // Placeholder box when Claude wasn’t available
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yAI, 182, 40, 5, 5, "F");
      doc.setDrawColor(200, 210, 230);
      doc.setLineWidth(0.5);
      doc.roundedRect(14, yAI, 182, 40, 5, 5, "S");
      doc.setTextColor(...COLORS.muted);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Análisis de IA no disponible en este informe", 105, yAI + 16, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Para incluir el diagnóstico generado por Claude, verifique que ANTHROPIC_API_KEY esté configurado.", 105, yAI + 26, { align: "center" });
    } else {
      const addAISection = (
        label: string,
        sublabel: string,
        raw: string,
        accentColor: [number, number, number]
      ) => {
        if (!raw) return;
        const text = cleanAI(raw);
        const lines = doc.splitTextToSize(text, 169);
        const bh = Math.max(lines.length * 5.8 + 22, 30);

        // New page if content doesn’t fit
        if (yAI + bh + 18 > 284) {
          doc.addPage();
          doc.setFillColor(8, 15, 38);
          doc.rect(0, 0, 210, 40, "F");
          doc.setFillColor(...COLORS.primary);
          doc.rect(0, 0, 5, 40, "F");
          doc.setTextColor(147, 179, 255);
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.text(`Análisis Guardy AI — ${domain}  (continuación)`, 14, 26);
          yAI = 50;
        }

        // Section label
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...accentColor);
        doc.text(label, 14, yAI);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.muted);
        doc.text(sublabel, 14, yAI + 6);
        yAI += 10;

        // Content box with left border
        doc.setFillColor(245, 248, 255);
        doc.roundedRect(14, yAI, 182, bh, 3, 3, "F");
        doc.setFillColor(...accentColor);
        doc.rect(14, yAI, 4, bh, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        doc.text(lines, 22, yAI + 12);
        yAI += bh + 10;
      };

      addAISection(
        "Diagnóstico Ejecutivo",
        "Resumen para la dirección — sin tecnicismos",
        claudeAnalysis.diagnosticoEjecutivo ?? "",
        [37, 99, 235]
      );
      addAISection(
        "Impacto en el Negocio",
        "Riesgo financiero, regulatorio y operacional",
        claudeAnalysis.impactoNegocio ?? "",
        [124, 58, 237]
      );
      addAISection(
        "Análisis Técnico Detallado",
        "CVEs, vectores de ataque, SSL/TLS, cabeceras, tecnologías",
        claudeAnalysis.analisisTecnico ?? "",
        [5, 150, 105]
      );
      addAISection(
        "Plan de Remediación Priorizado",
        "Acciones inmediatas, a 30 días y a 90 días",
        claudeAnalysis.planRemediacion ?? "",
        [217, 119, 6]
      );
    }
  }

  // ─── Pág 3: Resumen Ejecutivo ────────────────────────────────────
  doc.addPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen Ejecutivo", 14, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(`Análisis de seguridad para ${domain} — ${dayjs(scanData.createdAt).format("DD/MM/YYYY")}`, 14, 32);

  // Cuadro de diagnóstico
  doc.setFillColor(...scoreColor);
  doc.roundedRect(14, 46, 182, 28, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(scoreLabel, 22, 58);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const splitDesc = doc.splitTextToSize(scoreDesc, 170);
  doc.text(splitDesc, 22, 66);

  // KPIs del análisis
  let yy = 86;
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Hallazgos Clave", 14, yy);
  yy += 8;

  const kpis = [
    { label: "Vulnerabilidades críticas / altas detectadas", value: critVulns.length.toString(), color: critVulns.length > 0 ? ([239, 68, 68] as [number,number,number]) : ([16, 185, 129] as [number,number,number]) },
    { label: "Vulnerabilidades de severidad media", value: medVulns.length.toString(), color: medVulns.length > 0 ? ([245, 158, 11] as [number,number,number]) : ([16, 185, 129] as [number,number,number]) },
    { label: "Tecnologías identificadas en la plataforma", value: technologies.length.toString(), color: [99, 102, 241] as [number,number,number] },
    { label: "Puertos de red con riesgo alto expuestos", value: critPorts.length.toString(), color: critPorts.length > 0 ? ([239, 68, 68] as [number,number,number]) : ([16, 185, 129] as [number,number,number]) },
    { label: "Servicios sensibles expuestos (BD, SSH, etc.)", value: sensPorts.length.toString(), color: sensPorts.length > 0 ? ([245, 158, 11] as [number,number,number]) : ([16, 185, 129] as [number,number,number]) },
  ];

  kpis.forEach((k) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, yy, 182, 14, 3, 3, "F");
    doc.setFillColor(...k.color);
    doc.roundedRect(14, yy, 4, 14, 2, 2, "F");
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(k.label, 22, yy + 9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...k.color);
    doc.text(k.value, 190, yy + 9, { align: "right" });
    yy += 17;
  });

  // ¿Qué significa para el negocio?
  yy += 4;
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("¿Qué significa para el negocio?", 14, yy);
  yy += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);

  const businessMessages: string[] = [];
  if (critVulns.length > 0)
    businessMessages.push(`• Se encontraron ${critVulns.length} vulnerabilidades de alto riesgo. Un atacante podría explotar estas fallas para acceder a datos confidenciales, interrumpir el servicio o exigir rescate (ransomware).`);
  if (critPorts.length > 0)
    businessMessages.push(`• ${critPorts.length} puertos de alto riesgo están expuestos públicamente (Telnet, FTP, RDP, SMB). Estos protocolos son objetivos frecuentes de ataques automatizados que ocurren en minutos.`);
  if (sensPorts.length > 0)
    businessMessages.push(`• ${sensPorts.length} servicios sensibles como bases de datos o acceso remoto son visibles desde internet. Un atacante podría intentar acceder directamente sin pasar por la aplicación.`);
  if (critVulns.length === 0 && critPorts.length === 0 && sensPorts.length === 0)
    businessMessages.push("• No se detectaron vulnerabilidades críticas ni puertos de alto riesgo. La postura de seguridad actual protege adecuadamente los activos digitales de la organización.");

  businessMessages.forEach((msg) => {
    const lines = doc.splitTextToSize(msg, 182);
    doc.text(lines, 14, yy);
    yy += lines.length * 6 + 4;
  });

  // ─── Pág 3: Vulnerabilidades (lenguaje ejecutivo) ──────────────
  if (vulnerabilities.length > 0) {
    doc.addPage();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Vulnerabilidades Detectadas", 14, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text("Descripción del riesgo y su impacto en la organización", 14, 32);

    const vulnTableBody = vulnerabilities.slice(0, 20).map((v: any) => {
      const sev = (v.severity || "").toLowerCase();
      const sevLabel =
        ["critical", "crítico", "critico"].includes(sev) ? "CRÍTICO"
        : ["high", "alto"].includes(sev) ? "ALTO"
        : ["medium", "medio"].includes(sev) ? "MEDIO"
        : "BAJO";
      const businessImpact =
        sevLabel === "CRÍTICO" || sevLabel === "ALTO"
          ? "Puede provocar pérdida de datos, interrupción del servicio o acceso no autorizado a sistemas internos"
          : sevLabel === "MEDIO"
          ? "Podría ser aprovechado en combinación con otras vulnerabilidades para escalar privilegios o filtrar información"
          : "Riesgo bajo — recomendable corregir en el próximo ciclo de mantenimiento";
      const desc = v.description || v.title || v.name || "Vulnerabilidad detectada";
      return [sevLabel, desc.length > 60 ? desc.substring(0, 60) + "…" : desc, businessImpact];
    });

    autoTable(doc, {
      startY: 46,
      head: [["Severidad", "Descripción", "Impacto en el Negocio"]],
      body: vulnTableBody,
      theme: "grid",
      headStyles: { fillColor: [...COLORS.danger] as [number, number, number], textColor: [255,255,255], fontStyle: "bold", fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: "bold", fontSize: 9 },
        1: { cellWidth: 80, fontSize: 8 },
        2: { cellWidth: 80, fontSize: 8, textColor: [80, 80, 80] },
      },
      styles: { overflow: "linebreak", cellPadding: 3 },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === "body") {
          const val = String(data.cell.raw || "");
          if (val === "CRÍTICO" || val === "ALTO") data.cell.styles.textColor = [220, 38, 38];
          else if (val === "MEDIO") data.cell.styles.textColor = [180, 90, 0];
          else data.cell.styles.textColor = [22, 163, 74];
        }
      },
    });

    // Acción recomendada
    const finalY2 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(14, finalY2, 182, 24, 4, 4, "F");
    doc.setTextColor(29, 78, 216);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Acción Recomendada:", 20, finalY2 + 8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 58, 138);
    const actionText =
      critVulns.length > 0
        ? `Priorizar la corrección de las ${critVulns.length} vulnerabilidades críticas/altas en los próximos 30 días. Se recomienda contratar un servicio de parchado urgente o habilitar WAF para mitigación inmediata mientras se corrigen.`
        : "Programar la corrección de las vulnerabilidades detectadas en el próximo sprint de mantenimiento. No se requiere acción de emergencia.";
    const actionLines = doc.splitTextToSize(actionText, 170);
    doc.text(actionLines, 20, finalY2 + 15);
  }

  // ─── Pág 4: Exposición de Red (lenguaje ejecutivo) ─────────────
  if (openPorts.length > 0) {
    doc.addPage();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Exposición de Red y Servicios", 14, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text("Puertos y servicios visibles desde internet", 14, 32);

    const portLabelsMap: Record<number, string> = {
      80: "Servidor Web (HTTP)", 443: "Servidor Web Seguro (HTTPS)", 22: "Acceso Remoto SSH",
      21: "Transferencia de Archivos FTP (inseguro)", 23: "Acceso Remoto Telnet (inseguro)",
      3306: "Base de Datos MySQL", 5432: "Base de Datos PostgreSQL", 6379: "Servidor de Caché Redis",
      27017: "Base de Datos MongoDB", 3389: "Escritorio Remoto Windows (RDP)",
      445: "Compartición de Archivos Windows (SMB)", 8080: "Servidor Web Alternativo",
    };
    const portRiskMsg: Record<string, string> = {
      CRÍTICO: "Debe cerrarse de inmediato — protocolo inseguro o vector de ataque directo",
      SENSIBLE: "Restringir acceso — solo accesible desde redes internas o VPN",
      ESPERADO: "Servicio normal de operación web",
    };
    const portTableBody = openPorts.slice(0, 20).map((p: any) => {
      const n = parseInt(p.port, 10);
      const label = portLabelsMap[n] || p.service || "Servicio desconocido";
      const risk = PORTS_CRITICAL.includes(n) ? "CRÍTICO" : PORTS_SENSITIVE.includes(n) ? "SENSIBLE" : "ESPERADO";
      return [p.port?.toString() || "—", label, risk, portRiskMsg[risk]];
    });

    autoTable(doc, {
      startY: 46,
      head: [["Puerto", "Servicio", "Clasificación", "Acción"]],
      body: portTableBody,
      theme: "grid",
      headStyles: { fillColor: [...COLORS.warning] as [number,number,number], textColor: [255,255,255], fontStyle: "bold", fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 18, fontStyle: "bold", fontSize: 9 },
        1: { cellWidth: 58, fontSize: 8 },
        2: { cellWidth: 24, fontStyle: "bold", fontSize: 8 },
        3: { cellWidth: 82, fontSize: 8, textColor: [80, 80, 80] },
      },
      styles: { overflow: "linebreak", cellPadding: 3 },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const val = String(data.cell.raw || "");
          if (val === "CRÍTICO") data.cell.styles.textColor = [220, 38, 38];
          else if (val === "SENSIBLE") data.cell.styles.textColor = [180, 90, 0];
          else data.cell.styles.textColor = [22, 163, 74];
        }
      },
    });

    const finalY3 = (doc as any).lastAutoTable.finalY + 8;
    if (critPorts.length > 0 || sensPorts.length > 0) {
      doc.setFillColor(255, 247, 237);
      doc.roundedRect(14, finalY3, 182, 22, 4, 4, "F");
      doc.setTextColor(154, 52, 18);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Acción Recomendada:", 20, finalY3 + 8);
      doc.setFont("helvetica", "normal");
      const portAction = critPorts.length > 0
        ? `Cerrar inmediatamente los ${critPorts.length} puertos críticos (${critPorts.map((p: any) => p.port).join(", ")}). Revisar reglas del firewall para garantizar que los ${sensPorts.length} servicios sensibles no sean accesibles desde internet.`
        : `Revisar configuración de firewall para los ${sensPorts.length} servicios sensibles detectados. Asegurar que solo son accesibles desde redes internas o a través de VPN.`;
      const portLines = doc.splitTextToSize(portAction, 170);
      doc.text(portLines, 20, finalY3 + 14);
    }
  }

  // ─── Pág 5: Plan de Acción ──────────────────────────────────────
  doc.addPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Plan de Acción Recomendado", 14, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text("Pasos concretos ordenados por prioridad e impacto en el negocio", 14, 32);

  const actions = [
    {
      priority: "INMEDIATO",
      color: [239, 68, 68] as [number,number,number],
      items: [
        critVulns.length > 0 ? `Aplicar parches de seguridad para las ${critVulns.length} vulnerabilidades críticas detectadas` : null,
        critPorts.length > 0 ? `Cerrar puertos de alto riesgo expuestos (${critPorts.map((p: any) => p.port).join(", ")}) en el firewall` : null,
        "Verificar que no existan credenciales o archivos de configuración accesibles públicamente",
      ].filter(Boolean) as string[],
    },
    {
      priority: "CORTO PLAZO (30 días)",
      color: [245, 158, 11] as [number,number,number],
      items: [
        medVulns.length > 0 ? `Corregir las ${medVulns.length} vulnerabilidades de severidad media identificadas` : null,
        sensPorts.length > 0 ? `Restringir el acceso a ${sensPorts.length} servicios sensibles (BD, SSH) solo a redes internas o VPN` : null,
        "Revisar y actualizar tecnologías con versiones próximas a fin de soporte",
        "Implementar monitoreo de alertas de seguridad en tiempo real",
      ].filter(Boolean) as string[],
    },
    {
      priority: "MEDIANO PLAZO (90 días)",
      color: [16, 185, 129] as [number,number,number],
      items: [
        "Establecer un programa de escaneos de seguridad mensuales",
        "Capacitar al equipo de desarrollo en prácticas de programación segura",
        "Implementar política de gestión de parches y actualizaciones",
        "Evaluar la contratación de un servicio de monitoreo continuo (SOC)",
      ],
    },
  ];

  let yAction = 46;
  actions.forEach((section) => {
    if (section.items.length === 0) return;
    doc.setFillColor(...section.color);
    doc.roundedRect(14, yAction, 182, 10, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(section.priority, 20, yAction + 7);
    yAction += 13;
    section.items.forEach((item) => {
      const lines = doc.splitTextToSize(`• ${item}`, 172);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yAction, 182, lines.length * 6 + 6, 2, 2, "F");
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(lines, 20, yAction + 5);
      yAction += lines.length * 6 + 8;
    });
    yAction += 4;
  });

  // Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 226, 236);
    doc.setLineWidth(0.25);
    doc.line(14, 288, 196, 288);
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(`GuardyScan  ·  Informe de Ciberseguridad  ·  ${domain}`, 14, 293);
    doc.text(`Página ${i} de ${totalPages}`, 196, 293, { align: "right" });
    doc.text("Documento Confidencial", 105, 293, { align: "center" });
  }

  return doc.output("arraybuffer");
}

