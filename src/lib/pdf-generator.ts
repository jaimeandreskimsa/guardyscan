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
  const score = scanData.score || 0;
  const domain = scanData.domain || "Dominio Escaneado";
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

  // ─── Portada ───────────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(0, 0, 0);
  doc.setGState(new (doc as any).GState({ opacity: 0.18 }));
  doc.rect(0, 0, 210, 297, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("INFORME EJECUTIVO DE CIBERSEGURIDAD", 105, 70, { align: "center" });

  doc.setFontSize(26);
  doc.text(domain, 105, 90, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha del análisis: ${dayjs(scanData.createdAt).format("DD [de] MMMM [de] YYYY")}`, 105, 104, { align: "center" });

  // Score badge
  doc.setFillColor(...scoreColor);
  doc.roundedRect(72, 118, 66, 34, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.text(`${score}`, 105, 138, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("PUNTAJE DE SEGURIDAD / 100", 105, 148, { align: "center" });

  doc.setFillColor(...scoreColor);
  doc.roundedRect(55, 158, 100, 16, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(scoreLabel, 105, 169, { align: "center" });

  doc.setTextColor(200, 220, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Confidencial — Solo para uso de la Dirección", 105, 260, { align: "center" });
  doc.text("GuardyScan · Análisis de Ciberseguridad", 105, 268, { align: "center" });

  // ─── Pág 2: Resumen Ejecutivo ──────────────────────────────────
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
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(`GuardyScan — Informe Ejecutivo de Ciberseguridad · ${domain}`, 14, 290);
    doc.text(`Página ${i} de ${totalPages}`, 196, 290, { align: "right" });
    doc.text("Documento Confidencial", 105, 290, { align: "center" });
  }

  return doc.output("arraybuffer");
}

