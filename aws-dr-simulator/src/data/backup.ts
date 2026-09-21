import type {
  BackupJob,
  BackupPlan,
  BackupVault,
  LifecycleRule,
  ObjectVersion,
  ProtectedResource,
  StorageClassId,
  StorageClassInfo,
  VirtualTape,
} from '../types/backup'

/** Precios ilustrativos por GB/mes (referencia aproximada de us-east-1). No son una cotización. */
export const STORAGE_CLASSES: StorageClassInfo[] = [
  {
    id: 'STANDARD',
    name: 'S3 Standard',
    shortName: 'Standard',
    useCase: 'Datos activos y backups recientes de acceso frecuente',
    retrieval: 'Milisegundos',
    minDuration: 'Sin mínimo',
    availabilityZones: '3+ AZ',
    pricePerGbMonth: 0.023,
    color: '#38bdf8',
  },
  {
    id: 'INTELLIGENT_TIERING',
    name: 'S3 Intelligent-Tiering',
    shortName: 'Intelligent-Tiering',
    useCase: 'Patrones de acceso desconocidos o cambiantes; mueve datos automáticamente',
    retrieval: 'Milisegundos',
    minDuration: 'Sin mínimo',
    availabilityZones: '3+ AZ',
    pricePerGbMonth: 0.023,
    color: '#a78bfa',
  },
  {
    id: 'STANDARD_IA',
    name: 'S3 Standard-IA',
    shortName: 'Standard-IA',
    useCase: 'Acceso infrecuente con recuperación inmediata (backups de 30 a 90 días)',
    retrieval: 'Milisegundos',
    minDuration: '30 días',
    availabilityZones: '3+ AZ',
    pricePerGbMonth: 0.0125,
    color: '#34d399',
  },
  {
    id: 'ONEZONE_IA',
    name: 'S3 One Zone-IA',
    shortName: 'One Zone-IA',
    useCase: 'Copias secundarias recreables, menor costo en una sola AZ',
    retrieval: 'Milisegundos',
    minDuration: '30 días',
    availabilityZones: '1 AZ',
    pricePerGbMonth: 0.01,
    color: '#fbbf24',
  },
  {
    id: 'GLACIER_IR',
    name: 'S3 Glacier Instant Retrieval',
    shortName: 'Glacier Instant',
    useCase: 'Archivo con acceso trimestral y recuperación en milisegundos',
    retrieval: 'Milisegundos',
    minDuration: '90 días',
    availabilityZones: '3+ AZ',
    pricePerGbMonth: 0.004,
    color: '#f97316',
  },
  {
    id: 'GLACIER_FLEXIBLE',
    name: 'S3 Glacier Flexible Retrieval',
    shortName: 'Glacier Flexible',
    useCase: 'Archivo y cintas virtuales; recuperación en minutos u horas',
    retrieval: '1 min a 12 h',
    minDuration: '90 días',
    availabilityZones: '3+ AZ',
    pricePerGbMonth: 0.0036,
    color: '#fb7185',
  },
  {
    id: 'DEEP_ARCHIVE',
    name: 'S3 Glacier Deep Archive',
    shortName: 'Deep Archive',
    useCase: 'Retención regulatoria de 7 a 10 años al menor costo',
    retrieval: '12 a 48 h',
    minDuration: '180 días',
    availabilityZones: '3+ AZ',
    pricePerGbMonth: 0.00099,
    color: '#94a3b8',
  },
]

export const LIFECYCLE_RULES: LifecycleRule[] = [
  { afterDays: 0, to: 'STANDARD', label: 'Ingesta' },
  { afterDays: 30, to: 'STANDARD_IA', label: '30 días' },
  { afterDays: 90, to: 'GLACIER_IR', label: '90 días' },
  { afterDays: 180, to: 'GLACIER_FLEXIBLE', label: '180 días' },
  { afterDays: 365, to: 'DEEP_ARCHIVE', label: '1 año' },
  { afterDays: 2555, to: 'EXPIRE', label: '7 años' },
]

/** Cadena de transición usada por la simulación de envejecimiento de datos. */
export const LIFECYCLE_CHAIN: Array<{ from: StorageClassId; to: StorageClassId | 'EXPIRE'; dailyRate: number }> = [
  { from: 'STANDARD', to: 'STANDARD_IA', dailyRate: 0.02 },
  { from: 'STANDARD_IA', to: 'GLACIER_IR', dailyRate: 0.012 },
  { from: 'GLACIER_IR', to: 'GLACIER_FLEXIBLE', dailyRate: 0.009 },
  { from: 'GLACIER_FLEXIBLE', to: 'DEEP_ARCHIVE', dailyRate: 0.006 },
  { from: 'DEEP_ARCHIVE', to: 'EXPIRE', dailyRate: 0.0008 },
]

export const PROTECTED_RESOURCES: ProtectedResource[] = [
  { id: 'web-srv-01', name: 'WEB-SRV-01', type: 'EC2', sizeGb: 120, plan: 'Daily-Production' },
  { id: 'db-prod-01', name: 'DB-PROD-01', type: 'RDS', sizeGb: 340, plan: 'Daily-Production' },
  { id: 'files-01', name: 'FILES-01', type: 'EFS', sizeGb: 210, plan: 'Daily-Production' },
  { id: 'data-vol-02', name: 'DATA-VOL-02', type: 'EBS', sizeGb: 500, plan: 'Weekly-Compliance' },
  { id: 'orders-table', name: 'ORDERS', type: 'DynamoDB', sizeGb: 38, plan: 'Daily-Production' },
  { id: 'docs-bucket', name: 'magnatic-docs-prod', type: 'S3', sizeGb: 860, plan: 'Monthly-Archive' },
]

