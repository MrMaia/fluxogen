import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useApp } from '../context/AppContext'
import type { Item, ItemType } from '../types'
import { TYPE_PALETTE } from '../types'
import ItemCard from './ItemCard'
import ConfirmModal from './ConfirmModal'

// ── Type form ────────────────────────────────────────────────────────────────

function TypeForm({ initial, onSave, onCancel }: {
  initial?: ItemType
  onSave: (name: string, color: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? TYPE_PALETTE[0])

  return (
    <div className="bg-[#0f0f1a] border border-[#2a2a4a] rounded-lg p-3 mb-2">
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSave(name.trim(), color); if (e.key === 'Escape') onCancel() }}
        placeholder="Nome do tipo (ex: Comunicação)"
        className="w-full bg-transparent text-white text-sm border-b border-[#2a2a4a] pb-1 mb-3 focus:outline-none"
      />
      <div className="flex flex-wrap gap-2 mb-3">
        {TYPE_PALETTE.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
            style={{ background: c }}
          />
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancelar</button>
        <button
          onClick={() => name.trim() && onSave(name.trim(), color)}
          disabled={!name.trim()}
          className="text-xs bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-40 text-white px-3 py-1 rounded transition-colors"
        >
          {initial ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </div>
  )
}

// ── Draggable item ───────────────────────────────────────────────────────────

function DraggableSaida({ item, projectId, accentColor, types, activeDragType }: {
  item: Item
  projectId: string
  accentColor: string
  types: ItemType[]
  activeDragType: string | null
}) {
  const { updateSaida, deleteSaida } = useApp()
  const [deleteTarget, setDeleteTarget] = useState(false)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `saida-${item.id}`,
    data: { type: 'saida', itemId: item.id, projectId },
  })

  return (
    <div ref={setNodeRef}>
      <ItemCard
        item={item}
        accentColor={accentColor}
        types={types}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
        onUpdate={(name, role, typeId) => updateSaida(projectId, item.id, name, role, typeId)}
        onDelete={() => setDeleteTarget(true)}
      />
      {activeDragType === null && deleteTarget && (
        <ConfirmModal
          message={`Excluir saída "${item.name}"?`}
          onConfirm={() => { deleteSaida(projectId, item.id); setDeleteTarget(false) }}
          onCancel={() => setDeleteTarget(false)}
        />
      )}
    </div>
  )
}

// ── Panel ────────────────────────────────────────────────────────────────────

interface Props {
  projectId: string
  activeDragType: string | null
  collapsed: boolean
  onToggle: () => void
}

const DEFAULT_COLOR = '[#f5a623]'

