import { useCallback, useEffect, useMemo, useState } from 'react'
import { getScenario } from '../data/scenarios'
import type {
  ChartPoint,
  LogEntry,
  LogLevel,
  ScenarioId,
  SequenceKind,
  SimulationModel,
  SimulationSpeed,
  SimulationState,
  TimelineEvent,
} from '../types/simulation'

const TICK_MS = 100
const MAX_LOGS = 80
const MAX_CHART = 60
const USERS_HEALTHY = 127
const RPS_HEALTHY = 42

interface SequenceStep {
  state: SimulationState
  durationMs: number
  phaseLabel: string
  apply: (model: SimulationModel, scenarioId: ScenarioId) => SimulationModel
}

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function pushLog(
  logs: LogEntry[],
  level: LogLevel,
  message: string,
  time: string,
): LogEntry[] {
  return [{ id: uid('log'), level, message, time }, ...logs].slice(0, MAX_LOGS)
}

function pushTimeline(
  events: TimelineEvent[],
  time: string,
  title: string,
  detail: string,
): TimelineEvent[] {
  if (events.some((event) => event.time === time && event.title === title)) {
    return events
  }
  return [...events, { id: uid('tl'), time, title, detail }]
}

function jitter(base: number, spread: number): number {
  return Number((base + (Math.random() - 0.5) * spread).toFixed(1))
}

function nextChartPoint(model: SimulationModel): ChartPoint {
  const healthy = model.primaryStatus === 'ONLINE' && model.trafficTarget === 'onprem'
  const onAws =
    model.trafficTarget === 'aws' &&
    (model.applicationStatus === 'ONLINE' || model.state === 'RECOVERY_COMPLETE')
  const failing =
    model.primaryStatus === 'FAILED' || model.primaryStatus === 'FAILURE_DETECTED'

  let latency = 8
  let throughput = 42
  let rpAge = 5

  if (failing && !onAws) {
    latency = jitter(78, 24)
    throughput = jitter(4, 3)
    rpAge = 5
  } else if (model.state === 'RECOVERY_STARTING' || model.state === 'RECOVERY_BOOTING') {
    latency = jitter(36, 10)
    throughput = jitter(12, 6)
    rpAge = 5
  } else if (onAws) {
    latency = jitter(11, 3)
    throughput = jitter(40, 5)
    rpAge = 5
  } else if (model.replicationStatus === 'SYNCING_BACK') {
    latency = jitter(14, 4)
    throughput = jitter(55, 8)
    rpAge = 3
  } else if (healthy) {
    latency = jitter(8, 2)
    throughput = jitter(41, 6)
    rpAge = 5
  }

  const stamp = new Date()
  const t = `${String(stamp.getSeconds()).padStart(2, '0')}.${String(stamp.getMilliseconds()).slice(0, 1)}`

  return {
    t,
    latencyMs: Math.max(1, latency),
    throughputMbps: Math.max(0.2, throughput),
    recoveryPointAgeSec: rpAge,
  }
}

function seedChart(): ChartPoint[] {
  const points: ChartPoint[] = []
  for (let i = 0; i < MAX_CHART; i += 1) {
    points.push({
      t: String(i),
      latencyMs: jitter(8, 2),
      throughputMbps: jitter(41, 5),
      recoveryPointAgeSec: 5,
    })
  }
  return points
}

function initialTimeline(): TimelineEvent[] {
  return [
    {
      id: 'tl-healthy',
      time: '21:05:01',
      title: 'Primary Server Healthy',
      detail: 'WEB-SRV-01 reporta estado HEALTHY (simulado).',
    },
    {
      id: 'tl-rp',
      time: '21:05:05',
      title: 'Replication Point Created',
      detail: 'Recovery point conceptual generado por replicación continua.',
    },
  ]
}

function initialLogs(): LogEntry[] {
  return [
    {
      id: 'log-0',
      level: 'INFO',
      message: 'Simulation environment ready — no AWS resources will be modified',
      time: '21:05:00',
    },
    {
      id: 'log-1',
      level: 'INFO',
      message: 'Replication healthy',
      time: '21:05:01',
    },
    {
      id: 'log-2',
      level: 'INFO',
      message: 'Recovery point created',
      time: '21:05:05',
    },
  ]
}

