"use client";

import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function MonthlyReportButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      const response = await fetch("/api/report", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error al generar el reporte");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Informe-Ejecutivo-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "✅ Reporte generado",
        description: "El informe ejecutivo se ha descargado correctamente.",
      });
    } catch (error) {
      console.error("Error generando reporte:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo generar el reporte. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateReport}
      disabled={isGenerating}
      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
    >
      {isGenerating ? (
        <>
          <Download className="mr-2 h-4 w-4 animate-bounce" />
          Generando...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Informe Mensual (PDF)
        </>
      )}
    </Button>
  );
}

