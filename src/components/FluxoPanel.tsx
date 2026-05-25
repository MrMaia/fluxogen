import { useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useApp } from '../context/AppContext'
import type { Flow, FluxoStep, StepType } from '../types'
import FluxoStepCard from './FluxoStep'
import ConfirmModal from './ConfirmModal'

interface Props {
  projectId: string
  flow: Flow
  totalFlows: number
  overStepId: string | null
  highlightedStepId: string | null
  onNavigateToStep: (stepId: string) => void
}

const EMPTY_STEP: Omit<FluxoStep, 'id' | 'order'> = {
  type: 'process',
  title: '',
  description: '',
  responsible: '',
  referenceCode: '',
  linkedEntradas: [],
  linkedSaidas: [],
}

// ── Step modal ───────────────────────────────────────────────────────────────

interface StepModalProps {
  initial: Omit<FluxoStep, 'id' | 'order'>
  entradas: { id: string; label: string; name: string; color?: string }[]
  saidas: { id: string; label: string; name: string; color?: string }[]
  allSteps: FluxoStep[]
  currentStepId?: string
  onSave: (step: Omit<FluxoStep, 'id' | 'order'>) => void
  onCancel: () => void
}

function StepModal({ initial, entradas, saidas, allSteps, currentStepId, onSave, onCancel }: StepModalProps) {
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description ?? '')
  const [type, setType] = useState<StepType>(initial.type)
  const [responsible, setResponsible] = useState(initial.responsible ?? '')
  const [referenceCode, setReferenceCode] = useState(initial.referenceCode ?? '')
  const [linkedEntradas, setLinkedEntradas] = useState<string[]>(initial.linkedEntradas)
  const [linkedSaidas, setLinkedSaidas] = useState<string[]>(initial.linkedSaidas)
  const [nextStepId, setNextStepId] = useState(initial.nextStepId ?? '')
  const [yesNextStepId, setYesNextStepId] = useState(initial.yesNextStepId ?? '')
  const [yesLabel, setYesLabel] = useState(initial.yesLabel ?? '')
  const [noNextStepId, setNoNextStepId] = useState(initial.noNextStepId ?? '')
  const [noLabel, setNoLabel] = useState(initial.noLabel ?? '')

  const sorted = [...allSteps].sort((a, b) => a.order - b.order)
  const otherSteps = sorted.filter(s => s.id !== currentStepId)

  function save() {
    if (!title.trim()) return
    onSave({
      type,
      title: title.trim(),
      description: type === 'process' ? (description.trim() || undefined) : undefined,
      responsible: type === 'process' ? (responsible.trim().toUpperCase() || undefined) : undefined,
      referenceCode: type === 'process' ? (referenceCode.trim() || undefined) : undefined,
      linkedEntradas,
      linkedSaidas,
      nextStepId: type === 'process' ? (nextStepId || undefined) : undefined,
      yesNextStepId: type === 'decision' ? (yesNextStepId || undefined) : undefined,
      yesLabel: type === 'decision' ? (yesLabel.trim() || undefined) : undefined,
      noNextStepId: type === 'decision' ? (noNextStepId || undefined) : undefined,
      noLabel: type === 'decision' ? (noLabel.trim() || undefined) : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#14142a] border border-[#2a2a4a] rounded-xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <h2 className="text-white font-semibold text-lg mb-5">
            {initial.title ? 'Editar Etapa' : 'Nova Etapa'}
          </h2>

          <div className="flex gap-2 mb-5">
            {(['process', 'decision'] as StepType[]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  type === t
                    ? t === 'process'
                      ? 'bg-[#4f8ef7]/15 border-[#4f8ef7] text-[#4f8ef7]'
                      : 'bg-[#9b59b6]/15 border-[#9b59b6] text-[#9b59b6]'
                    : 'bg-transparent border-[#2a2a4a] text-slate-500 hover:text-slate-300'
                }`}
              >
                {t === 'process' ? '▭ Processo' : '◇ Decisão'}
              </button>
            ))}
          </div>

          {/* ── Processo fields ─────────────────────────────────────────── */}
          {type === 'process' && (<>
            <label className="block text-xs text-slate-400 mb-1">Código de referência</label>
            <input
              value={referenceCode}
              onChange={e => setReferenceCode(e.target.value)}
              placeholder="ex: PPJ.GTC.01"
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:border-[#4f8ef7] font-mono"
            />
          </>)}

          <label className="block text-xs text-slate-400 mb-1">Título *</label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={type === 'process' ? 'Descrição da etapa' : 'Pergunta da decisão'}
            className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:border-[#4f8ef7]"
          />

          {type === 'process' && (<>
            <label className="block text-xs text-slate-400 mb-1">Responsável</label>
            <input
              value={responsible}
              onChange={e => setResponsible(e.target.value)}
              placeholder="ex: ENGENHEIRO CIVIL"
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:border-[#4f8ef7] uppercase"
            />

            <label className="block text-xs text-slate-400 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalhes adicionais sobre esta etapa"
              rows={2}
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-5 text-sm focus:outline-none focus:border-[#4f8ef7] resize-none"
            />
          </>)}

          {/* ── Decisão branches ────────────────────────────────────────── */}
          {type === 'decision' && (
            <div className="mb-5 flex flex-col gap-3">
              <div className="bg-[#0f0f1a] border border-[#3ecf8e]/20 rounded-lg p-3">
                <p className="text-[10px] font-bold text-[#3ecf8e]/60 uppercase tracking-widest mb-2">Caminho 1</p>
                <input
                  value={yesLabel}
                  onChange={e => setYesLabel(e.target.value)}
                  placeholder="Ex: Aprovado, Sim, Conforme…"
                  className="w-full bg-transparent text-white text-sm border-b border-[#3ecf8e]/20 pb-1.5 mb-2 focus:outline-none placeholder-slate-600"
                />
                <select
                  value={yesNextStepId}
                  onChange={e => setYesNextStepId(e.target.value)}
                  className="w-full bg-[#16213e] border border-[#3ecf8e]/20 text-white rounded px-2 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">— selecione a etapa destino —</option>
                  {otherSteps.map(s => (
                    <option key={s.id} value={s.id}>
                      Etapa {sorted.findIndex(x => x.id === s.id) + 1} — {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-[#0f0f1a] border border-[#e85d75]/20 rounded-lg p-3">
                <p className="text-[10px] font-bold text-[#e85d75]/60 uppercase tracking-widest mb-2">Caminho 2</p>
                <input
                  value={noLabel}
                  onChange={e => setNoLabel(e.target.value)}
                  placeholder="Ex: Reprovado, Não, Não conforme…"
                  className="w-full bg-transparent text-white text-sm border-b border-[#e85d75]/20 pb-1.5 mb-2 focus:outline-none placeholder-slate-600"
                />
                <select
                  value={noNextStepId}
                  onChange={e => setNoNextStepId(e.target.value)}
                  className="w-full bg-[#16213e] border border-[#e85d75]/20 text-white rounded px-2 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">— selecione a etapa destino —</option>
                  {otherSteps.map(s => (
                    <option key={s.id} value={s.id}>
                      Etapa {sorted.findIndex(x => x.id === s.id) + 1} — {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Processo: flow connection ────────────────────────────────── */}
          {type === 'process' && otherSteps.length > 0 && (
            <div className="mb-5 bg-[#0f0f1a] border border-[#2a2a4a] rounded-lg p-3">
              <p className="text-xs text-slate-400 font-medium mb-3">Conexão de fluxo</p>
              <label className="text-xs text-slate-500 mb-1 block">Ir para etapa (se não for sequencial)</label>
              <select
                value={nextStepId}
                onChange={e => setNextStepId(e.target.value)}
                className="w-full bg-[#16213e] border border-[#2a2a4a] text-white rounded px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="">— próxima etapa (padrão) —</option>
                {otherSteps.map(s => (
                  <option key={s.id} value={s.id}>
                    Etapa {sorted.findIndex(x => x.id === s.id) + 1} — {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── Entradas vinculadas (all types) ─────────────────────────── */}
          {entradas.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-2">Entradas vinculadas</label>
              {linkedEntradas.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {linkedEntradas.map(id => {
                    const e = entradas.find(x => x.id === id)
                    if (!e) return null
                    return (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border"
                        style={{ color: e.color ?? '#3ecf8e', borderColor: `${e.color ?? '#3ecf8e'}50`, background: `${e.color ?? '#3ecf8e'}18` }}>
                        <span className="font-mono font-bold">{e.label}</span>
                        <span className="max-w-[90px] truncate">{e.name}</span>
                        <button onClick={() => setLinkedEntradas(linkedEntradas.filter(x => x !== id))} className="ml-0.5 hover:text-[#e85d75] transition-colors leading-none">×</button>
                      </span>
                    )
                  })}
                </div>
              )}
              {linkedEntradas.length < entradas.length && (
                <select
                  value=""
                  onChange={e => { if (e.target.value) setLinkedEntradas([...linkedEntradas, e.target.value]) }}
                  className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4f8ef7]"
                >
                  <option value="">+ Adicionar entrada…</option>
                  {entradas.filter(e => !linkedEntradas.includes(e.id)).map(e => (
                    <option key={e.id} value={e.id}>{e.label} — {e.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* ── Saídas vinculadas (all types) ───────────────────────────── */}
          {saidas.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs text-slate-400 mb-2">Saídas vinculadas</label>
              {linkedSaidas.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {linkedSaidas.map(id => {
                    const s = saidas.find(x => x.id === id)
                    if (!s) return null
                    return (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border"
                        style={{ color: s.color ?? '#f5a623', borderColor: `${s.color ?? '#f5a623'}50`, background: `${s.color ?? '#f5a623'}18` }}>
                        <span className="font-mono font-bold">{s.label}</span>
                        <span className="max-w-[90px] truncate">{s.name}</span>
                        <button onClick={() => setLinkedSaidas(linkedSaidas.filter(x => x !== id))} className="ml-0.5 hover:text-[#e85d75] transition-colors leading-none">×</button>
                      </span>
                    )
                  })}
                </div>
              )}
              {linkedSaidas.length < saidas.length && (
                <select
                  value=""
                  onChange={e => { if (e.target.value) setLinkedSaidas([...linkedSaidas, e.target.value]) }}
                  className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f5a623]"
                >
                  <option value="">+ Adicionar saída…</option>
                  {saidas.filter(s => !linkedSaidas.includes(s.id)).map(s => (
                    <option key={s.id} value={s.id}>{s.label} — {s.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={!title.trim()}
              className="bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main panel ───────────────────────────────────────────────────────────────

export default function FluxoPanel({ projectId, flow, totalFlows, overStepId, highlightedStepId, onNavigateToStep }: Props) {
  const { projects, addFluxoStep, addFluxoStepAfter, addFluxoStepAndLinkBranch, updateFluxoStep, deleteFluxoStep, renameFlow, deleteFlow, unlinkItemFromStep } = useApp()
  const project = projects.find(p => p.id === projectId)!

  const [adding, setAdding] = useState(false)
  const [addingAfterId, setAddingAfterId] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<FluxoStep | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FluxoStep | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [deleteFlowConfirm, setDeleteFlowConfirm] = useState(false)
  const [addingBranch, setAddingBranch] = useState<{ stepId: string; branch: 'yes' | 'no' } | null>(null)

  const sorted = [...flow.steps].sort((a, b) => a.order - b.order)

  const entradaItems = project.entradas.map(e => ({ ...e, color: project.entradaTypes.find(t => t.id === e.typeId)?.color }))
  const saidaItems = project.saidas.map(s => ({ ...s, color: project.saidaTypes.find(t => t.id === s.typeId)?.color }))

  function handleAdd(step: Omit<FluxoStep, 'id' | 'order'>) {
    addFluxoStep(projectId, flow.id, step)
    setAdding(false)
  }

  function handleAddAfter(step: Omit<FluxoStep, 'id' | 'order'>) {
    if (!addingAfterId) return
    addFluxoStepAfter(projectId, flow.id, step, addingAfterId)
    setAddingAfterId(null)
  }

  function handleUpdate(step: Omit<FluxoStep, 'id' | 'order'>) {
    if (!editingStep) return
    updateFluxoStep(projectId, { ...editingStep, ...step })
    setEditingStep(null)
  }

  function handleAddFromBranch(step: Omit<FluxoStep, 'id' | 'order'>) {
    if (!addingBranch) return
    addFluxoStepAndLinkBranch(projectId, flow.id, step, addingBranch.stepId, addingBranch.branch)
    setAddingBranch(null)
  }

  function saveFlowName() {
    if (nameInput.trim()) renameFlow(projectId, flow.id, nameInput.trim())
    setEditingName(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex-1 min-w-0 mr-2">
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={saveFlowName}
              onKeyDown={e => { if (e.key === 'Enter') saveFlowName(); if (e.key === 'Escape') setEditingName(false) }}
              className="bg-transparent text-[#4f8ef7] text-xs font-bold border-b border-[#4f8ef7] focus:outline-none w-full uppercase tracking-widest"
            />
          ) : (
            <button
              onClick={() => { setNameInput(flow.name); setEditingName(true) }}
              className="text-[#4f8ef7] text-xs font-bold tracking-widest uppercase hover:text-[#7ab3ff] transition-colors text-left w-full truncate block"
              title="Clique para renomear"
            >
              {flow.name}
            </button>
          )}
          <p className="text-slate-600 text-[10px] mt-0.5">Arraste ⠿ para reordenar</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {totalFlows > 1 && (
            <button
              onClick={() => setDeleteFlowConfirm(true)}
              className="text-slate-700 hover:text-[#e85d75] p-1 text-sm rounded hover:bg-[#e85d75]/10 transition-colors"
              title="Excluir fluxo"
            >×</button>
          )}
          <button
            onClick={() => setAdding(true)}
            className="w-7 h-7 rounded-full bg-[#4f8ef7]/10 hover:bg-[#4f8ef7]/20 text-[#4f8ef7] flex items-center justify-center text-lg leading-none transition-colors"
            title="Adicionar etapa"
          >+</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {sorted.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-700 text-xs">Nenhuma etapa ainda</p>
            <p className="text-slate-800 text-[10px] mt-1">Arraste entradas/saídas sobre uma etapa para vinculá-las</p>
          </div>
        )}

        <SortableContext items={sorted.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sorted.map((step, index) => (
            <FluxoStepCard
              key={step.id}
              step={step}
              stepNumber={index + 1}
              total={sorted.length}
              entradas={project.entradas}
              saidas={project.saidas}
              entradaTypes={project.entradaTypes}
              saidaTypes={project.saidaTypes}
              allSteps={flow.steps}
              isDropTarget={overStepId === step.id}
              isHighlighted={highlightedStepId === step.id}
              onEdit={() => setEditingStep(step)}
              onDelete={() => setDeleteTarget(step)}
              onUnlinkEntrada={itemId => unlinkItemFromStep(projectId, step.id, itemId, 'entrada')}
              onUnlinkSaida={itemId => unlinkItemFromStep(projectId, step.id, itemId, 'saida')}
              onNavigateToStep={onNavigateToStep}
              onAddAfter={() => setAddingAfterId(step.id)}
              onAddBranchYes={() => setAddingBranch({ stepId: step.id, branch: 'yes' })}
              onAddBranchNo={() => setAddingBranch({ stepId: step.id, branch: 'no' })}
            />
          ))}
        </SortableContext>
      </div>

      {adding && (
        <StepModal
          initial={EMPTY_STEP}
          entradas={entradaItems}
          saidas={saidaItems}
          allSteps={flow.steps}
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}

      {editingStep && (
        <StepModal
          initial={editingStep}
          entradas={entradaItems}
          saidas={saidaItems}
          allSteps={flow.steps}
          currentStepId={editingStep.id}
          onSave={handleUpdate}
          onCancel={() => setEditingStep(null)}
        />
      )}

      {addingAfterId && (
        <StepModal
          initial={EMPTY_STEP}
          entradas={entradaItems}
          saidas={saidaItems}
          allSteps={flow.steps}
          onSave={handleAddAfter}
          onCancel={() => setAddingAfterId(null)}
        />
      )}

      {addingBranch && (
        <StepModal
          initial={{ ...EMPTY_STEP, type: 'process' }}
          entradas={entradaItems}
          saidas={saidaItems}
          allSteps={flow.steps}
          onSave={handleAddFromBranch}
          onCancel={() => setAddingBranch(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Excluir etapa "${deleteTarget.title}"?`}
          detail="As conexões para esta etapa também serão removidas."
          onConfirm={() => { deleteFluxoStep(projectId, deleteTarget.id); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleteFlowConfirm && (
        <ConfirmModal
          message={`Excluir fluxo "${flow.name}"?`}
          detail="Todas as etapas deste fluxo serão excluídas permanentemente."
          onConfirm={() => { deleteFlow(projectId, flow.id); setDeleteFlowConfirm(false) }}
          onCancel={() => setDeleteFlowConfirm(false)}
        />
      )}
    </div>
  )
}