export function createInitialModel(scenarioId: ScenarioId = 'server-failure'): SimulationModel {
  return {
    state: 'PRIMARY_ONLINE',
    scenarioId,
    speed: 1,
    paused: false,
    presentationMode: false,
    demoMode: false,
    demoComplete: false,
    howItWorksOpen: false,
    sequence: 'none',
    stepIndex: -1,
    remainingMs: 0,
    primaryStatus: 'ONLINE',
    replicationStatus: 'SYNCED',
    replicationProgress: 100,
    lastRecoveryPointLabel: '5 seconds ago',
    rpoSeconds: 15,
    drsLabel: 'READY',
    recoveryInstanceStatus: 'STOPPED',
    recoveryInstanceDetail: 'STOPPED',
    applicationStatus: 'ONLINE',
    applicationLabel: 'ONLINE',
    trafficTarget: 'onprem',
    usersConnected: USERS_HEALTHY,
    requestsPerSec: RPS_HEALTHY,
    availability: 100,
    rpoTargetSec: 15,
    rtoTargetSec: 300,
    rpoAchievedSec: null,
    rtoAchievedSec: null,
    recoveryPointSelected: false,
    recoveryPointTimestamp: '—',
    banner: 'none',
    phaseLabel: 'Primary site healthy',
    timeline: initialTimeline(),
    logs: initialLogs(),
    chart: seedChart(),
    simClockLabel: '21:05:08',
    disasterAlert: false,
  }
}

function withUsers(model: SimulationModel, users: number, rps: number, availability: number): SimulationModel {
  return {
    ...model,
    usersConnected: Math.round(users),
    requestsPerSec: Math.round(rps),
    availability: Math.round(availability),
  }
}

