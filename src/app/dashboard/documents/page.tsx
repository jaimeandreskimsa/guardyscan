'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FolderArchive, Upload, FileText, File, FileSpreadsheet, FileImage,
  Trash2, Download, Eye, Search, X, Lock, Calendar, User, Tag,
  Shield, Building2, Scale, Briefcase, AlertCircle, Loader2,
} from 'lucide-react'

const documentCategories = [
  { id: 'contracts',      name: 'Contratos',               icon: Briefcase,    color: 'bg-blue-500' },
  { id: 'legal',          name: 'Legal / Gobierno',        icon: Scale,        color: 'bg-purple-500' },
  { id: 'policies',       name: 'Políticas y Procedimientos', icon: Shield,    color: 'bg-green-500' },
  { id: 'compliance',     name: 'Compliance / Riesgos',    icon: FileText,     color: 'bg-orange-500' },
  { id: 'certificates',   name: 'Certificaciones',         icon: Tag,          color: 'bg-cyan-500' },
  { id: 'bcp',            name: 'BCP / DRP / Continuidad', icon: Building2,    color: 'bg-red-500' },
  { id: 'ethical-hacking',name: 'Informes Ethical Hacking',icon: AlertCircle,  color: 'bg-pink-500' },
  { id: 'other',          name: 'Otros',                   icon: FolderArchive, color: 'bg-gray-500' },
]

interface Doc {
  id: string
  name: string
  originalName: string
  category: string
  description: string | null
  tags: string[]
  size: number
  mimeType: string
  fileType: string
  url: string
  isConfidential: boolean
  uploadedBy: string | null
  createdAt: string
}

