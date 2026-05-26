import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Project, Flow, FluxoStep } from '../types'

const s = StyleSheet.create({
  page: { backgroundColor: '#ffffff', padding: 40, fontFamily: 'Helvetica' },
  header: { marginBottom: 24, borderBottom: '2pt solid #e2e8f0', paddingBottom: 16 },
  projectName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 6 },
  projectMeta: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metaItem: { fontSize: 8, color: '#64748b' },
  metaValue: { fontSize: 8, color: '#1e293b', fontFamily: 'Helvetica-Bold' },
  flowSection: { marginBottom: 24 },
  flowTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1e40af', marginBottom: 10, paddingBottom: 4, borderBottom: '1pt solid #bfdbfe' },
  task: { marginBottom: 8, padding: 10, backgroundColor: '#f8fafc', borderRadius: 4, border: '1pt solid #e2e8f0' },
  taskDecision: { marginBottom: 8, padding: 10, backgroundColor: '#faf5ff', borderRadius: 4, border: '1pt solid #e9d5ff' },
  taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  badge: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center' },
  badgeDecision: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#ede9fe', justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1d4ed8' },
  badgeTextDecision: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#7c3aed' },
  taskTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0f172a', flex: 1 },
  taskDecisionLabel: { fontSize: 7, color: '#7c3aed', fontFamily: 'Helvetica-Bold' },
  taskMeta: { flexDirection: 'row', gap: 12, marginTop: 3 },
  taskMetaText: { fontSize: 7.5, color: '#64748b' },
  taskDesc: { fontSize: 8, color: '#475569', marginTop: 4, lineHeight: 1.4 },
  refCode: { fontSize: 7, color: '#94a3b8', fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  linkedRow: { flexDirection: 'row', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  linkedChip: { fontSize: 7, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10, backgroundColor: '#e0f2fe', color: '#0369a1' },
  linkedChipSaida: { fontSize: 7, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10, backgroundColor: '#fef3c7', color: '#92400e' },
  branchRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  branch: { flex: 1, padding: 6, borderRadius: 4, border: '1pt solid #bbf7d0', backgroundColor: '#f0fdf4' },
  branchNo: { flex: 1, padding: 6, borderRadius: 4, border: '1pt solid #fecaca', backgroundColor: '#fff1f2' },
  branchLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#166534', marginBottom: 2 },
  branchLabelNo: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#991b1b', marginBottom: 2 },
  branchTarget: { fontSize: 8, color: '#15803d' },
  branchTargetNo: { fontSize: 8, color: '#b91c1c' },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#94a3b8' },
})

interface Props {
  project: Project
}

function taskNumById(flows: Flow[], stepId?: string): number | null {
  if (!stepId) return null
  for (const f of flows) {
    const sorted = [...f.steps].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(s => s.id === stepId)
    if (idx >= 0) return idx + 1
  }
  return null
}

function TaskRow({ step, index, project }: { step: FluxoStep; index: number; project: Project }) {
  const isDecision = step.type === 'decision'
  const linkedE = project.entradas.filter(e => step.linkedEntradas.includes(e.id))
  const linkedS = project.saidas.filter(s => step.linkedSaidas.includes(s.id))
  const nextNum = taskNumById(project.flows, step.nextStepId)
  const yesNum = taskNumById(project.flows, step.yesNextStepId)
  const noNum = taskNumById(project.flows, step.noNextStepId)

  return (
    <View style={isDecision ? s.taskDecision : s.task}>
      {step.referenceCode && <Text style={s.refCode}>{step.referenceCode}</Text>}
      <View style={s.taskHeader}>
        <View style={isDecision ? s.badgeDecision : s.badge}>
          <Text style={isDecision ? s.badgeTextDecision : s.badgeText}>{index + 1}</Text>
        </View>
        {isDecision && <Text style={s.taskDecisionLabel}>◇ DECISÃO</Text>}
        <Text style={s.taskTitle}>{step.title}</Text>
      </View>
      {(step.responsible || nextNum) && (
        <View style={s.taskMeta}>
          {step.responsible && <Text style={s.taskMetaText}>Responsável: {step.responsible}</Text>}
          {nextNum && <Text style={s.taskMetaText}>→ Tarefa {nextNum}</Text>}
        </View>
      )}
      {step.description && <Text style={s.taskDesc}>{step.description}</Text>}
      {(linkedE.length > 0 || linkedS.length > 0) && (
        <View style={s.linkedRow}>
          {linkedE.map(e => <Text key={e.id} style={s.linkedChip}>{e.label} {e.name}</Text>)}
          {linkedS.map(s2 => <Text key={s2.id} style={s.linkedChipSaida}>{s2.label} {s2.name}</Text>)}
        </View>
      )}
      {isDecision && (
        <View style={s.branchRow}>
          <View style={s.branch}>
            <Text style={s.branchLabel}>{step.yesLabel || 'Caminho 1'}</Text>
            <Text style={s.branchTarget}>{yesNum ? `→ Tarefa ${yesNum}` : '—'}</Text>
          </View>
          <View style={s.branchNo}>
            <Text style={s.branchLabelNo}>{step.noLabel || 'Caminho 2'}</Text>
            <Text style={s.branchTargetNo}>{noNum ? `→ Tarefa ${noNum}` : '—'}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

function FlowSection({ flow, project }: { flow: Flow; project: Project }) {
  const sorted = [...flow.steps].sort((a, b) => a.order - b.order)
  return (
    <View style={s.flowSection} break={false}>
      <Text style={s.flowTitle}>{flow.name}</Text>
      {sorted.map((step, i) => (
        <TaskRow key={step.id} step={step} index={i} project={project} />
      ))}
    </View>
  )
}

export default function FlowPdf({ project }: Props) {
  const now = new Date().toLocaleDateString('pt-BR')
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.projectName}>{project.name}</Text>
          <View style={s.projectMeta}>
            {project.version && (
              <Text style={s.metaItem}>Versão: <Text style={s.metaValue}>{project.version}</Text></Text>
            )}
            {project.projectDate && (
              <Text style={s.metaItem}>Data: <Text style={s.metaValue}>{project.projectDate}</Text></Text>
            )}
            {project.approvedBy && (
              <Text style={s.metaItem}>Aprovado por: <Text style={s.metaValue}>{project.approvedBy}</Text></Text>
            )}
            {project.description && (
              <Text style={s.metaItem}>{project.description}</Text>
            )}
          </View>
        </View>

        {project.flows.map(flow => (
          <FlowSection key={flow.id} flow={flow} project={project} />
        ))}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>{project.name}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          <Text style={s.footerText}>Gerado em {now}</Text>
        </View>
      </Page>
    </Document>
  )
}