function disasterSteps(): SequenceStep[] {
  return [
    {
      state: 'FAILURE_DETECTED',
      durationMs: 1800,
      phaseLabel: 'Failure detected',
      apply: (model, scenarioId) => {
        const scenario = getScenario(scenarioId)
        return {
          ...withUsers(model, 48, 9, 12),
          state: 'FAILURE_DETECTED',
          primaryStatus: 'FAILURE_DETECTED',
          applicationStatus: 'DEGRADED',
          applicationLabel: 'DEGRADED',
          disasterAlert: true,
          banner: 'disaster',
          phaseLabel: scenario.failureHeadline,
          simClockLabel: '21:05:10',
          drsLabel: 'DETECTING FAILURE',
          timeline: pushTimeline(
            model.timeline,
            '21:05:10',
            'Primary Server Failure',
            scenario.failureDetail,
          ),
          logs: pushLog(
            pushLog(model.logs, 'CRITICAL', scenario.failureHeadline, '21:05:10'),
            'INFO',
            'AWS DRS simulation started',
            '21:05:11',
          ),
        }
      },
    },
    {
      state: 'FAILURE_DETECTED',
      durationMs: 1600,
      phaseLabel: 'Primary infrastructure unavailable',
      apply: (model) => ({
        ...withUsers(model, 8, 1, 0),
        primaryStatus: 'FAILED',
        applicationStatus: 'OFFLINE',
        applicationLabel: 'OFFLINE',
        phaseLabel: 'Primary infrastructure unavailable',
        simClockLabel: '21:05:11',
        timeline: pushTimeline(
          model.timeline,
          '21:05:11',
          'Failure Detected',
          'Primary infrastructure unavailable',
        ),
        logs: pushLog(model.logs, 'CRITICAL', 'Primary server marked FAILED', '21:05:11'),
      }),
    },
    {
      state: 'REPLICATION_PAUSED',
      durationMs: 1800,
      phaseLabel: 'Last known good recovery point',
      apply: (model, scenarioId) => {
        const scenario = getScenario(scenarioId)
        return {
          ...withUsers(model, 0, 0, 0),
          state: 'REPLICATION_PAUSED',
          replicationStatus: 'LAST_KNOWN_GOOD',
          replicationProgress: 100,
          lastRecoveryPointLabel: 'frozen at failure',
          drsLabel: 'DETECTING FAILURE',
          phaseLabel: 'Replication: LAST KNOWN GOOD',
          simClockLabel: '21:05:13',
          logs: pushLog(model.logs, 'WARN', scenario.detectingMessage, '21:05:13'),
        }
      },
    },
    {
      state: 'RECOVERY_POINT_SELECTED',
      durationMs: 1700,
      phaseLabel: 'Recovery Point selected',
      apply: (model) => ({
        ...model,
        state: 'RECOVERY_POINT_SELECTED',
        recoveryPointSelected: true,
        recoveryPointTimestamp: '5 seconds before failure',
        rpoAchievedSec: 5,
        drsLabel: 'RECOVERING',
        phaseLabel: 'Recovery Point Selected — RPO 5 seconds',
        simClockLabel: '21:05:15',
        banner: 'recovering',
        timeline: pushTimeline(
          model.timeline,
          '21:05:15',
          'Recovery Point Selected',
          'Timestamp: 5 seconds before failure · RPO: 5 seconds',
        ),
        logs: pushLog(model.logs, 'INFO', 'Recovery point selected', '21:05:15'),
      }),
    },
    {
      state: 'RECOVERY_STARTING',
      durationMs: 2200,
      phaseLabel: 'Recovery instance starting',
      apply: (model) => ({
        ...model,
        state: 'RECOVERY_STARTING',
        recoveryInstanceStatus: 'STARTING',
        recoveryInstanceDetail: 'STARTING',
        phaseLabel: 'Recovery Instance: STOPPED → STARTING',
        simClockLabel: '21:05:25',
        timeline: pushTimeline(
          model.timeline,
          '21:05:25',
          'Recovery Instance Starting',
          'Launching Recovery-Web-01 (simulated)',
        ),
        logs: pushLog(model.logs, 'INFO', 'Recovery instance starting', '21:05:25'),
      }),
    },
    {
      state: 'RECOVERY_BOOTING',
      durationMs: 2400,
      phaseLabel: 'Operating system booting',
      apply: (model) => ({
        ...model,
        state: 'RECOVERY_BOOTING',
        recoveryInstanceStatus: 'BOOTING',
        recoveryInstanceDetail: 'BOOTING',
        phaseLabel: 'Recovery Instance: STARTING → BOOTING',
        simClockLabel: '21:06:40',
        timeline: pushTimeline(
          model.timeline,
          '21:06:40',
          'Operating System Ready',
          'Boot sequence of Recovery-Web-01 (simulated)',
        ),
        logs: pushLog(model.logs, 'INFO', 'Recovery instance booting', '21:06:40'),
      }),
    },
    {
      state: 'HEALTH_CHECK',
      durationMs: 2000,
      phaseLabel: 'Instance health check',
      apply: (model) => ({
        ...model,
        state: 'HEALTH_CHECK',
        recoveryInstanceStatus: 'HEALTH_CHECK',
        recoveryInstanceDetail: 'HEALTH CHECK',
        phaseLabel: 'Recovery Instance: BOOTING → HEALTH CHECK',
        simClockLabel: '21:07:00',
        logs: pushLog(model.logs, 'INFO', 'Application health check', '21:07:00'),
      }),
    },
    {
      state: 'HEALTH_CHECK',
      durationMs: 1400,
      phaseLabel: 'Recovery instance running',
      apply: (model) => ({
        ...model,
        recoveryInstanceStatus: 'RUNNING',
        recoveryInstanceDetail: 'RUNNING',
        phaseLabel: 'Recovery Instance: HEALTH CHECK → RUNNING',
        simClockLabel: '21:07:08',
      }),
    },
    {
      state: 'APPLICATION_STARTING',
      durationMs: 2000,
      phaseLabel: 'Application starting',
      apply: (model) => ({
        ...withUsers(model, 22, 6, 40),
        state: 'APPLICATION_STARTING',
        applicationStatus: 'STARTING',
        applicationLabel: 'STARTING',
        recoveryInstanceStatus: 'APPLICATION_ONLINE',
        trafficTarget: 'aws',
        phaseLabel: 'Application: STARTING',
        simClockLabel: '21:07:10',
        timeline: pushTimeline(
          model.timeline,
          '21:07:10',
          'Application Starting',
          'Business Application arranca en el entorno de recovery',
        ),
        logs: pushLog(model.logs, 'INFO', 'Application starting on recovery instance', '21:07:10'),
      }),
    },
    {
      state: 'RECOVERY_COMPLETE',
      durationMs: 0,
      phaseLabel: 'Disaster recovery complete',
      apply: (model, scenarioId) => {
        const scenario = getScenario(scenarioId)
        const recovered: SimulationModel = {
          ...withUsers(model, USERS_HEALTHY, RPS_HEALTHY, 100),
          state: 'RECOVERY_COMPLETE',
          sequence: 'none',
          stepIndex: -1,
          remainingMs: 0,
          applicationStatus: 'ONLINE',
          applicationLabel: 'ONLINE',
          recoveryInstanceStatus: 'APPLICATION_ONLINE',
          recoveryInstanceDetail: 'APPLICATION ONLINE',
          trafficTarget: 'aws',
          disasterAlert: false,
          banner: 'recovery-success',
          rpoAchievedSec: 5,
          rtoAchievedSec: 154,
          phaseLabel: 'DISASTER RECOVERY COMPLETE',
          simClockLabel: '21:07:44',
          demoComplete: model.demoMode,
          timeline: pushTimeline(
            pushTimeline(
              model.timeline,
              '21:07:44',
              'Application Online',
              'Usuarios redirigidos a AWS Recovery Instance (simulado)',
            ),
            '21:07:44',
            'Recovery Complete',
            scenario.recoveryNote,
          ),
          logs: pushLog(
            pushLog(model.logs, 'SUCCESS', 'Application recovered', '21:07:44'),
            'SUCCESS',
            'Disaster recovery complete (simulation)',
            '21:07:44',
          ),
        }
        return recovered
      },
    },
  ]
}

