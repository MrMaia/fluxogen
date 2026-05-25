import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AppData, Segment, Project, Item, ItemType, Flow, FluxoStep } from '../types'
import { loadData, saveData } from '../storage'

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function recomputeLabels(items: Item[], types: ItemType[], roman: boolean): Item[] {
  const counters: Record<string, number> = {}
  let untypedIdx = 0
  return items.map(item => {
    const type = item.typeId ? types.find(t => t.id === item.typeId) : undefined
    if (type) {
      counters[type.id] = (counters[type.id] ?? 0) + 1
      return { ...item, label: `${type.name[0].toUpperCase()}${counters[type.id]}` }
    }
    return { ...item, label: toLabel(untypedIdx++, roman) }
  })
}

export function toLabel(index: number, roman = false): string {
  if (!roman) return String.fromCharCode(97 + (index % 26))
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['m','cm','d','cd','c','xc','l','xl','x','ix','v','iv','i']
  let n = index + 1, result = ''
  for (let i = 0; i < vals.length; i++) while (n >= vals[i]) { result += syms[i]; n -= vals[i] }
  return result
}

interface AppContextValue {
  segments: Segment[]
  projects: Project[]

  createSegment: (name: string, description?: string) => void
  deleteSegment: (id: string) => void
  updateSegment: (id: string, name: string, description?: string) => void

  createProject: (segmentId: string, name: string, description?: string) => void
  deleteProject: (id: string) => void
  updateProject: (id: string, name: string, description?: string) => void

  addEntrada: (projectId: string, name: string, role?: string, typeId?: string) => void
  updateEntrada: (projectId: string, itemId: string, name: string, role?: string, typeId?: string) => void
  deleteEntrada: (projectId: string, itemId: string) => void

  addEntradaType: (projectId: string, name: string, color: string) => void
  updateEntradaType: (projectId: string, typeId: string, name: string, color: string) => void
  deleteEntradaType: (projectId: string, typeId: string) => void

  addSaida: (projectId: string, name: string, role?: string, typeId?: string) => void
  updateSaida: (projectId: string, itemId: string, name: string, role?: string, typeId?: string) => void
  deleteSaida: (projectId: string, itemId: string) => void

  addSaidaType: (projectId: string, name: string, color: string) => void
  updateSaidaType: (projectId: string, typeId: string, name: string, color: string) => void
  deleteSaidaType: (projectId: string, typeId: string) => void

  addFlow: (projectId: string, name: string) => void
  deleteFlow: (projectId: string, flowId: string) => void
  renameFlow: (projectId: string, flowId: string, name: string) => void

