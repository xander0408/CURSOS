import { Activity, Database, Play, RotateCcw, Server, Shield, Split } from 'lucide-react'
import { HA_SCENARIOS } from '../../data/ha'
import type { NodeHealth } from '../../data/ha'
import { useHaSimulation } from '../../hooks/useHaSimulation'
import { ArchitectureBoard } from '../shared/ArchitectureBoard'
import {
  ActivityFeed,
  MetricGrid,
  PageHeader,
  PrimaryButton,
  ProgressBar,
  SectionCard,
} from '../shared/SectionCard'
import { StatusPill } from '../ui'

function healthTone(health: NodeHealth): 'ok' | 'warn' | 'crit' | 'info' | 'idle' {
  switch (health) {
    case 'healthy':
      return 'ok'
    case 'standby':
      return 'info'
    case 'impaired':
    case 'recovering':
      return 'warn'
    case 'failed':
      return 'crit'
    default:
      return 'idle'
  }
}

function NodeCard({
  label,
  subtitle,
  health,
}: {
  label: string
  subtitle: string
  health: NodeHealth
}) {
  const border =
    health === 'failed'
      ? 'border-red-500/60 bg-red-950/40'
      : health === 'impaired' || health === 'recovering'
        ? 'border-amber-500/50 bg-amber-950/30'
        : health === 'standby'
          ? 'border-sky-500/40 bg-sky-950/20'
          : 'border-emerald-500/35 bg-emerald-950/20'

  return (
    <div className={`rounded-md border px-3 py-2 ${border}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{subtitle}</p>
      <p className="text-xs font-semibold text-white">{label}</p>
      <div className="mt-1">
        <StatusPill tone={healthTone(health)} pulse={health === 'failed'}>
          {health.toUpperCase()}
        </StatusPill>
      </div>
    </div>
  )
}

export function HaDashboard() {
  const { model, stats, setScenario, start, reset } = useHaSimulation()

  return (
    <div className="space-y-4">
      <PageHeader
        crumb="Alta disponibilidad"
        title="Multi-AZ high availability"
        description="WAF, ALB, Auto Scaling y RDS Multi-AZ. Simula fallo de AZ, de instancia o failover de base de datos. No se toca ninguna cuenta AWS."
        right={
          <>
            <span className="rounded-md border border-slate-700 bg-[#111b2b] px-3 py-2 text-slate-400">
              VPC: <span className="font-mono text-slate-200">vpc-0magnatic</span>
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

      <ArchitectureBoard view="ha" />

      <MetricGrid
        cards={[
          { label: 'Healthy AZs', value: `${stats.healthyAz}/2`, hint: 'us-east-1a / us-east-1b' },
          { label: 'ASG healthy', value: `${model.asgHealthy}/${model.asgDesired}`, hint: 'portal-asg' },
          { label: 'RDS writer', value: stats.rdsWriter, hint: `Standby ${stats.rdsStandby}` },
          { label: 'Requests / min', value: model.requestsPerMin.toLocaleString('en-US'), hint: 'Through ALB' },
          { label: 'Error rate', value: `${model.errorRate.toFixed(1)}%`, hint: '5xx from targets' },
          { label: 'WAF blocked', value: model.wafBlocked.toLocaleString('en-US'), hint: 'AWS WAF web ACL' },
        ]}
      />

      <SectionCard
        icon={<Split className="h-5 w-5" />}
        eyebrow="Failure injection"
        title="Simular un evento de disponibilidad"
        right={
          <PrimaryButton onClick={start} disabled={model.running}>
            <Play className="h-3.5 w-3.5" />
            {model.running ? 'Failover in progress' : 'Simulate failure'}
          </PrimaryButton>
        }
      >
        <div className="grid gap-2 p-4 md:grid-cols-3">
          {HA_SCENARIOS.map((scenario) => {
            const active = model.scenario === scenario.id
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setScenario(scenario.id)}
                disabled={model.running}
                className={`rounded-md border p-3 text-left disabled:opacity-60 ${
                  active ? 'border-[#ff9900] bg-[#182334]' : 'border-slate-800 bg-[#0d1728] hover:border-slate-600'
                }`}
              >
                <p className="text-xs font-semibold text-white">{scenario.name}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">{scenario.detail}</p>
              </button>
            )
          })}
        </div>
        {(model.running || model.phase !== 'HEALTHY') && (
          <div className="border-t border-slate-800 px-4 py-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Automation: {model.phase}</span>
              <span className="font-mono">{Math.round(model.progress)}%</span>
            </div>
            <ProgressBar
              value={model.progress}
              tone={model.phase === 'RESTORED' ? 'bg-emerald-400' : model.phase === 'INCIDENT' ? 'bg-red-400' : 'bg-[#ff9900]'}
            />
          </div>
        )}
      </SectionCard>

      <SectionCard
        icon={<Activity className="h-5 w-5" />}
        iconTone="bg-emerald-500/15 text-emerald-300"
        eyebrow="Live topology"
        title="AWS Cloud / Region us-east-1"
      >
        <div className="space-y-3 p-4">
          <div className="flex justify-center">
            <NodeCard label="AWS WAF" subtitle="Edge" health="healthy" />
          </div>
          <div className="rounded-lg border border-sky-500/30 bg-[#0b1524] p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">VPC · two Availability Zones</p>
            <div className="mb-3 flex justify-center">
              <NodeCard label="Elastic Load Balancing" subtitle="ALB portal-alb" health={model.alb} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className={`space-y-2 rounded-md border p-3 ${model.azA === 'failed' ? 'border-red-500/40' : 'border-slate-700'}`}>
                <p className="text-[11px] font-semibold text-slate-300">Availability Zone us-east-1a</p>
                <NodeCard label="EC2 instance" subtitle="Auto Scaling group" health={model.instanceA} />
                <NodeCard
                  label={model.rdsPrimaryAz === 'a' ? 'Amazon RDS (writer)' : 'RDS Standby'}
                  subtitle="db.portal"
                  health={model.rdsFailing && model.rdsPrimaryAz === 'a' ? 'failed' : model.rdsPrimaryAz === 'a' ? 'healthy' : 'standby'}
                />
              </div>
              <div className={`space-y-2 rounded-md border p-3 ${model.azB === 'failed' ? 'border-red-500/40' : 'border-slate-700'}`}>
                <p className="text-[11px] font-semibold text-slate-300">Availability Zone us-east-1b</p>
                <NodeCard label="EC2 instance" subtitle="Auto Scaling group" health={model.instanceB} />
                <NodeCard
                  label={model.rdsPrimaryAz === 'b' ? 'Amazon RDS (writer)' : 'RDS Standby'}
                  subtitle="db.portal"
                  health={model.rdsFailing && model.rdsPrimaryAz === 'b' ? 'failed' : model.rdsPrimaryAz === 'b' ? 'healthy' : 'standby'}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md border border-slate-800 bg-[#0d1728] px-3 py-2 text-center">
              <Shield className="mx-auto h-4 w-4 text-pink-300" />
              <p className="mt-1 text-[11px] text-slate-300">Amazon CloudWatch</p>
            </div>
            <div className="rounded-md border border-slate-800 bg-[#0d1728] px-3 py-2 text-center">
              <Server className="mx-auto h-4 w-4 text-emerald-300" />
              <p className="mt-1 text-[11px] text-slate-300">AWS Backup</p>
            </div>
            <div className="rounded-md border border-slate-800 bg-[#0d1728] px-3 py-2 text-center">
              <Database className="mx-auto h-4 w-4 text-green-300" />
              <p className="mt-1 text-[11px] text-slate-300">Amazon S3</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <ActivityFeed title="Availability activity" entries={model.feed} />
    </div>
  )
}
