export type SimulationState =
  | 'READY'
  | 'PRIMARY_ONLINE'
  | 'FAILURE_DETECTED'
  | 'REPLICATION_PAUSED'
  | 'RECOVERY_POINT_SELECTED'
  | 'RECOVERY_STARTING'
  | 'RECOVERY_BOOTING'
  | 'HEALTH_CHECK'
  | 'APPLICATION_STARTING'
  | 'RECOVERY_COMPLETE'
  | 'FAILBACK_PREPARING'
  | 'FAILBACK_SYNC'
  | 'FAILBACK_VALIDATION'
  | 'FAILBACK_COMPLETE'

export type ScenarioId =
  | 'server-failure'
  | 'dc-failure'
  | 'network-failure'
  | 'app-failure'

export type SimulationSpeed = 0.5 | 1 | 2 | 5

export type TrafficTarget = 'onprem' | 'aws'

export type PrimaryStatus =
  | 'ONLINE'
  | 'FAILURE_DETECTED'
  | 'FAILED'
  | 'RESTORING'

export type ReplicationStatus = 'SYNCED' | 'PAUSED' | 'LAST_KNOWN_GOOD' | 'SYNCING_BACK'

export type RecoveryInstanceStatus =
  | 'STOPPED'
  | 'STARTING'
  | 'BOOTING'
  | 'HEALTH_CHECK'
  | 'RUNNING'
  | 'APPLICATION_ONLINE'

export type ApplicationStatus = 'ONLINE' | 'OFFLINE' | 'STARTING' | 'DEGRADED'

export type LogLevel = 'INFO' | 'CRITICAL' | 'SUCCESS' | 'WARN'

export type SequenceKind = 'none' | 'disaster' | 'failback'

export interface TimelineEvent {
  id: string
  time: string
  title: string
  detail: string
}

export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  time: string
}

export interface ChartPoint {
  t: string
  latencyMs: number
  throughputMbps: number
  recoveryPointAgeSec: number
}

export interface ScenarioDefinition {
  id: ScenarioId
  label: string
  shortLabel: string
  failureHeadline: string
  failureDetail: string
  detectingMessage: string
  recoveryNote: string
}

export interface SimulationModel {
  state: SimulationState
  scenarioId: ScenarioId
  speed: SimulationSpeed
  paused: boolean
  presentationMode: boolean
  demoMode: boolean
  demoComplete: boolean
  howItWorksOpen: boolean
  sequence: SequenceKind
  stepIndex: number
  remainingMs: number
  primaryStatus: PrimaryStatus
  replicationStatus: ReplicationStatus
  replicationProgress: number
  lastRecoveryPointLabel: string
  rpoSeconds: number
  drsLabel: string
  recoveryInstanceStatus: RecoveryInstanceStatus
  recoveryInstanceDetail: string
  applicationStatus: ApplicationStatus
  applicationLabel: string
  trafficTarget: TrafficTarget
  usersConnected: number
  requestsPerSec: number
  availability: number
  rpoTargetSec: number
  rtoTargetSec: number
  rpoAchievedSec: number | null
  rtoAchievedSec: number | null
  recoveryPointSelected: boolean
  recoveryPointTimestamp: string
  banner:
    | 'none'
    | 'disaster'
    | 'recovering'
    | 'recovery-success'
    | 'failback'
    | 'failback-success'
    | 'demo-complete'
  phaseLabel: string
  timeline: TimelineEvent[]
  logs: LogEntry[]
  chart: ChartPoint[]
  simClockLabel: string
  disasterAlert: boolean
}