export default function SaidasPanel({ projectId, activeDragType, collapsed, onToggle }: Props) {
  const { projects, addSaida, addSaidaType, updateSaidaType, deleteSaidaType } = useApp()
  const project = projects.find(p => p.id === projectId)!

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newTypeId, setNewTypeId] = useState('')
  const [addingType, setAddingType] = useState(false)
  const [editingType, setEditingType] = useState<ItemType | null>(null)
  const [deleteTypeTarget, setDeleteTypeTarget] = useState<ItemType | null>(null)

  function handleAdd() {
    if (!newName.trim()) return
    addSaida(projectId, newName.trim(), newRole.trim() || undefined, newTypeId || undefined)
    setNewName('')
    setNewRole('')
    setNewTypeId('')
    setAdding(false)
  }

  function accentFor(item: Item) {
    const t = project.saidaTypes.find(t => t.id === item.typeId)
    return t ? `[${t.color}]` : DEFAULT_COLOR
  }

  const grouped = project.saidaTypes.map(t => ({
    type: t,
    items: project.saidas.filter(s => s.typeId === t.id),
  }))
  const ungrouped = project.saidas.filter(s => !s.typeId || !project.saidaTypes.find(t => t.id === s.typeId))
  const hasTypes = project.saidaTypes.length > 0

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 h-full gap-3">
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center text-[#f5a623]/60 hover:text-[#f5a623] hover:bg-[#f5a623]/10 rounded-lg transition-all text-base"
          title="Expandir Saídas"
        >‹</button>
        <span className="text-[#f5a623]/20 text-[9px] font-bold tracking-widest select-none" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>SAÍDAS</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h2 className="text-[#f5a623] text-xs font-bold tracking-widest uppercase">Saídas</h2>
          <p className="text-slate-600 text-[10px] mt-0.5">Arraste para vincular</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onToggle}
            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-[#f5a623] hover:bg-[#f5a623]/10 rounded-full transition-all text-sm"
            title="Recolher painel"
          >›</button>
          <button
            onClick={() => setAddingType(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-slate-500 hover:text-[#f5a623] hover:bg-[#f5a623]/10 border border-transparent hover:border-[#f5a623]/20 transition-all"
            title="Novo tipo"
          >
            <span className="font-bold">T</span><span>+</span>
          </button>
          <button
            onClick={() => setAdding(true)}
            className="w-7 h-7 rounded-full bg-[#f5a623]/10 hover:bg-[#f5a623]/20 text-[#f5a623] flex items-center justify-center text-lg leading-none transition-colors"
            title="Adicionar saída"
          >+</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-0.5">
        {/* New type form */}
        {addingType && (
          <TypeForm
            onSave={(name, color) => { addSaidaType(projectId, name, color); setAddingType(false) }}
            onCancel={() => setAddingType(false)}
          />
        )}

        {/* Edit type form */}
        {editingType && (
          <TypeForm
            initial={editingType}
            onSave={(name, color) => { updateSaidaType(projectId, editingType.id, name, color); setEditingType(null) }}
            onCancel={() => setEditingType(null)}
          />
        )}

        {/* Add item form */}
        {adding && (
          <div className="bg-[#0f0f1a] border border-[#f5a623]/40 rounded-lg p-3 mb-2">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
              placeholder="Nome da saída"
              className="w-full bg-transparent text-white text-sm border-b border-[#2a2a4a] pb-1 mb-2 focus:outline-none"
            />
            {hasTypes && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                <button
                  onClick={() => setNewTypeId('')}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${!newTypeId ? 'border-white scale-110' : 'border-[#2a2a4a]'} bg-slate-700`}
                  title="Sem tipo"
                />
                {project.saidaTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setNewTypeId(t.id)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${newTypeId === t.id ? 'border-white scale-110' : 'border-transparent opacity-70'}`}
                    style={{ background: t.color }}
                    title={t.name}
                  />
                ))}
              </div>
            )}
            <input
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
              placeholder="Responsável (ex: GEOTECNIA)"
              className="w-full bg-transparent text-slate-400 text-xs border-b border-[#2a2a4a] pb-1 mb-3 focus:outline-none uppercase"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setAdding(false); setNewName(''); setNewRole(''); setNewTypeId('') }} className="text-xs text-slate-500 hover:text-slate-300">Cancelar</button>
              <button onClick={handleAdd} disabled={!newName.trim()} className="text-xs bg-[#f5a623] hover:bg-[#e0941a] disabled:opacity-40 text-[#0f0f1a] font-medium px-3 py-1 rounded transition-colors">Adicionar</button>
            </div>
          </div>
        )}

        {/* Grouped items */}
        {grouped.map(({ type, items }) => (
          <div key={type.id} className="mb-3">
            <div className="flex items-center gap-1.5 mb-1 group/type">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: type.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: type.color }}>
                {type.name}
              </span>
              <div className="flex-1 h-px opacity-20" style={{ background: type.color }} />
              <div className="flex gap-0.5 opacity-0 group-hover/type:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingType(type)}
                  className="text-slate-600 hover:text-[#4f8ef7] p-0.5 text-[10px] transition-colors"
                  title="Editar tipo"
                >✎</button>
                <button
                  onClick={() => setDeleteTypeTarget(type)}
                  className="text-slate-600 hover:text-[#e85d75] p-0.5 text-xs transition-colors"
                  title="Excluir tipo"
                >×</button>
              </div>
            </div>
            {items.length === 0 && (
              <p className="text-slate-800 text-[10px] pl-3.5 pb-1">Sem itens</p>
            )}
            {items.map(item => (
              <DraggableSaida
                key={item.id}
                item={item}
                projectId={projectId}
                accentColor={accentFor(item)}
                types={project.saidaTypes}
                activeDragType={activeDragType}
              />
            ))}
          </div>
        ))}

        {/* Ungrouped items */}
        {ungrouped.length > 0 && (
          <div className="mb-2">
            {hasTypes && (
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] text-slate-700 uppercase tracking-wider">Sem tipo</span>
                <div className="flex-1 h-px bg-[#2a2a4a]" />
              </div>
            )}
            {ungrouped.map(item => (
              <DraggableSaida
                key={item.id}
                item={item}
                projectId={projectId}
                accentColor={DEFAULT_COLOR}
                types={project.saidaTypes}
                activeDragType={activeDragType}
              />
            ))}
          </div>
        )}

        {project.saidas.length === 0 && !adding && (
          <p className="text-slate-700 text-xs text-center py-8">Nenhuma saída ainda</p>
        )}
      </div>

      {deleteTypeTarget && (
        <ConfirmModal
          message={`Excluir tipo "${deleteTypeTarget.name}"?`}
          detail="Os itens deste tipo ficam sem categoria."
          onConfirm={() => { deleteSaidaType(projectId, deleteTypeTarget.id); setDeleteTypeTarget(null) }}
          onCancel={() => setDeleteTypeTarget(null)}
        />
      )}
    </div>
  )
}
