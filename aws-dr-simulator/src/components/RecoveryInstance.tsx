import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import type { RecoveryInstanceStatus, SimulationModel } from '../types/simulation'
import { MetaRow, Panel, StatusPill } from './ui'

const STAGES: RecoveryInstanceStatus[] = [
  'STOPPED',
  'STARTING',
  'BOOTING',
  'HEALTH_CHECK',
  'RUNNING',
  'APPLICATION_ONLINE',
]

interface RecoveryInstanceProps {
  sim: SimulationModel
}

export function RecoveryInstance({ sim }: RecoveryInstanceProps) {
  const active = sim.recoveryInstanceStatus !== 'STOPPED'
  const tone =
    sim.recoveryInstanceStatus === 'STOPPED'
      ? 'idle'
      : sim.recoveryInstanceStatus === 'APPLICATION_ONLINE' || sim.recoveryInstanceStatus === 'RUNNING'
        ? 'ok'
        : 'info'

  return (
    <Panel eyebrow="Failover target" title="AWS Recovery Instance" tone={tone}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-slate-400" />
          <span className="font-mono text-sm">Recovery-Web-01</span>
        </div>
        <StatusPill tone={tone}>{sim.recoveryInstanceDetail}</StatusPill>
      </div>
      <MetaRow label="Instance" value="Recovery-Web-01" />
      <MetaRow label="Region" value="US East (N. Virginia)" />
      <MetaRow label="Availability Zone" value="us-east-1a" />
      <MetaRow label="State" value={sim.recoveryInstanceDetail} />
      <ol className="mt-3 space-y-1.5">
        {STAGES.map((stage) => {
          const current = sim.recoveryInstanceStatus === stage
          const idx = STAGES.indexOf(stage)
          const curIdx = STAGES.indexOf(sim.recoveryInstanceStatus)
          const done = idx < curIdx
          return (
            <li key={stage} className="flex items-center gap-2 text-[11px]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  current ? 'bg-sky-400' : done ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
              <span className={current ? 'font-semibold text-sky-200' : done ? 'text-emerald-300' : 'text-slate-500'}>
                {stage.replaceAll('_', ' ')}
              </span>
            </li>
          )
        })}
      </ol>
      {active && sim.recoveryInstanceStatus !== 'APPLICATION_ONLINE' && (
        <motion.div
          className="mt-3 h-1 overflow-hidden rounded bg-slate-800"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-sky-400"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          />
        </motion.div>
      )}
    </Panel>
  )
}
