import type { SimulationModel } from '../types/simulation'
import { MetaRow, Panel, StatusPill } from './ui'

interface ReplicationPanelProps {
  sim: SimulationModel
}

export function ReplicationPanel({ sim }: ReplicationPanelProps) {
  const active = sim.replicationStatus === 'SYNCED' || sim.replicationStatus === 'SYNCING_BACK'
  const tone =
    sim.replicationStatus === 'LAST_KNOWN_GOOD' || sim.replicationStatus === 'PAUSED'
      ? 'warn'
      : 'ok'

  return (
    <Panel eyebrow="AWS DRS Agent" title="Replication" tone={tone}>
      <StatusPill tone={tone}>{sim.replicationStatus.replaceAll('_', ' ')}</StatusPill>
      <div className="mt-3">
        <MetaRow label="Replication Status" value={sim.replicationStatus.replaceAll('_', ' ')} />
        <MetaRow label="Replication Progress" value={`${Math.round(sim.replicationProgress)}%`} />
        <MetaRow label="Last Recovery Point" value={sim.lastRecoveryPointLabel} />
        <MetaRow label="RPO" value="< 15 seconds" />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-500"
          style={{ width: `${sim.replicationProgress}%` }}
        />
      </div>
      <div
        className={`replication-pipe mt-3 h-16 rounded-lg border border-sky-500/20 ${
          !active ? 'is-paused' : ''
        } ${sim.disasterAlert ? 'is-alert' : ''}`}
        aria-hidden="true"
      />
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
        Flujo de datos animado de replicación continua (visualización local). No hay transferencia real hacia AWS.
      </p>
    </Panel>
  )
}
