import { AnimatePresence, motion } from 'framer-motion'
import { Bot, CheckCircle2, Circle, Loader2, Workflow } from 'lucide-react'
import type { SimulationModel, SimulationState } from '../types/simulation'

interface AutomationRunbookProps {
  sim: SimulationModel
}

interface RunbookTask {
  id: string
  title: string
  detail: string
  /** Estados en los que esta tarea se está ejecutando. */
  running: SimulationState[]
  /** Índice de paso a partir del cual se considera completada (sequence step). */
  doneAfterStep: number
}

const DISASTER_TASKS: RunbookTask[] = [
  {
    id: 'detect',
    title: 'Detect primary failure',
    detail: 'Health checks and agent heartbeat correlation',
    running: ['FAILURE_DETECTED'],
    doneAfterStep: 2,
  },
  {
    id: 'freeze',
    title: 'Mark last known good replication',
    detail: 'Freeze replication state at failure time',
    running: ['REPLICATION_PAUSED'],
    doneAfterStep: 3,
  },
  {
    id: 'rp',
    title: 'Select recovery point',
    detail: 'Most recent consistent snapshot before failure',
    running: ['RECOVERY_POINT_SELECTED'],
    doneAfterStep: 4,
  },
  {
    id: 'launch',
    title: 'Launch recovery instance',
    detail: 'Recovery-Web-01 in us-east-1a',
    running: ['RECOVERY_STARTING'],
    doneAfterStep: 5,
  },
  {
    id: 'boot',
    title: 'Boot operating system',
    detail: 'Drivers, network and volumes attached',
    running: ['RECOVERY_BOOTING'],
    doneAfterStep: 6,
  },
  {
    id: 'health',
    title: 'Run instance health check',
    detail: 'OS reachable, services responding',
    running: ['HEALTH_CHECK'],
    doneAfterStep: 8,
  },
  {
    id: 'app',
    title: 'Start business application',
    detail: 'Application services and dependencies',
    running: ['APPLICATION_STARTING'],
    doneAfterStep: 9,
  },
  {
    id: 'traffic',
    title: 'Redirect user traffic',
    detail: 'Users routed to the recovery environment',
    running: ['APPLICATION_STARTING'],
    doneAfterStep: 9,
  },
]

const FAILBACK_TASKS: RunbookTask[] = [
  {
    id: 'fb-prep',
    title: 'Prepare failback',
    detail: 'Validate on-premises target readiness',
    running: ['FAILBACK_PREPARING'],
    doneAfterStep: 1,
  },
  {
    id: 'fb-sync',
    title: 'Replicate changes back',
    detail: 'Delta sync from recovery environment',
    running: ['FAILBACK_SYNC'],
    doneAfterStep: 2,
  },
  {
    id: 'fb-validate',
    title: 'Validate primary server',
    detail: 'Data consistency and service checks',
    running: ['FAILBACK_VALIDATION'],
    doneAfterStep: 4,
  },
  {
    id: 'fb-traffic',
    title: 'Redirect traffic to on-premises',
    detail: 'Recovery instance stopped after cutover',
    running: ['FAILBACK_COMPLETE'],
    doneAfterStep: 5,
  },
]

type TaskStatus = 'done' | 'running' | 'pending'

function taskStatus(task: RunbookTask, sim: SimulationModel, completed: boolean): TaskStatus {
  if (completed) {
    return 'done'
  }
  if (sim.sequence !== 'none' && sim.stepIndex >= task.doneAfterStep) {
    return 'done'
  }
  if (sim.sequence !== 'none' && task.running.includes(sim.state)) {
    return 'running'
  }
  return 'pending'
}

