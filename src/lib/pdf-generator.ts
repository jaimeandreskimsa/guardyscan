import jsPDF from "jspdf";

export async function generatePDF(scan: any): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text("GuardyScan", 20, 20);
  
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Reporte de Seguridad", 20, 30);
  
  // Scan info
  doc.setFontSize(12);
  doc.text(`URL: ${scan.targetUrl}`, 20, 45);
  doc.text(`Fecha: ${new Date(scan.createdAt).toLocaleDateString()}`, 20, 52);
  doc.text(`Tipo de escaneo: ${scan.scanType}`, 20, 59);
  
  // Score
  doc.setFontSize(16);
  const scoreColor = scan.score >= 80 ? [34, 197, 94] : scan.score >= 60 ? [251, 191, 36] : [239, 68, 68];
  doc.setTextColor(...scoreColor);
  doc.text(`Puntuación de seguridad: ${scan.score}/100`, 20, 72);
  
  // SSL Info
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Información SSL/TLS", 20, 85);
  doc.setFontSize(10);
  
  if (scan.sslInfo) {
    doc.text(`Estado: ${scan.sslInfo.valid ? "Válido" : "Inválido"}`, 25, 92);
    if (scan.sslInfo.issuer) {
      doc.text(`Emisor: ${scan.sslInfo.issuer}`, 25, 99);
    }
    if (scan.sslInfo.validTo) {
      doc.text(`Válido hasta: ${scan.sslInfo.validTo}`, 25, 106);
    }
  }
  
  // Security Headers
  doc.setFontSize(14);
  doc.text("Headers de Seguridad", 20, 120);
  doc.setFontSize(10);
  
  if (scan.securityHeaders) {
    let y = 127;
    if (scan.securityHeaders.presentHeaders?.length > 0) {
      doc.text(`Presentes: ${scan.securityHeaders.presentHeaders.join(", ")}`, 25, y);
      y += 7;
    }
    if (scan.securityHeaders.missingHeaders?.length > 0) {
      doc.setTextColor(239, 68, 68);
      doc.text(`Faltantes: ${scan.securityHeaders.missingHeaders.join(", ")}`, 25, y);
      doc.setTextColor(0, 0, 0);
    }
  }
  
  // Vulnerabilities
  doc.setFontSize(14);
  doc.text("Vulnerabilidades Detectadas", 20, 150);
  doc.setFontSize(10);
  
  if (scan.vulnerabilities && Array.isArray(scan.vulnerabilities)) {
    let y = 157;
    if (scan.vulnerabilities.length === 0) {
      doc.setTextColor(34, 197, 94);
      doc.text("No se detectaron vulnerabilidades", 25, y);
      doc.setTextColor(0, 0, 0);
    } else {
      scan.vulnerabilities.slice(0, 5).forEach((vuln: any) => {
        doc.setTextColor(239, 68, 68);
        doc.text(`• ${vuln.type}: ${vuln.description}`, 25, y);
        y += 7;
        doc.setTextColor(100, 100, 100);
        doc.text(`  Recomendación: ${vuln.recommendation}`, 25, y);
        y += 7;
        doc.setTextColor(0, 0, 0);
      });
    }
  }
  
  // Technologies
  if (scan.technologies && scan.technologies.length > 0) {
    doc.setFontSize(14);
    doc.text("Tecnologías Detectadas", 20, 220);
    doc.setFontSize(10);
    doc.text(scan.technologies.join(", "), 25, 227);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Generado por GuardyScan - Plataforma de Ciberseguridad Empresarial", 20, 285);
  doc.text(`Reporte ID: ${scan.id}`, 20, 290);
  
  return Buffer.from(doc.output("arraybuffer"));
}
