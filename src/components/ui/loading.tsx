"use client";

import { memo } from "react";
import { Loader2 } from "lucide-react";

// Componente de loading memoizado para evitar re-renders
export const LoadingSpinner = memo(function LoadingSpinner({ 
  size = "default",
  text = "Cargando..." 
}: { 
  size?: "sm" | "default" | "lg";
  text?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
});

// Skeleton para tarjetas
export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border p-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
});

// Skeleton para tablas
export const TableSkeleton = memo(function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded" />
      ))}
    </div>
  );
});

// Skeleton para gráficos
export const ChartSkeleton = memo(function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border p-6">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
      <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded" />
    </div>
  );
});

// Loading para página completa
export const PageLoading = memo(function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    </div>
  );
});

// Dashboard skeleton completo
export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      
      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
});
