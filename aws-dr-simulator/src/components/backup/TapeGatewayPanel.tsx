import { motion } from 'framer-motion'
import { Archive, ArchiveRestore, Disc3, Loader2, Plus } from 'lucide-react'
import type { BackupSimulationApi } from '../../hooks/useBackupSimulation'
import type { VirtualTape } from '../../types/backup'
import { MetaRow, StatusPill } from '../ui'

interface TapeGatewayPanelProps {
  api: BackupSimulationApi
}

function tapeTone(tape: VirtualTape): 'ok' | 'info' | 'idle' | 'warn' {
  switch (tape.status) {
    case 'IN_USE':
      return 'ok'
    case 'AVAILABLE':
      return 'info'
    case 'ARCHIVING':
    case 'RETRIEVING':
      return 'warn'
    default:
      return 'idle'
  }
}

function poolLabel(pool: VirtualTape['pool']): string {
  return pool === 'DEEP_ARCHIVE' ? 'Deep Archive pool' : 'Glacier Flexible pool'
}

function TapeCard({ tape, api }: { tape: VirtualTape; api: BackupSimulationApi }) {
  const busy = tape.status === 'ARCHIVING' || tape.status === 'RETRIEVING'
  const used = Math.round((tape.usedGb / tape.sizeGb) * 100)
  return (
    <li className="rounded-md border border-slate-800 bg-[#0d1728] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc3 className={`h-4 w-4 ${busy ? 'animate-spin text-amber-300' : 'text-slate-500'}`} />
          <p className="font-mono text-xs text-slate-100">{tape.barcode}</p>
        </div>
        <StatusPill tone={tapeTone(tape)}>{tape.status.replace('_', ' ')}</StatusPill>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        LTO-6 virtual | {tape.sizeGb / 1000} TB | {poolLabel(tape.pool)} | created {tape.created}
      </p>
      <div className="mt-2">
        <div className="flex justify-between font-mono text-[10px] text-slate-400">
          <span>{busy ? (tape.status === 'ARCHIVING' ? 'Archiving' : 'Retrieving') : 'Used'}</span>
          <span>{busy ? `${Math.round(tape.progress)}%` : `${used}%`}</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className={`h-full ${busy ? 'bg-amber-400' : 'bg-sky-400'}`}
            animate={{ width: `${busy ? tape.progress : used}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => api.archiveTape(tape.barcode)}
          disabled={tape.status !== 'AVAILABLE' && tape.status !== 'IN_USE'}
          className="inline-flex items-center gap-1 rounded-md border border-slate-600 px-2 py-1 text-[11px] font-medium text-slate-200 enabled:hover:border-amber-400 disabled:opacity-30"
        >
          <Archive className="h-3 w-3" />
          Eject and archive
        </button>
        <button
          type="button"
          onClick={() => api.retrieveTape(tape.barcode)}
          disabled={tape.status !== 'ARCHIVED'}
          className="inline-flex items-center gap-1 rounded-md border border-slate-600 px-2 py-1 text-[11px] font-medium text-slate-200 enabled:hover:border-sky-400 disabled:opacity-30"
        >
          {tape.status === 'RETRIEVING' ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArchiveRestore className="h-3 w-3" />}
          Retrieve
        </button>
      </div>
    </li>
  )
}

export function TapeGatewayPanel({ api }: TapeGatewayPanelProps) {
  const { model, createTape } = api
  const library = model.tapes.filter((tape) => tape.status !== 'ARCHIVED')
  const shelf = model.tapes.filter((tape) => tape.status === 'ARCHIVED')
  const shelfGb = shelf.reduce((sum, tape) => sum + tape.usedGb, 0)

  return (
    <section className="rounded-lg border border-slate-700 bg-[#111b2e]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-rose-500/15 text-rose-300">
            <Disc3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              AWS Storage Gateway, Tape Gateway
            </p>
            <h2 className="text-sm font-semibold text-white">Virtual Tape Library (VTL) and Virtual Tape Shelf</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => createTape('GLACIER_FLEXIBLE')}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-sky-400"
          >
            <Plus className="h-3.5 w-3.5" />
            Tape (Glacier)
          </button>
          <button
            type="button"
            onClick={() => createTape('DEEP_ARCHIVE')}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-sky-400"
          >
            <Plus className="h-3.5 w-3.5" />
            Tape (Deep Archive)
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[240px_1fr_1fr]">
        <div>
          <MetaRow label="Gateway" value="sgw-magnatic-01" />
          <MetaRow label="Type" value="Tape Gateway (VTL)" />
          <MetaRow label="Backup software" value="Veeam / Commvault (iSCSI)" />
          <MetaRow label="Cache" value="2 TB local" />
          <MetaRow label="Tapes in library" value={String(library.length)} />
          <MetaRow label="Tapes on shelf" value={`${shelf.length} (${(shelfGb / 1000).toFixed(1)} TB)`} />
          <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
            La aplicación de backup escribe en cintas virtuales como si fuera una librería física. Al expulsar una cinta, pasa al Virtual Tape Shelf respaldado en S3 Glacier Flexible Retrieval o Deep Archive.
          </p>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Virtual Tape Library (gateway)
          </p>
          <ul className="space-y-2">
            {library.map((tape) => (
              <TapeCard key={tape.barcode} tape={tape} api={api} />
            ))}
            {library.length === 0 && <li className="text-[11px] text-slate-500">No tapes in the library.</li>}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Virtual Tape Shelf (S3 Glacier)
          </p>
          <ul className="space-y-2">
            {shelf.map((tape) => (
              <TapeCard key={tape.barcode} tape={tape} api={api} />
            ))}
            {shelf.length === 0 && <li className="text-[11px] text-slate-500">No archived tapes.</li>}
          </ul>
        </div>
      </div>
    </section>
  )
}
