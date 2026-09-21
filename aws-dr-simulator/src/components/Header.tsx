import { Bell, Cloud, HelpCircle, Presentation, RotateCcw, ShieldAlert, Terminal } from 'lucide-react'
import type { DisasterSimulationApi } from '../hooks/useDisasterSimulation'

interface HeaderProps {
  api: DisasterSimulationApi
}

export function Header({ api }: HeaderProps) {
  const { sim, headerStatus, reset, togglePresentation, toggleHowItWorks, startDemo } = api

  return (
    <header className="border-b border-slate-800 bg-[#101820]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#0b111c] px-5 py-2 text-[11px]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-[#ffb84d]">
            <ShieldAlert className="h-3.5 w-3.5" />
            SIMULATION MODE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">No AWS resources are being modified</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span>Local environment</span>
          <Bell className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ff9900] text-slate-950">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white md:text-lg">
              AWS Disaster Recovery Simulator
            </h1>
            <p className="text-[11px] text-slate-400">Elastic Disaster Recovery console view</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-md border border-slate-700 bg-[#0b111c] px-3 py-1.5 text-[11px] text-slate-300 sm:flex">
            <Terminal className="h-3.5 w-3.5 text-slate-500" />
            magnatic-dr-demo
          </span>
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
            {headerStatus}
          </span>
          <button
            type="button"
            onClick={toggleHowItWorks}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-400 hover:text-white"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Help
          </button>
          <button
            type="button"
            onClick={startDemo}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#ff9900]/60 bg-[#ff9900] px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-[#ffb84d]"
          >
            Demo Mode
          </button>
          <button
            type="button"
            onClick={togglePresentation}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium ${
              sim.presentationMode
                ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                : 'border-slate-700 text-slate-300 hover:border-slate-400'
            }`}
          >
            <Presentation className="h-3.5 w-3.5" />
            Presentation
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
      <div className="border-t border-slate-800 px-5 py-2 text-[11px] text-slate-500">
        Console home <span className="px-2 text-slate-700">/</span> Disaster Recovery <span className="px-2 text-slate-700">/</span> Dashboard
      </div>
    </header>
  )
}
