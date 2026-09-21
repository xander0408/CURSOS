import type { ReactNode } from 'react'
import type { FeedEntry, FeedLevel } from '../../types/console'

interface SectionCardProps {
  icon: ReactNode
  iconTone?: string
  eyebrow: string
  title: string
  right?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({
  icon,
  iconTone = 'bg-[#ff9900]/15 text-[#ffb84d]',
  eyebrow,
  title,
  right,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <section className={`rounded-lg border border-slate-700 bg-[#111b2e] ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-md ${iconTone}`}>{icon}</div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
          </div>
        </div>
        {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
      </div>
      {children}
    </section>
  )
}

interface PageHeaderProps {
  crumb: string
  title: string
  description: string
  right?: ReactNode
}

export function PageHeader({ crumb, title, description, right }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-800 pb-4">
      <div>
        <p className="text-[11px] font-medium text-slate-500">
          {crumb} <span className="px-1 text-slate-700">/</span> Overview
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
      {right ? <div className="flex items-center gap-2 text-[11px]">{right}</div> : null}
    </div>
  )
}

export interface MetricCard {
  label: string
  value: string
  hint?: string
}

export function MetricGrid({ cards }: { cards: MetricCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-slate-700 bg-[#111b2e] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
          <p className="mt-1 font-mono text-lg font-semibold text-white">{card.value}</p>
          {card.hint ? <p className="text-[10px] text-slate-500">{card.hint}</p> : null}
        </div>
      ))}
    </div>
  )
}

const LEVEL: Record<FeedLevel, string> = {
  INFO: 'text-sky-300',
  SUCCESS: 'text-emerald-300',
  WARN: 'text-amber-300',
  CRITICAL: 'text-red-300',
}

export function ActivityFeed({ title, entries }: { title: string; entries: FeedEntry[] }) {
  return (
    <section className="rounded-lg border border-slate-700 bg-[#0d1524] p-4">
      <h2 className="mb-3 text-sm font-semibold tracking-wide">{title}</h2>
      <ul className="scroll-thin max-h-80 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed">
        {entries.map((entry) => (
          <li key={entry.id} className="text-slate-300">
            <span className="text-slate-500">{entry.time}</span>{' '}
            <span className={LEVEL[entry.level]}>[{entry.level}]</span> {entry.message}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ProgressBar({ value, tone = 'bg-sky-400' }: { value: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      <div className={`h-full ${tone} transition-[width] duration-200`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#ff9900] bg-[#ff9900] px-3 py-1.5 text-xs font-semibold text-slate-950 transition enabled:hover:bg-[#ffb84d] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-100 transition enabled:hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
