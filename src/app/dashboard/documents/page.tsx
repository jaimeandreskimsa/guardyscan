"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FolderArchive, Upload, FileText, File, FileSpreadsheet, FileImage, 
  Trash2, Download, Eye, Search, Filter, Plus, FolderPlus, MoreVertical,
  Calendar, User, Tag, Lock, Unlock, ChevronRight, X, Check,
  FileType, Clock, Shield, Building2, Scale, Briefcase, AlertCircle
} from "lucide-react";

// Tipos de documento predefinidos
const documentCategories = [
  { id: "contracts", name: "Contratos", icon: Briefcase, color: "bg-blue-500" },
  { id: "legal", name: "Legal", icon: Scale, color: "bg-purple-500" },
  { id: "policies", name: "Políticas de Seguridad", icon: Shield, color: "bg-green-500" },
  { id: "compliance", name: "Compliance", icon: FileText, color: "bg-orange-500" },
  { id: "certificates", name: "Certificaciones", icon: Tag, color: "bg-cyan-500" },
  { id: "bcp", name: "BCP/DRP", icon: Building2, color: "bg-red-500" },
  { id: "ethical-hacking", name: "Informes Ethical Hacking", icon: AlertCircle, color: "bg-pink-500" },
  { id: "other", name: "Otros", icon: FolderArchive, color: "bg-gray-500" },
];

