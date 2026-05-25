# Fluxogen

Web app for creating process flow diagrams for engineering projects (slope containment). Built with React + TypeScript + Vite + Tailwind CSS.

## Dev

```bash
npm run dev    # http://localhost:5173
npm run build
```

## Architecture

**Navigation**: Simple state machine in `App.tsx` — segments → projects → project view. No router library.

**State**: Single React Context (`AppContext`) backed by `localStorage` (`fluxogen_data` key). All CRUD goes through context functions; `storage.ts` is the only place that touches `localStorage`.

**Data model** (`types.ts`):
- `Segment` → groups of projects (e.g. GRE, GMT, TER)
- `Project` → has `entradas[]`, `entradaTypes[]`, `flows[]`, `saidas[]`, `saidaTypes[]`
- `ItemType` → `{ id, name, color }` — category for grouping entradas or saídas; colors chosen from `TYPE_PALETTE`
- `Item` → has optional `typeId` referencing an `ItemType`
- `Flow` → has `steps: FluxoStep[]` (each project starts with one flow)
- `FluxoStep` → process or decision node; fields: `title`, `description?`, `responsible?`, `referenceCode?`, linked item IDs, and optional next step IDs

**Drag-and-drop** (`@dnd-kit`):
- `DndContext` lives at `ProjectView` level, spans all three panels
- Entradas/saídas use `useDraggable`; flow steps use `useSortable` (one `SortableContext` per flow)
- Dragging an entrada/saída over a step highlights it and drops to link; dragging a step reorders within its flow

## Component map

| Component | Responsibility |
|---|---|
| `SegmentList` | Home screen — segment grid, create/edit/delete segments |
| `SegmentProjects` | Projects for a segment — project grid, create/edit/delete projects |
| `ProjectView` | 3-column layout, owns `DndContext` and drag state |
| `EntradasPanel` | Left column — draggable entrada items |
| `FluxoPanel` | One flow column — step list, step modal, flow rename/delete |
| `FluxoStep` | Individual step card — badges with × unlink, clickable connection badges |
| `SaidasPanel` | Right column — draggable saída items |
| `ItemCard` | Reusable entrada/saída card with drag handle |
| `ConfirmModal` | Reusable delete confirmation dialog |

## Key behaviors

- **Multiple flows**: Each project can have multiple flows displayed side by side. Add via + button in ProjectView. Flows can be renamed (click name) or deleted (× button, disabled if only one flow remains).
- **Linking items to steps**: Drag an entrada/saída onto a step card, or use the step edit modal checkboxes.
- **Unlinking**: Click × on the badge directly on the step card.
- **Step connections**: Decision steps show a fork visual (├─ / └─) with clickable Sim and Não badges that navigate and highlight the target step (amber glow, 1.8s).
- **Step card layout**: reference code shown above the title as small mono text; responsible shown inline next to the title; description shown below the title as gray text.
- **Item types**: Both entradas and saídas support custom types (categories). Each type has a name and a color from `TYPE_PALETTE`. Items are grouped by type in the panel, with a colored header per group. Items with no type appear in a "Sem tipo" section (only shown when types exist). Use the "T+" button in each panel header to add types; hover a type header to edit or delete it.
- **Labels**: Entradas use lowercase letters (a, b, c…); saídas use lowercase roman numerals (i, ii, iii…). Labels update automatically on delete.

## Data migration

`storage.ts` migrates old data formats on load:
- `fluxogen_projects` key (original) → wraps in a default "Geral" segment
- `project.fluxo: FluxoStep[]` (pre-flows) → wraps in `project.flows: [{ name: 'Fluxo 1', steps: fluxo }]`
- missing `entradaTypes` / `saidaTypes` → initialized to `[]`
