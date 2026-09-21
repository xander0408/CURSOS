import { motion } from 'framer-motion'
import { CalendarClock, Copy, Database, Loader2, Lock, Play, RotateCcw, Vault } from 'lucide-react'
import { useState } from 'react'
import { BACKUP_PLANS, BACKUP_VAULTS, PROTECTED_RESOURCES } from '../../data/backup'
import type { BackupSimulationApi } from '../../hooks/useBackupSimulation'
import type { BackupJob } from '../../types/backup'
import { StatusPill } from '../ui'

interface AwsBackupPanelProps {
  api: BackupSimulationApi
}

function jobTone(job: BackupJob): 'ok' | 'info' | 'crit' {
  if (job.status === 'COMPLETED') {
    return 'ok'
  }
  if (job.status === 'FAILED') {
    return 'crit'
  }
  return 'info'
}

export function AwsBackupPanel({ api }: AwsBackupPanelProps) {
  const { model, runOnDemandBackup, restoreFromJob } = api
  const [resourceId, setResourceId] = useState(PROTECTED_RESOURCES[0]?.id ?? '')

  return (
    <section className="rounded-lg border border-slate-700 bg-[#111b2e]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ff9900]/15 text-[#ffb84d]">
            <Vault className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">AWS Backup</p>
            <h2 className="text-sm font-semibold text-white">Centralized backup plans, vaults and jobs</h2>
          </div>
        </div>
        <StatusPill tone="ok">POLICY COMPLIANT</StatusPill>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Backup plans</p>
            <ul className="space-y-2">
              {BACKUP_PLANS.map((plan) => (
                <li key={plan.id} className="rounded-md border border-slate-700 bg-[#0d1728] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-white">{plan.name}</p>
                    <span className="font-mono text-[10px] text-slate-400">{plan.resources} resources</span>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                    <dt className="text-slate-500">Schedule</dt>
                    <dd className="flex items-center gap-1 text-slate-200">
                      <CalendarClock className="h-3 w-3 text-slate-500" />
                      {plan.schedule}
                    </dd>
                    <dt className="text-slate-500">Retention</dt>
                    <dd className="text-slate-200">{plan.retention}</dd>
                    <dt className="text-slate-500">Cold storage</dt>
                    <dd className="text-slate-200">{plan.coldStorageAfter}</dd>
                    <dt className="text-slate-500">Vault</dt>
                    <dd className="font-mono text-slate-200">{plan.vault}</dd>
                    <dt className="text-slate-500">Copy</dt>
                    <dd className="text-slate-200">{plan.copyTo}</dd>
                  </dl>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Backup vaults</p>
            <ul className="space-y-1.5">
              {BACKUP_VAULTS.map((vault) => (
                <li
                  key={vault.id}
                  className="flex items-center justify-between rounded-md border border-slate-800 bg-[#0d1728] px-3 py-2 text-[11px]"
                >
                  <div>
                    <p className="flex items-center gap-1.5 font-mono text-slate-100">
                      {vault.name}
                      {vault.vaultLock && <Lock className="h-3 w-3 text-amber-300" aria-label="Vault Lock enabled" />}
                    </p>
                    <p className="text-slate-500">
                      {vault.region} | {vault.encryption}
                    </p>
                  </div>
                  <span className="font-mono text-slate-300">{vault.recoveryPoints} RP</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Backup jobs</p>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="resource" className="sr-only">
                Resource
              </label>
              <select
                id="resource"
                value={resourceId}
                onChange={(event) => setResourceId(event.target.value)}
                className="rounded-md border border-slate-600 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
              >
                {PROTECTED_RESOURCES.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} ({resource.type})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => runOnDemandBackup(resourceId)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#ff9900] bg-[#ff9900] px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-[#ffb84d]"
              >
                <Play className="h-3.5 w-3.5" />
                Create on-demand backup
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-slate-800">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#0b111c] text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Job</th>
                  <th className="px-3 py-2 font-medium">Resource</th>
                  <th className="px-3 py-2 font-medium">Vault</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Progress</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {model.jobs.map((job) => (
                  <tr key={job.id} className="bg-[#0d1728]">
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 text-slate-200">
                        {job.kind === 'RESTORE' ? (
                          <RotateCcw className="h-3 w-3 text-sky-300" />
                        ) : job.kind === 'COPY' ? (
                          <Copy className="h-3 w-3 text-violet-300" />
                        ) : (
                          <Database className="h-3 w-3 text-[#ffb84d]" />
                        )}
                        {job.kind}
                      </span>
                      <p className="font-mono text-[10px] text-slate-500">{job.startedAt}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-mono text-slate-100">{job.resource}</p>
                      <p className="text-slate-500">
                        {job.resourceType} | {job.sizeGb} GB | {job.plan}
                      </p>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-300">{job.vault}</td>
                    <td className="px-3 py-2">
                      <StatusPill tone={jobTone(job)}>
                        {job.status === 'RUNNING' ? (
                          <span className="inline-flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            RUNNING
                          </span>
                        ) : (
                          job.status
                        )}
                      </StatusPill>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                          <motion.div
                            className={`h-full ${job.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-sky-400'}`}
                            animate={{ width: `${job.progress}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                        <span className="font-mono text-slate-300">{Math.round(job.progress)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => restoreFromJob(job.id)}
                        disabled={job.status !== 'COMPLETED' || job.kind === 'RESTORE'}
                        className="rounded-md border border-slate-600 px-2 py-1 text-[11px] font-medium text-slate-200 enabled:hover:border-sky-400 disabled:opacity-30"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            Los jobs se ejecutan de forma automática según el plan. Los restores crean un nuevo recurso a partir del recovery point (simulado).
          </p>
        </div>
      </div>
    </section>
  )
}
