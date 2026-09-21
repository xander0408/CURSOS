import { Network } from 'lucide-react'
import { ARCHITECTURES } from '../../data/architecture'
import type { ConsoleView } from '../../types/console'
import { SectionCard } from './SectionCard'

interface ArchitectureBoardProps {
  view: ConsoleView
}

export function ArchitectureBoard({ view }: ArchitectureBoardProps) {
  const architecture = ARCHITECTURES[view]

  return (
    <SectionCard
      icon={<Network className="h-5 w-5" />}
      iconTone="bg-sky-500/15 text-sky-300"
      eyebrow="Reference architecture"
      title={architecture.title}
      right={<span className="text-[11px] text-slate-500">{architecture.source}</span>}
    >
      <div className="space-y-3 p-4">
        <p className="text-xs leading-relaxed text-slate-300">{architecture.caption}</p>
        <div className="overflow-hidden rounded-md border border-slate-700 bg-white">
          <img
            src={architecture.src}
            alt={architecture.title}
            className="mx-auto max-h-[520px] w-full object-contain"
          />
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {architecture.notes.map((note) => (
            <li key={note} className="rounded-md border border-slate-800 bg-[#0d1728] px-3 py-2 text-[11px] text-slate-300">
              {note}
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  )
}
