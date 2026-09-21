export type StrategyId = 'rehost' | 'replatform' | 'repurchase' | 'refactor' | 'retire' | 'retain' | 'relocate'

export interface Strategy {
  id: StrategyId
  name: string
  alias: string
  description: string
  awsServices: string[]
  effort: 'Bajo' | 'Medio' | 'Alto'
  tool: string
  color: string
}

export const STRATEGIES: Strategy[] = [
  {
    id: 'rehost',
    name: 'Rehost',
    alias: 'Lift and shift',
    description: 'Mover el servidor tal cual a EC2 sin cambiar la aplicación. Rápido y de bajo riesgo.',
    awsServices: ['AWS Application Migration Service (MGN)', 'Amazon EC2', 'AWS Migration Hub'],
    effort: 'Bajo',
    tool: 'AWS MGN',
    color: '#38bdf8',
  },
  {
    id: 'replatform',
    name: 'Replatform',
    alias: 'Lift, tinker and shift',
    description: 'Optimizaciones puntuales sin cambiar la arquitectura: base de datos a RDS, archivos a FSx o EFS.',
    awsServices: ['Amazon RDS', 'AWS DMS', 'Amazon FSx', 'Elastic Beanstalk'],
    effort: 'Medio',
    tool: 'AWS DMS y MGN',
    color: '#34d399',
  },
  {
    id: 'repurchase',
    name: 'Repurchase',
    alias: 'Drop and shop',
    description: 'Reemplazar la aplicación por una solución SaaS o del AWS Marketplace.',
    awsServices: ['AWS Marketplace', 'Amazon WorkMail', 'SaaS partners'],
    effort: 'Medio',
    tool: 'AWS Marketplace',
    color: '#a78bfa',
  },
  {
    id: 'refactor',
    name: 'Refactor / Re-architect',
    alias: 'Cloud native',
    description: 'Rediseñar la aplicación con servicios nativos: contenedores, serverless y bases de datos gestionadas.',
    awsServices: ['AWS Lambda', 'Amazon ECS / EKS', 'Amazon Aurora', 'Amazon DynamoDB', 'API Gateway'],
    effort: 'Alto',
    tool: 'CodePipeline (CI/CD)',
    color: '#fb7185',
  },
  {
    id: 'retire',
    name: 'Retire',
    alias: 'Apagar',
    description: 'Dar de baja aplicaciones sin uso o redundantes. Ahorro inmediato y menor superficie de ataque.',
    awsServices: ['AWS Application Discovery Service', 'Migration Evaluator'],
    effort: 'Bajo',
    tool: 'Decommission plan',
    color: '#94a3b8',
  },
  {
    id: 'retain',
    name: 'Retain',
    alias: 'Revisar más adelante',
    description: 'Mantener on-premises por ahora: dependencias, licencias o regulación. Se revisa en una ola posterior.',
    awsServices: ['AWS Outposts', 'AWS Direct Connect', 'Site-to-Site VPN'],
    effort: 'Bajo',
    tool: 'Hybrid connectivity',
    color: '#fbbf24',
  },
  {
    id: 'relocate',
    name: 'Relocate',
    alias: 'Hypervisor-level lift',
    description: 'Mover clústeres VMware completos a VMware Cloud on AWS sin reinstalar ni reconfigurar.',
    awsServices: ['VMware Cloud on AWS', 'VMware HCX', 'AWS Migration Hub'],
    effort: 'Medio',
    tool: 'VMware HCX',
    color: '#f97316',
  },
]

export type AppStatus = 'DISCOVERED' | 'ASSESSED' | 'MIGRATING' | 'CUTOVER' | 'MIGRATED' | 'RETIRED' | 'RETAINED'

export interface MigrationApp {
  id: string
  name: string
  servers: number
  database: string
  strategy: StrategyId
  wave: number
  status: AppStatus
  progress: number
  target: string
}

export const INITIAL_APPS: MigrationApp[] = [
  { id: 'portal', name: 'Portal Web Clientes', servers: 2, database: 'MySQL', strategy: 'rehost', wave: 1, status: 'MIGRATED', progress: 100, target: 'Amazon EC2 (m6i)' },
  { id: 'bizapp', name: 'Business Application (WEB-SRV-01)', servers: 1, database: 'SQL Server', strategy: 'rehost', wave: 1, status: 'MIGRATED', progress: 100, target: 'Amazon EC2 (Windows)' },
  { id: 'intranet', name: 'Intranet legacy', servers: 1, database: 'Access', strategy: 'retire', wave: 1, status: 'RETIRED', progress: 100, target: 'Dado de baja' },
  { id: 'mail', name: 'Servidor de correo', servers: 1, database: '-', strategy: 'repurchase', wave: 1, status: 'MIGRATED', progress: 100, target: 'Amazon WorkMail' },
  { id: 'erp', name: 'ERP Core', servers: 4, database: 'Oracle', strategy: 'replatform', wave: 2, status: 'ASSESSED', progress: 0, target: 'EC2 + Amazon RDS for Oracle' },
  { id: 'payroll', name: 'Sistema de Nómina', servers: 2, database: 'SQL Server', strategy: 'repurchase', wave: 2, status: 'ASSESSED', progress: 0, target: 'SaaS (AWS Marketplace)' },
  { id: 'fileserver', name: 'File Server FS-01', servers: 1, database: '-', strategy: 'replatform', wave: 2, status: 'ASSESSED', progress: 0, target: 'Amazon FSx for Windows' },
  { id: 'crm', name: 'CRM Ventas', servers: 2, database: 'MySQL', strategy: 'repurchase', wave: 2, status: 'ASSESSED', progress: 0, target: 'SaaS CRM' },
  { id: 'orders-api', name: 'API Pedidos', servers: 3, database: 'PostgreSQL', strategy: 'refactor', wave: 3, status: 'ASSESSED', progress: 0, target: 'ECS Fargate + Aurora PostgreSQL' },
  { id: 'dwh', name: 'Data Warehouse', servers: 2, database: 'SQL Server', strategy: 'replatform', wave: 3, status: 'ASSESSED', progress: 0, target: 'Amazon Redshift (DMS + SCT)' },
  { id: 'vmware-fin', name: 'Clúster VMware Finanzas', servers: 6, database: 'Varias', strategy: 'relocate', wave: 3, status: 'ASSESSED', progress: 0, target: 'VMware Cloud on AWS' },
  { id: 'mainframe', name: 'Reportes Mainframe', servers: 1, database: 'DB2', strategy: 'retain', wave: 4, status: 'ASSESSED', progress: 0, target: 'On-premises (revisión 2027)' },
]

export const MIGRATION_PHASES = [
  {
    id: 'assess',
    name: 'Assess',
    detail: 'Inventario y caso de negocio',
    services: ['AWS Application Discovery Service', 'Migration Evaluator', 'Migration Hub Strategy Recommendations'],
  },
  {
    id: 'mobilize',
    name: 'Mobilize',
    detail: 'Landing zone y plan por olas',
    services: ['AWS Control Tower', 'AWS Organizations', 'Landing Zone Accelerator'],
  },
  {
    id: 'migrate',
    name: 'Migrate and Modernize',
    detail: 'Ejecución por olas y optimización',
    services: ['AWS MGN', 'AWS DMS', 'AWS DataSync', 'AWS Snowball', 'AWS Migration Hub'],
  },
]

export const TOTAL_WAVES = 4

export function getStrategy(id: StrategyId): Strategy {
  return STRATEGIES.find((item) => item.id === id) ?? STRATEGIES[0]!
}
