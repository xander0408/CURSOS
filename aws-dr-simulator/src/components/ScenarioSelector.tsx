import { SCENARIOS } from '../data/scenarios'
import type { DisasterSimulationApi } from '../hooks/useDisasterSimulation'

interface ScenarioSelectorProps {
  api: DisasterSimulationApi
}

export function ScenarioSelector({ api }: ScenarioSelectorProps) {
  const { sim, setScenario, scenario } = api
  const locked = sim.sequence !== 'none'

  return (
    <section className="rounded-2xl border border-slate-700 bg-[#111b2e] p-4">
      <label htmlFor="scenario" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Scenario
      </label>
      <select
        id="scenario"
        disabled={locked}
        value={sim.scenarioId}
        onChange={(event) => setScenario(event.target.value as typeof sim.scenarioId)}
        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-50"
      >
        {SCENARIOS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{scenario.failureDetail}</p>
    </section>
  )
}
