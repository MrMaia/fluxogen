import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Segment, Project } from '../types'
import ConfirmModal from './ConfirmModal'

interface Props {
  segment: Segment
  onBack: () => void
  onOpenProject: (project: Project) => void
}

export default function SegmentProjects({ segment, onBack, onOpenProject }: Props) {
  const { projects, createProject, deleteProject, updateProject } = useApp()
  const segProjects = projects.filter(p => p.segmentId === segment.id)

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [version, setVersion] = useState('')
  const [projectDate, setProjectDate] = useState('')
  const [approvedBy, setApprovedBy] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editVersion, setEditVersion] = useState('')
  const [editProjectDate, setEditProjectDate] = useState('')
  const [editApprovedBy, setEditApprovedBy] = useState('')

  function handleCreate() {
    if (!name.trim()) return
    createProject(
      segment.id, name.trim(),
      description.trim() || undefined,
      version.trim() || undefined,
      projectDate || undefined,
      approvedBy.trim() || undefined,
    )
    setName(''); setDescription(''); setVersion(''); setProjectDate(''); setApprovedBy('')
    setShowModal(false)
  }

  function handleEdit() {
    if (!editTarget || !editName.trim()) return
    updateProject(
      editTarget.id, editName.trim(),
      editDescription.trim() || undefined,
      editVersion.trim() || undefined,
      editProjectDate || undefined,
      editApprovedBy.trim() || undefined,
    )
    setEditTarget(null)
  }

  function openEdit(e: React.MouseEvent, p: Project) {
    e.stopPropagation()
    setEditTarget(p)
    setEditName(p.name)
    setEditDescription(p.description ?? '')
    setEditVersion(p.version ?? '')
    setEditProjectDate(p.projectDate ?? '')
    setEditApprovedBy(p.approvedBy ?? '')
  }

  function stepCount(p: Project) {
    return p.flows.reduce((sum, f) => sum + f.steps.length, 0)
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-10">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 text-slate-400 hover:text-white transition-all text-sm mb-4 self-start"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Segmentos
            </button>
            <h1 className="text-3xl font-black tracking-widest text-white">{segment.name}</h1>
            {segment.description && (
              <p className="text-slate-500 text-sm mt-1">{segment.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#4f8ef7] hover:bg-[#3a7ae0] text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <span className="text-base leading-none">+</span> Novo Projeto
          </button>
        </div>

        {segProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4 opacity-10">⬡</div>
            <p className="text-slate-400 text-lg">Nenhum projeto em {segment.name}</p>
            <p className="text-slate-600 text-sm mt-1">Clique em "Novo Projeto" para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {segProjects.map(p => (
              <div
                key={p.id}
                onClick={() => onOpenProject(p)}
                className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-5 cursor-pointer hover:border-[#4f8ef7] hover:bg-[#1a2550] transition-all group relative"
              >
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => openEdit(e, p)}
                    className="text-slate-500 hover:text-[#4f8ef7] text-sm leading-none p-1 rounded hover:bg-[#4f8ef7]/10 transition-colors"
                    title="Editar projeto"
                  >✎</button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteTarget(p) }}
                    className="text-slate-600 hover:text-[#e85d75] text-xl leading-none p-1 rounded hover:bg-[#e85d75]/10 transition-colors"
                    title="Excluir projeto"
                  >×</button>
                </div>

                <h2 className="text-white font-semibold text-lg leading-tight group-hover:text-[#4f8ef7] transition-colors pr-14 mb-1">
                  {p.name}
                </h2>
                {p.description && (
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2">{p.description}</p>
                )}
                <div className="flex gap-3 text-xs text-slate-600 mt-3">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] inline-block"></span>
                    {p.entradas.length} entr.
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4f8ef7] inline-block"></span>
                    {stepCount(p)} tarefas
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] inline-block"></span>
                    {p.saidas.length} saídas
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-2">
                  {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal novo projeto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold text-xl mb-1">Novo Projeto</h2>
            <p className="text-slate-500 text-sm mb-5">em <span className="text-white font-bold">{segment.name}</span></p>
            <label className="block text-xs text-slate-400 mb-1">Nome *</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Nome do projeto"
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-[#4f8ef7] text-sm"
            />
            <label className="block text-xs text-slate-400 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrição opcional"
              rows={2}
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-[#4f8ef7] resize-none text-sm"
            />
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Versão</label>
                <input
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  placeholder="ex: 1.0"
                  className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#4f8ef7] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Data</label>
                <input
                  type="date"
                  value={projectDate}
                  onChange={e => setProjectDate(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#4f8ef7] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Aprovado Por</label>
                <input
                  value={approvedBy}
                  onChange={e => setApprovedBy(e.target.value)}
                  placeholder="ex: João"
                  className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#4f8ef7] text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowModal(false); setName(''); setDescription(''); setVersion(''); setProjectDate(''); setApprovedBy('') }} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">
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

      {/* Modal editar projeto */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold text-xl mb-5">Editar Projeto</h2>
            <label className="block text-xs text-slate-400 mb-1">Nome *</label>
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEdit()}
              placeholder="Nome do projeto"
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-[#4f8ef7] text-sm"
            />
            <label className="block text-xs text-slate-400 mb-1">Descrição</label>
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              placeholder="Descrição opcional"
              rows={2}
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-[#4f8ef7] resize-none text-sm"
            />
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Versão</label>
                <input
                  value={editVersion}
                  onChange={e => setEditVersion(e.target.value)}
                  placeholder="ex: 1.0"
                  className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#4f8ef7] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Data</label>
                <input
                  type="date"
                  value={editProjectDate}
                  onChange={e => setEditProjectDate(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#4f8ef7] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Aprovado Por</label>
                <input
                  value={editApprovedBy}
                  onChange={e => setEditApprovedBy(e.target.value)}
                  placeholder="ex: João"
                  className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#4f8ef7] text-sm"
                />
              </div>
            </div>
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
          message={`Excluir "${deleteTarget.name}"?`}
          detail="Esta ação não pode ser desfeita."
          onConfirm={() => { deleteProject(deleteTarget.id); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