export function AutomationRunbook({ sim }: AutomationRunbookProps) {
  const isFailback = sim.sequence === 'failback' || sim.state.startsWith('FAILBACK')
  const tasks = isFailback ? FAILBACK_TASKS : DISASTER_TASKS
  const completed =
    (!isFailback && sim.state === 'RECOVERY_COMPLETE') ||
    (isFailback && sim.state === 'FAILBACK_COMPLETE' && sim.sequence === 'none')
  const executing = sim.sequence !== 'none' && !sim.paused

  const statuses = tasks.map((task) => taskStatus(task, sim, completed))
  const doneCount = statuses.filter((status) => status === 'done').length
  const overall = Math.round((doneCount / tasks.length) * 100)

  const stepProgress =
    sim.stepDurationMs > 0
      ? Math.min(100, Math.round(((sim.stepDurationMs - sim.remainingMs) / sim.stepDurationMs) * 100))
      : 0

  const engineLabel = sim.paused
    ? 'PAUSED'
    : executing
      ? 'EXECUTING'
      : completed
        ? 'COMPLETED'
        : 'IDLE'

  const engineTone = sim.paused
    ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
    : executing
      ? 'text-sky-200 border-sky-400/40 bg-sky-500/10'
      : completed
        ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
        : 'text-slate-400 border-slate-600 bg-slate-800/40'

  const recentLogs = sim.logs.slice(0, 6)

  return (
    <section className="rounded-lg border border-slate-700 bg-[#111b2e]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ff9900]/15 text-[#ffb84d]">
            <Workflow className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Automated runbook
            </p>
            <h2 className="text-sm font-semibold text-white">
              {isFailback ? 'Failback orchestration' : 'Failover orchestration'}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1 text-[10px] text-slate-400 sm:inline-flex">
            <Bot className="h-3.5 w-3.5" />
            No manual steps required
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold ${engineTone}`}
          >
            {executing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {engineLabel}
          </span>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Tasks completed{' '}
            <span className="font-mono text-slate-100">
              {doneCount}/{tasks.length}
            </span>
          </span>
          <span className="font-mono text-slate-100">{overall}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className={`h-full ${completed ? 'bg-emerald-400' : 'bg-[#ff9900]'}`}
            animate={{ width: `${overall}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 20 }}
          />
        </div>
      </div>

      <ol className="divide-y divide-slate-800/80 px-2 py-2">
        {tasks.map((task, index) => {
          const status = statuses[index] ?? 'pending'
          return (
            <li
              key={task.id}
              className={`flex items-start gap-3 rounded-md px-2 py-2 ${
                status === 'running' ? 'bg-sky-500/5' : ''
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : status === 'running' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-600" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`truncate text-xs font-medium ${
                      status === 'done'
                        ? 'text-slate-300'
                        : status === 'running'
                          ? 'text-white'
                          : 'text-slate-500'
                    }`}
                  >
                    <span className="mr-2 font-mono text-[10px] text-slate-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {task.title}
                  </p>
                  <span
                    className={`shrink-0 font-mono text-[10px] uppercase ${
                      status === 'done'
                        ? 'text-emerald-400'
                        : status === 'running'
                          ? 'text-sky-300'
                          : 'text-slate-600'
                    }`}
                  >
                    {status === 'running' ? `${stepProgress}%` : status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{task.detail}</p>
                <AnimatePresence>
                  {status === 'running' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-800"
                    >
                      <div
                        className="h-full bg-sky-400 transition-[width] duration-150"
                        style={{ width: `${stepProgress}%` }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="border-t border-slate-800 bg-[#0a1020] px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-slate-500">
          <span>Orchestration console</span>
          <span className="font-mono normal-case tracking-normal">drs-orchestrator (simulated)</span>
        </div>
        <div className="space-y-0.5 font-mono text-[11px] leading-relaxed">
          {recentLogs
            .slice()
            .reverse()
            .map((entry) => (
              <p key={entry.id} className="truncate text-slate-300">
                <span className="text-slate-600">{entry.time}</span>{' '}
                <span
                  className={
                    entry.level === 'CRITICAL'
                      ? 'text-red-300'
                      : entry.level === 'SUCCESS'
                        ? 'text-emerald-300'
                        : entry.level === 'WARN'
                          ? 'text-amber-300'
                          : 'text-sky-300'
                  }
                >
                  [{entry.level}]
                </span>{' '}
                {entry.message}
              </p>
            ))}
          <p className="text-slate-500">
            {executing ? `$ executing step ${sim.stepIndex + 1} of ${sim.totalSteps}` : '$ awaiting trigger'}
            <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-slate-400 align-middle" />
          </p>
        </div>
      </div>
    </section>
  )
}