function failbackSteps(): SequenceStep[] {
  return [
    {
      state: 'FAILBACK_PREPARING',
      durationMs: 1800,
      phaseLabel: 'Preparing failback',
      apply: (model) => ({
        ...model,
        state: 'FAILBACK_PREPARING',
        banner: 'failback',
        phaseLabel: 'Preparing Failback',
        drsLabel: 'FAILBACK PREP',
        recoveryInstanceDetail: 'REPLICATION BACK',
        logs: pushLog(model.logs, 'INFO', 'Failback simulation started', '21:18:01'),
        simClockLabel: '21:18:01',
      }),
    },
    {
      state: 'FAILBACK_SYNC',
      durationMs: 2200,
      phaseLabel: 'Synchronizing data',
      apply: (model) => ({
        ...model,
        state: 'FAILBACK_SYNC',
        replicationStatus: 'SYNCING_BACK',
        replicationProgress: 64,
        primaryStatus: 'RESTORING',
        phaseLabel: 'Synchronizing Data → On-Premises',
        simClockLabel: '21:18:40',
        logs: pushLog(model.logs, 'INFO', 'Replicating changes back to on-premises (simulated)', '21:18:40'),
      }),
    },
    {
      state: 'FAILBACK_VALIDATION',
      durationMs: 1800,
      phaseLabel: 'Validating server',
      apply: (model) => ({
        ...model,
        state: 'FAILBACK_VALIDATION',
        replicationProgress: 92,
        phaseLabel: 'Validating Server',
        simClockLabel: '21:19:10',
        logs: pushLog(model.logs, 'INFO', 'Validating restored primary server', '21:19:10'),
      }),
    },
    {
      state: 'FAILBACK_VALIDATION',
      durationMs: 1800,
      phaseLabel: 'Starting primary',
      apply: (model) => ({
        ...model,
        primaryStatus: 'ONLINE',
        replicationProgress: 100,
        applicationStatus: 'STARTING',
        applicationLabel: 'STARTING',
        phaseLabel: 'Starting Primary',
        simClockLabel: '21:19:32',
        logs: pushLog(model.logs, 'INFO', 'Primary server starting', '21:19:32'),
      }),
    },
    {
      state: 'FAILBACK_COMPLETE',
      durationMs: 1400,
      phaseLabel: 'Traffic redirected',
      apply: (model) => ({
        ...withUsers(model, USERS_HEALTHY, RPS_HEALTHY, 100),
        state: 'FAILBACK_COMPLETE',
        trafficTarget: 'onprem',
        applicationStatus: 'ONLINE',
        applicationLabel: 'ONLINE',
        recoveryInstanceStatus: 'STOPPED',
        recoveryInstanceDetail: 'STOPPED',
        replicationStatus: 'SYNCED',
        drsLabel: 'READY',
        lastRecoveryPointLabel: '5 seconds ago',
        disasterAlert: false,
        phaseLabel: 'Traffic Redirected',
        simClockLabel: '21:19:50',
        logs: pushLog(model.logs, 'SUCCESS', 'Traffic redirected to on-premises', '21:19:50'),
      }),
    },
    {
      state: 'FAILBACK_COMPLETE',
      durationMs: 0,
      phaseLabel: 'Failback complete',
      apply: (model) => ({
        ...model,
        sequence: 'none',
        stepIndex: -1,
        remainingMs: 0,
        banner: 'failback-success',
        demoComplete: model.demoMode,
        phaseLabel: 'Failback Complete',
        simClockLabel: '21:20:02',
        recoveryPointSelected: false,
        rtoAchievedSec: null,
        logs: pushLog(model.logs, 'SUCCESS', 'Failback complete (simulation)', '21:20:02'),
      }),
    },
  ]
}

