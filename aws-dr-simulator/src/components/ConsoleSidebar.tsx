import {
  Activity,
  BarChart3,
  ChevronDown,
  CircleHelp,
  Cloud,
  Database,
  Gauge,
  LayoutDashboard,
  Network,
  Server,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import type { SimulationModel } from '../types/simulation'

interface ConsoleSidebarProps {
  sim: SimulationModel
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Protected servers', icon: Server },
  { label: 'Recovery points', icon: Database },
  { label: 'Recovery instances', icon: Cloud },
  { label: 'Network topology', icon: Network },
  { label: 'Activity log', icon: Activity },
]

export function ConsoleSidebar({ sim }: ConsoleSidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-800 bg-[#0b111c] lg:block">
      <div className="sticky top-0 flex min-h-[calc(100vh-86px)] flex-col">
        <div className="border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ff9900] text-slate-950">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Magnatic Cloud</p>
              <p className="text-[10px] text-slate-500">DR Simulator</p>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-800 p-3">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md border border-slate-700 bg-[#111b2b] px-3 py-2 text-left text-xs text-slate-200 hover:border-slate-500"
          >
            <span>
              <span className="block text-[10px] text-slate-500">Region</span>
              <span className="font-mono">us-east-1</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="Console navigation">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            Disaster Recovery
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                type="button"
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs ${
                  item.active
                    ? 'border-l-2 border-[#ff9900] bg-[#182334] text-white'
                    : 'text-slate-400 hover:bg-[#131d2d] hover:text-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${item.active ? 'text-[#ff9900]' : 'text-slate-500'}`} />
                {item.label}
              </button>
            )
          })}
          <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            Monitoring
          </p>
          <button type="button" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs text-slate-400 hover:bg-[#131d2d] hover:text-slate-100">
            <Gauge className="h-4 w-4 text-slate-500" />
            Replication health
          </button>
          <button type="button" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs text-slate-400 hover:bg-[#131d2d] hover:text-slate-100">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            Performance
          </button>
        </nav>

        <div className="space-y-2 border-t border-slate-800 p-3">
          <div className="rounded-md border border-amber-500/25 bg-amber-500/5 p-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Simulation only
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              No credentials, APIs or AWS resources are used.
            </p>
          </div>
          <div className="flex items-center justify-between px-2 text-[10px] text-slate-600">
            <span>State: {sim.state}</span>
            <div className="flex gap-2">
              <Settings className="h-3.5 w-3.5" />
              <CircleHelp className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
