import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FluxoStep, Item, ItemType } from '../types'

interface Props {
  step: FluxoStep
  stepNumber: number
  total: number
  entradas: Item[]
  saidas: Item[]
  entradaTypes: ItemType[]
  saidaTypes: ItemType[]
  allSteps: FluxoStep[]
  isDropTarget: boolean
  isHighlighted: boolean
  onEdit: () => void
  onDelete: () => void
  onUnlinkEntrada: (itemId: string) => void
  onUnlinkSaida: (itemId: string) => void
  onNavigateToStep: (stepId: string) => void
  onAddAfter: () => void
  onAddBranchYes: () => void
  onAddBranchNo: () => void
}

function ItemBadge({ item, color, onUnlink }: { item: Item; color: string; onUnlink: () => void }) {
  return (
    <button
      onPointerDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onUnlink() }}
      className="group/badge inline-flex items-center justify-center min-w-[26px] h-[26px] px-1.5 rounded-full font-mono font-bold text-[11px] transition-all"
      style={{ color, background: `${color}33`, border: `1.5px solid ${color}50` }}
      title={`${item.label} — ${item.name} · clique para desvincular`}
    >
      <span className="group-hover/badge:hidden leading-none">{item.label}</span>
      <span className="hidden group-hover/badge:inline leading-none text-[#e85d75]">×</span>
    </button>
  )
}

