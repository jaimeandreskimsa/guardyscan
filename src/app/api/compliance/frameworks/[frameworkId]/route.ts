import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Frameworks de compliance predefinidos con controles detallados
const COMPLIANCE_TEMPLATES = {
  ISO27001: {
    name: 'ISO 27001:2022',
    version: '2022',
    description: 'Sistema de Gestión de Seguridad de la Información',
    totalControls: 93,
    domains: [
      { id: 'A.5', name: 'Políticas de Seguridad de la Información', controls: [
        { id: 'A.5.1', title: 'Políticas para la seguridad de la información', objective: 'Proporcionar dirección y soporte de gestión' },
        { id: 'A.5.2', title: 'Revisión de políticas de seguridad', objective: 'Asegurar que las políticas se mantienen actualizadas' },
      ]},
      { id: 'A.6', name: 'Organización de la Seguridad', controls: [
        { id: 'A.6.1', title: 'Roles y responsabilidades de seguridad', objective: 'Definir estructura organizacional' },
        { id: 'A.6.2', title: 'Segregación de funciones', objective: 'Reducir riesgo de acciones no autorizadas' },
        { id: 'A.6.3', title: 'Contacto con autoridades', objective: 'Mantener contactos apropiados' },
        { id: 'A.6.4', title: 'Contacto con grupos especiales', objective: 'Mantenerse informado de amenazas' },
        { id: 'A.6.5', title: 'Seguridad en gestión de proyectos', objective: 'Integrar seguridad en proyectos' },
      ]},
      { id: 'A.8', name: 'Gestión de Activos', controls: [
        { id: 'A.8.1', title: 'Inventario de activos', objective: 'Identificar activos de información' },
        { id: 'A.8.2', title: 'Propiedad de activos', objective: 'Asignar responsabilidades' },
        { id: 'A.8.3', title: 'Uso aceptable de activos', objective: 'Definir reglas de uso' },
        { id: 'A.8.4', title: 'Devolución de activos', objective: 'Proceso de devolución' },
        { id: 'A.8.5', title: 'Clasificación de información', objective: 'Sistema de clasificación' },
      ]},
      { id: 'A.9', name: 'Control de Acceso', controls: [
        { id: 'A.9.1', title: 'Política de control de acceso', objective: 'Establecer requisitos de acceso' },
        { id: 'A.9.2', title: 'Gestión de acceso de usuarios', objective: 'Controlar acceso autorizado' },
        { id: 'A.9.3', title: 'Responsabilidades del usuario', objective: 'Proteger credenciales' },
        { id: 'A.9.4', title: 'Control de acceso a sistemas', objective: 'Prevenir acceso no autorizado' },
      ]},
    ]
  },
  SOC2: {
    name: 'SOC 2 Type II',
    version: '2017',
    description: 'Trust Services Criteria - AICPA',
    totalControls: 64,
    domains: [
      { id: 'CC1', name: 'Control Environment', controls: [
        { id: 'CC1.1', title: 'COSO Principle 1', objective: 'Commitment to integrity and ethical values' },
        { id: 'CC1.2', title: 'COSO Principle 2', objective: 'Board of directors oversight' },
        { id: 'CC1.3', title: 'COSO Principle 3', objective: 'Management establishes structure' },
        { id: 'CC1.4', title: 'COSO Principle 4', objective: 'Commitment to competence' },
        { id: 'CC1.5', title: 'COSO Principle 5', objective: 'Accountability for internal control' },
      ]},
      { id: 'CC6', name: 'Logical and Physical Access', controls: [
        { id: 'CC6.1', title: 'Access Control', objective: 'Implement logical access security' },
        { id: 'CC6.2', title: 'Registration and Authorization', objective: 'New user registration process' },
        { id: 'CC6.3', title: 'Removal of Access Rights', objective: 'Timely removal of access' },
        { id: 'CC6.4', title: 'Restriction of Physical Access', objective: 'Physical security controls' },
        { id: 'CC6.5', title: 'Disposal of Assets', objective: 'Secure disposal procedures' },
        { id: 'CC6.6', title: 'Protection from Threats', objective: 'External and internal threats' },
        { id: 'CC6.7', title: 'Restriction of Data Output', objective: 'Transmitting and moving data' },
        { id: 'CC6.8', title: 'Prevention of Malware', objective: 'Malware prevention controls' },
      ]},
      { id: 'CC7', name: 'System Operations', controls: [
        { id: 'CC7.1', title: 'Detection of Anomalies', objective: 'Monitor for anomalies' },
        { id: 'CC7.2', title: 'Monitoring System Components', objective: 'Monitor infrastructure' },
        { id: 'CC7.3', title: 'Evaluation of Security Events', objective: 'Evaluate detected events' },
        { id: 'CC7.4', title: 'Response to Incidents', objective: 'Respond to incidents' },
        { id: 'CC7.5', title: 'Recovery from Incidents', objective: 'Recover from incidents' },
      ]},
    ]
  },
  GDPR: {
    name: 'GDPR',
    version: '2018',
    description: 'Reglamento General de Protección de Datos',
    totalControls: 50,
    domains: [
      { id: 'Art.5', name: 'Principios del Tratamiento', controls: [
        { id: 'Art.5.1.a', title: 'Licitud, lealtad y transparencia', objective: 'Tratamiento lícito y transparente' },
        { id: 'Art.5.1.b', title: 'Limitación de finalidad', objective: 'Fines determinados y legítimos' },
        { id: 'Art.5.1.c', title: 'Minimización de datos', objective: 'Datos adecuados y pertinentes' },
        { id: 'Art.5.1.d', title: 'Exactitud', objective: 'Datos exactos y actualizados' },
        { id: 'Art.5.1.e', title: 'Limitación del plazo de conservación', objective: 'Conservación limitada' },
        { id: 'Art.5.1.f', title: 'Integridad y confidencialidad', objective: 'Seguridad apropiada' },
      ]},
      { id: 'Art.12-14', name: 'Derechos de Información', controls: [
        { id: 'Art.12', title: 'Transparencia de la información', objective: 'Información clara y accesible' },
        { id: 'Art.13', title: 'Info cuando datos del interesado', objective: 'Información al recopilar' },
        { id: 'Art.14', title: 'Info cuando no del interesado', objective: 'Información de terceros' },
      ]},
      { id: 'Art.15-22', name: 'Derechos del Interesado', controls: [
        { id: 'Art.15', title: 'Derecho de acceso', objective: 'Acceso a datos personales' },
        { id: 'Art.16', title: 'Derecho de rectificación', objective: 'Rectificar datos inexactos' },
        { id: 'Art.17', title: 'Derecho de supresión', objective: 'Derecho al olvido' },
        { id: 'Art.18', title: 'Derecho a limitación', objective: 'Limitar el tratamiento' },
        { id: 'Art.20', title: 'Portabilidad de datos', objective: 'Recibir datos en formato estructurado' },
        { id: 'Art.21', title: 'Derecho de oposición', objective: 'Oponerse al tratamiento' },
        { id: 'Art.22', title: 'Decisiones automatizadas', objective: 'No ser objeto de decisiones automatizadas' },
      ]},
      { id: 'Art.32', name: 'Seguridad del Tratamiento', controls: [
        { id: 'Art.32.1.a', title: 'Seudonimización y cifrado', objective: 'Medidas técnicas de seguridad' },
        { id: 'Art.32.1.b', title: 'Confidencialidad e integridad', objective: 'Garantizar seguridad continua' },
        { id: 'Art.32.1.c', title: 'Restauración y disponibilidad', objective: 'Recuperación ante incidentes' },
        { id: 'Art.32.1.d', title: 'Verificación y evaluación', objective: 'Evaluar eficacia de medidas' },
      ]},
    ]
  }
}

