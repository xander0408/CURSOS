import { AppWindow } from 'lucide-react'
import type { SimulationModel } from '../types/simulation'
import { Panel, StatusPill } from './ui'

interface ApplicationPanelProps {
  sim: SimulationModel
}

export function ApplicationPanel({ sim }: ApplicationPanelProps) {
  const tone =
    sim.applicationStatus === 'ONLINE'
      ? 'ok'
      : sim.applicationStatus === 'STARTING' || sim.applicationStatus === 'DEGRADED'
        ? 'warn'
        : 'crit'

  return (
    <Panel eyebrow="Workload" title="Application" tone={tone}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AppWindow className="h-4 w-4 text-slate-400" />
          <span className="text-sm">Business Application</span>
        </div>
        <StatusPill tone={tone}>{sim.applicationLabel}</StatusPill>
      </div>
      {sim.state === 'RECOVERY_COMPLETE' && (
        <ul className="space-y-1 text-xs text-emerald-200">
          <li>Recovery successful</li>
          <li>Application available</li>
          <li>Recovery Point restored</li>
          <li>Traffic redirected</li>
        </ul>
      )}
      {sim.applicationStatus === 'OFFLINE' && (
        <p className="text-xs text-red-200">Application unreachable from the primary site.</p>
      )}
      <p className="mt-3 text-[11px] text-slate-500">
        Estado de aplicación simulado para la demo. No se despliega ningún workload real.
      </p>
    </Panel>
  )
}
