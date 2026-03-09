"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScansRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/scanner");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-gray-500">Redirigiendo al Centro de Análisis...</p>
    </div>
  );
}
