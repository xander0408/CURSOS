import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SimulationModel } from '../types/simulation'

interface ReplicationChartProps {
  sim: SimulationModel
}

export function ReplicationChart({ sim }: ReplicationChartProps) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-[#111b2e] p-4">
      <h2 className="mb-1 text-sm font-semibold tracking-wide">Replication Health</h2>
      <p className="mb-3 text-[11px] text-slate-400">
        Últimos 60 segundos de la simulación. Latency, throughput y edad del recovery point.
      </p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sim.chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="t" hide />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: '#0b1220',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="latencyMs"
              name="Replication Latency (ms)"
              stroke="#38bdf8"
              dot={false}
              isAnimationActive
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="throughputMbps"
              name="Replication Throughput"
              stroke="#34d399"
              dot={false}
              isAnimationActive
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="recoveryPointAgeSec"
              name="Recovery Point Age (s)"
              stroke="#f59e0b"
              dot={false}
              isAnimationActive
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
