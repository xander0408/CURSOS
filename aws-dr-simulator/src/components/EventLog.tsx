import type { LogLevel, SimulationModel } from '../types/simulation'

const LEVEL: Record<LogLevel, string> = {
  INFO: 'text-sky-300',
  WARN: 'text-amber-300',
  CRITICAL: 'text-red-300',
  SUCCESS: 'text-emerald-300',
}

interface EventLogProps {
  sim: SimulationModel
}

export function EventLog({ sim }: EventLogProps) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-[#0d1524] p-4">
      <h2 className="mb-3 text-sm font-semibold tracking-wide">Event Log</h2>
      <ul className="scroll-thin max-h-72 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed">
        {sim.logs.map((entry) => (
          <li key={entry.id} className="text-slate-300">
            <span className="text-slate-500">{entry.time}</span>{' '}
            <span className={LEVEL[entry.level]}>[{entry.level}]</span> {entry.message}
          </li>
        ))}
      </ul>
    </section>
  )
}
