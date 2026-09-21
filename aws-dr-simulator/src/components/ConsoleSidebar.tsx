import {
  Activity,
  Archive,
  BarChart3,
  Brain,
  ChevronDown,
  CircleHelp,
  Cloud,
  Database,
  Disc3,
  Gauge,
  HardDrive,
  History,
  Landmark,
  LayoutDashboard,
  Network,
  Route,
  Server,
  Settings,
  ShieldCheck,
  Split,
  Vault,
} from 'lucide-react'
import type { ConsoleView } from '../types/console'
import type { SimulationModel } from '../types/simulation'

interface ConsoleSidebarProps {
  sim: SimulationModel
  view: ConsoleView
  onNavigate: (view: ConsoleView) => void
}

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  view: ConsoleView
  primary?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const GROUPS: NavGroup[] = [
  {
    title: 'Disaster Recovery',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, view: 'dr', primary: true },
      { label: 'Protected servers', icon: Server, view: 'dr' },
      { label: 'Recovery points', icon: Database, view: 'dr' },
      { label: 'Recovery instances', icon: Cloud, view: 'dr' },
      { label: 'Network topology', icon: Network, view: 'dr' },
      { label: 'Activity log', icon: Activity, view: 'dr' },
    ],
  },
  {
    title: 'Backup as a Service',
    items: [
      { label: 'Backup dashboard', icon: Archive, view: 'backup', primary: true },
      { label: 'AWS Backup plans', icon: Vault, view: 'backup' },
      { label: 'S3 storage classes', icon: HardDrive, view: 'backup' },
      { label: 'S3 versioning', icon: History, view: 'backup' },
      { label: 'Tape Gateway (VTL)', icon: Disc3, view: 'backup' },
    ],
  },
  {
    title: 'Alta disponibilidad',
    items: [
      { label: 'Multi-AZ dashboard', icon: Split, view: 'ha', primary: true },
      { label: 'Load balancing', icon: Network, view: 'ha' },
      { label: 'RDS failover', icon: Database, view: 'ha' },
    ],
  },
  {
    title: 'Cloud Migration',
    items: [
      { label: 'Migration Hub', icon: Route, view: 'migration', primary: true },
      { label: '7 R strategies', icon: LayoutDashboard, view: 'migration' },
      { label: 'Waves and portfolio', icon: Server, view: 'migration' },
    ],
  },
  {
    title: 'Well-Architected',
    items: [
      { label: 'WA Tool', icon: Landmark, view: 'wellarchitected', primary: true },
      { label: 'Six pillars', icon: ShieldCheck, view: 'wellarchitected' },
      { label: 'Improvement plan', icon: BarChart3, view: 'wellarchitected' },
    ],
  },
  {
    title: 'Machine Learning e IA',
    items: [
      { label: 'SageMaker / Bedrock', icon: Brain, view: 'ml', primary: true },
      { label: 'Training jobs', icon: Gauge, view: 'ml' },
      { label: 'AI services', icon: Cloud, view: 'ml' },
    ],
  },
  {
    title: 'Seguridad AWS',
    items: [
      { label: 'Security Hub', icon: ShieldCheck, view: 'security', primary: true },
      { label: 'GuardDuty findings', icon: Activity, view: 'security' },
      { label: 'WAF and KMS', icon: Vault, view: 'security' },
    ],
  },
]

function NavButton({ item, view, onNavigate }: { item: NavItem; view: ConsoleView; onNavigate: (view: ConsoleView) => void }) {
  const Icon = item.icon
  const active = item.primary === true && item.view === view
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.view)}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs ${
        active
          ? 'border-l-2 border-[#ff9900] bg-[#182334] text-white'
          : 'text-slate-400 hover:bg-[#131d2d] hover:text-slate-100'
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? 'text-[#ff9900]' : 'text-slate-500'}`} />
      {item.label}
    </button>
  )
}

function sidebarState(view: ConsoleView, sim: SimulationModel): string {
  switch (view) {
    case 'dr':
      return `State: ${sim.state}`
    case 'backup':
      return 'Backup service: active'
    case 'ha':
      return 'Multi-AZ: 2 AZs'
    case 'migration':
      return 'Migration Hub: active'
    case 'wellarchitected':
      return 'WA Tool: 3 workloads'
    case 'ml':
      return 'SageMaker domain: ready'
    case 'security':
      return 'Security Hub: enabled'
  }
}

export function ConsoleSidebar({ sim, view, onNavigate }: ConsoleSidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-800 bg-[#0b111c] lg:block">
      <div className="sticky top-0 flex max-h-[calc(100vh-86px)] min-h-[calc(100vh-86px)] flex-col">
        <div className="border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ff9900] text-slate-950">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Magnatic Cloud</p>
              <p className="text-[10px] text-slate-500">AWS Simulator</p>
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

        <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto p-3" aria-label="Console navigation">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className={`px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 ${group.title === 'Disaster Recovery' ? '' : 'pt-5'}`}>
                {group.title}
              </p>
              {group.items.map((item) => (
                <NavButton key={item.label} item={item} view={view} onNavigate={onNavigate} />
              ))}
            </div>
          ))}
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
            <span>{sidebarState(view, sim)}</span>
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
