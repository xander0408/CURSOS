import { useCallback, useEffect, useMemo, useState } from 'react'
import { AI_SERVICES, INITIAL_ENDPOINTS, INITIAL_JOBS, type InferenceEndpoint, type TrainingJob } from '../data/ml'
import { pushFeed, seedFeed, uid } from '../lib/feed'
import type { FeedEntry } from '../types/console'

interface ServiceCounters {
  [serviceId: string]: number
}

interface MlModel {
  jobs: TrainingJob[]
  endpoints: InferenceEndpoint[]
  ragStep: number
  ragRunning: boolean
  tokens: number
  latencyMs: number
  selectedModel: string
  counters: ServiceCounters
  feed: FeedEntry[]
}

function createInitial(): MlModel {
  return {
    jobs: INITIAL_JOBS.map((job) => ({ ...job })),
    endpoints: INITIAL_ENDPOINTS.map((endpoint) => ({ ...endpoint })),
    ragStep: -1,
    ragRunning: false,
    tokens: 128_400,
    latencyMs: 420,
    selectedModel: 'claude-sonnet',
    counters: Object.fromEntries(AI_SERVICES.map((service, index) => [service.id, 1200 + index * 340])),
    feed: seedFeed([
      ['INFO', 'SageMaker Studio: domain magnatic-ml-demo ready'],
      ['SUCCESS', 'Endpoint prod-churn-realtime InService (ml.m5.large)'],
      ['INFO', 'Bedrock model access enabled: Claude 3.5 Sonnet, Titan Embeddings V2, Nova Pro'],
    ]),
  }
}

export function useMlSimulation() {
  const [model, setModel] = useState<MlModel>(createInitial)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setModel((current) => {
        let feed = current.feed
        let changed = false
        const jobs = current.jobs.map((job) => {
          if (job.status !== 'RUNNING') {
            return job
          }
          changed = true
          const progress = Math.min(100, job.progress + 3 + Math.random() * 6)
          if (progress >= 100) {
            feed = pushFeed(feed, 'SUCCESS', `Training job ${job.name} completed. Model artifact in S3.`)
            return { ...job, status: 'COMPLETED' as const, progress: 100, accuracy: 0.91 + Math.random() * 0.06 }
          }
          return { ...job, progress }
        })
        const endpoints = current.endpoints.map((endpoint) => {
          if (endpoint.status !== 'InService') {
            return endpoint
          }
          changed = true
          return { ...endpoint, invocations: endpoint.invocations + Math.floor(2 + Math.random() * 6) }
        })
        const counters = { ...current.counters }
        for (const service of AI_SERVICES) {
          counters[service.id] = (counters[service.id] ?? 0) + Math.floor(Math.random() * 4)
        }
        let ragStep = current.ragStep
        let ragRunning = current.ragRunning
        if (ragRunning) {
          changed = true
          ragStep += 1
          if (ragStep >= 5) {
            ragRunning = false
            ragStep = 4
            feed = pushFeed(feed, 'SUCCESS', 'RAG query completed via Bedrock Knowledge Bases')
          }
        }
        if (!changed && !ragRunning) {
          return current
        }
        return {
          ...current,
          jobs,
          endpoints,
          counters,
          ragStep,
          ragRunning,
          tokens: current.tokens + (endpoints.length > 0 ? Math.floor(20 + Math.random() * 80) : 0),
          latencyMs: 280 + Math.round(Math.random() * 220),
          feed,
        }
      })
    }, 320)
    return () => window.clearInterval(timer)
  }, [])

  const startTraining = useCallback(() => {
    setModel((current) => {
      const idle = current.jobs.find((job) => job.status === 'IDLE')
      if (idle) {
        return {
          ...current,
          jobs: current.jobs.map((job) =>
            job.id === idle.id ? { ...job, status: 'RUNNING' as const, progress: 4 } : job,
          ),
          feed: pushFeed(current.feed, 'INFO', `SageMaker training job started: ${idle.name} on ${idle.instance}`),
        }
      }
      const next: TrainingJob = {
        id: uid('job'),
        name: 'demand-forecast-tft',
        instance: 'ml.g5.xlarge',
        framework: 'TensorFlow 2.15',
        status: 'RUNNING',
        progress: 3,
        accuracy: null,
      }
      return {
        ...current,
        jobs: [next, ...current.jobs],
        feed: pushFeed(current.feed, 'INFO', `SageMaker training job started: ${next.name}`),
      }
    })
  }, [])

  const deployEndpoint = useCallback(() => {
    setModel((current) => {
      const ready = current.jobs.find((job) => job.status === 'COMPLETED')
      if (!ready) {
        return {
          ...current,
          feed: pushFeed(current.feed, 'WARN', 'No completed training job available to deploy'),
        }
      }
      if (current.endpoints.some((endpoint) => endpoint.name.includes(ready.name))) {
        return current
      }
      const endpoint: InferenceEndpoint = {
        id: uid('ep'),
        name: `prod-${ready.name}`,
        variant: 'AllTraffic',
        instance: 'ml.m5.large',
        status: 'InService',
        invocations: 0,
      }
      return {
        ...current,
        endpoints: [endpoint, ...current.endpoints],
        feed: pushFeed(current.feed, 'SUCCESS', `SageMaker endpoint ${endpoint.name} InService`),
      }
    })
  }, [])

  const runRag = useCallback(() => {
    setModel((current) => ({
      ...current,
      ragRunning: true,
      ragStep: 0,
      feed: pushFeed(current.feed, 'INFO', 'Bedrock Knowledge Base query: retrieve + generate'),
    }))
  }, [])

  const selectModel = useCallback((id: string) => {
    setModel((current) => ({
      ...current,
      selectedModel: id,
      feed: pushFeed(current.feed, 'INFO', `Bedrock inference profile switched to ${id}`),
    }))
  }, [])

  const reset = useCallback(() => setModel(createInitial()), [])

  const stats = useMemo(() => {
    const running = model.jobs.filter((job) => job.status === 'RUNNING').length
    const completed = model.jobs.filter((job) => job.status === 'COMPLETED').length
    return {
      running,
      completed,
      endpoints: model.endpoints.length,
      tokens: model.tokens,
      latencyMs: model.latencyMs,
    }
  }, [model.endpoints.length, model.jobs, model.latencyMs, model.tokens])

  return { model, stats, startTraining, deployEndpoint, runRag, selectModel, reset }
}

export type MlSimulationApi = ReturnType<typeof useMlSimulation>