function applyStep(
  model: SimulationModel,
  kind: SequenceKind,
  index: number,
): SimulationModel {
  const steps = kind === 'disaster' ? disasterSteps() : failbackSteps()
  const step = steps[index]
  if (!step) {
    return model
  }
  const next = step.apply({ ...model, state: step.state, phaseLabel: step.phaseLabel }, model.scenarioId)
  const finished = step.durationMs === 0
  return {
    ...next,
    sequence: finished ? 'none' : kind,
    stepIndex: finished ? -1 : index,
    remainingMs: finished ? 0 : step.durationMs,
    state: next.state,
  }
}

function interpolateDuringStep(model: SimulationModel, dt: number): SimulationModel {
  const speed = model.speed
  const factor = Math.min(1, (dt / 1000) * speed)
  if (model.state === 'FAILURE_DETECTED' || model.state === 'REPLICATION_PAUSED') {
    return withUsers(
      model,
      Math.max(0, model.usersConnected - 18 * factor),
      Math.max(0, model.requestsPerSec - 8 * factor),
      Math.max(0, model.availability - 20 * factor),
    )
  }
  if (model.state === 'APPLICATION_STARTING') {
    return withUsers(
      model,
      Math.min(USERS_HEALTHY, model.usersConnected + 16 * factor),
      Math.min(RPS_HEALTHY, model.requestsPerSec + 6 * factor),
      Math.min(100, model.availability + 18 * factor),
    )
  }
  if (model.state === 'FAILBACK_SYNC') {
    return {
      ...model,
      replicationProgress: Math.min(100, model.replicationProgress + 8 * factor),
    }
  }
  return model
}

