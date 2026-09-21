import { useCallback, useEffect, useMemo, useState } from 'react'
import { CONTROLS, INITIAL_FINDINGS, type ControlStatus, type HubFinding, type SecurityControl } from '../data/security'
import { pushFeed, seedFeed, uid } from '../lib/feed'
import type { FeedEntry } from '../types/console'

interface SecurityModel {
  findings: HubFinding[]
  controls: SecurityControl[]
  wafBlocked: number
  shieldMitigations: number
  kmsRequests: number
  investigating: string | null
  feed: FeedEntry[]
}

function createInitial(): SecurityModel {
  return {
    findings: INITIAL_FINDINGS.map((item) => ({ ...item })),
    controls: CONTROLS.map((item) => ({ ...item })),
    wafBlocked: 1446,
    shieldMitigations: 2,
    kmsRequests: 184_220,
    investigating: null,
    feed: seedFeed([
      ['INFO', 'Security Hub: AWS Foundational Security Best Practices v1.0.0 enabled'],
      ['WARN', 'GuardDuty: UnauthorizedAccess:EC2/SSHBruteForce on WEB-SRV-01'],
      ['CRITICAL', 'Inspector: CRITICAL CVE on recovery AMI, patch window recommended'],
    ]),
  }
}

export function useSecuritySimulation() {
  const [model, setModel] = useState<SecurityModel>(createInitial)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setModel((current) => ({
        ...current,
        wafBlocked: current.wafBlocked + Math.floor(Math.random() * 4),
        kmsRequests: current.kmsRequests + Math.floor(8 + Math.random() * 40),
        shieldMitigations: current.shieldMitigations + (Math.random() > 0.97 ? 1 : 0),
      }))
    }, 400)
    return () => window.clearInterval(timer)
  }, [])

  const investigate = useCallback((id: string) => {
    setModel((current) => {
      const finding = current.findings.find((item) => item.id === id)
      if (!finding) {
        return current
      }
      return {
        ...current,
        investigating: id,
        findings: current.findings.map((item) => (item.id === id && item.status === 'NEW' ? { ...item, status: 'NOTIFIED' as const } : item)),
        feed: pushFeed(current.feed, 'INFO', `Amazon Detective graph opened for ${finding.title}`),
      }
    })
  }, [])

  const resolveFinding = useCallback((id: string) => {
    setModel((current) => {
      const finding = current.findings.find((item) => item.id === id)
      if (!finding) {
        return current
      }
      return {
        ...current,
        investigating: current.investigating === id ? null : current.investigating,
        findings: current.findings.map((item) => (item.id === id ? { ...item, status: 'RESOLVED' as const } : item)),
        feed: pushFeed(current.feed, 'SUCCESS', `Finding ${id} resolved. Automation document executed.`),
      }
    })
  }, [])

  const enableKmsRotation = useCallback(() => {
    setModel((current) => ({
      ...current,
      controls: current.controls.map((control) =>
        control.id === 'FSBP-KMS.1' ? { ...control, status: 'PASSED' as ControlStatus } : control,
      ),
      feed: pushFeed(current.feed, 'SUCCESS', 'KMS CMK automatic rotation enabled (FSBP-KMS.1 PASSED)'),
    }))
  }, [])

  const simulateAttack = useCallback(() => {
    setModel((current) => {
      const finding: HubFinding = {
        id: uid('atk').slice(0, 10).toUpperCase(),
        title: 'Impact:S3/AnomalousBehavior.UnauthorizedAPICall',
        product: 'Amazon GuardDuty',
        severity: 'CRITICAL',
        status: 'NEW',
        resource: 's3://magnatic-backups',
      }
      return {
        ...current,
        findings: [finding, ...current.findings],
        wafBlocked: current.wafBlocked + 42,
        feed: pushFeed(current.feed, 'CRITICAL', 'GuardDuty finding: anomalous S3 API calls from unusual geolocation'),
      }
    })
  }, [])

  const reset = useCallback(() => setModel(createInitial()), [])

  const stats = useMemo(() => {
    const open = model.findings.filter((item) => item.status !== 'RESOLVED' && item.status !== 'SUPPRESSED')
    const critical = open.filter((item) => item.severity === 'CRITICAL').length
    const high = open.filter((item) => item.severity === 'HIGH').length
    const passed = model.controls.filter((item) => item.status === 'PASSED').length
    const score = Math.round((passed / model.controls.length) * 100)
    return { open: open.length, critical, high, passed, totalControls: model.controls.length, score }
  }, [model.controls, model.findings])

  return { model, stats, investigate, resolveFinding, enableKmsRotation, simulateAttack, reset }
}

export type SecuritySimulationApi = ReturnType<typeof useSecuritySimulation>