export default function FluxoStepCard({
  step, stepNumber, total, entradas, saidas, entradaTypes, saidaTypes, allSteps,
  isDropTarget, isHighlighted, onEdit, onDelete, onUnlinkEntrada, onUnlinkSaida,
  onNavigateToStep, onAddAfter, onAddBranchYes, onAddBranchNo,
}: Props) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({
    id: step.id,
    data: { type: 'step', stepId: step.id },
  })

  const style = { transform: CSS.Transform.toString(transform), transition }

  const linkedE = entradas.filter(e => step.linkedEntradas.includes(e.id))
  const linkedS = saidas.filter(s => step.linkedSaidas.includes(s.id))
  const isDecision = step.type === 'decision'
  const hasLinked = linkedE.length > 0 || linkedS.length > 0

  function stepNumById(id?: string) {
    if (!id) return null
    const sorted = [...allSteps].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(s => s.id === id)
    return idx >= 0 ? idx + 1 : null
  }

  const yesNum = stepNumById(step.yesNextStepId)
  const noNum = stepNumById(step.noNextStepId)
  const nextNum = stepNumById(step.nextStepId)

  if (isDragging) {
    return (
      <div id={`step-${step.id}`} ref={setNodeRef} style={style}
        className="h-20 border-2 border-dashed border-[#4f8ef7]/40 rounded-xl mb-3 bg-[#4f8ef7]/5" />
    )
  }

  const borderClass = isHighlighted
    ? 'border-[#f5a623] shadow-[0_0_16px_rgba(245,166,35,0.35)]'
    : isDropTarget
      ? 'border-[#4f8ef7] shadow-[0_0_12px_rgba(79,142,247,0.3)]'
      : isDecision
        ? 'border-[#9b59b6]/40 hover:border-[#9b59b6]/70'
        : 'border-[#2a2a4a] hover:border-[#3a3a5c]'

  const bgClass = isHighlighted
    ? 'bg-[#f5a623]/10'
    : isDropTarget
      ? 'bg-[#4f8ef7]/10'
      : isDecision
        ? 'bg-[#1a1030]'
        : 'bg-[#1a1a32]'

  return (
    <div id={`step-${step.id}`} ref={setNodeRef} style={style} className="relative group mb-3">
      {stepNumber < total && !isDecision && (
        <div className="absolute left-5 top-full w-px h-3 bg-[#2a2a4a] z-10 pointer-events-none" />
      )}

      <div className={`border rounded-xl overflow-hidden transition-all ${borderClass} ${bgClass}`}>

        {/* Header: Entradas | Saídas — shown only when items are linked */}
        {hasLinked && (
          <div className="flex border-b border-[#2a2a4a]/70">
            <div className="flex-1 min-w-0 p-2 border-r border-[#2a2a4a]/70">
              <p className="text-[9px] font-bold tracking-widest uppercase mb-1.5 text-[#3ecf8e]/40">Entradas</p>
              <div className="flex flex-wrap gap-1 min-h-[18px]">
                {linkedE.map(e => {
                  const c = (e.typeId && entradaTypes.find(t => t.id === e.typeId)?.color) ?? '#3ecf8e'
                  return <ItemBadge key={e.id} item={e} color={c} onUnlink={() => onUnlinkEntrada(e.id)} />
                })}
              </div>
            </div>
            <div className="flex-1 min-w-0 p-2 flex flex-col items-end">
              <p className="text-[9px] font-bold tracking-widest uppercase mb-1.5 text-[#f5a623]/40">Saídas</p>
              <div className="flex flex-wrap justify-end gap-1 min-h-[18px]">
                {linkedS.map(s => {
                  const c = (s.typeId && saidaTypes.find(t => t.id === s.typeId)?.color) ?? '#f5a623'
                  return <ItemBadge key={s.id} item={s} color={c} onUnlink={() => onUnlinkSaida(s.id)} />
                })}
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex items-stretch">
          <div
            {...listeners}
            {...attributes}
            className="flex items-center px-2 text-slate-700 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 border-r border-[#2a2a4a]/70 select-none"
            title="Arrastar para reordenar"
          >⠿</div>

          <div className="flex-1 min-w-0 p-3">
            {step.referenceCode && (
              <div className="text-[10px] font-mono text-[#4f8ef7]/55 tracking-widest mb-1.5 leading-none">
                {step.referenceCode}
              </div>
            )}

            <div className="flex items-start gap-2 mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 ${
                isDecision ? 'bg-[#9b59b6]/25 text-[#9b59b6]' : 'bg-[#4f8ef7]/20 text-[#4f8ef7]'
              }`}>
                {stepNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  {isDecision && (
                    <span className="text-[10px] font-bold text-[#9b59b6] tracking-wider shrink-0">◇ DECISÃO</span>
                  )}
                  <span className="text-white text-sm font-medium leading-snug">{step.title}</span>
                  {step.responsible && (
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide shrink-0">
                      {step.responsible}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {step.description && (
              <p className="pl-8 text-xs text-slate-500 leading-relaxed mb-2">{step.description}</p>
            )}

            {!isDecision && nextNum && (
              <div className="pl-8 mt-1.5">
                <button
                  onClick={() => onNavigateToStep(step.nextStepId!)}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-[#4f8ef7] transition-colors"
                  title={`Ir para tarefa ${nextNum}`}
                >
                  <span className="text-[10px]">→</span>
                  <span className="w-5 h-5 rounded-full bg-[#4f8ef7]/15 text-[#4f8ef7] text-[10px] font-black flex items-center justify-center leading-none hover:bg-[#4f8ef7]/25">{nextNum}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-start gap-0.5 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={onEdit} className="text-slate-600 hover:text-[#4f8ef7] p-1 text-xs rounded hover:bg-[#4f8ef7]/10 transition-colors" title="Editar">✎</button>
            <button onClick={onDelete} className="text-slate-600 hover:text-[#e85d75] p-1 text-xs rounded hover:bg-[#e85d75]/10 transition-colors" title="Excluir">×</button>
          </div>
        </div>
      </div>

      {/* + button below process card */}
      {!isDecision && (
        <div className="flex items-center justify-center h-5 relative z-20 opacity-30 group-hover:opacity-100 transition-opacity">
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onAddAfter() }}
            className="w-6 h-6 rounded-full bg-[#0f0f1a] border-2 border-[#4f8ef7]/40 hover:border-[#4f8ef7] text-[#4f8ef7] text-sm flex items-center justify-center hover:bg-[#4f8ef7]/15 transition-all leading-none font-bold shadow-sm"
            title="Adicionar tarefa após"
          >+</button>
        </div>
      )}

      {/* Decision branches — lateral spread below the card */}
      {isDecision && (
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-[#2a2a4a]" />
          <div className="absolute top-4 left-[calc(25%+6px)] right-[calc(25%+6px)] h-px bg-[#2a2a4a]" />

          <div className="flex gap-3 pt-4">
            {/* Branch 1 (yes) */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-px h-3 bg-[#3ecf8e]/40" />
              {yesNum ? (
                <div className="w-full">
                  <button
                    onClick={() => onNavigateToStep(step.yesNextStepId!)}
                    className="w-full bg-[#3ecf8e]/[0.06] hover:bg-[#3ecf8e]/15 border border-[#3ecf8e]/25 rounded-lg p-2 text-center transition-colors"
                  >
                    <div className="text-[9px] font-bold tracking-widest uppercase text-[#3ecf8e]/55 leading-none mb-1.5 truncate">
                      {step.yesLabel || 'Caminho 1'}
                    </div>
                    <div className="flex justify-center">
                      <span className="w-5 h-5 rounded-full bg-[#3ecf8e]/20 text-[#3ecf8e] text-[10px] font-black flex items-center justify-center leading-none">{yesNum}</span>
                    </div>
                  </button>
                  <div className="flex justify-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); onAddBranchYes() }}
                      className="w-4 h-4 rounded-full bg-[#3ecf8e]/10 hover:bg-[#3ecf8e]/25 text-[#3ecf8e] text-[9px] flex items-center justify-center border border-[#3ecf8e]/20 hover:border-[#3ecf8e]/50 transition-all leading-none"
                      title="Adicionar tarefa neste caminho"
                    >+</button>
                  </div>
                </div>
              ) : (
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onAddBranchYes() }}
                  className="w-full border border-dashed border-[#3ecf8e]/20 rounded-lg p-2 text-center hover:border-[#3ecf8e]/40 hover:bg-[#3ecf8e]/5 transition-all"
                >
                  <div className="text-[9px] font-bold tracking-widest uppercase text-[#3ecf8e]/55 leading-none mb-1 truncate">
                    {step.yesLabel || 'Caminho 1'}
                  </div>
                  <div className="text-[#3ecf8e]/40 text-base leading-none">+</div>
                </button>
              )}
            </div>

            {/* Branch 2 (no) */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-px h-3 bg-[#e85d75]/40" />
              {noNum ? (
                <div className="w-full">
                  <button
                    onClick={() => onNavigateToStep(step.noNextStepId!)}
                    className="w-full bg-[#e85d75]/[0.06] hover:bg-[#e85d75]/15 border border-[#e85d75]/25 rounded-lg p-2 text-center transition-colors"
                  >
                    <div className="text-[9px] font-bold tracking-widest uppercase text-[#e85d75]/55 leading-none mb-1.5 truncate">
                      {step.noLabel || 'Caminho 2'}
                    </div>
                    <div className="flex justify-center">
                      <span className="w-5 h-5 rounded-full bg-[#e85d75]/20 text-[#e85d75] text-[10px] font-black flex items-center justify-center leading-none">{noNum}</span>
                    </div>
                  </button>
                  <div className="flex justify-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); onAddBranchNo() }}
                      className="w-4 h-4 rounded-full bg-[#e85d75]/10 hover:bg-[#e85d75]/25 text-[#e85d75] text-[9px] flex items-center justify-center border border-[#e85d75]/20 hover:border-[#e85d75]/50 transition-all leading-none"
                      title="Adicionar tarefa neste caminho"
                    >+</button>
                  </div>
                </div>
              ) : (
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onAddBranchNo() }}
                  className="w-full border border-dashed border-[#e85d75]/20 rounded-lg p-2 text-center hover:border-[#e85d75]/40 hover:bg-[#e85d75]/5 transition-all"
                >
                  <div className="text-[9px] font-bold tracking-widest uppercase text-[#e85d75]/55 leading-none mb-1 truncate">
                    {step.noLabel || 'Caminho 2'}
                  </div>
                  <div className="text-[#e85d75]/40 text-base leading-none">+</div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
