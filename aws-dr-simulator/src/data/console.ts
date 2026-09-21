import type { ConsoleView } from '../types/console'

export interface ViewMeta {
  id: ConsoleView
  label: string
  tagline: string
  title: string
  subtitle: string
  envName: string
}

export const VIEWS: ViewMeta[] = [
  {
    id: 'dr',
    label: 'Disaster Recovery',
    tagline: 'AWS Elastic Disaster Recovery',
    title: 'AWS Disaster Recovery Simulator',
    subtitle: 'Elastic Disaster Recovery console view',
    envName: 'magnatic-dr-demo',
  },
  {
    id: 'backup',
    label: 'Backup as a Service',
    tagline: 'AWS Backup, S3, Glacier, VTL',
    title: 'AWS Backup as a Service Simulator',
    subtitle: 'AWS Backup, Amazon S3 and Storage Gateway console view',
    envName: 'magnatic-backup-demo',
  },
  {
    id: 'migration',
    label: 'Cloud Migration',
    tagline: '7 R, Migration Hub, MGN, DMS',
    title: 'AWS Cloud Migration Simulator',
    subtitle: 'AWS Migration Hub console view',
    envName: 'magnatic-migration-demo',
  },
  {
    id: 'wellarchitected',
    label: 'Well-Architected',
    tagline: '6 pilares del framework',
    title: 'AWS Well-Architected Simulator',
    subtitle: 'AWS Well-Architected Tool console view',
    envName: 'magnatic-war-demo',
  },
  {
    id: 'ml',
    label: 'Machine Learning e IA',
    tagline: 'SageMaker, Bedrock, AI services',
    title: 'AWS Machine Learning and AI Simulator',
    subtitle: 'Amazon SageMaker and Amazon Bedrock console view',
    envName: 'magnatic-ml-demo',
  },
  {
    id: 'security',
    label: 'Seguridad AWS',
    tagline: 'Security Hub, GuardDuty, WAF, KMS',
    title: 'AWS Security Simulator',
    subtitle: 'AWS Security Hub console view',
    envName: 'magnatic-security-demo',
  },
]

export function getViewMeta(id: ConsoleView): ViewMeta {
  return VIEWS.find((view) => view.id === id) ?? VIEWS[0]!
}
