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
    components/
    hooks/useDisasterSimulation.ts
    types/simulation.ts
    data/scenarios.ts
    App.tsx
```
