import type { SimulationModel } from '../types/simulation'

interface TimelineProps {
  sim: SimulationModel
}

export function Timeline({ sim }: TimelineProps) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-[#111b2e] p-4">
      <h2 className="mb-3 text-sm font-semibold tracking-wide">Incident Timeline</h2>
      <ol className="scroll-thin max-h-72 space-y-2 overflow-y-auto pr-1">
        {sim.timeline.map((event, index) => {
          const last = index === sim.timeline.length - 1
          return (
            <li key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 h-2 w-2 rounded-full ${last ? 'bg-sky-400' : 'bg-slate-500'}`}
                />
                {index < sim.timeline.length - 1 ? (
                  <span className="w-px flex-1 bg-slate-700" />
                ) : null}
              </div>
              <div className="pb-3">
                <p className="font-mono text-[11px] text-slate-400">{event.time}</p>
                <p className="text-sm font-medium text-slate-100">{event.title}</p>
                <p className="text-xs text-slate-400">{event.detail}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
