export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL'
export type FindingStatus = 'NEW' | 'NOTIFIED' | 'RESOLVED' | 'SUPPRESSED'
export type ControlStatus = 'PASSED' | 'FAILED' | 'WARNING'

export interface HubFinding {
  id: string
  title: string
  product: string
  severity: FindingSeverity
  status: FindingStatus
  resource: string
}

export const INITIAL_FINDINGS: HubFinding[] = [
  {
    id: 'GD-7a21',
    title: 'UnauthorizedAccess:EC2/SSHBruteForce',
    product: 'Amazon GuardDuty',
    severity: 'HIGH',
    status: 'NEW',
    resource: 'i-0a19c3 (WEB-SRV-01)',
  },
  {
    id: 'INS-9c02',
    title: 'CVE-2024-21626 in Amazon Linux AMI',
    product: 'Amazon Inspector',
    severity: 'CRITICAL',
    status: 'NEW',
    resource: 'ami-0c55b159',
  },
  {
    id: 'CFG-12',
    title: 's3-bucket-public-read-prohibited',
    product: 'AWS Config',
    severity: 'HIGH',
    status: 'NOTIFIED',
    resource: 's3://magnatic-backups',
  },
  {
    id: 'IAM-44',
    title: 'Access key older than 90 days',
    product: 'IAM Access Analyzer',
    severity: 'MEDIUM',
    status: 'NEW',
    resource: 'IAM user: backup-job',
  },
  {
    id: 'MAC-03',
    title: 'Sensitive data (PII) detected in S3 object',
    product: 'Amazon Macie',
    severity: 'MEDIUM',
    status: 'NEW',
    resource: 's3://magnatic-docs/hr/export.csv',
  },
  {
    id: 'WAF-19',
    title: 'Rate-based rule triggered (SQL injection probes)',
    product: 'AWS WAF',
    severity: 'LOW',
    status: 'RESOLVED',
    resource: 'WAFv2 web ACL: portal-edge',
  },
]

export interface SecurityControl {
  id: string
  name: string
  service: string
  status: ControlStatus
}

export const CONTROLS: SecurityControl[] = [
  { id: 'CIS-1.4', name: 'Root MFA enabled', service: 'IAM', status: 'PASSED' },
  { id: 'CIS-2.1', name: 'CloudTrail in all regions', service: 'CloudTrail', status: 'PASSED' },
  { id: 'FSBP-EC2.2', name: 'VPC default SG restricts all traffic', service: 'VPC', status: 'WARNING' },
  { id: 'FSBP-S3.1', name: 'S3 Block Public Access account level', service: 'S3', status: 'PASSED' },
  { id: 'FSBP-KMS.1', name: 'CMK rotation enabled', service: 'KMS', status: 'FAILED' },
  { id: 'FSBP-RDS.2', name: 'RDS snapshots not public', service: 'RDS', status: 'PASSED' },
  { id: 'FSBP-ELB.6', name: 'ALB HTTPS redirect', service: 'ELB', status: 'PASSED' },
  { id: 'FSBP-CW.1', name: 'Log metric filter for unauthorized API', service: 'CloudWatch', status: 'WARNING' },
]

export const LAYERS = [
  { id: 'identity', name: 'Identity', services: ['IAM', 'IAM Identity Center', 'AWS Organizations', 'SCPs'] },
  { id: 'detection', name: 'Detection', services: ['GuardDuty', 'Security Hub', 'CloudTrail', 'Detective'] },
  { id: 'network', name: 'Network', services: ['VPC', 'Security Groups', 'AWS WAF', 'AWS Shield'] },
  { id: 'data', name: 'Data', services: ['KMS', 'Macie', 'Secrets Manager', 'S3 encryption'] },
  { id: 'compute', name: 'Compute', services: ['Inspector', 'Patch Manager', 'Nitro', 'IMDSv2'] },
  { id: 'response', name: 'Response', services: ['EventBridge', 'Lambda', 'Step Functions', 'Security Hub actions'] },
]

export const WAF_RULES = [
  { id: 'AWSManagedRulesCommonRuleSet', blocked: 1284, action: 'BLOCK' },
  { id: 'AWSManagedRulesSQLiRuleSet', blocked: 96, action: 'BLOCK' },
  { id: 'AWSManagedRulesAnonymousIpList', blocked: 41, action: 'BLOCK' },
  { id: 'rate-limit-login', blocked: 18, action: 'BLOCK' },
  { id: 'geo-allow-latam', blocked: 7, action: 'COUNT' },
]
