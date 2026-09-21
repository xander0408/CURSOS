import { FileClock, History, Trash2, Undo2, Upload } from 'lucide-react'
import { getStorageClass } from '../../data/backup'
import type { BackupSimulationApi } from '../../hooks/useBackupSimulation'
import { MetaRow, StatusPill } from '../ui'

interface VersioningPanelProps {
  api: BackupSimulationApi
}

export function VersioningPanel({ api }: VersioningPanelProps) {
  const { model, uploadVersion, deleteObject, removeDeleteMarker, restoreVersion } = api
  const latest = model.versions[0]
  const deleted = latest?.deleteMarker === true

  return (
    <section className="rounded-lg border border-slate-700 bg-[#111b2e]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-violet-500/15 text-violet-300">
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">S3 Versioning</p>
            <h2 className="text-sm font-semibold text-white">Object versions and delete protection</h2>
          </div>
        </div>
        <StatusPill tone={deleted ? 'warn' : 'ok'}>{deleted ? 'DELETE MARKER' : 'CURRENT VERSION OK'}</StatusPill>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
        <div>
          <MetaRow label="Bucket" value="magnatic-backups-prod" />
          <MetaRow label="Object" value="finanzas/cierre-mensual.xlsx" />
          <MetaRow label="Versioning" value="Enabled" />
          <MetaRow label="MFA Delete" value="Enabled" />
          <MetaRow label="Object Lock" value="Compliance, 7 years" />
          <MetaRow label="Replication" value="CRR to us-west-2" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={uploadVersion}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#ff9900] bg-[#ff9900] px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-[#ffb84d]"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload new version
            </button>
            <button
              type="button"
              onClick={deleteObject}
              disabled={deleted}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-200 enabled:hover:bg-red-500/10 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete object
            </button>
            <button
              type="button"
              onClick={removeDeleteMarker}
              disabled={!deleted}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-100 enabled:hover:border-sky-400 disabled:opacity-40"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo delete
            </button>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
            Con versionado, un borrado solo agrega un delete marker. Las versiones anteriores permanecen y pueden restaurarse como objeto actual.
          </p>
        </div>

        <ul className="space-y-1.5">
          {model.versions.map((version) => {
            const cls = getStorageClass(version.storageClass)
            return (
              <li
                key={version.versionId}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-[11px] ${
                  version.isLatest ? 'border-sky-500/40 bg-sky-500/5' : 'border-slate-800 bg-[#0d1728]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileClock className={`h-4 w-4 ${version.deleteMarker ? 'text-amber-300' : 'text-slate-500'}`} />
                  <div>
                    <p className="font-mono text-slate-100">
                      {version.versionId}
                      {version.isLatest && <span className="ml-2 text-[10px] text-sky-300">current</span>}
                      {version.deleteMarker && <span className="ml-2 text-[10px] text-amber-300">delete marker</span>}
                    </p>
                    <p className="text-slate-500">
                      {version.modified} | {version.deleteMarker ? '0 KB' : `${version.sizeKb.toLocaleString()} KB`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!version.deleteMarker && (
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: `${cls.color}22`, color: cls.color }}
                    >
                      {cls.shortName}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => restoreVersion(version.versionId)}
                    disabled={version.isLatest || version.deleteMarker}
                    className="rounded-md border border-slate-600 px-2 py-1 font-medium text-slate-200 enabled:hover:border-sky-400 disabled:opacity-30"
                  >
                    Restore
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
