import type { AppData, Segment, Project, Flow } from './types'

const KEY = 'fluxogen_data'
const LEGACY_KEY = 'fluxogen_projects'

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateProject(p: any): Project {
  let result = p
  // Old format had `fluxo: FluxoStep[]` — wrap it in a single Flow
  if (!('flows' in result) && 'fluxo' in result) {
    const flow: Flow = { id: uid(), name: 'Fluxo 1', steps: result.fluxo ?? [] }
    const { fluxo: _drop, ...rest } = result
    result = { ...rest, flows: [flow] }
  }
  // Add type arrays if missing
  if (!('entradaTypes' in result)) result = { ...result, entradaTypes: [] }
  if (!('saidaTypes' in result)) result = { ...result, saidaTypes: [] }
  return result as Project
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      // Migrate any projects that still use old fluxo format
      return { ...parsed, projects: parsed.projects.map(migrateProject) }
    }

    // Migrate from original legacy key
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const oldProjects = JSON.parse(legacy) as object[]
      const defaultSegment: Segment = {
        id: uid(),
        name: 'Geral',
        description: 'Projetos migrados',
        createdAt: new Date().toISOString(),
      }
      const data: AppData = {
        version: 1,
        segments: [defaultSegment],
        projects: oldProjects.map(p => migrateProject({ ...p, segmentId: defaultSegment.id })),
      }
      saveData(data)
      localStorage.removeItem(LEGACY_KEY)
      return data
    }

    return { version: 1, segments: [], projects: [] }
  } catch {
    return { version: 1, segments: [], projects: [] }
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}
