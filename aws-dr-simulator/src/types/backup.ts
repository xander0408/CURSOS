export type { ConsoleView } from './console'

export type StorageClassId =
  | 'STANDARD'
  | 'INTELLIGENT_TIERING'
  | 'STANDARD_IA'
  | 'ONEZONE_IA'
  | 'GLACIER_IR'
  | 'GLACIER_FLEXIBLE'
  | 'DEEP_ARCHIVE'

export interface StorageClassInfo {
  id: StorageClassId
  name: string
  shortName: string
  useCase: string
  retrieval: string
  minDuration: string
  availabilityZones: string
  pricePerGbMonth: number
  color: string
}

export interface LifecycleRule {
  afterDays: number
  to: StorageClassId | 'EXPIRE'
  label: string
}

export type ResourceType = 'EC2' | 'EBS' | 'RDS' | 'EFS' | 'DynamoDB' | 'S3'

export interface ProtectedResource {
  id: string
  name: string
  type: ResourceType
  sizeGb: number
  plan: string
}

export interface BackupPlan {
  id: string
  name: string
  schedule: string
  retention: string
  coldStorageAfter: string
  vault: string
  copyTo: string
  resources: number
}

export interface BackupVault {
  id: string
  name: string
  region: string
  recoveryPoints: number
  encryption: string
  vaultLock: boolean
}

export type JobStatus = 'RUNNING' | 'COMPLETED' | 'FAILED'
export type JobKind = 'BACKUP' | 'RESTORE' | 'COPY'

export interface BackupJob {
  id: string
  kind: JobKind
  resource: string
  resourceType: ResourceType
  plan: string
  vault: string
  status: JobStatus
  progress: number
  sizeGb: number
  startedAt: string
  finishedAt: string | null
}

export interface ObjectVersion {
  versionId: string
  sizeKb: number
  modified: string
  isLatest: boolean
  deleteMarker: boolean
  storageClass: StorageClassId
}

export type TapeStatus = 'AVAILABLE' | 'IN_USE' | 'ARCHIVING' | 'ARCHIVED' | 'RETRIEVING'
export type TapePool = 'GLACIER_FLEXIBLE' | 'DEEP_ARCHIVE'

export interface VirtualTape {
  barcode: string
  sizeGb: number
  usedGb: number
  status: TapeStatus
  pool: TapePool
  progress: number
  created: string
}

export type ActivityLevel = 'INFO' | 'SUCCESS' | 'WARN'

export interface ActivityEntry {
  id: string
  time: string
  level: ActivityLevel
  message: string
}

export interface BackupModel {
  jobs: BackupJob[]
  versions: ObjectVersion[]
  tapes: VirtualTape[]
  distributionGb: Record<StorageClassId, number>
  lifecycleDay: number
  recoveryPointsBase: number
  activity: ActivityEntry[]
}