// GET - Obtener framework completo con controles
export async function GET(
  request: NextRequest,
  { params }: { params: { frameworkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const framework = await prisma.complianceFramework.findFirst({
      where: {
        id: params.frameworkId
      },
      include: {
        controls: {
          include: { evidences: true },
          orderBy: [{ domain: 'asc' }, { controlId: 'asc' }]
        },
        assessments: {
          orderBy: { assessmentDate: 'desc' },
          take: 5
        }
      }
    })

    if (!framework) {
      return NextResponse.json({ error: 'Framework no encontrado' }, { status: 404 })
    }

    // Calcular estadísticas solo si controls está incluido
    const controlStats = {
      total: framework.totalControls || 0,
      withEvidence: 0,
      byDomain: {} as Record<string, { total: number, withEvidence: number }>
    }

    if (framework.controls) {
      controlStats.total = framework.controls.length;
      controlStats.withEvidence = framework.controls.filter(c => c.evidences && c.evidences.length > 0).length;
      
      framework.controls.forEach(control => {
        if (!controlStats.byDomain[control.domain]) {
          controlStats.byDomain[control.domain] = { total: 0, withEvidence: 0 }
        }
        controlStats.byDomain[control.domain].total++
        if (control.evidences && control.evidences.length > 0) {
          controlStats.byDomain[control.domain].withEvidence++
        }
      });
    }

    return NextResponse.json({
      framework,
      stats: controlStats
    })
  } catch (error) {
    console.error('Error fetching framework:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Inicializar framework desde template
export async function POST(
  request: NextRequest,
  { params }: { params: { frameworkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const templateCode = params.frameworkId as keyof typeof COMPLIANCE_TEMPLATES
    const template = COMPLIANCE_TEMPLATES[templateCode]

    if (!template) {
      return NextResponse.json({ error: 'Template no válido' }, { status: 400 })
    }

    // Verificar si ya existe
    const existing = await prisma.complianceFramework.findFirst({
      where: {
        name: template.name,
        version: template.version
      }
    })

    if (existing) {
      return NextResponse.json({ 
        error: 'Este framework ya ha sido configurado',
        frameworkId: existing.id 
      }, { status: 409 })
    }

    // Crear framework
    const framework = await prisma.complianceFramework.create({
      data: {
        name: template.name,
        version: template.version,
        description: template.description,
        totalControls: template.totalControls,
        category: 'security',
        mandatory: false
      }
    })

    // Crear controles
    const controlsData: any[] = []
    for (const domain of template.domains) {
      for (const control of domain.controls) {
        controlsData.push({
          frameworkId: framework.id,
          controlId: control.id,
          title: control.title,
          description: control.objective,
          domain: domain.name,
          objective: control.objective,
          priority: control.id.includes('.1') ? 'HIGH' : 'MEDIUM'
        })
      }
    }

    await prisma.complianceControl.createMany({ data: controlsData })

    return NextResponse.json({
      success: true,
      framework,
      controlsCreated: controlsData.length
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating framework:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT - Actualizar control con evidencia
export async function PUT(
  request: NextRequest,
  { params }: { params: { frameworkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { controlId, status, notes, evidence } = await request.json()

    // Verificar framework existe
    const framework = await prisma.complianceFramework.findFirst({
      where: { id: params.frameworkId }
    })

    if (!framework) {
      return NextResponse.json({ error: 'Framework no encontrado' }, { status: 404 })
    }

    // Si hay evidencia para agregar
    if (evidence) {
      await prisma.complianceEvidence.create({
        data: {
          userId: session.user.id,
          assessmentId: evidence.assessmentId || '',
          controlId,
          status: evidence.status || 'COMPLIANT',
          evidenceType: evidence.evidenceType || 'document',
          title: evidence.title,
          description: evidence.description,
          fileUrl: evidence.fileUrl,
        }
      })
    }

    // Obtener control actualizado
    const control = await prisma.complianceControl.findUnique({
      where: { id: controlId },
      include: { evidences: true }
    })

    return NextResponse.json({ control })
  } catch (error) {
    console.error('Error updating control:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
