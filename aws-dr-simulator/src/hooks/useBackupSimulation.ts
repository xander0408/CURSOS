import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  INITIAL_DISTRIBUTION_GB,
  INITIAL_JOBS,
  INITIAL_TAPES,
  INITIAL_VERSIONS,
  LIFECYCLE_CHAIN,
  PROTECTED_RESOURCES,
  STORAGE_CLASSES,
} from '../data/backup'
import type {
  ActivityEntry,
  ActivityLevel,
  BackupJob,
  BackupModel,
  ObjectVersion,
  StorageClassId,
  TapePool,
  VirtualTape,
} from '../types/backup'

const TICK_MS = 250
const TICKS_PER_DAY = 4
const MAX_ACTIVITY = 60
const DAILY_INGEST_GB = 6

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function nowLabel(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

function todayLabel(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  return `${date} ${now.toTimeString().slice(0, 5)}`
}

function log(activity: ActivityEntry[], level: ActivityLevel, message: string): ActivityEntry[] {
  return [{ id: uid('act'), time: nowLabel(), level, message }, ...activity].slice(0, MAX_ACTIVITY)
}

function ageDistribution(
  distribution: Record<StorageClassId, number>,
  days: number,
): Record<StorageClassId, number> {
  const next = { ...distribution }
  for (let day = 0; day < days; day += 1) {
    next.STANDARD += DAILY_INGEST_GB
    for (const rule of LIFECYCLE_CHAIN) {
      const moved = next[rule.from] * rule.dailyRate
      next[rule.from] -= moved
      if (rule.to !== 'EXPIRE') {
        next[rule.to] += moved
      }
    }
  }
  return next
}

export function createInitialBackupModel(): BackupModel {
  return {
    jobs: INITIAL_JOBS,
    versions: INITIAL_VERSIONS,
    tapes: INITIAL_TAPES,
    distributionGb: { ...INITIAL_DISTRIBUTION_GB },
    lifecycleDay: 0,
    recoveryPointsBase: 410,
    activity: [
      { id: 'act-0', time: '02:00:00', level: 'INFO', message: 'Backup window opened for plan Daily-Production' },
      { id: 'act-1', time: '02:00:01', level: 'INFO', message: 'Backup job started: WEB-SRV-01 (EC2)' },
      { id: 'act-2', time: '02:06:38', level: 'SUCCESS', message: 'Recovery point created in Primary-Vault: WEB-SRV-01' },
      { id: 'act-3', time: '02:11:02', level: 'SUCCESS', message: 'Copy job completed to CrossRegion-Vault (us-west-2)' },
      { id: 'act-4', time: '02:00:04', level: 'INFO', message: 'Backup job started: DB-PROD-01 (RDS)' },
    ],
  }
}

export function useBackupSimulation() {
  const [model, setModel] = useState<BackupModel>(createInitialBackupModel)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((value) => value + 1)
      setModel((current) => {
        let activity = current.activity
        let distribution = current.distributionGb
        let recoveryPointsBase = current.recoveryPointsBase

        const jobs = current.jobs.map((job) => {
          if (job.status !== 'RUNNING') {
            return job
          }
          const progress = Math.min(100, job.progress + 1.2 + Math.random() * 2.4)
          if (progress < 100) {
            return { ...job, progress }
          }
          if (job.kind === 'BACKUP') {
            distribution = { ...distribution, STANDARD: distribution.STANDARD + job.sizeGb }
            recoveryPointsBase += 1
            activity = log(activity, 'SUCCESS', `Recovery point created in ${job.vault}: ${job.resource}`)
          } else if (job.kind === 'RESTORE') {
            activity = log(activity, 'SUCCESS', `Restore completed: ${job.resource} recovered from ${job.vault}`)
          } else {
            activity = log(activity, 'SUCCESS', `Copy completed to ${job.vault}: ${job.resource}`)
          }
          return { ...job, status: 'COMPLETED' as const, progress: 100, finishedAt: nowLabel() }
        })

        const tapes = current.tapes.map((tape) => {
          if (tape.status === 'ARCHIVING') {
            const progress = Math.min(100, tape.progress + 3)
            if (progress >= 100) {
              activity = log(activity, 'SUCCESS', `Tape ${tape.barcode} archived to Virtual Tape Shelf (${tape.pool.replace('_', ' ')})`)
              return { ...tape, status: 'ARCHIVED' as const, progress: 100 }
            }
            return { ...tape, progress }
          }
          if (tape.status === 'RETRIEVING') {
            const progress = Math.min(100, tape.progress + (tape.pool === 'DEEP_ARCHIVE' ? 1.2 : 2.2))
            if (progress >= 100) {
              activity = log(activity, 'SUCCESS', `Tape ${tape.barcode} retrieved to gateway and available`)
              return { ...tape, status: 'AVAILABLE' as const, progress: 0 }
            }
            return { ...tape, progress }
          }
          return tape
        })

        const advanceDay = Math.random() < 1 / TICKS_PER_DAY
        const lifecycleDay = advanceDay ? current.lifecycleDay + 1 : current.lifecycleDay
        if (advanceDay) {
          distribution = ageDistribution(distribution, 1)
        }

        return {
          ...current,
          jobs,
          tapes,
          activity,
          distributionGb: distribution,
          lifecycleDay,
          recoveryPointsBase,
        }
      })
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [])

  const runOnDemandBackup = useCallback((resourceId: string) => {
    const resource = PROTECTED_RESOURCES.find((item) => item.id === resourceId)
    if (!resource) {
      return
    }
    setModel((current) => {
      const job: BackupJob = {
        id: uid('job'),
        kind: 'BACKUP',
        resource: resource.name,
        resourceType: resource.type,
        plan: 'On-demand',
        vault: 'Primary-Vault',
        status: 'RUNNING',
        progress: 0,
        sizeGb: resource.sizeGb,
        startedAt: nowLabel(),
        finishedAt: null,
      }
      return {
        ...current,
        jobs: [job, ...current.jobs].slice(0, 12),
        activity: log(current.activity, 'INFO', `On-demand backup started: ${resource.name} (${resource.type})`),
      }
    })
  }, [])

  const restoreFromJob = useCallback((jobId: string) => {
    setModel((current) => {
      const source = current.jobs.find((job) => job.id === jobId)
      if (!source || source.status !== 'COMPLETED' || source.kind === 'RESTORE') {
        return current
      }
      const job: BackupJob = {
        id: uid('rst'),
        kind: 'RESTORE',
        resource: source.resource,
        resourceType: source.resourceType,
        plan: source.plan,
        vault: source.vault,
        status: 'RUNNING',
        progress: 0,
        sizeGb: source.sizeGb,
        startedAt: nowLabel(),
        finishedAt: null,
      }
      return {
        ...current,
        jobs: [job, ...current.jobs].slice(0, 12),
        activity: log(current.activity, 'INFO', `Restore job started: ${source.resource} from ${source.vault}`),
      }
    })
  }, [])

  const uploadVersion = useCallback(() => {
    setModel((current) => {
      const latestSize = current.versions.find((v) => !v.deleteMarker)?.sizeKb ?? 2400
      const version: ObjectVersion = {
        versionId: uid('v'),
        sizeKb: Math.round(latestSize + 40 + Math.random() * 90),
        modified: todayLabel(),
        isLatest: true,
        deleteMarker: false,
        storageClass: 'STANDARD',
      }
      return {
        ...current,
        versions: [version, ...current.versions.map((v) => ({ ...v, isLatest: false }))],
        activity: log(current.activity, 'INFO', `New object version uploaded: ${version.versionId}`),
      }
    })
  }, [])

  const deleteObject = useCallback(() => {
    setModel((current) => {
      const latest = current.versions[0]
      if (latest?.deleteMarker) {
        return current
      }
      const marker: ObjectVersion = {
        versionId: uid('dm'),
        sizeKb: 0,
        modified: todayLabel(),
        isLatest: true,
        deleteMarker: true,
        storageClass: 'STANDARD',
      }
      return {
        ...current,
        versions: [marker, ...current.versions.map((v) => ({ ...v, isLatest: false }))],
        activity: log(current.activity, 'WARN', 'Delete marker created. Previous versions are retained'),
      }
    })
  }, [])

  const removeDeleteMarker = useCallback(() => {
    setModel((current) => {
      const [latest, ...rest] = current.versions
      if (!latest?.deleteMarker || rest.length === 0) {
        return current
      }
      const [first, ...others] = rest
      if (!first) {
        return current
      }
      return {
        ...current,
        versions: [{ ...first, isLatest: true }, ...others],
        activity: log(current.activity, 'SUCCESS', 'Delete marker removed. Object is visible again'),
      }
    })
  }, [])

  const restoreVersion = useCallback((versionId: string) => {
    setModel((current) => {
      const source = current.versions.find((v) => v.versionId === versionId)
      if (!source || source.deleteMarker) {
        return current
      }
      const restored: ObjectVersion = {
        ...source,
        versionId: uid('v'),
        modified: todayLabel(),
        isLatest: true,
        storageClass: 'STANDARD',
      }
      return {
        ...current,
        versions: [restored, ...current.versions.map((v) => ({ ...v, isLatest: false }))],
        activity: log(current.activity, 'SUCCESS', `Version ${source.versionId} restored as current object`),
      }
    })
  }, [])

  const createTape = useCallback((pool: TapePool) => {
    setModel((current) => {
      const index = current.tapes.length + 1
      const tape: VirtualTape = {
        barcode: `MAG${String(index).padStart(3, '0')}L6`,
        sizeGb: 2500,
        usedGb: 0,
        status: 'AVAILABLE',
        pool,
        progress: 0,
        created: new Date().toISOString().slice(0, 10),
      }
      return {
        ...current,
        tapes: [...current.tapes, tape],
        activity: log(current.activity, 'INFO', `Virtual tape ${tape.barcode} created (pool ${pool.replace('_', ' ')})`),
      }
    })
  }, [])

  const archiveTape = useCallback((barcode: string) => {
    setModel((current) => {
      const tape = current.tapes.find((item) => item.barcode === barcode)
      if (!tape || (tape.status !== 'AVAILABLE' && tape.status !== 'IN_USE')) {
        return current
      }
      return {
        ...current,
        tapes: current.tapes.map((item) =>
          item.barcode === barcode ? { ...item, status: 'ARCHIVING', progress: 0, usedGb: item.sizeGb } : item,
        ),
        activity: log(current.activity, 'INFO', `Tape ${barcode} ejected. Archiving to Virtual Tape Shelf`),
      }
    })
  }, [])

  const retrieveTape = useCallback((barcode: string) => {
    setModel((current) => {
      const tape = current.tapes.find((item) => item.barcode === barcode)
      if (!tape || tape.status !== 'ARCHIVED') {
        return current
      }
      const eta = tape.pool === 'DEEP_ARCHIVE' ? '12 to 48 h' : '3 to 5 h'
      return {
        ...current,
        tapes: current.tapes.map((item) =>
          item.barcode === barcode ? { ...item, status: 'RETRIEVING', progress: 0 } : item,
        ),
        activity: log(current.activity, 'INFO', `Tape ${barcode} retrieval requested (typical ${eta}, accelerated in simulation)`),
      }
    })
  }, [])

  const advanceLifecycle = useCallback((days: number) => {
    setModel((current) => ({
      ...current,
      distributionGb: ageDistribution(current.distributionGb, days),
      lifecycleDay: current.lifecycleDay + days,
      activity: log(current.activity, 'INFO', `Lifecycle evaluation: ${days} simulated days applied to S3 objects`),
    }))
  }, [])

  const resetBackup = useCallback(() => {
    setModel(createInitialBackupModel())
  }, [])

  const totals = useMemo(() => {
    const totalGb = STORAGE_CLASSES.reduce((sum, cls) => sum + model.distributionGb[cls.id], 0)
    const monthlyCost = STORAGE_CLASSES.reduce(
      (sum, cls) => sum + model.distributionGb[cls.id] * cls.pricePerGbMonth,
      0,
    )
    const standardOnlyCost = totalGb * (STORAGE_CLASSES[0]?.pricePerGbMonth ?? 0.023)
    const completed = model.jobs.filter((job) => job.status === 'COMPLETED').length
    const running = model.jobs.filter((job) => job.status === 'RUNNING').length
    const failed = model.jobs.filter((job) => job.status === 'FAILED').length
    const successRate = completed + failed === 0 ? 100 : Math.round((completed / (completed + failed)) * 100)
    return { totalGb, monthlyCost, standardOnlyCost, completed, running, successRate }
  }, [model.distributionGb, model.jobs])

  return {
    model,
    tick,
    totals,
    runOnDemandBackup,
    restoreFromJob,
    uploadVersion,
    deleteObject,
    removeDeleteMarker,
    restoreVersion,
    createTape,
    archiveTape,
    retrieveTape,
    advanceLifecycle,
    resetBackup,
  }
}

export type BackupSimulationApi = ReturnType<typeof useBackupSimulation>
