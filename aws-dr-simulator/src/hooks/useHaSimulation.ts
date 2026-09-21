import { useCallback, useEffect, useMemo, useState } from 'react'
import type { HaScenario, NodeHealth } from '../data/ha'
import { pushFeed, seedFeed } from '../lib/feed'
import type { FeedEntry } from '../types/console'

export type HaPhase = 'HEALTHY' | 'INCIDENT' | 'FAILING_OVER' | 'DEGRADED' | 'RECOVERING' | 'RESTORED'

interface HaModel {
  scenario: HaScenario
  phase: HaPhase
  running: boolean
  progress: number
  azA: NodeHealth
  azB: NodeHealth
  instanceA: NodeHealth
  instanceB: NodeHealth
  alb: NodeHealth
  wafBlocked: number
  rdsPrimaryAz: 'a' | 'b'
  rdsFailing: boolean
  requestsPerMin: number
  errorRate: number
  asgDesired: number
  asgHealthy: number
  feed: FeedEntry[]
}

function createInitial(): HaModel {
  return {
    scenario: 'az-failure',
    phase: 'HEALTHY',
    running: false,
    progress: 0,
    azA: 'healthy',
    azB: 'healthy',
    instanceA: 'healthy',
    instanceB: 'healthy',
    alb: 'healthy',
    wafBlocked: 214,
    rdsPrimaryAz: 'a',
    rdsFailing: false,
    requestsPerMin: 1840,
    errorRate: 0.1,
    asgDesired: 2,
    asgHealthy: 2,
    feed: seedFeed([
      ['INFO', 'ALB target group: 2 healthy targets across us-east-1a and us-east-1b'],
      ['INFO', 'Amazon RDS Multi-AZ: primary in us-east-1a, standby in us-east-1b'],
      ['SUCCESS', 'Auto Scaling group portal-asg desired=2, min=2, max=6'],
    ]),
  }
}

