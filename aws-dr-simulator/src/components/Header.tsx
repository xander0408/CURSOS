import { Cloud, HelpCircle, Presentation, RotateCcw, ShieldAlert } from 'lucide-react'
import type { DisasterSimulationApi } from '../hooks/useDisasterSimulation'

interface HeaderProps {
  api: DisasterSimulationApi
}

export function Header({ api }: HeaderProps) {
  const { sim, headerStatus, reset, togglePresentation, toggleHowItWorks, startDemo } = api

  return (
    <header className="border-b border-slate-800/80 bg-[#0b1220]/85 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">
        <ShieldAlert className="h-3.5 w-3.5" />
        <span>Simulation Mode</span>
        <span className="text-amber-500/60">·</span>
        <span>No AWS resources are being modified</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30">
            <Cloud className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">
              AWS Disaster Recovery Simulator
            </h1>
            <p className="text-xs text-slate-400 md:text-sm">
              Interactive Disaster Recovery & Failover Demonstration
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-200">
            Simulation Mode
          </span>
          <span className="rounded-full border border-slate-600 px-3 py-1 text-[11px] font-medium text-slate-300">
            Local Environment
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            Status: {headerStatus}
          </span>
          <button
            type="button"
            onClick={toggleHowItWorks}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-400 hover:text-white"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            ¿Cómo funciona?
          </button>
          <button
            type="button"
            onClick={startDemo}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/40 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-100 hover:bg-violet-500/25"
          >
            🎬 Demo Mode
          </button>
          <button
            type="button"
            onClick={togglePresentation}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              sim.presentationMode
                ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                : 'border-slate-600 text-slate-200 hover:border-sky-400'
            }`}
          >
            <Presentation className="h-3.5 w-3.5" />
            Presentation Mode
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Simulation
          </button>
        </div>
      </div>
    </header>
  )
}
