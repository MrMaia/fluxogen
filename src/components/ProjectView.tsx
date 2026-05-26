import { useState, useCallback } from 'react'
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import EntradasPanel from './EntradasPanel'
import FluxoPanel from './FluxoPanel'
import SaidasPanel from './SaidasPanel'
import FlowPdf from './FlowPdf'

interface Props {
  projectId: string
  onBack: () => void
}

interface ActiveDrag {
  type: 'step' | 'entrada' | 'saida'
  id: string
  label?: string
  name?: string
}

export default function ProjectView({ projectId, onBack }: Props) {
  const { projects, updateProject, reorderFluxoSteps, linkItemToStep, addFlow } = useApp()
  const project = projects.find(p => p.id === projectId)

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)
  const [overStepId, setOverStepId] = useState<string | null>(null)
  const [highlightedStepId, setHighlightedStepId] = useState<string | null>(null)
  const [entradasOpen, setEntradasOpen] = useState(true)
  const [saidasOpen, setSaidasOpen] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const navigateToStep = useCallback((stepId: string) => {
    setHighlightedStepId(stepId)
    setTimeout(() => {
      document.getElementById(`step-${stepId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
    setTimeout(() => setHighlightedStepId(null), 1800)
  }, [])

  if (!project) {
    return (
      <div className="h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Projeto não encontrado</p>
          <button onClick={onBack} className="text-[#4f8ef7] hover:underline text-sm">Voltar</button>
        </div>
      </div>
    )
  }

  function saveName() {
    if (nameInput.trim()) updateProject(projectId, nameInput.trim(), project!.description)
    setEditingName(false)
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current
    if (!data) return
    if (data.type === 'step') {
      setActiveDrag({ type: 'step', id: event.active.id as string })
    } else if (data.type === 'entrada') {
      const item = project!.entradas.find(e => e.id === data.itemId)
      setActiveDrag({ type: 'entrada', id: data.itemId, label: item?.label, name: item?.name })
    } else if (data.type === 'saida') {
      const item = project!.saidas.find(s => s.id === data.itemId)
      setActiveDrag({ type: 'saida', id: data.itemId, label: item?.label, name: item?.name })
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { over, active } = event
    const activeType = active.data.current?.type
    if ((activeType === 'entrada' || activeType === 'saida') && over) {
      if (over.data.current?.type === 'step') {
        setOverStepId(over.id as string)
        return
      }
    }
    setOverStepId(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveDrag(null)
    setOverStepId(null)

    if (!over) return

    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    if (activeType === 'step' && overType === 'step' && active.id !== over.id) {
      const flow = project!.flows.find(f => f.steps.some(s => s.id === (active.id as string)))
      if (flow) {
        const sorted = [...flow.steps].sort((a, b) => a.order - b.order)
        const oldIndex = sorted.findIndex(s => s.id === active.id)
        const newIndex = sorted.findIndex(s => s.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) {
          reorderFluxoSteps(projectId, flow.id, arrayMove(sorted, oldIndex, newIndex).map(s => s.id))
        }
      }
    } else if (activeType === 'entrada' && overType === 'step') {
      linkItemToStep(projectId, over.id as string, active.data.current!.itemId, 'entrada')
    } else if (activeType === 'saida' && overType === 'step') {
      linkItemToStep(projectId, over.id as string, active.data.current!.itemId, 'saida')
    }
  }

  const totalSteps = project.flows.reduce((sum, f) => sum + f.steps.length, 0)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen bg-[#0f0f1a] flex flex-col overflow-hidden">
        <header className="bg-[#0a0a18] border-b border-[#1a1a2e] px-6 py-3 flex items-center gap-4 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 text-slate-400 hover:text-white transition-all text-sm shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Projetos
          </button>
          <span className="text-[#2a2a4a] shrink-0">|</span>

          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
              className="bg-transparent text-white font-semibold text-base border-b border-[#4f8ef7] focus:outline-none"
            />
          ) : (
            <button
              onClick={() => { setNameInput(project.name); setEditingName(true) }}
              className="text-white font-semibold text-base hover:text-[#4f8ef7] transition-colors"
              title="Clique para editar o nome"
            >
              {project.name}
            </button>
          )}

          {project.description && !editingName && (
            <span className="text-slate-600 text-sm truncate hidden sm:block">{project.description}</span>
          )}

          <div className="ml-auto flex items-center gap-4 text-xs text-slate-600">
            {project.version && <span className="hidden lg:block text-slate-500">v{project.version}</span>}
            {project.projectDate && <span className="hidden lg:block text-slate-500">{project.projectDate}</span>}
            {project.approvedBy && <span className="hidden lg:block text-slate-500">Aprov. {project.approvedBy}</span>}
            <span>
              <span className="text-[#3ecf8e]">{project.entradas.length}</span> entr. ·{' '}
              <span className="text-[#4f8ef7]">{totalSteps}</span> tarefas ·{' '}
              <span className="text-[#f5a623]">{project.saidas.length}</span> saídas
            </span>
            <PDFDownloadLink
              document={<FlowPdf project={project} />}
              fileName={`${project.name.replace(/\s+/g, '_')}_fluxo.pdf`}
            >
              {({ loading }) => (
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 text-slate-400 hover:text-white transition-all"
                  title="Exportar PDF"
                >
                  <FileDown size={14} />
                  <span className="hidden sm:inline">{loading ? '…' : 'PDF'}</span>
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className={`${entradasOpen ? 'w-80' : 'w-10'} shrink-0 border-r border-[#1a1a2e] bg-[#0d0d22] overflow-y-auto transition-all duration-200`}>
            <EntradasPanel projectId={projectId} activeDragType={activeDrag?.type ?? null} collapsed={!entradasOpen} onToggle={() => setEntradasOpen(o => !o)} />
          </div>

          <div className="flex-1 min-w-0 bg-[#0f0f1a] p-4 overflow-x-auto">
            <div className="flex gap-4 h-full">
              {project.flows.map(flow => (
                <div key={flow.id} className="w-72 flex-shrink-0 flex flex-col min-h-0">
                  <FluxoPanel
                    projectId={projectId}
                    flow={flow}
                    totalFlows={project.flows.length}
                    overStepId={overStepId}
                    highlightedStepId={highlightedStepId}
                    onNavigateToStep={navigateToStep}
                  />
                </div>
              ))}
              <div className="flex-shrink-0 flex items-start pt-1">
                <button
                  onClick={() => addFlow(projectId, `Fluxo ${project.flows.length + 1}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9b59b6]/10 hover:bg-[#9b59b6]/20 text-[#9b59b6] text-xs font-semibold border border-[#9b59b6]/20 hover:border-[#9b59b6]/40 transition-all"
                  title="Continuar fluxo em paralelo"
                >+ Continuar Fluxo</button>
              </div>
            </div>
          </div>

          <div className={`${saidasOpen ? 'w-80' : 'w-10'} shrink-0 border-l border-[#1a1a2e] bg-[#0d0d22] overflow-y-auto transition-all duration-200`}>
            <SaidasPanel projectId={projectId} activeDragType={activeDrag?.type ?? null} collapsed={!saidasOpen} onToggle={() => setSaidasOpen(o => !o)} />
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag?.type === 'entrada' && (
          <div className="flex items-center gap-1.5 bg-[#3ecf8e]/20 border border-[#3ecf8e] rounded-lg px-2.5 py-1.5 shadow-xl text-xs text-[#3ecf8e] font-medium pointer-events-none">
            <span className="font-mono font-bold">{activeDrag.label}</span>
            <span className="max-w-[140px] truncate">{activeDrag.name}</span>
          </div>
        )}
        {activeDrag?.type === 'saida' && (
          <div className="flex items-center gap-1.5 bg-[#f5a623]/20 border border-[#f5a623] rounded-lg px-2.5 py-1.5 shadow-xl text-xs text-[#f5a623] font-medium pointer-events-none">
            <span className="font-mono font-bold">{activeDrag.label}</span>
            <span className="max-w-[140px] truncate">{activeDrag.name}</span>
          </div>
        )}
        {activeDrag?.type === 'step' && (
          <div className="bg-[#1a1a32] border border-[#4f8ef7]/60 rounded-lg px-3 py-2 shadow-xl text-xs text-[#4f8ef7] pointer-events-none">
            Movendo etapa...
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
