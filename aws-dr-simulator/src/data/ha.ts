export type HaScenario = 'az-failure' | 'instance-failure' | 'rds-failover'
export type NodeHealth = 'healthy' | 'impaired' | 'failed' | 'recovering' | 'standby'

export interface HaScenarioInfo {
  id: HaScenario
  name: string
  detail: string
}

export const HA_SCENARIOS: HaScenarioInfo[] = [
  {
    id: 'az-failure',
    name: 'Availability Zone failure',
    detail: 'us-east-1a queda degradada. ALB drena targets, ASG lanza capacidad en 1b y RDS hace failover si el primario estaba en 1a.',
  },
  {
    id: 'instance-failure',
    name: 'EC2 instance failure',
    detail: 'Una instancia del Auto Scaling group falla el health check. ASG la reemplaza en la misma AZ.',
  },
  {
    id: 'rds-failover',
    name: 'RDS Multi-AZ failover',
    detail: 'El primario de Amazon RDS deja de responder. El Standby se promociona. El endpoint CNAME cambia en menos de un minuto simulado.',
  },
]
