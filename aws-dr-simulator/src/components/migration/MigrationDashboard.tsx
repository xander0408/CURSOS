import { ArrowRight, Boxes, Layers, Loader2, Play, RotateCcw, Route } from 'lucide-react'
import { MIGRATION_PHASES, STRATEGIES, TOTAL_WAVES, getStrategy } from '../../data/migration'
import type { AppStatus } from '../../data/migration'
import { useMigrationSimulation } from '../../hooks/useMigrationSimulation'
import { StatusPill } from '../ui'
import { ArchitectureBoard } from '../shared/ArchitectureBoard'
import {
  ActivityFeed,
  MetricGrid,
  PageHeader,
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
  SectionCard,
} from '../shared/SectionCard'

function statusTone(status: AppStatus): 'ok' | 'info' | 'warn' | 'idle' {
  switch (status) {
    case 'MIGRATED':
    case 'RETIRED':
      return 'ok'
    case 'MIGRATING':
    case 'CUTOVER':
      return 'info'
    case 'RETAINED':
      return 'warn'
    default:
      return 'idle'
  }
}

export function MigrationDashboard() {
  const { model, stats, visibleApps, startNextWave, setFilter, reset } = useMigrationSimulation()
  const wavesRemaining = model.nextWave <= TOTAL_WAVES

  return (
    <div className="space-y-4">
      <PageHeader
        crumb="Cloud Migration"
        title="Migration Hub dashboard"
        description="Las 7 R de migración a AWS con ejecución por olas. Simulación local, no se migra ningún servidor real."
        right={
          <>
            <span className="rounded-md border border-slate-700 bg-[#111b2b] px-3 py-2 text-slate-400">
              Home region: <span className="font-mono text-slate-200">us-east-1</span>
            </span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-2 font-semibold text-slate-300 hover:border-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </>
        }
      />

      <ArchitectureBoard view="migration" />

      <MetricGrid
        cards={[
          { label: 'Applications', value: String(stats.totalApps), hint: 'Discovered and assessed' },
          { label: 'Servers', value: String(stats.totalServers), hint: `${stats.migratedServers} migrated or retired` },
          { label: 'Migration progress', value: `${stats.percent}%`, hint: 'By servers' },
          { label: 'In flight', value: String(stats.inFlight), hint: 'Replicating or in cutover' },
          { label: 'Waves completed', value: `${stats.wavesDone}/${TOTAL_WAVES}`, hint: 'Migration Hub plan' },
          {
            label: 'Est. monthly savings',
            value: `$${stats.monthlySavings.toLocaleString('en-US')}`,
            hint: 'Illustrative TCO estimate',
          },
        ]}
      />

      <SectionCard
        icon={<Route className="h-5 w-5" />}
        eyebrow="AWS migration journey"
        title="Assess, Mobilize, Migrate and Modernize"
      >
        <ol className="flex flex-wrap items-stretch gap-2 p-4">
          {MIGRATION_PHASES.map((phase, index) => (
            <li key={phase.id} className="flex flex-1 items-center gap-2">
              <div className="flex-1 rounded-md border border-slate-700 bg-[#0d1728] p-3">
                <p className="text-xs font-semibold text-white">
                  <span className="mr-2 font-mono text-[10px] text-slate-500">0{index + 1}</span>
                  {phase.name}
                </p>
                <p className="text-[11px] text-slate-400">{phase.detail}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {phase.services.map((service) => (
                    <span key={service} className="rounded border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              {index < MIGRATION_PHASES.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-slate-600" />}
            </li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard
        icon={<Layers className="h-5 w-5" />}
        iconTone="bg-sky-500/15 text-sky-300"
        eyebrow="Migration strategies"
        title="Las 7 R de migración"
        right={
          model.filter ? (
            <SecondaryButton onClick={() => setFilter(null)}>Clear filter</SecondaryButton>
          ) : (
            <span className="text-[11px] text-slate-500">Selecciona una R para filtrar el portafolio</span>
          )
        }
      >
        <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {STRATEGIES.map((strategy) => {
            const active = model.filter === strategy.id
            return (
              <button
                key={strategy.id}
                type="button"
                onClick={() => setFilter(strategy.id)}
                aria-pressed={active}
                className={`flex flex-col rounded-md border bg-[#0d1728] p-3 text-left transition ${
                  active ? 'border-[#ff9900]' : 'border-slate-800 hover:border-slate-600'
                }`}
                style={{ borderTopColor: strategy.color, borderTopWidth: 2 }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">{strategy.name}</p>
                  <span className="font-mono text-[10px] text-slate-400">{stats.counts[strategy.id]}</span>
                </div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: strategy.color }}>
                  {strategy.alias}
                </p>
                <p className="mt-1 flex-1 text-[11px] leading-snug text-slate-400">{strategy.description}</p>
                <p className="mt-2 text-[10px] text-slate-500">
                  Esfuerzo: <span className="text-slate-300">{strategy.effort}</span>
                </p>
                <ul className="mt-1 space-y-0.5 text-[10px] text-slate-300">
                  {strategy.awsServices.slice(0, 3).map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <SectionCard
          icon={<Boxes className="h-5 w-5" />}
          iconTone="bg-emerald-500/15 text-emerald-300"
          eyebrow="Application portfolio"
          title={model.filter ? `Applications: ${getStrategy(model.filter).name}` : 'All applications'}
          right={
            <PrimaryButton onClick={startNextWave} disabled={!wavesRemaining || stats.inFlight > 0}>
              {stats.inFlight > 0 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {wavesRemaining ? `Start wave ${model.nextWave}` : 'All waves completed'}
            </PrimaryButton>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#0b111c] text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Application</th>
                  <th className="px-3 py-2 font-medium">Strategy</th>
                  <th className="px-3 py-2 font-medium">Target</th>
                  <th className="px-3 py-2 font-medium">Wave</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {visibleApps.map((app) => {
                  const strategy = getStrategy(app.strategy)
                  return (
                    <tr key={app.id} className="bg-[#0d1728]">
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-100">{app.name}</p>
                        <p className="text-slate-500">
                          {app.servers} server{app.servers > 1 ? 's' : ''} | DB: {app.database}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="rounded px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${strategy.color}22`, color: strategy.color }}
                        >
                          {strategy.name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-300">{app.target}</td>
                      <td className="px-3 py-2 font-mono text-slate-300">W{app.wave}</td>
                      <td className="px-3 py-2">
                        <StatusPill tone={statusTone(app.status)}>{app.status}</StatusPill>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <ProgressBar
                              value={app.progress}
                              tone={app.status === 'MIGRATED' || app.status === 'RETIRED' ? 'bg-emerald-400' : 'bg-sky-400'}
                            />
                          </div>
                          <span className="font-mono text-slate-300">{Math.round(app.progress)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard icon={<Layers className="h-5 w-5" />} iconTone="bg-violet-500/15 text-violet-300" eyebrow="Wave plan" title="Migration waves">
            <ol className="space-y-2 p-4">
              {Array.from({ length: TOTAL_WAVES }, (_, index) => index + 1).map((wave) => {
                const apps = model.apps.filter((app) => app.wave === wave)
                const done = apps.every((app) => app.status === 'MIGRATED' || app.status === 'RETIRED' || app.status === 'RETAINED')
                const running = apps.some((app) => app.status === 'MIGRATING' || app.status === 'CUTOVER')
                const tone = done ? 'ok' : running ? 'info' : wave === model.nextWave ? 'warn' : 'idle'
                return (
                  <li key={wave} className="rounded-md border border-slate-800 bg-[#0d1728] px-3 py-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white">Wave {wave}</p>
                      <StatusPill tone={tone}>{done ? 'COMPLETED' : running ? 'IN PROGRESS' : wave === model.nextWave ? 'NEXT' : 'PLANNED'}</StatusPill>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {apps.map((app) => app.name).join(', ')}
                    </p>
                  </li>
                )
              })}
            </ol>
          </SectionCard>
          <ActivityFeed title="Migration activity" entries={model.feed} />
        </div>
      </div>
    </div>
  )
}
