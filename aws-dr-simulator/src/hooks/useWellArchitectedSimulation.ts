import { useCallback, useEffect, useMemo, useState } from 'react'
import { INITIAL_FINDINGS, PILLARS, WORKLOADS, type PillarId, type WaFinding } from '../data/wellarchitected'
import { pushFeed, seedFeed } from '../lib/feed'
import type { FeedEntry } from '../types/console'

interface WaModel {
  selectedWorkload: string
  findings: WaFinding[]
  reviewing: PillarId | null
  reviewProgress: number
  scores: Record<string, Record<PillarId, number>>
  feed: FeedEntry[]
}

function cloneScores() {
  return Object.fromEntries(WORKLOADS.map((workload) => [workload.id, { ...workload.scores }])) as Record<
    string,
    Record<PillarId, number>
  >
}

function createInitial(): WaModel {
  return {
    selectedWorkload: WORKLOADS[0]!.id,
    findings: INITIAL_FINDINGS.map((item) => ({ ...item })),
    reviewing: null,
    reviewProgress: 0,
    scores: cloneScores(),
    feed: seedFeed([
      ['INFO', 'Well-Architected Tool: 3 workloads registered in us-east-1'],
      ['WARN', 'Business Application: 3 high-risk issues across Security and Reliability'],
      ['INFO', 'Trusted Advisor + Compute Optimizer findings imported into the review'],
    ]),
  }
}

export function useWellArchitectedSimulation() {
  const [model, setModel] = useState<WaModel>(createInitial)

  useEffect(() => {
    if (!model.reviewing) {
      return
    }
    const timer = window.setInterval(() => {
      setModel((current) => {
        if (!current.reviewing) {
          return current
        }
        const next = Math.min(100, current.reviewProgress + 12 + Math.random() * 10)
        if (next < 100) {
          return { ...current, reviewProgress: next }
        }
        const pillar = current.reviewing
        const findings = current.findings.map((finding) =>
          finding.pillar === pillar && finding.status === 'OPEN' ? { ...finding, status: 'IN_PROGRESS' as const } : finding,
        )
        return {
          ...current,
          reviewing: null,
          reviewProgress: 0,
          findings,
          feed: pushFeed(current.feed, 'SUCCESS', `Milestone saved for ${PILLARS.find((item) => item.id === pillar)?.name}`),
        }
      })
    }, 280)
    return () => window.clearInterval(timer)
  }, [model.reviewing])

  const startReview = useCallback((pillar: PillarId) => {
    setModel((current) => ({
      ...current,
      reviewing: pillar,
      reviewProgress: 8,
      feed: pushFeed(current.feed, 'INFO', `Review started: ${PILLARS.find((item) => item.id === pillar)?.name}`),
    }))
  }, [])

  const remediate = useCallback((id: string) => {
    setModel((current) => {
      const finding = current.findings.find((item) => item.id === id)
      if (!finding || finding.status === 'RESOLVED') {
        return current
      }
      const scores = { ...current.scores }
      const workloadScores = { ...scores[current.selectedWorkload]! }
      const bump = finding.risk === 'HIGH' ? 8 : finding.risk === 'MEDIUM' ? 5 : 3
      workloadScores[finding.pillar] = Math.min(98, workloadScores[finding.pillar] + bump)
      scores[current.selectedWorkload] = workloadScores
      return {
        ...current,
        findings: current.findings.map((item) => (item.id === id ? { ...item, status: 'RESOLVED' as const } : item)),
        scores,
        feed: pushFeed(current.feed, 'SUCCESS', `Improvement plan applied: ${finding.title}`),
      }
    })
  }, [])

  const selectWorkload = useCallback((id: string) => {
    setModel((current) => ({ ...current, selectedWorkload: id }))
  }, [])

  const reset = useCallback(() => setModel(createInitial()), [])

  const stats = useMemo(() => {
    const scores = model.scores[model.selectedWorkload] ?? WORKLOADS[0]!.scores
    const overall = Math.round(PILLARS.reduce((sum, pillar) => sum + scores[pillar.id], 0) / PILLARS.length)
    const openHigh = model.findings.filter((item) => item.status !== 'RESOLVED' && item.risk === 'HIGH').length
    const open = model.findings.filter((item) => item.status !== 'RESOLVED').length
    const resolved = model.findings.filter((item) => item.status === 'RESOLVED').length
    return { scores, overall, openHigh, open, resolved }
  }, [model.findings, model.scores, model.selectedWorkload])

  return { model, stats, startReview, remediate, selectWorkload, reset }
}

export type WellArchitectedApi = ReturnType<typeof useWellArchitectedSimulation>