const fmtSize = (b: number) => {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(2)} MB`
}

const fmtDate = (s: string) => new Date(s).toISOString().split('T')[0]

const FileIcon = ({ type }: { type: string }) => {
  const t = type?.toLowerCase()
  if (t === 'pdf') return <FileText className="h-6 w-6 text-red-500 flex-shrink-0" />
  if (t === 'docx' || t === 'doc') return <FileText className="h-6 w-6 text-blue-500 flex-shrink-0" />
  if (t === 'xlsx' || t === 'xls') return <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />
  if (['png','jpg','jpeg','gif','webp'].includes(t)) return <FileImage className="h-6 w-6 text-purple-500 flex-shrink-0" />
  return <File className="h-6 w-6 text-gray-500 flex-shrink-0" />
}

const EMPTY_FORM = { name: '', category: 'other', description: '', tags: '', isConfidential: false, file: null as File | null }

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [uploadErr, setUploadErr] = useState('')
  const [selCat, setSelCat] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocs(data.documents || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDocs() }, [])

  const filtered = docs.filter(d => {
    const matchCat = !selCat || d.category === selCat
    const q = search.toLowerCase()
    const matchQ = !q ||
      d.name.toLowerCase().includes(q) ||
      (d.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (d.description || '').toLowerCase().includes(q)
    return matchCat && matchQ
  })

  const catCount = (id: string) => docs.filter(d => d.category === id).length

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setForm(p => ({ ...p, name: f.name, file: f }))
  }

  const handleUpload = async () => {
    if (!form.file || !form.name) return
    setUploading(true)
    setUploadErr('')
    setUploadMsg('Subiendo archivo...')
    try {
      const formData = new FormData()
      formData.append('file', form.file)
      formData.append('name', form.name)
      formData.append('category', form.category)
      formData.append('description', form.description || '')
      formData.append('tags', form.tags)
      formData.append('isConfidential', String(form.isConfidential))
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Error al subir el archivo')
      await fetchDocs()
      setShowModal(false)
      setForm(EMPTY_FORM)
      setUploadMsg('')
    } catch (e: any) {
      setUploadErr(e.message || 'Error al subir. Verifica BLOB_READ_WRITE_TOKEN en Vercel.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  const now = new Date()
  const thisMonthCount = docs.filter(d => {
    const c = new Date(d.createdAt)
    return c.getMonth() === now.getMonth() && c.getFullYear() === now.getFullYear()
  }).length

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
          onClick={() => { setShowModal(true); setUploadErr(''); setUploadMsg('') }}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
        >
          <Upload className="h-4 w-4 mr-2" /> Subir Documento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Documentos', value: docs.length, icon: FileText, color: 'text-blue-600', bg: 'from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-blue-100 dark:border-blue-800' },
          { label: 'Confidenciales', value: docs.filter(d => d.isConfidential).length, icon: Lock, color: 'text-purple-600', bg: 'from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 border-purple-100 dark:border-purple-800' },
          { label: 'Categorías', value: documentCategories.length, icon: FolderArchive, color: 'text-green-600', bg: 'from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 border-green-100 dark:border-green-800' },
          { label: 'Este Mes', value: thisMonthCount, icon: Calendar, color: 'text-orange-600', bg: 'from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 border-orange-100 dark:border-orange-800' },
        ].map(s => (
          <Card key={s.label} className={`bg-gradient-to-br ${s.bg}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
                </div>
                <s.icon className={`h-10 w-10 ${s.color} opacity-40`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Categorías</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <button
                onClick={() => setSelCat(null)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${!selCat ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-500 flex items-center justify-center">
                    <FolderArchive className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-sm">Todos</span>
                </div>
                <span className="text-sm text-gray-500">{docs.length}</span>
              </button>
              {documentCategories.map(cat => {
                const Icon = cat.icon
                return (
                  <button key={cat.id} onClick={() => setSelCat(cat.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selCat === cat.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg ${cat.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-sm text-left">{cat.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 flex-shrink-0">{catCount(cat.id)}</span>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-lg">
                  {selCat ? documentCategories.find(c => c.id === selCat)?.name : 'Todos los Documentos'}
                </CardTitle>
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Buscar documentos..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                  <p className="text-gray-500">Cargando documentos...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{search ? 'Sin resultados' : 'No hay documentos'}</h3>
                  <p className="text-gray-500 mb-4 text-sm">{search ? 'Intenta con otro criterio' : 'Sube tu primer documento para comenzar'}</p>
                  {!search && <Button onClick={() => setShowModal(true)}><Upload className="h-4 w-4 mr-2" />Subir Documento</Button>}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                    <div className="col-span-5">Documento</div>
                    <div className="col-span-2">Categoría</div>
                    <div className="col-span-2">Fecha</div>
                    <div className="col-span-1">Tamaño</div>
                    <div className="col-span-2 text-right">Acciones</div>
                  </div>
                  {filtered.map(doc => {
                    const cat = documentCategories.find(c => c.id === doc.category)
                    return (
                      <div key={doc.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors items-center">
                        <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                          <FileIcon type={doc.fileType} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{doc.name}</p>
                              {doc.isConfidential && <Lock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                            </div>
                            {doc.description && <p className="text-xs text-gray-500 truncate">{doc.description}</p>}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(doc.tags || []).slice(0, 4).map((tag, i) => (
                                <span key={i} className="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          {cat && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${cat.color} text-white`}>
                              <cat.icon className="h-3 w-3" /> {cat.name}
                            </span>
                          )}
                        </div>
                        <div className="md:col-span-2 text-xs text-gray-500 space-y-0.5">
                          <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{fmtDate(doc.createdAt)}</div>
                          {doc.uploadedBy && <div className="flex items-center gap-1"><User className="h-3 w-3" />{doc.uploadedBy}</div>}
                        </div>
                        <div className="md:col-span-1 text-xs text-gray-500">{fmtSize(doc.size)}</div>
                        <div className="md:col-span-2 flex items-center justify-end gap-1">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Ver">
                            <Eye className="h-4 w-4" />
                          </a>
                          <a href={doc.url} download={doc.originalName}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Descargar">
                            <Download className="h-4 w-4" />
                          </a>
                          <button onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">Subir Documento</h2>
              <button onClick={() => { if (!uploading) { setShowModal(false); setForm(EMPTY_FORM) } }}
                disabled={uploading} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Drop zone */}
              <div
                onClick={() => !uploading && fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploading ? 'opacity-50 cursor-not-allowed border-gray-200' : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'} ${form.file ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 dark:border-gray-600'}`}
              >
                <input ref={fileRef} type="file" className="hidden" onChange={handleFile} disabled={uploading}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv,.zip" />
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                {form.file ? (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{form.file.name}</p>
                    <p className="text-sm text-gray-500">{fmtSize(form.file.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Arrastra o haz clic para seleccionar</p>
                    <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, XLS, XLSX, PPT, PNG, JPG... (Máx 50MB)</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre del documento</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  disabled={uploading} placeholder="Nombre del archivo"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50">
                  {documentCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  disabled={uploading} rows={2} placeholder="Breve descripción del contenido"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm disabled:opacity-50" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Etiquetas (separadas por coma)</label>
                <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  disabled={uploading} placeholder="Ley 21.663, BCP, ACLIN"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50" />
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <input type="checkbox" id="conf" checked={form.isConfidential}
                  onChange={e => setForm(p => ({ ...p, isConfidential: e.target.checked }))}
                  disabled={uploading} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                <label htmlFor="conf" className="flex items-center gap-2 text-sm cursor-pointer">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-800 dark:text-amber-200">Marcar como confidencial</span>
                </label>
              </div>

              {uploading && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">{uploadMsg}</p>
                </div>
              )}

              {uploadErr && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">{uploadErr}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button variant="outline" disabled={uploading}
                onClick={() => { if (!uploading) { setShowModal(false); setForm(EMPTY_FORM) } }}>
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={!form.file || !form.name || uploading}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                {uploading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Subiendo...</>
                  : <><Upload className="h-4 w-4 mr-2" />Subir Documento</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
