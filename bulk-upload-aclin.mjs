/**
 * Bulk upload ACLIN documents to Vercel Blob + Neon DB
 * Usage: BLOB_READ_WRITE_TOKEN="xxx" DATABASE_URL="xxx" node bulk-upload-aclin.mjs
 */
import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

const ACLIN_USER_ID = 'cmqj5a2zh0000p42b7hzwqrqr'
const BASE_DIR = path.join(__dirname, 'documentos', 'LEY MARCO 21663-ACLIN')

const FOLDER_CATEGORY = {
  '1 GOBIERNO Y ESTRUCTURA':            'legal',
  '2 POLITICAS Y PROCEDIMIENTOS':       'policies',
  '3 PLANES CONTINUIDAD Y RECUPERACION': 'bcp',
  '4 GESTION RIESGOS E INVENTARIOS':    'compliance',
  '5 CAPACITACION Y CONCIENCIA':        'compliance',
  '6 INCIDENTES Y REPORTES':            'compliance',
  '7 AUDITORIAS Y CONFORMIDAD':         'compliance',
  '8 DOCUMENTOS PARA FIRMAR':           'legal',
}

const FOLDER_TAGS = {
  '1 GOBIERNO Y ESTRUCTURA':            ['Gobierno', 'Estructura', 'Ley 21.663', 'ACLIN'],
  '2 POLITICAS Y PROCEDIMIENTOS':       ['Políticas', 'Procedimientos', 'Ley 21.663', 'ACLIN'],
  '3 PLANES CONTINUIDAD Y RECUPERACION': ['BCP', 'DRP', 'Continuidad', 'Ley 21.663', 'ACLIN'],
  '4 GESTION RIESGOS E INVENTARIOS':    ['Riesgos', 'Inventarios', 'Ley 21.663', 'ACLIN'],
  '5 CAPACITACION Y CONCIENCIA':        ['Capacitación', 'Conciencia', 'Ley 21.663', 'ACLIN'],
  '6 INCIDENTES Y REPORTES':            ['Incidentes', 'Reportes', 'Ley 21.663', 'ACLIN'],
  '7 AUDITORIAS Y CONFORMIDAD':         ['Auditorías', 'Conformidad', 'Ley 21.663', 'ACLIN'],
  '8 DOCUMENTOS PARA FIRMAR':           ['Informes', 'Firmas', 'Para Firmar', 'Ley 21.663', 'ACLIN'],
}

const MIME = {
  pdf:  'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc:  'application/msword',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls:  'application/vnd.ms-excel',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt:  'application/vnd.ms-powerpoint',
  png:  'image/png',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
}

function getMime(ext) {
  return MIME[ext?.toLowerCase()] || 'application/octet-stream'
}

function getFilesRecursively(dir) {
  const files = []
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) files.push(...getFilesRecursively(fullPath))
    else if (!item.name.startsWith('.') && !item.name.startsWith('~')) files.push(fullPath)
  }
  return files
}

function getTopFolder(filePath) {
  return path.relative(BASE_DIR, filePath).split(path.sep)[0]
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Falta BLOB_READ_WRITE_TOKEN. Agrégalo en Vercel: Settings → Environment Variables')
    process.exit(1)
  }

  console.log('📁 Leyendo archivos de:', BASE_DIR)
  const files = getFilesRecursively(BASE_DIR)
  console.log(`📄 ${files.length} archivos encontrados\n`)

  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (const filePath of files) {
    const filename = path.basename(filePath)
    const ext = filename.split('.').pop() || ''
    const topFolder = getTopFolder(filePath)
    const category = FOLDER_CATEGORY[topFolder] || 'other'
    const tags = FOLDER_TAGS[topFolder] || ['ACLIN']
    const mimeType = getMime(ext)
    const stat = fs.statSync(filePath)
    const size = stat.size

    try {
      // Skip if already in DB
      const existing = await prisma.document.findFirst({
        where: { userId: ACLIN_USER_ID, originalName: filename },
      })
      if (existing) {
        console.log(`  ⏭  SKIP: ${filename}`)
        skipped++
        continue
      }

      // Upload to Vercel Blob
      const fileBuffer = fs.readFileSync(filePath)
      const blobPath = `documents/aclin/${category}/${filename.replace(/\s+/g, '_')}`
      const { url } = await put(blobPath, fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: mimeType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      // Save to DB
      await prisma.document.create({
        data: {
          userId: ACLIN_USER_ID,
          name: filename,
          originalName: filename,
          category,
          description: null,
          tags,
          size,
          mimeType,
          fileType: ext.toLowerCase(),
          url,
          isConfidential: false,
          uploadedBy: 'GuardyScan Admin',
        },
      })

      console.log(`  ✅ [${category.padEnd(12)}] ${filename}`)
      uploaded++
    } catch (err) {
      console.error(`  ❌ ERROR: ${filename} — ${err.message}`)
      failed++
    }
  }

  console.log(`\n✅ Subidos: ${uploaded}`)
  console.log(`⏭  Omitidos (ya existían): ${skipped}`)
  console.log(`❌ Fallidos: ${failed}`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
