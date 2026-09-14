import { Cloud } from 'lucide-react'
import type { SimulationModel } from '../types/simulation'
import { InfoTip, MetaRow, Panel, StatusPill } from './ui'

interface DRSPanelProps {
  sim: SimulationModel
}

export function DRSPanel({ sim }: DRSPanelProps) {
  const tone =
    sim.drsLabel.includes('DETECT') || sim.drsLabel.includes('RECOVER') || sim.drsLabel.includes('FAILBACK')
      ? 'warn'
      : 'ok'

  return (
    <Panel eyebrow="Simulated control plane" title="AWS Elastic Disaster Recovery" tone={tone}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-300">
          <Cloud className="h-4 w-4" />
          <span className="text-xs font-semibold tracking-wide">CONCEPTUAL AWS DRS</span>
        </div>
        <StatusPill tone={tone}>{sim.drsLabel}</StatusPill>
      </div>
      <MetaRow label="Protected Servers" value="1" />
      <MetaRow
        label="Replication"
        value={sim.replicationStatus === 'SYNCED' ? 'Healthy' : sim.replicationStatus.replaceAll('_', ' ')}
      />
      <MetaRow
        label="Recovery Point"
        value={sim.recoveryPointSelected ? 'Selected' : 'Available'}
      />
      <MetaRow label="Last Sync" value={sim.lastRecoveryPointLabel} />
      <MetaRow
        label="RPO"
        value={`${sim.rpoTargetSec} seconds`}
      />
      <div className="mt-1">
        <InfoTip label="Recovery Point Objective. Cantidad máxima de datos que potencialmente podrían perderse medida en tiempo.">
          <span className="text-[11px] text-slate-500">RPO tooltip</span>
        </InfoTip>
      </div>
      <MetaRow label="RTO Target" value="5 minutes" />
      {sim.recoveryPointSelected && (
        <p className="mt-3 rounded-lg bg-sky-500/10 px-3 py-2 text-xs text-sky-100">
          Recovery Point Selected. {sim.recoveryPointTimestamp}. RPO 5 seconds
        </p>
      )}
      <p className="mt-3 text-[11px] text-slate-500">
        Representación educativa. Esta tarjeta no está conectada a AWS.
      </p>
    </Panel>
  )
}
