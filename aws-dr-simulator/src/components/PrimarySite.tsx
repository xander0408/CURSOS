import { Server } from 'lucide-react'
import type { SimulationModel } from '../types/simulation'
import { MetaRow, Panel, StatusPill } from './ui'

interface PrimarySiteProps {
  sim: SimulationModel
}

export function PrimarySite({ sim }: PrimarySiteProps) {
  const tone =
    sim.primaryStatus === 'ONLINE'
      ? 'ok'
      : sim.primaryStatus === 'RESTORING'
        ? 'warn'
        : 'crit'

  return (
    <Panel
      eyebrow="Primary Site"
      title="On-Premises"
      tone={tone}
      className={sim.primaryStatus === 'FAILED' || sim.primaryStatus === 'FAILURE_DETECTED' ? 'pulse-crit' : ''}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200">
          <Server className="h-4 w-4 text-slate-400" />
          <span className="font-mono text-sm">WEB-SRV-01</span>
        </div>
        <StatusPill
          tone={tone}
          pulse={sim.primaryStatus === 'FAILURE_DETECTED'}
        >
          {sim.primaryStatus === 'ONLINE'
            ? 'HEALTHY'
            : sim.primaryStatus === 'FAILURE_DETECTED'
              ? 'FAILURE DETECTED'
              : sim.primaryStatus}
        </StatusPill>
      </div>
      <MetaRow label="Server" value="WEB-SRV-01" />
      <MetaRow label="IP" value="10.10.10.20" />
      <MetaRow label="Operating System" value="Windows Server" />
      <MetaRow label="Application" value="Business Application" />
      <MetaRow label="Estado" value={sim.primaryStatus} />
      {(sim.primaryStatus === 'FAILED' || sim.primaryStatus === 'FAILURE_DETECTED') && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200">
          Primary infrastructure unavailable
        </p>
      )}
    </Panel>
  )
}
