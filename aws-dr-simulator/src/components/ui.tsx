import type { ReactNode } from 'react'

interface InfoTipProps {
  label: string
  children: ReactNode
}

export function InfoTip({ label, children }: InfoTipProps) {
  return (
    <span className="relative inline-flex items-center gap-1">
      <span>{children}</span>
      <button
        type="button"
        className="group relative inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-500 text-[10px] text-slate-300 hover:border-sky-400 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        aria-label={label}
      >
        ?
        <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-64 -translate-x-1/2 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-left text-xs font-normal leading-relaxed text-slate-200 shadow-xl group-hover:block group-focus:block">
          {label}
        </span>
      </button>
    </span>
  )
}

interface StatusPillProps {
  tone: 'ok' | 'warn' | 'crit' | 'info' | 'idle'
  children: ReactNode
  pulse?: boolean
}

const TONE: Record<StatusPillProps['tone'], string> = {
  ok: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  warn: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  crit: 'bg-red-500/15 text-red-300 border-red-500/40',
  info: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  idle: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
}

const DOT: Record<StatusPillProps['tone'], string> = {
  ok: 'bg-emerald-400',
  warn: 'bg-amber-400',
  crit: 'bg-red-400',
  info: 'bg-sky-400',
  idle: 'bg-slate-400',
}

export function StatusPill({ tone, children, pulse }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${TONE[tone]} ${pulse ? 'pulse-crit' : ''}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[tone]}`} />
      {children}
    </span>
  )
}

interface PanelProps {
  title: string
  eyebrow?: string
  tone?: 'ok' | 'warn' | 'crit' | 'info' | 'idle'
  children: ReactNode
  className?: string
}

export function Panel({ title, eyebrow, tone = 'idle', children, className = '' }: PanelProps) {
  const border =
    tone === 'crit'
      ? 'border-red-500/50'
      : tone === 'ok'
        ? 'border-emerald-500/35'
        : tone === 'warn'
          ? 'border-amber-500/40'
          : tone === 'info'
            ? 'border-sky-500/35'
            : 'border-slate-700/80'

  return (
    <section
      className={`rounded-2xl border bg-[#111b2e]/90 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur ${border} ${className}`}
    >
      {eyebrow ? (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-100">{title}</h2>
      {children}
    </section>
  )
}

export function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-800/80 py-1.5 text-xs last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono text-slate-100">{value}</span>
    </div>
  )
}
