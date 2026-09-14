import { motion } from 'framer-motion'
import { ArrowDown, Building2, Cloud, User } from 'lucide-react'
import type { SimulationModel } from '../types/simulation'

interface TrafficFlowProps {
  sim: SimulationModel
}

export function TrafficFlow({ sim }: TrafficFlowProps) {
  const aws = sim.trafficTarget === 'aws'
  const hops = aws
    ? [
        { icon: User, label: 'USER' },
        { icon: Cloud, label: 'AWS RECOVERY INSTANCE' },
        { icon: Cloud, label: 'APPLICATION' },
      ]
    : [
        { icon: User, label: 'USER' },
        { icon: Building2, label: 'ON-PREMISES' },
        { icon: Building2, label: 'APPLICATION' },
      ]

  return (
    <div className="rounded-2xl border border-slate-700 bg-[#0d1728] px-4 py-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Traffic Flow
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {hops.map((hop, index) => {
          const Icon = hop.icon
          return (
            <div key={`${hop.label}-${index}`} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  aws ? 'border-amber-400/40 bg-amber-500/10 text-amber-100' : 'border-sky-400/40 bg-sky-500/10 text-sky-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {hop.label}
              </div>
              {index < hops.length - 1 && (
                <motion.div
                  aria-hidden="true"
                  className="text-sky-400"
                  animate={{ y: [0, 4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                >
                  <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
