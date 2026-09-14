import { AnimatePresence, motion } from 'framer-motion'
import { ArchitectureDiagram } from './components/ArchitectureDiagram'
import { EventLog } from './components/EventLog'
import { Header } from './components/Header'
import { HowItWorksModal } from './components/HowItWorksModal'
import { MetricsPanel, UsersPanel } from './components/MetricsPanel'
import { ReplicationChart } from './components/ReplicationChart'
import { ScenarioSelector } from './components/ScenarioSelector'
import { SimulationControls } from './components/SimulationControls'
import { Timeline } from './components/Timeline'
import { useDisasterSimulation } from './hooks/useDisasterSimulation'

function formatRto(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes} minutes ${String(rest).padStart(2, '0')} seconds`
}

export default function App() {
  const api = useDisasterSimulation()
  const { sim, scenario, toggleHowItWorks, runAgain, dismissDemo } = api
  const compact = sim.presentationMode

  return (
    <div className={`min-h-screen ${compact ? 'text-base' : 'text-sm'}`}>
      <Header api={api} />

      <AnimatePresence>
        {sim.banner === 'disaster' && (
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-600 px-4 py-2 text-center text-sm font-bold tracking-[0.14em] text-white"
          >
            DISASTER DETECTED — {scenario.failureHeadline.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-[1600px] space-y-4 px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            Magnatic Cloud DR Simulator · clock {sim.simClockLabel} · {sim.phaseLabel}
          </p>
          <p className="text-[11px] uppercase tracking-wider text-amber-200/80">
            Simulation only
          </p>
        </div>

        <MetricsPanel sim={sim} />

        <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-[1fr_280px]'}`}>
          <SimulationControls api={api} />
          {!compact && <ScenarioSelector api={api} />}
        </div>

        <ArchitectureDiagram sim={sim} presentationMode={compact} />

        <AnimatePresence>
          {sim.banner === 'recovery-success' && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5"
            >
              <h2 className="text-lg font-bold tracking-wide text-emerald-200">
                DISASTER RECOVERY SUCCESSFUL
              </h2>
              <p className="mt-1 text-xs text-emerald-100/80">Resultado de la simulación — no es un failover real.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Result label="RPO Achieved" value="5 seconds" />
                <Result label="Target RPO" value="15 seconds" />
                <Result
                  label="RTO Achieved"
                  value={formatRto(sim.rtoAchievedSec ?? 154)}
                />
                <Result label="Target RTO" value="5 minutes" />
                <Result label="Data Loss" value="~5 seconds" />
                <Result label="Application Status" value="ONLINE" />
                <Result label="Recovery Instance" value="RUNNING" />
                <Result label="Traffic" value="AWS Recovery Instance" />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {sim.banner === 'failback-success' && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-5"
            >
              <h2 className="text-lg font-bold text-sky-100">FAILBACK COMPLETE</h2>
              <p className="text-sm text-sky-100/80">
                El tráfico simulado volvió a On-Premises. El sitio primario está restaurado en esta demostración.
              </p>
            </motion.section>
          )}
        </AnimatePresence>

        {compact ? (
          <UsersPanel sim={sim} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <ReplicationChart sim={sim} />
            <UsersPanel sim={sim} />
          </div>
        )}

        {!compact && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Timeline sim={sim} />
            <EventLog sim={sim} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-300">AWS Disaster Recovery Simulator</p>
        <p>Educational / Demonstration Tool</p>
        <p>Simulation only — No AWS resources are being modified.</p>
      </footer>

      <HowItWorksModal open={sim.howItWorksOpen} onClose={toggleHowItWorks} />

      <AnimatePresence>
        {sim.demoComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-violet-400/40 bg-[#141028] p-6 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-violet-300">Demo Mode</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Demo Complete</h2>
              <p className="mt-2 text-sm text-slate-300">
                El escenario de failover se ejecutó de extremo a extremo en modo simulación.
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={runAgain}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
                >
                  Run Again
                </button>
                <button
                  type="button"
                  onClick={dismissDemo}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-emerald-200/70">{label}</p>
      <p className="font-mono text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
