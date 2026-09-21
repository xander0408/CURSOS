import { ArrowRight, FastForward, HardDrive } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { LIFECYCLE_RULES, STORAGE_CLASSES, getStorageClass } from '../../data/backup'
import type { BackupSimulationApi } from '../../hooks/useBackupSimulation'
import { formatGb, formatUsd } from './BackupMetrics'

interface StorageClassesPanelProps {
  api: BackupSimulationApi
}

export function StorageClassesPanel({ api }: StorageClassesPanelProps) {
  const { model, totals, advanceLifecycle } = api

  const chartData = STORAGE_CLASSES.map((cls) => ({
    name: cls.shortName,
    value: Math.round(model.distributionGb[cls.id]),
    color: cls.color,
  }))

  return (
    <section className="rounded-lg border border-slate-700 bg-[#111b2e]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Amazon S3</p>
            <h2 className="text-sm font-semibold text-white">Storage classes and lifecycle policy</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="rounded-md border border-slate-700 px-2.5 py-1 font-mono text-slate-300">
            Simulated day {model.lifecycleDay}
          </span>
          <button
            type="button"
            onClick={() => advanceLifecycle(30)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 font-semibold text-slate-100 hover:border-sky-400"
          >
            <FastForward className="h-3.5 w-3.5" />
            Advance 30 days
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Lifecycle rule: backups-lifecycle-7y
        </p>
        <ol className="flex flex-wrap items-center gap-2">
          {LIFECYCLE_RULES.map((rule, index) => {
            const cls = rule.to === 'EXPIRE' ? null : getStorageClass(rule.to)
            return (
              <li key={`${rule.to}-${rule.afterDays}`} className="flex items-center gap-2">
                <div
                  className="rounded-md border px-3 py-2 text-[11px]"
                  style={{
                    borderColor: cls ? `${cls.color}66` : '#475569',
                    background: cls ? `${cls.color}14` : '#1e293b',
                  }}
                >
                  <p className="font-semibold text-white">{cls ? cls.shortName : 'Expire'}</p>
                  <p className="text-slate-400">{rule.label}</p>
                </div>
                {index < LIFECYCLE_RULES.length - 1 && <ArrowRight className="h-4 w-4 text-slate-600" />}
              </li>
            )
          })}
        </ol>

        <div className="mt-4 grid gap-4 xl:grid-cols-[260px_1fr]">
          <div className="rounded-md border border-slate-800 bg-[#0d1728] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Distribution</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={2} stroke="none">
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatGb(Number(value))}
                    contentStyle={{ background: '#0b1220', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <p className="font-mono text-lg font-semibold text-white">{formatGb(totals.totalGb)}</p>
              <p className="text-[10px] text-slate-500">
                {formatUsd(totals.monthlyCost)}/month vs {formatUsd(totals.standardOnlyCost)} in Standard only
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {STORAGE_CLASSES.map((cls) => {
              const gb = model.distributionGb[cls.id]
              const share = totals.totalGb > 0 ? (gb / totals.totalGb) * 100 : 0
              return (
                <article
                  key={cls.id}
                  className="flex flex-col rounded-md border border-slate-800 bg-[#0d1728] p-3"
                  style={{ borderTopColor: cls.color, borderTopWidth: 2 }}
                >
                  <p className="text-xs font-semibold text-white">{cls.name}</p>
                  <p className="mt-1 flex-1 text-[11px] leading-snug text-slate-400">{cls.useCase}</p>
                  <dl className="mt-2 space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Retrieval</dt>
                      <dd className="text-slate-200">{cls.retrieval}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Min. duration</dt>
                      <dd className="text-slate-200">{cls.minDuration}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Resilience</dt>
                      <dd className="text-slate-200">{cls.availabilityZones}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Price</dt>
                      <dd className="font-mono text-slate-200">${cls.pricePerGbMonth}/GB</dd>
                    </div>
                  </dl>
                  <div className="mt-2">
                    <div className="flex justify-between font-mono text-[10px] text-slate-300">
                      <span>{formatGb(gb)}</span>
                      <span>{share.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full transition-[width] duration-500"
                        style={{ width: `${share}%`, background: cls.color }}
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
        <p className="mt-3 text-[10px] text-slate-500">
          Durabilidad de diseño 99.999999999% (11 nueves) en todas las clases. Precios ilustrativos, no constituyen una cotización.
        </p>
      </div>
    </section>
  )
}
