import type { SimulationModel, SimulationState } from '../types/simulation'

interface SimulationProgressProps {
  sim: SimulationModel
}

const STAGES: Array<{ label: string; states: SimulationState[] }> = [
  { label: 'Primary site', states: ['PRIMARY_ONLINE', 'FAILURE_DETECTED'] },
  { label: 'Failure detected', states: ['REPLICATION_PAUSED'] },
  { label: 'Recovery point', states: ['RECOVERY_POINT_SELECTED'] },
  { label: 'Recovery instance', states: ['RECOVERY_STARTING', 'RECOVERY_BOOTING', 'HEALTH_CHECK'] },
  { label: 'Application', states: ['APPLICATION_STARTING', 'RECOVERY_COMPLETE'] },
]

function stageIndex(state: SimulationState): number {
  const index = STAGES.findIndex((stage) => stage.states.includes(state))
  return index === -1 ? 0 : index
}

export function SimulationProgress({ sim }: SimulationProgressProps) {
  const current = stageIndex(sim.state)
  const active = sim.sequence !== 'none'
  const failback = sim.state.startsWith('FAILBACK')
  const stepProgress =
    sim.stepDurationMs > 0
      ? Math.min(100, ((sim.stepDurationMs - sim.remainingMs) / sim.stepDurationMs) * 100)
      : 0

  return (
    <section
      aria-label="Simulation progress"
      className="rounded-2xl border border-slate-700 bg-[#0d1728] p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Recovery workflow
          </p>
          <h2 className="mt-1 text-sm font-semibold text-white">{sim.phaseLabel}</h2>
        </div>
        <span className="inline-flex items-center gap-2 font-mono text-xs text-slate-400">
          {active && !sim.paused ? (
            <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" aria-hidden="true" />
          ) : null}
          {sim.paused ? 'PAUSED' : failback ? 'AUTOMATED FAILBACK' : active ? 'AUTOMATED FAILOVER' : 'READY'}
        </span>
      </div>
      <ol className="grid gap-2 sm:grid-cols-5">
        {STAGES.map((stage, index) => {
          const done = index < current || sim.state === 'RECOVERY_COMPLETE'
          const selected = index === current && !done
          return (
            <li key={stage.label} className="flex items-center gap-2 sm:block">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                  done
                    ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                    : selected
                      ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                      : 'border-slate-600 bg-slate-900 text-slate-500'
                }`}
              >
                {index + 1}
              </span>
              <div className="mt-1">
                <p className={`text-xs font-medium ${selected ? 'text-sky-100' : 'text-slate-300'}`}>
                  {stage.label}
                </p>
                <p className="text-[10px] text-slate-500">
                  {done ? 'Complete' : selected ? (active ? 'Running automatically' : 'Current step') : 'Pending'}
                </p>
                {selected && active && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800 sm:w-28">
                    <div
                      className="h-full bg-sky-400 transition-[width] duration-150"
                      style={{ width: `${stepProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