  addFluxoStep: (projectId: string, flowId: string, step: Omit<FluxoStep, 'id' | 'order'>) => void
  addFluxoStepAfter: (projectId: string, flowId: string, step: Omit<FluxoStep, 'id' | 'order'>, afterStepId: string) => void
  addFluxoStepAndLinkBranch: (projectId: string, flowId: string, step: Omit<FluxoStep, 'id' | 'order'>, fromDecisionStepId: string, branch: 'yes' | 'no') => void
  updateFluxoStep: (projectId: string, step: FluxoStep) => void
  deleteFluxoStep: (projectId: string, stepId: string) => void
  reorderFluxoSteps: (projectId: string, flowId: string, orderedIds: string[]) => void
  linkItemToStep: (projectId: string, stepId: string, itemId: string, kind: 'entrada' | 'saida') => void
  unlinkItemFromStep: (projectId: string, stepId: string, itemId: string, kind: 'entrada' | 'saida') => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())

  const persist = useCallback((updated: AppData) => {
    setData(updated)
    saveData(updated)
  }, [])

  const updateProjects = useCallback((fn: (p: Project[]) => Project[]) => {
    persist({ ...data, projects: fn(data.projects) })
  }, [data, persist])

  const mapFlows = (p: Project, flowId: string, fn: (f: Flow) => Flow): Project => ({
    ...p,
    flows: p.flows.map(f => f.id === flowId ? fn(f) : f),
  })

  const mapAllSteps = (p: Project, fn: (s: FluxoStep) => FluxoStep): Project => ({
    ...p,
    flows: p.flows.map(f => ({ ...f, steps: f.steps.map(fn) })),
  })

  // Segments
  const createSegment = useCallback((name: string, description?: string) => {
    const seg: Segment = { id: uid(), name, description, createdAt: new Date().toISOString() }
    persist({ ...data, segments: [...data.segments, seg] })
  }, [data, persist])

  const deleteSegment = useCallback((id: string) => {
    persist({
      ...data,
      segments: data.segments.filter(s => s.id !== id),
      projects: data.projects.filter(p => p.segmentId !== id),
    })
  }, [data, persist])

  const updateSegment = useCallback((id: string, name: string, description?: string) => {
    persist({ ...data, segments: data.segments.map(s => s.id === id ? { ...s, name, description } : s) })
  }, [data, persist])

  // Projects
  const createProject = useCallback((segmentId: string, name: string, description?: string) => {
    const project: Project = {
      id: uid(), segmentId, name, description,
      createdAt: new Date().toISOString(),
      entradas: [],
      entradaTypes: [],
      flows: [{ id: uid(), name: 'Fluxo 1', steps: [] }],
      saidas: [],
      saidaTypes: [],
    }
    persist({ ...data, projects: [...data.projects, project] })
  }, [data, persist])

  const deleteProject = useCallback((id: string) => {
    updateProjects(ps => ps.filter(p => p.id !== id))
  }, [updateProjects])

  const updateProject = useCallback((id: string, name: string, description?: string) => {
    updateProjects(ps => ps.map(p => p.id === id ? { ...p, name, description } : p))
  }, [updateProjects])

  // Entradas
  const addEntrada = useCallback((projectId: string, name: string, role?: string, typeId?: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      const item: Item = { id: uid(), label: '', name, role, typeId }
      return { ...p, entradas: recomputeLabels([...p.entradas, item], p.entradaTypes, false) }
    }))
  }, [updateProjects])

  const updateEntrada = useCallback((projectId: string, itemId: string, name: string, role?: string, typeId?: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      const entradas = recomputeLabels(
        p.entradas.map(e => e.id === itemId ? { ...e, name, role, typeId } : e),
        p.entradaTypes, false
      )
      return { ...p, entradas }
    }))
  }, [updateProjects])

  const deleteEntrada = useCallback((projectId: string, itemId: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      const entradas = recomputeLabels(p.entradas.filter(e => e.id !== itemId), p.entradaTypes, false)
      return mapAllSteps({ ...p, entradas }, s => ({
        ...s, linkedEntradas: s.linkedEntradas.filter(id => id !== itemId)
      }))
    }))
  }, [updateProjects])

  // Entrada types
  const addEntradaType = useCallback((projectId: string, name: string, color: string) => {
    updateProjects(ps => ps.map(p => p.id !== projectId ? p : {
      ...p, entradaTypes: [...p.entradaTypes, { id: uid(), name, color }]
    }))
  }, [updateProjects])

  const updateEntradaType = useCallback((projectId: string, typeId: string, name: string, color: string) => {
    updateProjects(ps => ps.map(p => p.id !== projectId ? p : {
      ...p, entradaTypes: p.entradaTypes.map(t => t.id === typeId ? { ...t, name, color } : t)
    }))
  }, [updateProjects])

  const deleteEntradaType = useCallback((projectId: string, typeId: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      const entradaTypes = p.entradaTypes.filter(t => t.id !== typeId)
      const entradas = recomputeLabels(
        p.entradas.map(e => e.typeId === typeId ? { ...e, typeId: undefined } : e),
        entradaTypes, false
      )
      return { ...p, entradaTypes, entradas }
    }))
  }, [updateProjects])

  // Saidas
  const addSaida = useCallback((projectId: string, name: string, role?: string, typeId?: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      const item: Item = { id: uid(), label: '', name, role, typeId }
      return { ...p, saidas: recomputeLabels([...p.saidas, item], p.saidaTypes, true) }
    }))
  }, [updateProjects])

  const updateSaida = useCallback((projectId: string, itemId: string, name: string, role?: string, typeId?: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      const saidas = recomputeLabels(
        p.saidas.map(s => s.id === itemId ? { ...s, name, role, typeId } : s),
        p.saidaTypes, true
      )
      return { ...p, saidas }
    }))
  }, [updateProjects])

  const deleteSaida = useCallback((projectId: string, itemId: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      const saidas = recomputeLabels(p.saidas.filter(s => s.id !== itemId), p.saidaTypes, true)
      return mapAllSteps({ ...p, saidas }, s => ({
        ...s, linkedSaidas: s.linkedSaidas.filter(id => id !== itemId)
      }))
    }))
  }, [updateProjects])

  // Saida types
  const addSaidaType = useCallback((projectId: string, name: string, color: string) => {
    updateProjects(ps => ps.map(p => p.id !== projectId ? p : {
      ...p, saidaTypes: [...p.saidaTypes, { id: uid(), name, color }]
    }))
  }, [updateProjects])

  const updateSaidaType = useCallback((projectId: string, typeId: string, name: string, color: string) => {
    updateProjects(ps => ps.map(p => p.id !== projectId ? p : {
      ...p, saidaTypes: p.saidaTypes.map(t => t.id === typeId ? { ...t, name, color } : t)
    }))
  }, [updateProjects])

  const deleteSaidaType = useCallback((projectId: string, typeId: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      const saidaTypes = p.saidaTypes.filter(t => t.id !== typeId)
      const saidas = recomputeLabels(
        p.saidas.map(s => s.typeId === typeId ? { ...s, typeId: undefined } : s),
        saidaTypes, true
      )
      return { ...p, saidaTypes, saidas }
    }))
  }, [updateProjects])

  // Flows
  const addFlow = useCallback((projectId: string, name: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      return { ...p, flows: [...p.flows, { id: uid(), name, steps: [] }] }
    }))
  }, [updateProjects])

  const deleteFlow = useCallback((projectId: string, flowId: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      if (p.flows.length <= 1) return p
      return { ...p, flows: p.flows.filter(f => f.id !== flowId) }
    }))
  }, [updateProjects])

  const renameFlow = useCallback((projectId: string, flowId: string, name: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      return mapFlows(p, flowId, f => ({ ...f, name }))
    }))
  }, [updateProjects])

  // Steps
  const addFluxoStep = useCallback((projectId: string, flowId: string, step: Omit<FluxoStep, 'id' | 'order'>) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      return mapFlows(p, flowId, f => {
        const newStep: FluxoStep = { ...step, id: uid(), order: f.steps.length }
        return { ...f, steps: [...f.steps, newStep] }
      })
    }))
  }, [updateProjects])

  const addFluxoStepAfter = useCallback((
    projectId: string, flowId: string, step: Omit<FluxoStep, 'id' | 'order'>, afterStepId: string
  ) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      return mapFlows(p, flowId, f => {
        const newStep: FluxoStep = { ...step, id: uid(), order: 0 }
        const sorted = [...f.steps].sort((a, b) => a.order - b.order)
        const afterIdx = sorted.findIndex(s => s.id === afterStepId)
        const insertAt = afterIdx >= 0 ? afterIdx + 1 : sorted.length
        const reordered = [
          ...sorted.slice(0, insertAt),
          newStep,
          ...sorted.slice(insertAt),
        ].map((s, i) => ({ ...s, order: i }))
        return { ...f, steps: reordered }
      })
    }))
  }, [updateProjects])

  const addFluxoStepAndLinkBranch = useCallback((
    projectId: string, flowId: string, step: Omit<FluxoStep, 'id' | 'order'>,
    fromDecisionStepId: string, branch: 'yes' | 'no'
  ) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      return mapFlows(p, flowId, f => {
        const newStepId = uid()
        const newStep: FluxoStep = { ...step, id: newStepId, order: f.steps.length }
        const steps = [...f.steps, newStep].map(s =>
          s.id !== fromDecisionStepId ? s :
          branch === 'yes' ? { ...s, yesNextStepId: newStepId } : { ...s, noNextStepId: newStepId }
        )
        return { ...f, steps }
      })
    }))
  }, [updateProjects])

  const updateFluxoStep = useCallback((projectId: string, step: FluxoStep) => {
    updateProjects(ps => ps.map(p => p.id !== projectId ? p :
      mapAllSteps(p, s => s.id === step.id ? step : s)
    ))
  }, [updateProjects])

  const deleteFluxoStep = useCallback((projectId: string, stepId: string) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      return {
        ...p,
        flows: p.flows.map(f => ({
          ...f,
          steps: f.steps
            .filter(s => s.id !== stepId)
            .map((s, i) => ({
              ...s, order: i,
              nextStepId: s.nextStepId === stepId ? undefined : s.nextStepId,
              yesNextStepId: s.yesNextStepId === stepId ? undefined : s.yesNextStepId,
              noNextStepId: s.noNextStepId === stepId ? undefined : s.noNextStepId,
            })),
        })),
      }
    }))
  }, [updateProjects])

  const reorderFluxoSteps = useCallback((projectId: string, flowId: string, orderedIds: string[]) => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      return mapFlows(p, flowId, f => {
        const map = new Map(f.steps.map(s => [s.id, s]))
        return { ...f, steps: orderedIds.map((id, i) => ({ ...map.get(id)!, order: i })) }
      })
    }))
  }, [updateProjects])

  const linkItemToStep = useCallback((projectId: string, stepId: string, itemId: string, kind: 'entrada' | 'saida') => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      const field = kind === 'entrada' ? 'linkedEntradas' : 'linkedSaidas'
      return mapAllSteps(p, s => {
        if (s.id !== stepId || s[field].includes(itemId)) return s
        return { ...s, [field]: [...s[field], itemId] }
      })
    }))
  }, [updateProjects])

  const unlinkItemFromStep = useCallback((projectId: string, stepId: string, itemId: string, kind: 'entrada' | 'saida') => {
    updateProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      const field = kind === 'entrada' ? 'linkedEntradas' : 'linkedSaidas'
      return mapAllSteps(p, s => {
        if (s.id !== stepId) return s
        return { ...s, [field]: s[field].filter(id => id !== itemId) }
      })
    }))
  }, [updateProjects])

  return (
    <AppContext.Provider value={{
      segments: data.segments,
      projects: data.projects,
      createSegment, deleteSegment, updateSegment,
      createProject, deleteProject, updateProject,
      addEntrada, updateEntrada, deleteEntrada,
      addEntradaType, updateEntradaType, deleteEntradaType,
      addSaida, updateSaida, deleteSaida,
      addSaidaType, updateSaidaType, deleteSaidaType,
      addFlow, deleteFlow, renameFlow,
      addFluxoStep, addFluxoStepAfter, addFluxoStepAndLinkBranch, updateFluxoStep, deleteFluxoStep, reorderFluxoSteps,
      linkItemToStep, unlinkItemFromStep,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
