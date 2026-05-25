interface Props {
  message: string
  detail?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ message, detail, confirmLabel = 'Excluir', onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-6 w-full max-w-sm text-center">
        <div className="text-2xl mb-3">⚠️</div>
        <p className="text-white font-medium mb-1">{message}</p>
        {detail && <p className="text-slate-400 text-sm mb-6">{detail}</p>}
        {!detail && <div className="mb-6" />}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-slate-400 hover:text-white border border-[#2a2a4a] hover:border-[#3a3a5c] rounded-lg transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#e85d75] hover:bg-[#d04060] text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