export function useHaSimulation() {
  const [model, setModel] = useState<HaModel>(createInitial)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setModel((current) => {
        const jitter = current.running ? 80 : 12
        const requestsPerMin = Math.max(200, current.requestsPerMin + Math.round((Math.random() - 0.45) * jitter))
        const wafBlocked = current.wafBlocked + (Math.random() > 0.7 ? 1 : 0)
        if (!current.running) {
          return {
            ...current,
            requestsPerMin,
            wafBlocked,
            errorRate: current.phase === 'HEALTHY' || current.phase === 'RESTORED' ? 0.1 : current.errorRate,
          }
        }

        const next = Math.min(100, current.progress + 4 + Math.random() * 6)
        let feed = current.feed
        let phase = current.phase
        let azA = current.azA
        let azB = current.azB
        let instanceA = current.instanceA
        let instanceB = current.instanceB
        let alb = current.alb
        let rdsPrimaryAz = current.rdsPrimaryAz
        let rdsFailing = current.rdsFailing
        let asgDesired = current.asgDesired
        let asgHealthy = current.asgHealthy
        let errorRate = current.errorRate
        let running: boolean = current.running

        if (next >= 12 && phase === 'INCIDENT') {
          phase = 'FAILING_OVER'
          alb = 'impaired'
          errorRate = current.scenario === 'instance-failure' ? 4.2 : 12
          feed = pushFeed(feed, 'WARN', 'ELB health checks failing. Traffic shifted to healthy targets')
        }

        if (current.scenario === 'az-failure') {
          if (next >= 8) {
            azA = 'failed'
            instanceA = 'failed'
            asgHealthy = 1
          }
          if (next >= 35) {
            rdsFailing = true
            rdsPrimaryAz = 'b'
            feed = next < 42 ? pushFeed(feed, 'CRITICAL', 'RDS Multi-AZ failover: promoting standby in us-east-1b') : feed
          }
          if (next >= 55) {
            rdsFailing = false
            asgDesired = 3
            instanceB = 'healthy'
            phase = 'DEGRADED'
            alb = 'healthy'
            errorRate = 1.4
            feed = next < 62 ? pushFeed(feed, 'INFO', 'ASG launching replacement capacity in us-east-1b') : feed
          }
          if (next >= 78) {
            phase = 'RECOVERING'
            azA = 'recovering'
            instanceA = 'recovering'
          }
          if (next >= 100) {
            running = false
            phase = 'RESTORED'
            azA = 'healthy'
            instanceA = 'healthy'
            asgDesired = 2
            asgHealthy = 2
            alb = 'healthy'
            errorRate = 0.1
            feed = pushFeed(feed, 'SUCCESS', 'AZ us-east-1a restored. Dual-AZ capacity back to desired=2')
          }
        }

        if (current.scenario === 'instance-failure') {
          if (next >= 6) {
            instanceA = 'failed'
            asgHealthy = 1
            errorRate = 3.8
          }
          if (next >= 40) {
            instanceA = 'recovering'
            phase = 'RECOVERING'
            alb = 'healthy'
            errorRate = 0.8
            feed = next < 48 ? pushFeed(feed, 'INFO', 'Auto Scaling: launching replacement i-0a19c3 in us-east-1a') : feed
          }
          if (next >= 100) {
            running = false
            phase = 'RESTORED'
            instanceA = 'healthy'
            asgHealthy = 2
            errorRate = 0.1
            feed = pushFeed(feed, 'SUCCESS', 'Target group: 2/2 healthy. Instance failure recovered')
          }
        }

        if (current.scenario === 'rds-failover') {
          if (next >= 8 && !current.rdsFailing && current.phase !== 'DEGRADED' && current.phase !== 'RESTORED') {
            rdsFailing = true
            errorRate = 18
            alb = 'impaired'
            phase = 'FAILING_OVER'
          }
          if (next >= 45 && current.rdsFailing) {
            rdsPrimaryAz = current.rdsPrimaryAz === 'a' ? 'b' : 'a'
            rdsFailing = false
            errorRate = 2.1
            alb = 'healthy'
            phase = 'DEGRADED'
            feed = pushFeed(feed, 'SUCCESS', `RDS standby promoted in us-east-1${current.rdsPrimaryAz === 'a' ? 'b' : 'a'}`)
          }
          if (next >= 100) {
            running = false
            phase = 'RESTORED'
            errorRate = 0.1
            feed = pushFeed(feed, 'SUCCESS', 'Applications reconnected to RDS writer endpoint')
          }
        }

        return {
          ...current,
          progress: next,
          phase,
          running,
          azA,
          azB,
          instanceA,
          instanceB,
          alb,
          rdsPrimaryAz,
          rdsFailing,
          asgDesired,
          asgHealthy,
          errorRate,
          requestsPerMin,
          wafBlocked,
          feed,
        }
      })
    }, 280)
    return () => window.clearInterval(timer)
  }, [])

  const setScenario = useCallback((scenario: HaScenario) => {
    setModel((current) => (current.running ? current : { ...current, scenario }))
  }, [])

  const start = useCallback(() => {
    setModel((current) => {
      if (current.running) {
        return current
      }
      const headline =
        current.scenario === 'az-failure'
          ? 'Simulated failure of Availability Zone us-east-1a'
          : current.scenario === 'instance-failure'
            ? 'Simulated EC2 health check failure in portal-asg'
            : 'Simulated Amazon RDS writer failure (Multi-AZ failover)'
      return {
        ...current,
        running: true,
        phase: 'INCIDENT',
        progress: 4,
        errorRate: 8,
        feed: pushFeed(current.feed, 'CRITICAL', headline),
      }
    })
  }, [])

  const reset = useCallback(() => setModel(createInitial()), [])

  const stats = useMemo(
    () => ({
      healthyAz: [model.azA, model.azB].filter((item) => item === 'healthy').length,
      rdsWriter: model.rdsPrimaryAz === 'a' ? 'us-east-1a' : 'us-east-1b',
      rdsStandby: model.rdsPrimaryAz === 'a' ? 'us-east-1b' : 'us-east-1a',
    }),
    [model.azA, model.azB, model.rdsPrimaryAz],
  )

  return { model, stats, setScenario, start, reset }
}

export type HaSimulationApi = ReturnType<typeof useHaSimulation>
