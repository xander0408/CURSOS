# AWS Disaster Recovery Simulator

Demo interactiva **educativa y comercial** que explica visualmente un escenario de Disaster Recovery inspirado en **AWS Elastic Disaster Recovery (AWS DRS)**.

Marca de la demo: **Magnatic Cloud DR Simulator**.

## Esto es una simulación

Esta aplicación **no se conecta a AWS**. No solicita Access Key, Secret Key ni ningún otro tipo de credencial. No llama APIs de AWS y **no modifica recursos**.

Todo el failover, la replicación, el recovery point, la recovery instance y el failback son **visualizaciones locales** para presentar el concepto a un cliente o a un equipo interno.

En la interfaz aparece de forma permanente:

- `SIMULATION MODE`
- `NO AWS RESOURCES ARE BEING MODIFIED`

## Arquitectura de la demo

```
USERS
  → ON-PREMISES (WEB-SRV-01)
  → AWS DRS AGENT / replicación continua (simulada)
  → AWS Elastic Disaster Recovery (plano conceptual)
  → AWS Recovery Instance
  → APPLICATION
```

La lógica vive en una máquina de estados (`useDisasterSimulation`) con fases de failover y failback. No hay `setTimeout` dispersos: un único ticker avanza los pasos según la velocidad de simulación.

## Pestaña Backup as a Service

La consola tiene una segunda pestaña, **Backup as a Service**, con su propia simulación local:

- **AWS Backup**: planes (Daily-Production, Weekly-Compliance, Monthly-Archive), vaults con Vault Lock y copia cross-region, jobs de backup, copy y restore con progreso en vivo, y backup on-demand por recurso (EC2, RDS, EFS, EBS, DynamoDB, S3).
- **Amazon S3, clases de almacenamiento**: Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval y Glacier Deep Archive, con tiempo de recuperación, duración mínima, resiliencia y precio ilustrativo por GB.
- **Lifecycle policy**: regla de 7 años (Standard, 30 días a Standard-IA, 90 a Glacier Instant, 180 a Glacier Flexible, 1 año a Deep Archive, expiración a 7 años), distribución de datos animada y estimación de costo frente a usar solo Standard. Botón para avanzar 30 días simulados.
- **S3 Versioning**: subir versiones, borrar (crea delete marker), deshacer borrado y restaurar una versión anterior como objeto actual.
- **Tape Gateway (VTL)**: cintas virtuales LTO en la Virtual Tape Library, expulsión y archivado al Virtual Tape Shelf en Glacier Flexible o Deep Archive, y recuperación de cintas.

Los precios son ilustrativos y no constituyen una cotización.

## Otras pestañas AWS (todas simulación)

La barra superior de la consola incluye seis servicios. Ninguno llama a AWS.

- **Cloud Migration**: las 7 R (Rehost, Replatform, Repurchase, Refactor, Retire, Retain, Relocate) con portafolio, olas y AWS Migration Hub / MGN / DMS.
- **Well-Architected**: los 6 pilares (incluido Sustainability), score por workload, findings de riesgo y plan de mejora en el Well-Architected Tool.
- **Machine Learning e IA**: SageMaker (jobs y endpoints), Amazon Bedrock (modelos fundacionales y RAG) y servicios de IA (Rekognition, Textract, Comprehend, Transcribe, Polly, Translate, Personalize, Forecast).
- **Seguridad AWS**: Security Hub, GuardDuty, Inspector, WAF, Shield, KMS y controles FSBP. Botón para simular una amenaza y resolver findings.

## Tecnologías

- React 19
- TypeScript (strict)
- Vite
- Tailwind CSS
- Lucide React
- Recharts
- Framer Motion

## Instalación

```bash
cd aws-dr-simulator
npm install
```

## Ejecutar la demo (desarrollo)

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Build de producción

```bash
npm run build
npm run preview
```

## Cómo usar la demo frente a un cliente

1. Abre la aplicación y muestra el sitio primario **HEALTHY** y la replicación **SYNCED**.
2. Elige un **Scenario** (Server Failure por defecto, Data Center, Network o Application Failure).
3. Pulsa **SIMULAR DESASTRE** y deja que la secuencia avance, o usa **Demo Mode** para ejecutarla sola.
4. Observa el servidor primario en FAILED, la detección, la selección de Recovery Point, el arranque de la Recovery Instance y la aplicación ONLINE.
5. El tráfico de usuarios pasa de On-Premises a la Recovery Instance.
6. Revisa RPO/RTO, Incident Timeline y Event Log.
7. Pulsa **Simular Failback** para devolver el servicio al sitio primario.
8. **Reset Simulation** o **Run Again** para repetir.

Controles adicionales:

- **Pause / Resume**
- **Skip to Recovery**
- **Simulation Speed** (`0.5x`, `1x`, `2x`, `5x`)
- **Presentation Mode** (maximiza el diagrama y oculta paneles secundarios)
- **¿Cómo funciona?** (explicación conceptual de AWS DRS + aviso de simulación)

## Estructura

```
aws-dr-simulator/
  src/
    components/          DR + backup + migration + WA + ML + security
    hooks/               una máquina de estados por pestaña
    types/console.ts     vistas de la consola
    data/console.ts      metadatos de pestañas
    App.tsx
```
