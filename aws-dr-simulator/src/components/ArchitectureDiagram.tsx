import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, Users } from 'lucide-react'
import type { SimulationModel } from '../types/simulation'
import { ApplicationPanel } from './ApplicationPanel'
import { DRSPanel } from './DRSPanel'
import { PrimarySite } from './PrimarySite'
import { RecoveryInstance } from './RecoveryInstance'
import { ReplicationPanel } from './ReplicationPanel'
import { TrafficFlow } from './TrafficFlow'

interface ArchitectureDiagramProps {
  sim: SimulationModel
  presentationMode: boolean
}

function Connector({ alert, reverse }: { alert: boolean; reverse?: boolean }) {
  return (
    <div className="flex flex-col items-center py-1 lg:py-2">
      <ArrowDown className={`h-4 w-4 ${alert ? 'text-amber-400' : 'text-sky-400'} ${reverse ? 'rotate-180' : ''}`} />
      <div
        className={`h-8 w-0.5 rounded ${alert ? 'replication-pipe is-alert' : 'replication-pipe'} ${
          reverse ? 'opacity-80' : ''
        }`}
      />
    </div>
  )
}

export function ArchitectureDiagram({ sim, presentationMode }: ArchitectureDiagramProps) {
  const failback = sim.state.startsWith('FAILBACK')

  return (
    <div className={presentationMode ? 'space-y-4' : 'space-y-3'}>
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3">
        <Users className="h-4 w-4 text-slate-300" />
        <span className={`font-semibold tracking-wide ${presentationMode ? 'text-lg' : 'text-sm'}`}>USERS</span>
        <span className="font-mono text-xs text-slate-400">{sim.usersConnected} connected</span>
      </div>
      <div className="flex justify-center">
        <ArrowDown className="h-4 w-4 text-sky-400" />
      </div>
      <TrafficFlow sim={sim} />

      <div className={`grid gap-3 ${presentationMode ? 'lg:grid-cols-2 xl:grid-cols-4' : 'lg:grid-cols-2 xl:grid-cols-4'}`}>
        <PrimarySite sim={sim} />
        <ReplicationPanel sim={sim} />
        <DRSPanel sim={sim} />
        <div className="space-y-3">
          <RecoveryInstance sim={sim} />
          <ApplicationPanel sim={sim} />
        </div>
      </div>

      <div className="hidden text-center text-[11px] text-slate-500 xl:block">
        On-Premises → AWS DRS Agent / Replication → AWS DRS → Recovery Instance → Application
      </div>

      <AnimatePresence>
        {failback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          >
            Failback path: AWS Recovery Environment → Replication Back → On-Premises → Primary Server → Application
            Restored
            <div className="mt-2 flex justify-center">
              <Connector alert={false} reverse />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
