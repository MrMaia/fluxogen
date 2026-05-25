import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import SegmentList from './components/SegmentList'
import SegmentProjects from './components/SegmentProjects'
import ProjectView from './components/ProjectView'
import type { Segment, Project } from './types'

type View =
  | { screen: 'segments' }
  | { screen: 'projects'; segment: Segment }
  | { screen: 'project'; project: Project; segment: Segment }

function Router() {
  const [view, setView] = useState<View>({ screen: 'segments' })

  if (view.screen === 'project') {
    return (
      <ProjectView
        projectId={view.project.id}
        onBack={() => setView({ screen: 'projects', segment: view.segment })}
      />
    )
  }

  if (view.screen === 'projects') {
    return (
      <SegmentProjects
        segment={view.segment}
        onBack={() => setView({ screen: 'segments' })}
        onOpenProject={project => setView({ screen: 'project', project, segment: view.segment })}
      />
    )
  }

  return (
    <SegmentList onOpen={segment => setView({ screen: 'projects', segment })} />
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
