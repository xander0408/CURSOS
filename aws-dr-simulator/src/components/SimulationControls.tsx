import { Flame, Pause, Play, RotateCcw, SkipForward, Undo2 } from 'lucide-react'
import type { DisasterSimulationApi } from '../hooks/useDisasterSimulation'
import type { SimulationSpeed } from '../types/simulation'

const SPEEDS: SimulationSpeed[] = [0.5, 1, 2, 5]

interface SimulationControlsProps {
  api: DisasterSimulationApi
}

export function SimulationControls({ api }: SimulationControlsProps) {
  const {
    sim,
    canStartDisaster,
    canFailback,
    canSkip,
    startDisaster,
    startFailback,
    pause,
    resume,
    reset,
    skipToRecovery,
    setSpeed,
  } = api

  return (
    <section className="rounded-2xl border border-slate-700 bg-[#111b2e] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={startDisaster}
          disabled={!canStartDisaster}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-5 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-red-900/40 transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Flame className="h-5 w-5" />
          SIMULAR DESASTRE
        </button>
        <button
          type="button"
          onClick={pause}
          disabled={sim.paused}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 enabled:hover:bg-slate-800 disabled:opacity-40"
        >
          <Pause className="h-3.5 w-3.5" />
          Pause
        </button>
        <button
          type="button"
          onClick={resume}
          disabled={!sim.paused}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 enabled:hover:bg-slate-800 disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5" />
          Resume
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <button
          type="button"
          onClick={startFailback}
          disabled={!canFailback}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-100 enabled:hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Simular Failback
        </button>
        <button
          type="button"
          onClick={skipToRecovery}
          disabled={!canSkip}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 enabled:hover:bg-slate-800 disabled:opacity-40"
        >
          <SkipForward className="h-3.5 w-3.5" />
          Skip to Recovery
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400">Simulation Speed</span>
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => setSpeed(speed)}
            className={`rounded-md border px-2.5 py-1 font-mono ${
              sim.speed === speed
                ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                : 'border-slate-600 text-slate-300 hover:border-slate-400'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </section>
  )
}
