import { RotateCcw, ShieldCheck } from 'lucide-react'
import { useBackupSimulation } from '../../hooks/useBackupSimulation'
import type { ActivityLevel } from '../../types/backup'
import { AwsBackupPanel } from './AwsBackupPanel'
import { BackupMetrics } from './BackupMetrics'
import { StorageClassesPanel } from './StorageClassesPanel'
import { TapeGatewayPanel } from './TapeGatewayPanel'
import { VersioningPanel } from './VersioningPanel'

const LEVEL: Record<ActivityLevel, string> = {
  INFO: 'text-sky-300',
  SUCCESS: 'text-emerald-300',
  WARN: 'text-amber-300',
}

export function BackupDashboard() {
  const api = useBackupSimulation()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <p className="text-[11px] font-medium text-slate-500">
            Backup as a Service <span className="px-1 text-slate-700">/</span> Overview
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Backup dashboard</h2>
          <p className="mt-1 text-xs text-slate-400">
            AWS Backup, Amazon S3 storage classes, versioning and Tape Gateway (VTL). Simulation only.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Policy compliant
          </span>
          <button
            type="button"
            onClick={api.resetBackup}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-2 font-semibold text-slate-300 hover:border-slate-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <BackupMetrics api={api} />
      <AwsBackupPanel api={api} />
      <StorageClassesPanel api={api} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <VersioningPanel api={api} />
        <section className="rounded-lg border border-slate-700 bg-[#0d1524] p-4">
          <h2 className="mb-3 text-sm font-semibold tracking-wide">Backup activity</h2>
          <ul className="scroll-thin max-h-80 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed">
            {api.model.activity.map((entry) => (
              <li key={entry.id} className="text-slate-300">
                <span className="text-slate-500">{entry.time}</span>{' '}
                <span className={LEVEL[entry.level]}>[{entry.level}]</span> {entry.message}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <TapeGatewayPanel api={api} />
    </div>
  )
}
