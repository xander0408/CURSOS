import { Bug, KeyRound, RotateCcw, ShieldAlert, ShieldCheck, Siren } from 'lucide-react'
import { LAYERS, WAF_RULES, type FindingSeverity } from '../../data/security'
import { useSecuritySimulation } from '../../hooks/useSecuritySimulation'
import { StatusPill } from '../ui'
import {
  ActivityFeed,
  MetricGrid,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
} from '../shared/SectionCard'

function severityTone(severity: FindingSeverity): 'crit' | 'warn' | 'info' | 'idle' {
  if (severity === 'CRITICAL' || severity === 'HIGH') return 'crit'
  if (severity === 'MEDIUM') return 'warn'
  if (severity === 'LOW') return 'info'
  return 'idle'
}

export function SecurityDashboard() {
  const { model, stats, investigate, resolveFinding, enableKmsRotation, simulateAttack, reset } = useSecuritySimulation()
  const kmsFailed = model.controls.some((control) => control.id === 'FSBP-KMS.1' && control.status === 'FAILED')

  return (
    <div className="space-y-4">
      <PageHeader
        crumb="Seguridad AWS"
        title="Security Hub dashboard"
        description="GuardDuty, Inspector, WAF, KMS y controles de Foundational Security Best Practices. Simulación, sin cuentas reales."
        right={
          <>
            <span className="rounded-md border border-slate-700 bg-[#111b2b] px-3 py-2 text-slate-400">
              Aggregator: <span className="font-mono text-slate-200">us-east-1</span>
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
          { label: 'Security score', value: `${stats.score}%`, hint: `${stats.passed}/${stats.totalControls} controls` },
          { label: 'Open findings', value: String(stats.open), hint: `${stats.critical} critical` },
          { label: 'High severity', value: String(stats.high), hint: 'GuardDuty + Config' },
          { label: 'WAF blocked', value: model.wafBlocked.toLocaleString('en-US'), hint: 'Last 24h simulated' },
          { label: 'Shield mitigations', value: String(model.shieldMitigations), hint: 'AWS Shield Standard' },
          { label: 'KMS requests', value: model.kmsRequests.toLocaleString('en-US'), hint: 'Decrypt / GenerateDataKey' },
        ]}
      />

      <SectionCard
        icon={<ShieldCheck className="h-5 w-5" />}
        eyebrow="Defense in depth"
        title="AWS security layers"
        right={
          <PrimaryButton onClick={simulateAttack}>
            <Siren className="h-3.5 w-3.5" />
            Simulate threat
          </PrimaryButton>
        }
      >
        <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-6">
          {LAYERS.map((layer) => (
            <article key={layer.id} className="rounded-md border border-slate-800 bg-[#0d1728] p-3">
              <p className="text-xs font-semibold text-white">{layer.name}</p>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
                {layer.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <SectionCard
          icon={<ShieldAlert className="h-5 w-5" />}
          iconTone="bg-red-500/15 text-red-300"
          eyebrow="AWS Security Hub"
          title="Aggregated findings"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#0b111c] text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Finding</th>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Severity</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {model.findings.map((finding) => (
                  <tr key={finding.id} className={`bg-[#0d1728] ${model.investigating === finding.id ? 'outline outline-1 outline-sky-500/40' : ''}`}>
                    <td className="px-3 py-2 font-mono text-slate-300">{finding.id}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-100">{finding.title}</p>
                      <p className="text-slate-500">{finding.resource}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-300">{finding.product}</td>
                    <td className="px-3 py-2">
                      <StatusPill tone={severityTone(finding.severity)}>{finding.severity}</StatusPill>
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill tone={finding.status === 'RESOLVED' ? 'ok' : finding.status === 'NOTIFIED' ? 'info' : 'warn'}>
                        {finding.status}
                      </StatusPill>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <SecondaryButton onClick={() => investigate(finding.id)} disabled={finding.status === 'RESOLVED'}>
                          Investigate
                        </SecondaryButton>
                        <PrimaryButton onClick={() => resolveFinding(finding.id)} disabled={finding.status === 'RESOLVED'}>
                          Resolve
                        </PrimaryButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            icon={<KeyRound className="h-5 w-5" />}
            iconTone="bg-amber-500/15 text-amber-300"
            eyebrow="FSBP controls"
            title="Security Hub standards"
            right={
              kmsFailed ? (
                <PrimaryButton onClick={enableKmsRotation}>Enable KMS rotation</PrimaryButton>
              ) : null
            }
          >
            <ul className="divide-y divide-slate-800">
              {model.controls.map((control) => (
                <li key={control.id} className="flex items-center justify-between px-4 py-2 text-[11px]">
                  <div>
                    <p className="font-medium text-slate-100">{control.name}</p>
                    <p className="text-slate-500">
                      {control.id} · {control.service}
                    </p>
                  </div>
                  <StatusPill tone={control.status === 'PASSED' ? 'ok' : control.status === 'FAILED' ? 'crit' : 'warn'}>
                    {control.status}
                  </StatusPill>
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard icon={<Bug className="h-5 w-5" />} eyebrow="AWS WAF" title="Web ACL portal-edge">
            <ul className="space-y-2 p-4 text-[11px]">
              {WAF_RULES.map((rule) => (
                <li key={rule.id} className="flex items-center justify-between rounded-md border border-slate-800 bg-[#0d1728] px-3 py-2">
                  <span className="font-mono text-slate-300">{rule.id}</span>
                  <span className="text-slate-400">
                    {rule.action} · {rule.blocked.toLocaleString('en-US')}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
          <ActivityFeed title="Security activity" entries={model.feed} />
        </div>
      </div>
    </div>
  )
}
