import type { ScenarioDefinition, ScenarioId } from '../types/simulation'

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'server-failure',
    label: 'Server Failure',
    shortLabel: 'Host',
    failureHeadline: 'Primary server failure detected',
    failureDetail:
      'WEB-SRV-01 dejó de responder a health checks. El sitio primario queda marcado como FAILED en esta simulación.',
    detectingMessage: 'AWS DRS (simulado) correlaciona el último heartbeat del agente con el último recovery point.',
    recoveryNote: 'Failover conceptual hacia Recovery-Web-01 en us-east-1a.',
  },
  {
    id: 'dc-failure',
    label: 'Data Center Failure',
    shortLabel: 'DC',
    failureHeadline: 'Data center unavailable',
    failureDetail:
      'El data center on-premises deja de estar alcanzable. Toda la zona primaria se considera caída en esta simulación.',
    detectingMessage: 'Pérdida de replicación y de health checks del sitio. Se usa el último recovery point conocido.',
    recoveryNote: 'Recuperación del workload completo en el entorno de recovery simulado en AWS.',
  },
  {
    id: 'network-failure',
    label: 'Network Failure',
    shortLabel: 'Net',
    failureHeadline: 'Network path to primary lost',
    failureDetail:
      'La conectividad de usuarios y de replicación hacia 10.10.10.20 se interrumpe. El servidor puede existir, pero no es utilizable.',
    detectingMessage: 'El agente deja de reportar; el último recovery point válido queda congelado (LAST KNOWN GOOD).',
    recoveryNote: 'El tráfico de usuarios se redirige conceptualmente a la recovery instance.',
  },
  {
    id: 'app-failure',
    label: 'Application Failure',
    shortLabel: 'App',
    failureHeadline: 'Business application unhealthy',
    failureDetail:
      'El sistema operativo responde, pero la aplicación de negocio falla health checks de forma continua.',
    detectingMessage: 'Se trata como interrupción de servicio: se inicia recuperación desde el recovery point de aplicación.',
    recoveryNote: 'Se arranca la aplicación sobre Recovery-Web-01 para restaurar disponibilidad.',
  },
]

export function getScenario(id: ScenarioId): ScenarioDefinition {
  const found = SCENARIOS.find((item) => item.id === id)
  return found ?? SCENARIOS[0]!
}
