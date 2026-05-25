import { useState } from 'react'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { Item, ItemType } from '../types'

export const ROLE_COLORS: Record<string, string> = {
  'CLIENTE': 'bg-[#3ecf8e]/15 text-[#3ecf8e] border-[#3ecf8e]/30',
  'GEOTECNIA': 'bg-[#4f8ef7]/15 text-[#4f8ef7] border-[#4f8ef7]/30',
  'ENGENHEIRO CIVIL': 'bg-[#9b59b6]/15 text-[#9b59b6] border-[#9b59b6]/30',
  'GERENTE DE PROJETO': 'bg-[#f5a623]/15 text-[#f5a623] border-[#f5a623]/30',
  'TOPOGRAFIA': 'bg-[#e85d75]/15 text-[#e85d75] border-[#e85d75]/30',
}

export function roleClass(role?: string) {
  if (!role) return ''
  return ROLE_COLORS[role.toUpperCase()] ?? 'bg-slate-700/40 text-slate-300 border-slate-600'
}

interface Props {
  item: Item
  accentColor: string
  types?: ItemType[]
  dragListeners?: SyntheticListenerMap
  dragAttributes?: DraggableAttributes
  isDragging?: boolean
  onUpdate: (name: string, role?: string, typeId?: string) => void
  onDelete: () => void
}

export default function ItemCard({ item, accentColor, types, dragListeners, dragAttributes, isDragging, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.name)
  const [role, setRole] = useState(item.role ?? '')
  const [typeId, setTypeId] = useState(item.typeId ?? '')

  function save() {
    if (!name.trim()) return
    onUpdate(name.trim(), role.trim() || undefined, typeId || undefined)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className={`bg-[#0f0f1a] border border-${accentColor}/50 rounded-lg p-3 mb-2`}>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          placeholder="Nome"
          className="w-full bg-transparent text-white text-sm border-b border-[#2a2a4a] pb-1 mb-2 focus:outline-none"
        />
        <input
          value={role}
          onChange={e => setRole(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          placeholder="Responsável (ex: CLIENTE)"
          className="w-full bg-transparent text-slate-400 text-xs border-b border-[#2a2a4a] pb-1 mb-3 focus:outline-none uppercase"
        />
        {types && types.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] text-slate-600 mb-1.5">Tipo</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setTypeId('')}
                className={`w-5 h-5 rounded-full border-2 transition-all ${!typeId ? 'border-white scale-110' : 'border-[#2a2a4a]'} bg-slate-700`}
                title="Sem tipo"
              />
              {types.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTypeId(t.id)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${typeId === t.id ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ background: t.color }}
                  title={t.name}
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditing(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancelar</button>
          <button onClick={save} className="text-xs bg-[#4f8ef7] hover:bg-[#3a7ae0] text-white px-3 py-1 rounded transition-colors">Salvar</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 bg-[#1f1f3a] border border-[#2a2a4a] rounded-lg p-2 mb-2 group hover:border-[#3a3a5c] transition-all ${isDragging ? 'opacity-40' : ''}`}>
      <div
        {...dragListeners}
        {...dragAttributes}
        className="text-slate-700 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 px-0.5 select-none"
        title="Arraste para vincular a uma etapa"
      >
        ⠿
      </div>

      <span className={`inline-flex items-center justify-center rounded min-w-[26px] h-[22px] px-1.5 bg-${accentColor}/20 text-${accentColor} border border-${accentColor}/35 font-mono text-[11px] font-bold shrink-0 tracking-tight`}>
        {item.label}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm leading-snug break-words">{item.name}</p>
        {item.role && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border mt-0.5 inline-block ${roleClass(item.role)}`}>
            {item.role.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={() => { setName(item.name); setRole(item.role ?? ''); setTypeId(item.typeId ?? ''); setEditing(true) }} className="text-slate-600 hover:text-[#4f8ef7] transition-colors p-1 text-xs" title="Editar">✎</button>
        <button onClick={onDelete} className="text-slate-600 hover:text-[#e85d75] transition-colors p-1 text-xs" title="Excluir">×</button>
      </div>
    </div>
  )
}
