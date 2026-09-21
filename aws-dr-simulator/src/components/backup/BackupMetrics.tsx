import { PROTECTED_RESOURCES } from '../../data/backup'
import type { BackupSimulationApi } from '../../hooks/useBackupSimulation'

interface BackupMetricsProps {
  api: BackupSimulationApi
}

export function formatGb(gb: number): string {
  if (gb >= 1000) {
    return `${(gb / 1000).toFixed(2)} TB`
  }
  return `${Math.round(gb)} GB`
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function BackupMetrics({ api }: BackupMetricsProps) {
  const { model, totals } = api
  const savings = totals.standardOnlyCost - totals.monthlyCost
  const savingsPct = totals.standardOnlyCost > 0 ? Math.round((savings / totals.standardOnlyCost) * 100) : 0

  const cards = [
    { label: 'Protected resources', value: String(PROTECTED_RESOURCES.length), hint: 'EC2, RDS, EFS, EBS, DynamoDB, S3' },
    { label: 'Jobs running', value: String(totals.running), hint: `${totals.completed} completed today` },
    { label: 'Success rate', value: `${totals.successRate}%`, hint: 'Last 24 h' },
    { label: 'Recovery points', value: String(model.recoveryPointsBase), hint: 'Across 3 vaults' },
    { label: 'Data stored', value: formatGb(totals.totalGb), hint: 'All S3 storage classes' },
    {
      label: 'Est. monthly cost',
      value: formatUsd(totals.monthlyCost),
      hint: `${savingsPct}% below S3 Standard only`,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-slate-700 bg-[#111b2e] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
          <p className="mt-1 font-mono text-lg font-semibold text-white">{card.value}</p>
          <p className="text-[10px] text-slate-500">{card.hint}</p>
        </div>
      ))}
    </div>
  )
}