// Documentos de ejemplo
const initialDocuments = [
  {
    id: "1",
    name: "Política de Seguridad de la Información v2.0.pdf",
    category: "policies",
    size: "2.4 MB",
    uploadedBy: "Admin",
    uploadedAt: "2026-01-15",
    type: "pdf",
    isConfidential: true,
    tags: ["ISO 27001", "Seguridad"],
    description: "Política general de seguridad de la información de la organización"
  },
  {
    id: "2",
    name: "Contrato Proveedor Cloud Services.pdf",
    category: "contracts",
    size: "1.8 MB",
    uploadedBy: "Legal",
    uploadedAt: "2026-01-10",
    type: "pdf",
    isConfidential: true,
    tags: ["Proveedores", "Cloud"],
    description: "Contrato de servicios con proveedor de infraestructura cloud"
  },
  {
    id: "3",
    name: "Certificado ISO 27001.pdf",
    category: "certificates",
    size: "520 KB",
    uploadedBy: "Compliance",
    uploadedAt: "2025-12-20",
    type: "pdf",
    isConfidential: false,
    tags: ["ISO 27001", "Certificación"],
    description: "Certificación ISO 27001:2022 vigente"
  },
  {
    id: "4",
    name: "Plan de Continuidad de Negocio.docx",
    category: "bcp",
    size: "3.2 MB",
    uploadedBy: "Admin",
    uploadedAt: "2026-01-05",
    type: "docx",
    isConfidential: true,
    tags: ["BCP", "Continuidad"],
    description: "Plan maestro de continuidad de negocio actualizado"
  },
  {
    id: "5",
    name: "Acuerdo de Confidencialidad Template.docx",
    category: "legal",
    size: "156 KB",
    uploadedBy: "Legal",
    uploadedAt: "2025-11-30",
    type: "docx",
    isConfidential: false,
    tags: ["NDA", "Template"],
    description: "Plantilla de acuerdo de confidencialidad para empleados y proveedores"
  },
  {
    id: "6",
    name: "Matriz de Cumplimiento Ley 21.663.xlsx",
    category: "compliance",
    size: "890 KB",
    uploadedBy: "Compliance",
    uploadedAt: "2026-01-12",
    type: "xlsx",
    isConfidential: true,
    tags: ["Ley 21.663", "Compliance"],
    description: "Matriz de controles y cumplimiento de la Ley 21.663"
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<typeof initialDocuments[0] | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para nuevo documento
  const [newDocument, setNewDocument] = useState({
    name: "",
    category: "other",
    description: "",
    tags: "",
    isConfidential: false,
    file: null as File | null
  });

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Contar documentos por categoría
  const getCategoryCount = (categoryId: string) => {
    return documents.filter(doc => doc.category === categoryId).length;
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="h-6 w-6 text-red-500" />;
      case "docx": case "doc": return <FileText className="h-6 w-6 text-blue-500" />;
      case "xlsx": case "xls": return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case "png": case "jpg": case "jpeg": return <FileImage className="h-6 w-6 text-purple-500" />;
      default: return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  // Manejar subida de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocument({
        ...newDocument,
        name: file.name,
        file: file
      });
    }
  };

  // Manejar subida de documento
  const handleUpload = () => {
    if (!newDocument.file || !newDocument.name) return;

    const fileExtension = newDocument.file.name.split('.').pop() || "";
    const newDoc = {
      id: Date.now().toString(),
      name: newDocument.name,
      category: newDocument.category,
      size: `${(newDocument.file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedBy: "Usuario",
      uploadedAt: new Date().toISOString().split('T')[0],
      type: fileExtension,
      isConfidential: newDocument.isConfidential,
      tags: newDocument.tags.split(',').map(t => t.trim()).filter(t => t),
      description: newDocument.description
    };

    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setNewDocument({
      name: "",
      category: "other",
      description: "",
      tags: "",
      isConfidential: false,
      file: null
    });
  };

  // Eliminar documento
  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FolderArchive className="h-8 w-8 text-blue-600" />
            Repositorio de Documentos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona contratos, políticas, documentación legal y certificaciones
          </p>
        </div>
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
        >
          <Upload className="h-4 w-4 mr-2" />
          Subir Documento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-blue-100 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Documentos</p>
                <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 border-purple-100 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Confidenciales</p>
                <p className="text-2xl font-bold text-purple-600">
                  {documents.filter(d => d.isConfidential).length}
                </p>
              </div>
              <Lock className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 border-green-100 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Categorías</p>
                <p className="text-2xl font-bold text-green-600">{documentCategories.length}</p>
              </div>
              <FolderArchive className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 border-orange-100 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Este Mes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {documents.filter(d => d.uploadedAt.startsWith("2026-01")).length}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categorías */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Categorías</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  !selectedCategory 
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-500 flex items-center justify-center">
                    <FolderArchive className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">Todos</span>
                </div>
                <span className="text-sm text-gray-500">{documents.length}</span>
              </button>

              {documentCategories.map((category) => {
                const Icon = category.icon;
                const count = getCategoryCount(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg ${category.color} flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Lista de Documentos */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-lg">
                  {selectedCategory 
                    ? documentCategories.find(c => c.id === selectedCategory)?.name 
                    : "Todos los Documentos"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar documentos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay documentos
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchQuery 
                      ? "No se encontraron documentos con ese criterio de búsqueda"
                      : "Sube tu primer documento para comenzar"}
                  </p>
                  <Button onClick={() => setShowUploadModal(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Documento
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header de tabla */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-5">Documento</div>
                    <div className="col-span-2">Categoría</div>
                    <div className="col-span-2">Fecha</div>
                    <div className="col-span-1">Tamaño</div>
                    <div className="col-span-2 text-right">Acciones</div>
                  </div>

                  {/* Lista de documentos */}
                  {filteredDocuments.map((doc) => {
                    const category = documentCategories.find(c => c.id === doc.category);
                    return (
                      <div
                        key={doc.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors items-center"
                      >
                        {/* Documento */}
                        <div className="md:col-span-5 flex items-center gap-3">
                          {getFileIcon(doc.type)}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {doc.name}
                              </p>
                              {doc.isConfidential && (
                                <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{doc.description}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {doc.tags.map((tag, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Categoría */}
                        <div className="md:col-span-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${category?.color} text-white`}>
                            {category && <category.icon className="h-3 w-3" />}
                            {category?.name}
                          </span>
                        </div>

                        {/* Fecha */}
                        <div className="md:col-span-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {doc.uploadedAt}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <User className="h-3 w-3" />
                            {doc.uploadedBy}
                          </div>
                        </div>

                        {/* Tamaño */}
                        <div className="md:col-span-1 text-sm text-gray-500">
                          {doc.size}
                        </div>

                        {/* Acciones */}
                        <div className="md:col-span-2 flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Ver"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Descargar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(doc.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Subida */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Subir Documento
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Área de arrastrar */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                {newDocument.file ? (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{newDocument.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(newDocument.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Arrastra un archivo o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Nombre del documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del documento
                </label>
                <input
                  type="text"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del archivo"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría
                </label>
                <select
                  value={newDocument.category}
                  onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {documentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe brevemente el contenido del documento"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={newDocument.tags}
                  onChange={(e) => setNewDocument({ ...newDocument, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ISO 27001, Seguridad, Compliance"
                />
              </div>

              {/* Confidencial */}
              <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={newDocument.isConfidential}
                  onChange={(e) => setNewDocument({ ...newDocument, isConfidential: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="confidential" className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-800 dark:text-amber-200">
                    Marcar como confidencial
                  </span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!newDocument.file || !newDocument.name}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
