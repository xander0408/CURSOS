import { X } from 'lucide-react'

interface HowItWorksModalProps {
  open: boolean
  onClose: () => void
}

const STEPS = [
  'AWS DRS instala un agente en el servidor origen (on-premises o en otra nube).',
  'Los datos se replican de forma continua hacia el área de staging del servicio.',
  'AWS mantiene recovery points puntuales a partir de esa replicación.',
  'Ante una interrupción se puede iniciar el proceso de recuperación (failover).',
  'Se levantan recovery instances a partir del recovery point seleccionado.',
  'La aplicación puede recuperarse y recibir tráfico en AWS.',
  'Posteriormente se puede realizar failback hacia el sitio primario cuando esté listo.',
]

export function HowItWorksModal({ open, onClose }: HowItWorksModalProps) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-600 bg-[#10192b] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="how-title" className="text-lg font-semibold text-white">
            ¿Cómo funciona AWS Elastic Disaster Recovery?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Esta aplicación es una simulación visual educativa. No ejecuta AWS DRS, no usa credenciales y no modifica
          recursos en AWS.
        </p>
        <ol className="space-y-3 text-sm leading-relaxed text-slate-200">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-200">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
