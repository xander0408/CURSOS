import type { ConsoleView } from '../types/console'

export interface ArchitectureInfo {
  src: string
  title: string
  source: string
  caption: string
  notes: string[]
}

export const ARCHITECTURES: Record<ConsoleView, ArchitectureInfo> = {
  dr: {
    src: '/architecture/drs.png',
    title: 'AWS Elastic Disaster Recovery (AWS DRS)',
    source: 'Arquitectura general de AWS DRS',
    caption:
      'Agentes en origen replican a nivel de bloque (cifrado) hacia Replication Servers ligeros en la Staging Area. En un failover, DRS lanza Recovery Instances en subnets de la VPC del cliente con RTO de minutos y RPO de segundos.',
    notes: [
      'Origen: data center o cloud con AWS Replication Agent sobre los discos.',
      'Staging Area Subnet: replication servers y volúmenes EBS temporales, creados y destruidos automáticamente.',
      'Recovery Subnet: Recovery Instances + EBS cuando se dispara el failover.',
      'Control plane de DRS en la región: estado de replicación y orquestación.',
    ],
  },
  backup: {
    src: '/architecture/storage-gateway.png',
    title: 'AWS Storage Gateway',
    source: 'Tape / File / Volume Gateway hacia S3 y Glacier',
    caption:
      'Un appliance on-premises (VMware, Hyper-V, KVM, EC2 o hardware) cachea en local y sube por HTTPS al servicio gestionado. Desde ahí los datos llegan a S3, Glacier, Backup y monitoreo.',
    notes: [
      'Application, workstation y backup server usan protocolos estándar (NFS, SMB, iSCSI, VTL).',
      'Cache local para latencia baja; uploads optimizados hacia AWS.',
      'Storage services: S3 Standard, IA, Glacier, Deep Archive y AWS Backup.',
      'Management: CloudWatch, IAM, KMS y Storage Gateway Managed Service.',
    ],
  },
  migration: {
    src: '/architecture/migration-7r.png',
    title: 'Las 7 R de migración a AWS',
    source: 'Camino Assess → 7 R → Validation → Production',
    caption:
      'Tras Discovery y Assess se elige una estrategia: Relocate, Rehost, Replatform, Repurchase, Refactor, Retain o Retire. Todas convergen en Validation, Transition y Production.',
    notes: [
      'Relocate: mover VMware Cloud on AWS sin reinstalar.',
      'Rehost: lift and shift con AWS MGN (manual o automatizado).',
      'Replatform: lift and reshape (RDS, FSx, Elastic Beanstalk).',
      'Repurchase: drop and shop (SaaS / Marketplace).',
      'Refactor: re-arquitectura cloud native (Lambda, ECS/EKS, Aurora).',
      'Retain / Retire: se quedan fuera del camino de cutover.',
    ],
  },
  wellarchitected: {
    src: '/architecture/well-architected.png',
    title: '6 pilares del Well-Architected Framework',
    source: 'AWS Well-Architected Tool',
    caption:
      'Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization y Sustainability. Cada pilar tiene preguntas, riesgos y un improvement plan.',
    notes: [
      'Operational Excellence: CloudWatch, Systems Manager, Config.',
      'Security: IAM, KMS, GuardDuty, Security Hub.',
      'Reliability: Multi-AZ, Auto Scaling, DRS, Backup.',
      'Performance: Compute Optimizer, ElastiCache, CloudFront.',
      'Cost: Cost Explorer, Budgets, Savings Plans.',
      'Sustainability: Graviton, serverless, Intelligent-Tiering.',
    ],
  },
  ml: {
    src: '/architecture/ml-ai.png',
    title: 'Plataforma de Machine Learning e IA en AWS',
    source: 'Amazon Bedrock, SageMaker, ECS/EKS y data plane',
    caption:
      'Clientes entran por CloudFront, Route 53, WAF y ALB. El cluster VPC corre API/middleware (ECS/EKS) y puede orquestar LiteLLM. Modelos: Bedrock, Nova y SageMaker. Datos en S3, RDS y ElastiCache; secretos en Secrets Manager.',
    notes: [
      'Edge: CloudFront + Route 53 + AWS WAF + ALB + ACM.',
      'Compute: Amazon ECS y Amazon EKS, imágenes en ECR.',
      'Modelos: Amazon Bedrock, Amazon Nova, Amazon SageMaker AI.',
      'Datos: Amazon S3, Amazon RDS, Amazon ElastiCache (Redis OSS).',
    ],
  },
  security: {
    src: '/architecture/security-org.png',
    title: 'Seguridad de red y organización en AWS',
    source: 'AWS Organizations + controles de red',
    caption:
      'Desde Organizations y la OU, cada cuenta aplica controles de red y content delivery: Firewall Manager, WAF, Shield, Network Firewall, ACM, Inspector, CloudFront, Route 53 y VPC (SGs, NACLs, endpoints, flow logs, traffic mirroring).',
    notes: [
      'Governance: AWS Organizations, OUs, accounts, principals y resources.',
      'Perimeter: AWS WAF, Shield, Firewall Manager, Network Firewall.',
      'Inspection: Amazon Inspector, VPC Traffic Mirroring, Flow Logs.',
      'Delivery: CloudFront, Route 53, ACM, VPC endpoints y policies.',
    ],
  },
  ha: {
    src: '/architecture/high-availability.png',
    title: 'Alta disponibilidad Multi-AZ',
    source: 'WAF, ALB, Auto Scaling, RDS Multi-AZ',
    caption:
      'El usuario llega por AWS WAF al Elastic Load Balancer. Un Auto Scaling group reparte instancias en dos Availability Zones. Amazon RDS tiene primario y Standby. CloudWatch, AWS Backup y S3 cierran observabilidad y respaldo.',
    notes: [
      'Edge: AWS WAF delante del Application Load Balancer.',
      'Compute: Auto Scaling group con una instancia sana por AZ como mínimo.',
      'Data: Amazon RDS Multi-AZ (failover automático al Standby).',
      'Ops: CloudWatch métricas/alarmas, AWS Backup y Amazon S3.',
    ],
  },
}
