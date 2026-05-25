import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Project } from '../types'

interface Props {
  onOpen: (project: Project) => void
}

export default function ProjectList({ onOpen }: Props) {
  const { projects, createProject, deleteProject } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function handleCreate() {
    if (!name.trim()) return
    createProject(name.trim(), description.trim() || undefined)
    setName('')
    setDescription('')
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              <span className="text-[#4f8ef7]">Fluxo</span>gen
            </h1>
            <p className="text-slate-400 text-sm mt-1">Gerador de fluxos de projeto</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#4f8ef7] hover:bg-[#3a7ae0] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <span className="text-lg leading-none">+</span> Novo Projeto
          </button>
        </div>

        {/* Grid de projetos */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4 opacity-20">⬡</div>
            <p className="text-slate-400 text-lg">Nenhum projeto ainda</p>
            <p className="text-slate-600 text-sm mt-1">Clique em "Novo Projeto" para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => onOpen(p)}
                className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-5 cursor-pointer hover:border-[#4f8ef7] hover:bg-[#1a2550] transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-white font-semibold text-lg leading-tight group-hover:text-[#4f8ef7] transition-colors">
                    {p.name}
                  </h2>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDelete(p.id) }}
                    className="text-slate-600 hover:text-[#e85d75] transition-colors ml-2 text-lg leading-none"
                    title="Excluir projeto"
                  >
                    ×
                  </button>
                </div>
                {p.description && (
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{p.description}</p>
                )}
                <div className="flex gap-3 text-xs text-slate-500 mt-auto">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span>
                    {p.entradas.length} entrada{p.entradas.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#4f8ef7] inline-block"></span>
                    {p.fluxo.length} etapa{p.fluxo.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#f5a623] inline-block"></span>
                    {p.saidas.length} saída{p.saidas.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
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
            <h2 className="text-white font-semibold text-xl mb-5">Novo Projeto</h2>
            <label className="block text-sm text-slate-400 mb-1">Nome *</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Nome do projeto"
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-[#4f8ef7]"
            />
            <label className="block text-sm text-slate-400 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrição opcional"
              rows={3}
              className="w-full bg-[#0f0f1a] border border-[#2a2a4a] text-white rounded-lg px-3 py-2 mb-6 focus:outline-none focus:border-[#4f8ef7] resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowModal(false); setName(''); setDescription('') }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium transition-colors"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-6 w-full max-w-sm text-center">
            <p className="text-white mb-2 font-medium">Excluir projeto?</p>
            <p className="text-slate-400 text-sm mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { deleteProject(confirmDelete); setConfirmDelete(null) }}
                className="bg-[#e85d75] hover:bg-[#d04060] text-white px-5 py-2 rounded-lg font-medium transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
