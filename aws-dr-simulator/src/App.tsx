import { AnimatePresence, motion } from 'framer-motion'
import { Archive, Brain, Landmark, Route, ShieldAlert, ShieldCheck, Split } from 'lucide-react'
import { useState } from 'react'
import { ArchitectureBoard } from './components/shared/ArchitectureBoard'
import { ArchitectureDiagram } from './components/ArchitectureDiagram'
import { AutomationRunbook } from './components/AutomationRunbook'
import { BackupDashboard } from './components/backup/BackupDashboard'
import { ConsoleSidebar } from './components/ConsoleSidebar'
import { EventLog } from './components/EventLog'
import { Header } from './components/Header'
import { HowItWorksModal } from './components/HowItWorksModal'
import { MetricsPanel, UsersPanel } from './components/MetricsPanel'
import { MigrationDashboard } from './components/migration/MigrationDashboard'
import { MlDashboard } from './components/ml/MlDashboard'
import { ReplicationChart } from './components/ReplicationChart'
import { ScenarioSelector } from './components/ScenarioSelector'
import { SecurityDashboard } from './components/security/SecurityDashboard'
import { SimulationControls } from './components/SimulationControls'
import { SimulationProgress } from './components/SimulationProgress'
import { Timeline } from './components/Timeline'
import { HaDashboard } from './components/ha/HaDashboard'
import { WellArchitectedDashboard } from './components/wellarchitected/WellArchitectedDashboard'
import { VIEWS } from './data/console'
import { useDisasterSimulation } from './hooks/useDisasterSimulation'
import type { ConsoleView } from './types/console'

const TAB_ICONS: Record<ConsoleView, typeof Archive> = {
  dr: ShieldAlert,
  backup: Archive,
  ha: Split,
  migration: Route,
  wellarchitected: Landmark,
  ml: Brain,
  security: ShieldCheck,
}

function formatRto(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes} minutes ${String(rest).padStart(2, '0')} seconds`
}

export default function App() {
  const api = useDisasterSimulation()
  const { sim, scenario, toggleHowItWorks, runAgain, dismissDemo } = api
  const [view, setView] = useState<ConsoleView>('dr')
  const compact = sim.presentationMode && view === 'dr'

  return (
    <div className={`min-h-screen bg-[#0f1722] ${compact ? 'text-base' : 'text-sm'}`}>
      <Header api={api} view={view} />

      <div className="border-b border-slate-800 bg-[#0b111c] px-4 lg:px-6" role="tablist" aria-label="Services">
        <div className="flex gap-1 overflow-x-auto">
          {VIEWS.map((tab) => {
            const Icon = TAB_ICONS[tab.id]
            const active = tab.id === view
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(tab.id)}
                className={`flex min-w-[160px] items-center gap-2 border-b-2 px-4 py-2.5 text-left text-xs transition ${
                  active
                    ? 'border-[#ff9900] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#ff9900]' : 'text-slate-500'}`} />
                <span>
                  <span className="block font-semibold">{tab.label}</span>
                  <span className="block text-[10px] text-slate-500">{tab.tagline}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {view === 'dr' && sim.banner === 'disaster' && (
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-600 px-4 py-2 text-center text-sm font-bold tracking-[0.14em] text-white"
          >
            DISASTER DETECTED: {scenario.failureHeadline.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {!compact && <ConsoleSidebar sim={sim} view={view} onNavigate={setView} />}
        {view === 'backup' ? (
          <main className="min-w-0 flex-1 px-4 py-4 lg:px-6">
            <BackupDashboard />
          </main>
        ) : view === 'ha' ? (
          <main className="min-w-0 flex-1 px-4 py-4 lg:px-6">
            <HaDashboard />
          </main>
        ) : view === 'migration' ? (
          <main className="min-w-0 flex-1 px-4 py-4 lg:px-6">
            <MigrationDashboard />
          </main>
        ) : view === 'wellarchitected' ? (
          <main className="min-w-0 flex-1 px-4 py-4 lg:px-6">
            <WellArchitectedDashboard />
          </main>
        ) : view === 'ml' ? (
          <main className="min-w-0 flex-1 px-4 py-4 lg:px-6">
            <MlDashboard />
          </main>
        ) : view === 'security' ? (
          <main className="min-w-0 flex-1 px-4 py-4 lg:px-6">
            <SecurityDashboard />
          </main>
        ) : (
        <main className="min-w-0 flex-1 space-y-4 px-4 py-4 lg:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Disaster Recovery <span className="px-1 text-slate-700">/</span> Protected servers
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                Recovery dashboard
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {sim.simClockLabel} <span className="px-1 text-slate-600">|</span> {sim.phaseLabel}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="rounded-md border border-slate-700 bg-[#111b2b] px-3 py-2 text-slate-400">
                Environment: <span className="font-mono text-slate-200">local-demo</span>
              </span>
              <span className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-amber-200">
                Simulation only
              </span>
            </div>
          </div>

          <ArchitectureBoard view="dr" />
          <SimulationProgress sim={sim} />
          <MetricsPanel sim={sim} />

          <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-[1fr_280px]'}`}>
            <SimulationControls api={api} />
            {!compact && <ScenarioSelector api={api} />}
          </div>

          <div className={`grid gap-4 ${compact ? 'xl:grid-cols-[1fr_360px]' : 'xl:grid-cols-[1fr_380px]'}`}>
            <ArchitectureDiagram sim={sim} presentationMode={compact} />
            <AutomationRunbook sim={sim} />
          </div>

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
              <p className="mt-1 text-xs text-emerald-100/80">Resultado de la simulación. No es un failover real.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Result label="RPO Achieved" value="5 seconds" />
                <Result label="Target RPO" value="15 seconds" />
                <Result
                  label="RTO Achieved"
                  value={formatRto(sim.rtoAchievedSec ?? 154)}
                />
                <Result label="Target RTO" value="5 minutes" />
                <Result label="Data Loss" value="5 seconds" />
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
        )}
      </div>

      <footer className="border-t border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-300">AWS Cloud Resilience Simulator</p>
        <p>Educational / Demonstration Tool</p>
        <p>Simulation only. No AWS resources are being modified.</p>
      </footer>

      <HowItWorksModal open={sim.howItWorksOpen} onClose={toggleHowItWorks} />

      <AnimatePresence>
        {sim.demoComplete && view === 'dr' && (
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
