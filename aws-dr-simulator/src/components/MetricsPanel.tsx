import { motion } from 'framer-motion'
import type { SimulationModel } from '../types/simulation'
import { InfoTip } from './ui'

interface MetricsPanelProps {
  sim: SimulationModel
}

export function MetricsPanel({ sim }: MetricsPanelProps) {
  const cards = [
    {
      key: 'rpo',
      label: (
        <InfoTip label="Recovery Point Objective. Cantidad máxima de datos que potencialmente podrían perderse medida en tiempo.">
          RPO
        </InfoTip>
      ),
      value: `${sim.rpoTargetSec} sec`,
    },
    {
      key: 'rto',
      label: (
        <InfoTip label="Recovery Time Objective. Tiempo objetivo para recuperar la disponibilidad de la aplicación.">
          RTO
        </InfoTip>
      ),
      value: '5 min',
    },
    { key: 'rep', label: 'Replication', value: `${Math.round(sim.replicationProgress)}%` },
    { key: 'prot', label: 'Protected Servers', value: '1' },
    {
      key: 'rp',
      label: 'Recovery Point',
      value: sim.recoveryPointSelected ? 'Selected' : 'Available',
    },
    { key: 'app', label: 'Application', value: sim.applicationLabel },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <motion.div
          key={card.key}
          layout
          className="rounded-xl border border-slate-700 bg-[#111b2e] px-3 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
          <p className="mt-1 font-mono text-lg font-semibold text-white">{card.value}</p>
        </motion.div>
      ))}
    </div>
  )
}

export function UsersPanel({ sim }: { sim: SimulationModel }) {
  const pct = Math.round((sim.usersConnected / 127) * 100)
  return (
    <section className="rounded-2xl border border-slate-700 bg-[#111b2e] p-4">
      <h2 className="mb-3 text-sm font-semibold">Application Users</h2>
      <p className="text-xs text-slate-400">Users Connected</p>
      <p className="font-mono text-3xl font-semibold text-white">{sim.usersConnected}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full bg-sky-400"
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-400">Requests/sec</p>
          <p className="font-mono text-lg text-slate-100">{sim.requestsPerSec}</p>
        </div>
        <div>
          <p className="text-slate-400">Application Availability</p>
          <p className="font-mono text-lg text-slate-100">{sim.availability}%</p>
        </div>
      </div>
    </section>
  )
}