export function useDisasterSimulation() {
  const [sim, setSim] = useState<SimulationModel>(() => createInitialModel())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSim((current) => {
        const chart = current.paused
          ? current.chart
          : [...current.chart.slice(-MAX_CHART + 1), nextChartPoint(current)]

        if (current.paused || current.sequence === 'none') {
          return { ...current, chart }
        }

        const remaining = current.remainingMs - TICK_MS * current.speed
        const moved = interpolateDuringStep({ ...current, chart }, TICK_MS)

        if (remaining > 0) {
          return { ...moved, remainingMs: remaining }
        }

        const steps = current.sequence === 'disaster' ? disasterSteps() : failbackSteps()
        const nextIndex = current.stepIndex + 1
        if (nextIndex >= steps.length) {
          return { ...moved, sequence: 'none', remainingMs: 0, stepIndex: -1 }
        }
        return applyStep(moved, current.sequence, nextIndex)
      })
    }, TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

  const scenario = useMemo(() => getScenario(sim.scenarioId), [sim.scenarioId])

  const canStartDisaster =
    !sim.paused &&
    sim.sequence === 'none' &&
    (sim.state === 'PRIMARY_ONLINE' ||
      sim.state === 'READY' ||
      sim.state === 'FAILBACK_COMPLETE') &&
    sim.trafficTarget === 'onprem' &&
    sim.primaryStatus === 'ONLINE'

  const canFailback =
    !sim.paused && sim.sequence === 'none' && sim.state === 'RECOVERY_COMPLETE'

  const canSkip =
    sim.sequence !== 'failback' &&
    !(sim.state === 'RECOVERY_COMPLETE' && sim.sequence === 'none')

  const startDisaster = useCallback(() => {
    setSim((current) => {
      if (
        current.sequence !== 'none' ||
        (current.state !== 'PRIMARY_ONLINE' &&
          current.state !== 'READY' &&
          current.state !== 'FAILBACK_COMPLETE')
      ) {
        return current
      }
      const base =
        current.state === 'FAILBACK_COMPLETE'
          ? { ...current, rpoAchievedSec: null, rtoAchievedSec: null, banner: 'none' as const }
          : current
      return applyStep(base, 'disaster', 0)
    })
  }, [])

  const startFailback = useCallback(() => {
    setSim((current) => {
      if (current.state !== 'RECOVERY_COMPLETE' || current.sequence !== 'none') {
        return current
      }
      return applyStep(current, 'failback', 0)
    })
  }, [])

  const pause = useCallback(() => {
    setSim((current) => ({ ...current, paused: true }))
  }, [])

  const resume = useCallback(() => {
    setSim((current) => ({ ...current, paused: false }))
  }, [])

  const reset = useCallback(() => {
    setSim((current) =>
      createInitialModel(current.scenarioId),
    )
  }, [])

  const skipToRecovery = useCallback(() => {
    setSim((current) => {
      if (current.state === 'RECOVERY_COMPLETE' && current.sequence === 'none') {
        return current
      }
      let next =
        current.sequence === 'disaster'
          ? current
          : applyStep(
              {
                ...createInitialModel(current.scenarioId),
                speed: current.speed,
                presentationMode: current.presentationMode,
                demoMode: current.demoMode,
              },
              'disaster',
              0,
            )
      const steps = disasterSteps()
      for (let i = next.stepIndex + 1; i < steps.length; i += 1) {
        next = applyStep(next, 'disaster', i)
      }
      return { ...next, demoComplete: current.demoMode }
    })
  }, [])

  const setSpeed = useCallback((speed: SimulationSpeed) => {
    setSim((current) => ({ ...current, speed }))
  }, [])

  const setScenario = useCallback((scenarioId: ScenarioId) => {
    setSim((current) => {
      if (current.sequence !== 'none') {
        return current
      }
      return { ...createInitialModel(scenarioId), presentationMode: current.presentationMode }
    })
  }, [])

  const togglePresentation = useCallback(() => {
    setSim((current) => ({ ...current, presentationMode: !current.presentationMode }))
  }, [])

  const toggleHowItWorks = useCallback(() => {
    setSim((current) => ({ ...current, howItWorksOpen: !current.howItWorksOpen }))
  }, [])

  const startDemo = useCallback(() => {
    setSim((current) => {
      const base = createInitialModel(current.scenarioId)
      const running = applyStep(
        {
          ...base,
          demoMode: true,
          presentationMode: current.presentationMode,
          speed: current.speed,
        },
        'disaster',
        0,
      )
      return running
    })
  }, [])

  const runAgain = useCallback(() => {
    setSim((current) => {
      const base = createInitialModel(current.scenarioId)
      return applyStep(
        {
          ...base,
          demoMode: true,
          presentationMode: current.presentationMode,
          speed: current.speed,
        },
        'disaster',
        0,
      )
    })
  }, [])

  const dismissDemo = useCallback(() => {
    setSim((current) => ({ ...current, demoComplete: false, demoMode: false }))
  }, [])

  const headerStatus = sim.sequence !== 'none' ? 'Running' : sim.paused ? 'Paused' : 'Ready'

  return {
    sim,
    scenario,
    headerStatus,
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
    setScenario,
    togglePresentation,
    toggleHowItWorks,
    startDemo,
    runAgain,
    dismissDemo,
  }
}

export type DisasterSimulationApi = ReturnType<typeof useDisasterSimulation>
