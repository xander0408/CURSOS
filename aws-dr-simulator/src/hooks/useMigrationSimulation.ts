import { useCallback, useEffect, useMemo, useState } from 'react'
import { INITIAL_APPS, TOTAL_WAVES, getStrategy } from '../data/migration'
import type { MigrationApp, StrategyId } from '../data/migration'
import { pushFeed, seedFeed } from '../lib/feed'
import type { FeedEntry } from '../types/console'

const TICK_MS = 250
const MONTHLY_SAVING_PER_SERVER_USD = 420

interface MigrationModel {
  apps: MigrationApp[]
  nextWave: number
  filter: StrategyId | null
  feed: FeedEntry[]
}

function createInitial(): MigrationModel {
  return {
    apps: INITIAL_APPS.map((app) => ({ ...app })),
    nextWave: 2,
    filter: null,
    feed: seedFeed([
      ['INFO', 'Application Discovery Service: 26 servidores inventariados'],
      ['INFO', 'Migration Hub Strategy Recommendations: estrategia asignada a 12 aplicaciones'],
      ['SUCCESS', 'Wave 1 completada: 3 aplicaciones migradas, 1 retirada'],
    ]),
  }
}

export function useMigrationSimulation() {
  const [model, setModel] = useState<MigrationModel>(createInitial)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setModel((current) => {
        let feed = current.feed
        let changed = false
        const apps = current.apps.map((app) => {
          if (app.status !== 'MIGRATING' && app.status !== 'CUTOVER') {
            return app
          }
          changed = true
          const progress = Math.min(100, app.progress + 1.2 + Math.random() * 2.2)
          if (progress >= 100) {
            feed = pushFeed(feed, 'SUCCESS', `Cutover completado: ${app.name} ahora corre en ${app.target}`)
            return { ...app, status: 'MIGRATED' as const, progress: 100 }
          }
          if (app.status === 'MIGRATING' && progress >= 80) {
            feed = pushFeed(feed, 'INFO', `${app.name}: instancia de prueba validada, ventana de cutover abierta`)
            return { ...app, status: 'CUTOVER' as const, progress }
          }
          return { ...app, progress }
        })
        return changed ? { ...current, apps, feed } : current
      })
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [])

  const startNextWave = useCallback(() => {
    setModel((current) => {
      if (current.nextWave > TOTAL_WAVES) {
        return current
      }
      const wave = current.nextWave
      let feed = pushFeed(current.feed, 'INFO', `Wave ${wave} iniciada desde AWS Migration Hub`)
      const apps = current.apps.map((app) => {
        if (app.wave !== wave || app.status !== 'ASSESSED') {
          return app
        }
        if (app.strategy === 'retire') {
          feed = pushFeed(feed, 'SUCCESS', `${app.name} dado de baja (Retire)`)
          return { ...app, status: 'RETIRED' as const, progress: 100 }
        }
        if (app.strategy === 'retain') {
          feed = pushFeed(feed, 'WARN', `${app.name} se mantiene on-premises (Retain) con conectividad híbrida`)
          return { ...app, status: 'RETAINED' as const, progress: 100 }
        }
        feed = pushFeed(feed, 'INFO', `${getStrategy(app.strategy).tool}: replicación iniciada para ${app.name}`)
        return { ...app, status: 'MIGRATING' as const, progress: 0 }
      })
      return { ...current, apps, feed, nextWave: wave + 1 }
    })
  }, [])

  const setFilter = useCallback((filter: StrategyId | null) => {
    setModel((current) => ({ ...current, filter: current.filter === filter ? null : filter }))
  }, [])

  const reset = useCallback(() => setModel(createInitial()), [])

  const stats = useMemo(() => {
    const totalServers = model.apps.reduce((sum, app) => sum + app.servers, 0)
    const done = model.apps.filter((app) => app.status === 'MIGRATED' || app.status === 'RETIRED')
    const migratedServers = done.reduce((sum, app) => sum + app.servers, 0)
    const inFlight = model.apps.filter((app) => app.status === 'MIGRATING' || app.status === 'CUTOVER').length
    const percent = Math.round((migratedServers / totalServers) * 100)
    const counts = model.apps.reduce<Record<StrategyId, number>>(
      (acc, app) => ({ ...acc, [app.strategy]: acc[app.strategy] + 1 }),
      { rehost: 0, replatform: 0, repurchase: 0, refactor: 0, retire: 0, retain: 0, relocate: 0 },
    )
    return {
      totalApps: model.apps.length,
      totalServers,
      migratedServers,
      percent,
      inFlight,
      monthlySavings: migratedServers * MONTHLY_SAVING_PER_SERVER_USD,
      counts,
      wavesDone: model.nextWave - 1,
    }
  }, [model.apps, model.nextWave])

  const visibleApps = useMemo(
    () => (model.filter ? model.apps.filter((app) => app.strategy === model.filter) : model.apps),
    [model.apps, model.filter],
  )

  return { model, stats, visibleApps, startNextWave, setFilter, reset }
}

export type MigrationSimulationApi = ReturnType<typeof useMigrationSimulation>
