export type JobStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED'
export type EndpointStatus = 'InService' | 'Creating' | 'Updating'

export interface FoundationModel {
  id: string
  name: string
  provider: string
  modality: string
  useCase: string
}

export const BEDROCK_MODELS: FoundationModel[] = [
  { id: 'claude-sonnet', name: 'Anthropic Claude 3.5 Sonnet', provider: 'Anthropic', modality: 'Text', useCase: 'Agentes, resumen y razonamiento' },
  { id: 'titan-embed', name: 'Amazon Titan Embeddings V2', provider: 'Amazon', modality: 'Embeddings', useCase: 'RAG y búsqueda semántica' },
  { id: 'titan-image', name: 'Amazon Titan Image Generator', provider: 'Amazon', modality: 'Image', useCase: 'Generación de imágenes' },
  { id: 'llama3', name: 'Meta Llama 3 70B Instruct', provider: 'Meta', modality: 'Text', useCase: 'Chat y clasificación' },
  { id: 'nova-pro', name: 'Amazon Nova Pro', provider: 'Amazon', modality: 'Multimodal', useCase: 'Visión + texto empresarial' },
]

export interface AiService {
  id: string
  name: string
  category: string
  description: string
  metricLabel: string
  unit: string
}

export const AI_SERVICES: AiService[] = [
  { id: 'rekognition', name: 'Amazon Rekognition', category: 'Vision', description: 'Detección de objetos, caras y texto en imágenes.', metricLabel: 'Images analyzed', unit: 'img' },
  { id: 'textract', name: 'Amazon Textract', category: 'Document', description: 'OCR y extracción de formularios y tablas.', metricLabel: 'Pages processed', unit: 'pág' },
  { id: 'comprehend', name: 'Amazon Comprehend', category: 'NLP', description: 'Sentimiento, entidades y PII en texto.', metricLabel: 'Documents', unit: 'doc' },
  { id: 'transcribe', name: 'Amazon Transcribe', category: 'Speech', description: 'Voz a texto con speaker diarization.', metricLabel: 'Audio minutes', unit: 'min' },
  { id: 'polly', name: 'Amazon Polly', category: 'Speech', description: 'Texto a voz neuronal.', metricLabel: 'Characters', unit: 'chars' },
  { id: 'translate', name: 'Amazon Translate', category: 'NLP', description: 'Traducción neuronal en tiempo real.', metricLabel: 'Characters', unit: 'chars' },
  { id: 'personalize', name: 'Amazon Personalize', category: 'Recommend', description: 'Recomendaciones en el portal de clientes.', metricLabel: 'Inferences', unit: 'req' },
  { id: 'forecast', name: 'Amazon Forecast', category: 'Time series', description: 'Pronóstico de demanda para inventario.', metricLabel: 'Forecasts', unit: 'pts' },
]

export interface TrainingJob {
  id: string
  name: string
  instance: string
  framework: string
  status: JobStatus
  progress: number
  accuracy: number | null
}

export const INITIAL_JOBS: TrainingJob[] = [
  {
    id: 'job-churn',
    name: 'customer-churn-xgb',
    instance: 'ml.m5.xlarge',
    framework: 'XGBoost 1.7',
    status: 'COMPLETED',
    progress: 100,
    accuracy: 0.931,
  },
  {
    id: 'job-fraud',
    name: 'claims-fraud-detector',
    instance: 'ml.g5.2xlarge',
    framework: 'PyTorch 2.2',
    status: 'IDLE',
    progress: 0,
    accuracy: null,
  },
]

export interface InferenceEndpoint {
  id: string
  name: string
  variant: string
  instance: string
  status: EndpointStatus
  invocations: number
}

export const INITIAL_ENDPOINTS: InferenceEndpoint[] = [
  {
    id: 'ep-churn',
    name: 'prod-churn-realtime',
    variant: 'AllTraffic',
    instance: 'ml.m5.large',
    status: 'InService',
    invocations: 18420,
  },
]

export const RAG_STEPS = [
  { id: 'ingest', label: 'Ingest', detail: 'S3 + Amazon Textract' },
  { id: 'embed', label: 'Embed', detail: 'Titan Embeddings V2' },
  { id: 'index', label: 'Index', detail: 'Amazon OpenSearch Serverless' },
  { id: 'retrieve', label: 'Retrieve', detail: 'k-NN + metadata filters' },
  { id: 'generate', label: 'Generate', detail: 'Amazon Bedrock (Claude)' },
]
