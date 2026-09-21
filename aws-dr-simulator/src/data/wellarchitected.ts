export type PillarId =
  | 'operationalExcellence'
  | 'security'
  | 'reliability'
  | 'performance'
  | 'cost'
  | 'sustainability'

export interface Pillar {
  id: PillarId
  name: string
  shortName: string
  question: string
  description: string
  services: string[]
  color: string
}

export const PILLARS: Pillar[] = [
  {
    id: 'operationalExcellence',
    name: 'Operational Excellence',
    shortName: 'Ops',
    question: 'How do you run, observe and improve the workload?',
    description: 'IaC, observabilidad, runbooks y cambios seguros. CloudWatch, Systems Manager y AWS Config.',
    services: ['Amazon CloudWatch', 'AWS Systems Manager', 'AWS Config', 'AWS CloudFormation'],
    color: '#38bdf8',
  },
  {
    id: 'security',
    name: 'Security',
    shortName: 'Security',
    question: 'How do you protect data, identities and infrastructure?',
    description: 'IAM, cifrado, detección y respuesta. Security Hub, GuardDuty, KMS e IAM Identity Center.',
    services: ['AWS IAM', 'AWS KMS', 'Amazon GuardDuty', 'AWS Security Hub'],
    color: '#f87171',
  },
  {
    id: 'reliability',
    name: 'Reliability',
    shortName: 'Reliability',
    question: 'How does the workload recover from failure?',
    description: 'Multi-AZ, backups, failover y límites. DRS, Auto Scaling, Route 53 y AWS Backup.',
    services: ['Amazon EC2 Auto Scaling', 'Amazon Route 53', 'AWS Elastic Disaster Recovery', 'AWS Backup'],
    color: '#34d399',
  },
  {
    id: 'performance',
    name: 'Performance Efficiency',
    shortName: 'Performance',
    question: 'How do you use computing resources efficiently?',
    description: 'Right-sizing, caching y arquitectura elástica. Compute Optimizer, ElastiCache y CloudFront.',
    services: ['AWS Compute Optimizer', 'Amazon ElastiCache', 'Amazon CloudFront', 'Amazon EKS'],
    color: '#a78bfa',
  },
  {
    id: 'cost',
    name: 'Cost Optimization',
    shortName: 'Cost',
    question: 'How do you avoid unnecessary spend?',
    description: 'Savings Plans, S3 lifecycle, tagging y Cost Explorer. Rightsizing continuo.',
    services: ['AWS Cost Explorer', 'AWS Budgets', 'Savings Plans', 'AWS Compute Optimizer'],
    color: '#fbbf24',
  },
  {
    id: 'sustainability',
    name: 'Sustainability',
    shortName: 'Sustainability',
    question: 'How do you minimize environmental impact?',
    description: 'Regiones eficientes, Graviton, serverless y storage classes. Menos recursos ociosos.',
    services: ['AWS Customer Carbon Footprint Tool', 'AWS Graviton', 'AWS Lambda', 'Amazon S3 Intelligent-Tiering'],
    color: '#4ade80',
  },
]

export type FindingSeverity = 'HIGH' | 'MEDIUM' | 'LOW'
export type FindingStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

export interface WaFinding {
  id: string
  pillar: PillarId
  title: string
  risk: FindingSeverity
  status: FindingStatus
  recommendation: string
}

export const INITIAL_FINDINGS: WaFinding[] = [
  {
    id: 'OPS-01',
    pillar: 'operationalExcellence',
    title: 'No hay alarmas de CloudWatch en el sitio primario',
    risk: 'HIGH',
    status: 'OPEN',
    recommendation: 'Crear Composite Alarm + SNS hacia el runbook de DRS.',
  },
  {
    id: 'SEC-04',
    pillar: 'security',
    title: 'Bucket de snapshots sin Block Public Access explícito',
    risk: 'HIGH',
    status: 'OPEN',
    recommendation: 'Activar S3 Block Public Access y AWS Backup Vault Lock.',
  },
  {
    id: 'REL-07',
    pillar: 'reliability',
    title: 'Recovery instance en una sola AZ',
    risk: 'HIGH',
    status: 'OPEN',
    recommendation: 'Launch template Multi-AZ y health checks de Route 53.',
  },
  {
    id: 'PERF-02',
    pillar: 'performance',
    title: 'Instancia m5.xlarge sobredimensionada 62% del tiempo',
    risk: 'MEDIUM',
    status: 'OPEN',
    recommendation: 'Aplicar recomendación de Compute Optimizer a m6i.large.',
  },
  {
    id: 'COST-11',
    pillar: 'cost',
    title: 'EBS gp2 sin convertir a gp3',
    risk: 'MEDIUM',
    status: 'OPEN',
    recommendation: 'Migrar volúmenes a gp3 y revisar snapshots huérfanos.',
  },
  {
    id: 'SUS-03',
    pillar: 'sustainability',
    title: 'Workload 24/7 sin schedule de apagado en no-prod',
    risk: 'LOW',
    status: 'OPEN',
    recommendation: 'Instance Scheduler + Graviton en el entorno de staging.',
  },
  {
    id: 'SEC-12',
    pillar: 'security',
    title: 'Secrets en parámetros sin rotación',
    risk: 'MEDIUM',
    status: 'OPEN',
    recommendation: 'Mover a AWS Secrets Manager con rotación de 30 días.',
  },
  {
    id: 'REL-02',
    pillar: 'reliability',
    title: 'RTO objetivo 5 min sin drill trimestral',
    risk: 'MEDIUM',
    status: 'OPEN',
    recommendation: 'Programar failover test con AWS DRS drill mode.',
  },
]

export interface Workload {
  id: string
  name: string
  type: string
  environment: string
  scores: Record<PillarId, number>
}

export const WORKLOADS: Workload[] = [
  {
    id: 'bizapp',
    name: 'Business Application',
    type: 'EC2 + SQL Server',
    environment: 'Production',
    scores: {
      operationalExcellence: 62,
      security: 58,
      reliability: 71,
      performance: 64,
      cost: 55,
      sustainability: 48,
    },
  },
  {
    id: 'portal',
    name: 'Customer Portal',
    type: 'ALB + EC2 + RDS',
    environment: 'Production',
    scores: {
      operationalExcellence: 74,
      security: 80,
      reliability: 78,
      performance: 70,
      cost: 61,
      sustainability: 66,
    },
  },
  {
    id: 'analytics',
    name: 'Analytics Lake',
    type: 'S3 + Glue + Athena',
    environment: 'Shared',
    scores: {
      operationalExcellence: 69,
      security: 72,
      reliability: 65,
      performance: 81,
      cost: 58,
      sustainability: 77,
    },
  },
]

export function getPillar(id: PillarId): Pillar {
  return PILLARS.find((pillar) => pillar.id === id) ?? PILLARS[0]!
}