export const BACKUP_PLANS: BackupPlan[] = [
  {
    id: 'daily',
    name: 'Daily-Production',
    schedule: 'Diario 02:00 UTC',
    retention: '35 días',
    coldStorageAfter: 'No aplica',
    vault: 'Primary-Vault',
    copyTo: 'CrossRegion-Vault (us-west-2)',
    resources: 8,
  },
  {
    id: 'weekly',
    name: 'Weekly-Compliance',
    schedule: 'Domingos 01:00 UTC',
    retention: '1 año',
    coldStorageAfter: '30 días',
    vault: 'Compliance-Vault',
    copyTo: 'CrossRegion-Vault (us-west-2)',
    resources: 3,
  },
  {
    id: 'monthly',
    name: 'Monthly-Archive',
    schedule: 'Día 1 de cada mes',
    retention: '7 años',
    coldStorageAfter: '90 días',
    vault: 'Compliance-Vault',
    copyTo: 'Sin copia',
    resources: 1,
  },
]

export const BACKUP_VAULTS: BackupVault[] = [
  {
    id: 'primary',
    name: 'Primary-Vault',
    region: 'us-east-1',
    recoveryPoints: 184,
    encryption: 'AWS KMS (CMK)',
    vaultLock: false,
  },
  {
    id: 'compliance',
    name: 'Compliance-Vault',
    region: 'us-east-1',
    recoveryPoints: 42,
    encryption: 'AWS KMS (CMK)',
    vaultLock: true,
  },
  {
    id: 'crossregion',
    name: 'CrossRegion-Vault',
    region: 'us-west-2',
    recoveryPoints: 184,
    encryption: 'AWS KMS (CMK)',
    vaultLock: false,
  },
]

export const INITIAL_JOBS: BackupJob[] = [
  {
    id: 'job-3',
    kind: 'BACKUP',
    resource: 'DB-PROD-01',
    resourceType: 'RDS',
    plan: 'Daily-Production',
    vault: 'Primary-Vault',
    status: 'RUNNING',
    progress: 42,
    sizeGb: 340,
    startedAt: '02:00:04',
    finishedAt: null,
  },
  {
    id: 'job-2',
    kind: 'BACKUP',
    resource: 'WEB-SRV-01',
    resourceType: 'EC2',
    plan: 'Daily-Production',
    vault: 'Primary-Vault',
    status: 'COMPLETED',
    progress: 100,
    sizeGb: 120,
    startedAt: '02:00:01',
    finishedAt: '02:06:38',
  },
  {
    id: 'job-1',
    kind: 'COPY',
    resource: 'WEB-SRV-01',
    resourceType: 'EC2',
    plan: 'Daily-Production',
    vault: 'CrossRegion-Vault',
    status: 'COMPLETED',
    progress: 100,
    sizeGb: 120,
    startedAt: '02:06:40',
    finishedAt: '02:11:02',
  },
]

export const INITIAL_VERSIONS: ObjectVersion[] = [
  {
    versionId: 'v-9c1f2a7e',
    sizeKb: 2480,
    modified: '2026-09-20 08:15',
    isLatest: true,
    deleteMarker: false,
    storageClass: 'STANDARD',
  },
  {
    versionId: 'v-5b7d013c',
    sizeKb: 2410,
    modified: '2026-09-13 17:42',
    isLatest: false,
    deleteMarker: false,
    storageClass: 'STANDARD',
  },
  {
    versionId: 'v-a02e88f1',
    sizeKb: 2325,
    modified: '2026-08-31 09:03',
    isLatest: false,
    deleteMarker: false,
    storageClass: 'STANDARD_IA',
  },
  {
    versionId: 'v-33d9e6b0',
    sizeKb: 2190,
    modified: '2026-06-30 18:20',
    isLatest: false,
    deleteMarker: false,
    storageClass: 'GLACIER_IR',
  },
]

export const INITIAL_TAPES: VirtualTape[] = [
  {
    barcode: 'MAG001L6',
    sizeGb: 2500,
    usedGb: 1840,
    status: 'IN_USE',
    pool: 'GLACIER_FLEXIBLE',
    progress: 0,
    created: '2026-09-14',
  },
  {
    barcode: 'MAG002L6',
    sizeGb: 2500,
    usedGb: 2500,
    status: 'AVAILABLE',
    pool: 'GLACIER_FLEXIBLE',
    progress: 0,
    created: '2026-09-07',
  },
  {
    barcode: 'MAG003L6',
    sizeGb: 2500,
    usedGb: 2500,
    status: 'ARCHIVED',
    pool: 'GLACIER_FLEXIBLE',
    progress: 100,
    created: '2026-08-10',
  },
  {
    barcode: 'MAG004L6',
    sizeGb: 2500,
    usedGb: 2500,
    status: 'ARCHIVED',
    pool: 'DEEP_ARCHIVE',
    progress: 100,
    created: '2026-03-02',
  },
]

export const INITIAL_DISTRIBUTION_GB: Record<StorageClassId, number> = {
  STANDARD: 1860,
  INTELLIGENT_TIERING: 640,
  STANDARD_IA: 2420,
  ONEZONE_IA: 380,
  GLACIER_IR: 3150,
  GLACIER_FLEXIBLE: 5900,
  DEEP_ARCHIVE: 14200,
}

export function getStorageClass(id: StorageClassId): StorageClassInfo {
  return STORAGE_CLASSES.find((item) => item.id === id) ?? STORAGE_CLASSES[0]!
}
