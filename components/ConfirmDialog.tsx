type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  
  isDangerous?: boolean;
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmare',
  cancelText = 'Anulare',
  isDangerous = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 rounded-[2rem] border border-white/10 bg-slate-900/95 p-8 shadow-2xl sm:w-full sm:max-w-md">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-3 whitespace-pre-line text-slate-300">{message}</p>

        <div className="mt-8 flex gap-3 sm:flex-row">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-white/10 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 hover:border-white/20"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
              isDangerous
                ? 'bg-red-500 hover:bg-red-400'
                : 'bg-emerald-500 hover:bg-emerald-400'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
