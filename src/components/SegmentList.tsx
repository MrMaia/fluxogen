import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Segment } from '../types'
import ConfirmModal from './ConfirmModal'

const SEGMENT_COLORS = [
  { bg: 'bg-[#4f8ef7]/10', border: 'border-[#4f8ef7]/30', text: 'text-[#4f8ef7]', dot: 'bg-[#4f8ef7]' },
  { bg: 'bg-[#3ecf8e]/10', border: 'border-[#3ecf8e]/30', text: 'text-[#3ecf8e]', dot: 'bg-[#3ecf8e]' },
  { bg: 'bg-[#f5a623]/10', border: 'border-[#f5a623]/30', text: 'text-[#f5a623]', dot: 'bg-[#f5a623]' },
  { bg: 'bg-[#9b59b6]/10', border: 'border-[#9b59b6]/30', text: 'text-[#9b59b6]', dot: 'bg-[#9b59b6]' },
  { bg: 'bg-[#e85d75]/10', border: 'border-[#e85d75]/30', text: 'text-[#e85d75]', dot: 'bg-[#e85d75]' },
]

function colorFor(index: number) {
  return SEGMENT_COLORS[index % SEGMENT_COLORS.length]
}

interface Props {
  onOpen: (segment: Segment) => void
}

export default function SegmentList({ onOpen }: Props) {
  const { segments, projects, createSegment, deleteSegment, updateSegment } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Segment | null>(null)
  const [editTarget, setEditTarget] = useState<Segment | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  function handleCreate() {
    if (!name.trim()) return
    createSegment(name.trim().toUpperCase(), description.trim() || undefined)
    setName('')
    setDescription('')
    setShowModal(false)
  }

  function handleEdit() {
    if (!editTarget || !editName.trim()) return
    updateSegment(editTarget.id, editName.trim().toUpperCase(), editDescription.trim() || undefined)
    setEditTarget(null)
  }

  function openEdit(e: React.MouseEvent, seg: Segment) {
    e.stopPropagation()
    setEditTarget(seg)
    setEditName(seg.name)
    setEditDescription(seg.description ?? '')
  }

  function projectCount(segId: string) {
    return projects.filter(p => p.segmentId === segId).length
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              <span className="text-[#4f8ef7]">Fluxo</span>gen
            </h1>
            <p className="text-slate-500 text-sm mt-1">Selecione um segmento para ver seus projetos</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#4f8ef7] hover:bg-[#3a7ae0] text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <span className="text-base leading-none">+</span> Novo Segmento
          </button>
        </div>

        {segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-5 opacity-10 font-black tracking-widest">GRE GMT TER</div>
            <p className="text-slate-400 text-lg">Nenhum segmento criado</p>
            <p className="text-slate-600 text-sm mt-1">Crie um segmento (ex: GRE, GMT, TER) para organizar seus projetos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {segments.map((seg, i) => {
              const color = colorFor(i)
              const count = projectCount(seg.id)
              return (
                <div
                  key={seg.id}
                  onClick={() => onOpen(seg)}
                  className={`${color.bg} border ${color.border} rounded-2xl p-6 cursor-pointer hover:scale-[1.02] transition-all group relative`}
                >
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => openEdit(e, seg)}
                      className="text-slate-500 hover:text-[#4f8ef7] text-sm leading-none p-1 rounded hover:bg-[#4f8ef7]/10 transition-colors"
                      title="Editar segmento"
                    >✎</button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteTarget(seg) }}
                      className="text-slate-600 hover:text-[#e85d75] text-lg leading-none p-1 rounded hover:bg-[#e85d75]/10 transition-colors"
                      title="Excluir segmento"
                    >×</button>
                  </div>

                  <div className={`text-3xl font-black tracking-widest ${color.text} mb-2`}>
                    {seg.name}
                  </div>

                  {seg.description && (
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{seg.description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <span className={`w-2 h-2 rounded-full ${color.dot}`}></span>
                    <span className="text-slate-500 text-xs">
                      {count} projeto{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal novo segmento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold text-xl mb-1">Novo Segmento</h2>
            <p className="text-slate-500 text-sm mb-5">Ex: GRE, GMT, TER, OBRA A...</p>
            <label className="block text-xs text-slate-400 mb-1">Nome *</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="GRE"
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-[#4f8ef7] uppercase font-bold tracking-widest text-lg"
            />
            <label className="block text-xs text-slate-400 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrição opcional do segmento"
              rows={2}
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-6 focus:outline-none focus:border-[#4f8ef7] resize-none text-sm"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowModal(false); setName(''); setDescription('') }} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar segmento */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold text-xl mb-5">Editar Segmento</h2>
            <label className="block text-xs text-slate-400 mb-1">Nome *</label>
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleEdit()}
              placeholder="GRE"
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-[#4f8ef7] uppercase font-bold tracking-widest text-lg"
            />
            <label className="block text-xs text-slate-400 mb-1">Descrição</label>
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              placeholder="Descrição opcional do segmento"
              rows={2}
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-6 focus:outline-none focus:border-[#4f8ef7] resize-none text-sm"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">
                Cancelar
              </button>
              <button
                onClick={handleEdit}
                disabled={!editName.trim()}
                className="bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Excluir segmento "${deleteTarget.name}"?`}
          detail="Todos os projetos deste segmento serão excluídos permanentemente."
          onConfirm={() => { deleteSegment(deleteTarget.id); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
