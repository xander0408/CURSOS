import { Brain, Database, Play, Rocket, RotateCcw, Sparkles, Workflow } from 'lucide-react'
import { AI_SERVICES, BEDROCK_MODELS, RAG_STEPS } from '../../data/ml'
import { useMlSimulation } from '../../hooks/useMlSimulation'
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

export function MlDashboard() {
  const { model, stats, startTraining, deployEndpoint, runRag, selectModel, reset } = useMlSimulation()

  return (
    <div className="space-y-4">
      <PageHeader
        crumb="Machine Learning e IA"
        title="SageMaker and Bedrock console"
        description="Entrenamiento, endpoints, modelos fundacionales y servicios de IA de AWS. Simulación local, sin llamadas reales."
        right={
          <>
            <span className="rounded-md border border-slate-700 bg-[#111b2b] px-3 py-2 text-slate-400">
              Domain: <span className="font-mono text-slate-200">magnatic-ml-demo</span>
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

      <ArchitectureBoard view="ml" />

      <MetricGrid
        cards={[
          { label: 'Training jobs', value: String(model.jobs.length), hint: `${stats.running} running` },
          { label: 'Endpoints', value: String(stats.endpoints), hint: 'SageMaker real-time' },
          { label: 'Bedrock tokens', value: stats.tokens.toLocaleString('en-US'), hint: 'Simulated usage' },
          { label: 'p50 latency', value: `${stats.latencyMs} ms`, hint: 'Claude 3.5 Sonnet' },
          { label: 'Completed models', value: String(stats.completed), hint: 'Artifacts in S3' },
          { label: 'AI services', value: String(AI_SERVICES.length), hint: 'Rekognition to Forecast' },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={<Brain className="h-5 w-5" />}
          eyebrow="Amazon SageMaker"
          title="Training jobs"
          right={<PrimaryButton onClick={startTraining}><Play className="h-3.5 w-3.5" />Start training</PrimaryButton>}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#0b111c] text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Job</th>
                  <th className="px-3 py-2 font-medium">Instance</th>
                  <th className="px-3 py-2 font-medium">Framework</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {model.jobs.map((job) => (
                  <tr key={job.id} className="bg-[#0d1728]">
                    <td className="px-3 py-2 font-medium text-slate-100">{job.name}</td>
                    <td className="px-3 py-2 font-mono text-slate-300">{job.instance}</td>
                    <td className="px-3 py-2 text-slate-300">{job.framework}</td>
                    <td className="px-3 py-2">
                      <StatusPill tone={job.status === 'COMPLETED' ? 'ok' : job.status === 'RUNNING' ? 'info' : 'idle'}>
                        {job.status}
                      </StatusPill>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <ProgressBar value={job.progress} tone={job.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-violet-400'} />
                        </div>
                        <span className="font-mono text-slate-300">
                          {Math.round(job.progress)}%{job.accuracy ? ` · ${(job.accuracy * 100).toFixed(1)}% acc` : ''}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          icon={<Rocket className="h-5 w-5" />}
          iconTone="bg-emerald-500/15 text-emerald-300"
          eyebrow="Inference"
          title="SageMaker endpoints"
          right={<SecondaryButton onClick={deployEndpoint}>Deploy latest model</SecondaryButton>}
        >
          <ul className="divide-y divide-slate-800">
            {model.endpoints.map((endpoint) => (
              <li key={endpoint.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-white">{endpoint.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {endpoint.instance} · variant {endpoint.variant}
                  </p>
                </div>
                <div className="text-right">
                  <StatusPill tone="ok">{endpoint.status}</StatusPill>
                  <p className="mt-1 font-mono text-[11px] text-slate-300">{endpoint.invocations.toLocaleString('en-US')} inv/h</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        icon={<Sparkles className="h-5 w-5" />}
        iconTone="bg-violet-500/15 text-violet-300"
        eyebrow="Amazon Bedrock"
        title="Foundation models"
      >
        <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-5">
          {BEDROCK_MODELS.map((item) => {
            const active = model.selectedModel === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectModel(item.id)}
                className={`rounded-md border p-3 text-left ${active ? 'border-[#ff9900] bg-[#182334]' : 'border-slate-800 bg-[#0d1728] hover:border-slate-600'}`}
              >
                <p className="text-xs font-semibold text-white">{item.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-violet-300">{item.provider}</p>
                <p className="mt-1 text-[11px] text-slate-400">{item.useCase}</p>
                <p className="mt-2 text-[10px] text-slate-500">{item.modality}</p>
              </button>
            )
          })}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <SectionCard
            icon={<Workflow className="h-5 w-5" />}
            iconTone="bg-sky-500/15 text-sky-300"
            eyebrow="Bedrock Knowledge Bases"
            title="RAG pipeline"
            right={
              <PrimaryButton onClick={runRag} disabled={model.ragRunning}>
                <Play className="h-3.5 w-3.5" />
                Run RAG query
              </PrimaryButton>
            }
          >
            <ol className="flex flex-wrap items-stretch gap-2 p-4">
              {RAG_STEPS.map((step, index) => {
                const done = model.ragStep > index
                const current = model.ragStep === index
                return (
                  <li key={step.id} className="flex-1 min-w-[120px] rounded-md border border-slate-800 bg-[#0d1728] p-3">
                    <p className="text-[10px] font-mono text-slate-500">0{index + 1}</p>
                    <p className="text-xs font-semibold text-white">{step.label}</p>
                    <p className="text-[11px] text-slate-400">{step.detail}</p>
                    <StatusPill tone={done ? 'ok' : current ? 'info' : 'idle'}>
                      {done ? 'DONE' : current ? 'RUNNING' : 'PENDING'}
                    </StatusPill>
                  </li>
                )
              })}
            </ol>
          </SectionCard>

          <SectionCard icon={<Database className="h-5 w-5" />} eyebrow="AI services" title="Pre-trained AWS AI APIs">
            <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
              {AI_SERVICES.map((service) => (
                <div key={service.id} className="rounded-md border border-slate-800 bg-[#0d1728] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{service.category}</p>
                  <p className="text-xs font-semibold text-white">{service.name}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{service.description}</p>
                  <p className="mt-2 font-mono text-sm text-sky-200">
                    {(model.counters[service.id] ?? 0).toLocaleString('en-US')}
                    <span className="ml-1 text-[10px] text-slate-500">{service.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
        <ActivityFeed title="ML activity" entries={model.feed} />
      </div>
    </div>
  )
}
