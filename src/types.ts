export interface Segment {
  id: string
  name: string
  description?: string
  createdAt: string
}

export interface ItemType {
  id: string
  name: string
  color: string
}

export const TYPE_PALETTE = [
  '#4f8ef7', '#3ecf8e', '#f5a623', '#e85d75',
  '#9b59b6', '#1abc9c', '#e67e22', '#64748b',
]

export interface Item {
  id: string
  label: string
  name: string
  role?: string
  typeId?: string
}

export type StepType = 'process' | 'decision'

export interface FluxoStep {
  id: string
  order: number
  type: StepType
  title: string
  description?: string
  responsible?: string
  referenceCode?: string
  linkedEntradas: string[]
  linkedSaidas: string[]
  nextStepId?: string
  yesNextStepId?: string
  yesLabel?: string
  noNextStepId?: string
  noLabel?: string
}

export interface Flow {
  id: string
  name: string
  steps: FluxoStep[]
}

export interface Project {
  id: string
  segmentId: string
  name: string
  description?: string
  createdAt: string
  entradas: Item[]
  entradaTypes: ItemType[]
  flows: Flow[]
  saidas: Item[]
  saidaTypes: ItemType[]
}

export interface AppData {
  version: number
  segments: Segment[]
  projects: Project[]
}
