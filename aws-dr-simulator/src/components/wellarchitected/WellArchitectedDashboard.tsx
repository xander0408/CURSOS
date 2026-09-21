import { CheckCircle2, ClipboardList, RotateCcw, Shield, Sparkles } from 'lucide-react'
import { PILLARS, WORKLOADS, getPillar, type FindingSeverity, type PillarId } from '../../data/wellarchitected'
import { useWellArchitectedSimulation } from '../../hooks/useWellArchitectedSimulation'
import { StatusPill } from '../ui'
import {
  ActivityFeed,
  MetricGrid,
  PageHeader,
  PrimaryButton,
  ProgressBar,
  SectionCard,
} from '../shared/SectionCard'

function riskTone(risk: FindingSeverity): 'crit' | 'warn' | 'idle' {
  if (risk === 'HIGH') return 'crit'
  if (risk === 'MEDIUM') return 'warn'
  return 'idle'
}

function scoreTone(score: number): string {
  if (score >= 80) return 'bg-emerald-400'
  if (score >= 65) return 'bg-sky-400'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-red-400'
}

export function WellArchitectedDashboard() {
  const { model, stats, startReview, remediate, selectWorkload, reset } = useWellArchitectedSimulation()
  const workload = WORKLOADS.find((item) => item.id === model.selectedWorkload) ?? WORKLOADS[0]!

  return (
    <div className="space-y-4">
      <PageHeader
        crumb="Well-Architected"
        title="Well-Architected Tool"
        description="Seis pilares de AWS Well-Architected aplicados a workloads simulados. No se crea ninguna review real."
        right={
          <>
            <span className="rounded-md border border-slate-700 bg-[#111b2b] px-3 py-2 text-slate-400">
              Lenses: <span className="font-mono text-slate-200">WA Framework 2024</span>
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

      <MetricGrid
        cards={[
          { label: 'Workloads', value: String(WORKLOADS.length), hint: 'Registered in the tool' },
          { label: 'Overall score', value: `${stats.overall}/100`, hint: workload.name },
          { label: 'High-risk issues', value: String(stats.openHigh), hint: 'Open in current review' },
          { label: 'Open findings', value: String(stats.open), hint: `${stats.resolved} remediated` },
          { label: 'Pillars', value: '6', hint: 'Including Sustainability' },
          { label: 'Environment', value: workload.environment, hint: workload.type },
        ]}
      />

      <SectionCard
        icon={<ClipboardList className="h-5 w-5" />}
        eyebrow="Workloads"
        title="Select a workload to review"
      >
        <div className="grid gap-2 p-4 md:grid-cols-3">
          {WORKLOADS.map((item) => {
            const active = item.id === model.selectedWorkload
            const avg = Math.round(PILLARS.reduce((sum, pillar) => sum + (model.scores[item.id]?.[pillar.id] ?? 0), 0) / 6)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectWorkload(item.id)}
                className={`rounded-md border p-3 text-left ${active ? 'border-[#ff9900] bg-[#182334]' : 'border-slate-800 bg-[#0d1728] hover:border-slate-600'}`}
              >
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="text-[11px] text-slate-400">
                  {item.type} · {item.environment}
                </p>
                <p className="mt-2 font-mono text-lg text-white">{avg}</p>
                <p className="text-[10px] text-slate-500">Composite score</p>
              </button>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard
        icon={<Shield className="h-5 w-5" />}
        iconTone="bg-emerald-500/15 text-emerald-300"
        eyebrow="AWS Well-Architected Framework"
        title="Six pillars"
        right={
          model.reviewing ? (
            <span className="text-[11px] text-sky-300">Review in progress: {getPillar(model.reviewing).shortName}</span>
          ) : null
        }
      >
        <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-6">
          {PILLARS.map((pillar) => {
            const score = stats.scores[pillar.id]
            const reviewing = model.reviewing === pillar.id
            return (
              <article key={pillar.id} className="flex flex-col rounded-md border border-slate-800 bg-[#0d1728] p-3" style={{ borderTopColor: pillar.color, borderTopWidth: 2 }}>
                <p className="text-xs font-semibold text-white">{pillar.name}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">{pillar.description}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Score</span>
                    <span className="font-mono text-slate-200">{score}</span>
                  </div>
                  <ProgressBar value={score} tone={scoreTone(score)} />
                </div>
                {reviewing ? (
                  <div className="mt-3">
                    <ProgressBar value={model.reviewProgress} tone="bg-[#ff9900]" />
                    <p className="mt-1 text-[10px] text-slate-500">Saving milestone… {Math.round(model.reviewProgress)}%</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startReview(pillar.id as PillarId)}
                    disabled={model.reviewing !== null}
                    className="mt-3 rounded-md border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200 enabled:hover:border-[#ff9900] disabled:opacity-40"
                  >
                    Start pillar review
                  </button>
                )}
              </article>
            )
          })}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <SectionCard
          icon={<Sparkles className="h-5 w-5" />}
          iconTone="bg-amber-500/15 text-amber-300"
          eyebrow="Improvement plan"
          title="Risks and recommendations"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#0b111c] text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Finding</th>
                  <th className="px-3 py-2 font-medium">Pillar</th>
                  <th className="px-3 py-2 font-medium">Risk</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {model.findings.map((finding) => (
                  <tr key={finding.id} className="bg-[#0d1728]">
                    <td className="px-3 py-2 font-mono text-slate-300">{finding.id}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-100">{finding.title}</p>
                      <p className="text-slate-500">{finding.recommendation}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-300">{getPillar(finding.pillar).shortName}</td>
                    <td className="px-3 py-2">
                      <StatusPill tone={riskTone(finding.risk)}>{finding.risk}</StatusPill>
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill tone={finding.status === 'RESOLVED' ? 'ok' : finding.status === 'IN_PROGRESS' ? 'info' : 'idle'}>
                        {finding.status}
                      </StatusPill>
                    </td>
                    <td className="px-3 py-2">
                      {finding.status === 'RESOLVED' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Done
                        </span>
                      ) : (
                        <PrimaryButton onClick={() => remediate(finding.id)}>Remediate</PrimaryButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <div className="space-y-4">
          <SectionCard icon={<Shield className="h-5 w-5" />} eyebrow="AWS services per pillar" title="Mapped services">
            <ul className="space-y-2 p-4 text-[11px]">
              {PILLARS.map((pillar) => (
                <li key={pillar.id}>
                  <p className="font-semibold text-slate-200">{pillar.name}</p>
                  <p className="text-slate-400">{pillar.services.join(' · ')}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
          <ActivityFeed title="Review activity" entries={model.feed} />
        </div>
      </div>
    </div>
  )
}
