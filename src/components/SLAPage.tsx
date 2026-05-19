import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SLA } from '../types'
import { conditionsSummary } from '../data'
import { SLAListRow } from './SLAListRow'
import { FiPlus, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi'

type ContainerId = 'active' | 'pending'
type DraftLists = Record<ContainerId, string[]>

function SortableListRow({
  sla,
  containerId,
  isLast,
  isEditMode,
  onEdit,
  onAddToActive,
  onMoveToPending,
  onDelete,
}: {
  sla: SLA
  containerId: ContainerId
  isLast: boolean
  isEditMode: boolean
  onEdit: () => void
  onAddToActive: () => void
  onMoveToPending: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sla.id,
    data: { containerId },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      <SLAListRow
        sla={sla}
        section={containerId}
        isLast={isLast}
        showDragHandle={isEditMode}
        showContextMenu={!isEditMode}
        dragHandleListeners={listeners as unknown as Record<string, unknown>}
        dragHandleAttributes={attributes as unknown as Record<string, unknown>}
        onEdit={onEdit}
        onAddToActive={onAddToActive}
        onMoveToPending={onMoveToPending}
        onDelete={onDelete}
        onRowClick={!isEditMode ? onEdit : undefined}
      />
    </div>
  )
}

// ─── Droppable list section ───────────────────────────────────────────────────
function DroppableSection({
  id,
  isEditMode,
  isOver,
  children,
  className = '',
}: {
  id: ContainerId
  isEditMode: boolean
  isOver?: boolean
  children: ReactNode
  className?: string
}) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`w-full max-w-[720px] bg-surface-card border-[0.5px] rounded-lg shadow-[0px_0px_1px_0px_rgba(0,0,0,0.12),0px_1px_2px_0px_rgba(0,0,0,0.18)] transition-colors ${
        isEditMode && isOver
          ? 'border-brand-500 ring-2 ring-brand-500/20'
          : 'border-border-card'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────
function DeleteConfirmDialog({ slaName, onConfirm, onCancel }: {
  slaName: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-[16px] font-semibold text-gray-900">Delete SLA?</h3>
          <button onClick={onCancel} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-0.5 -mr-0.5">
            <FiX size={16} />
          </button>
        </div>
        <p className="text-[14px] text-gray-600 mb-6">
          <strong className="text-gray-800">{slaName}</strong> will be permanently deleted and cannot be recovered.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-[14px] font-medium text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-[14px] font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Yes, delete</button>
        </div>
      </div>
    </div>
  )
}

function DiscardChangesDialog({ onDiscard, onCancel }: { onDiscard: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-[16px] font-semibold text-gray-900 mb-2">Discard changes?</h3>
        <p className="text-[14px] text-gray-600 mb-6">
          You have unsaved changes to SLA order. If you leave now, your changes will not be applied to live tickets.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-[14px] font-medium text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
          <button onClick={onDiscard} className="px-4 py-2 text-[14px] font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Discard</button>
        </div>
      </div>
    </div>
  )
}

const DocIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-4">
    <rect x="8" y="4" width="24" height="32" rx="3" fill="#CCF1EB" />
    <path d="M14 14h12M14 20h12M14 26h8" stroke="#00BB99" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

function listsFromSLAs(slas: SLA[]): DraftLists {
  const active = slas.filter(s => !s.isDefault && s.listStatus === 'active').map(s => s.id)
  const pending = slas.filter(s => !s.isDefault && s.listStatus === 'pending').map(s => s.id)
  return { active, pending }
}

function findContainer(id: string, lists: DraftLists): ContainerId | null {
  if (lists.active.includes(id)) return 'active'
  if (lists.pending.includes(id)) return 'pending'
  if (id === 'active' || id === 'pending') return id
  return null
}

interface Props {
  slas: SLA[]
  onDeleteSLA: (slaId: string) => void
  onCommitLists: (lists: DraftLists) => void
  onNavigateToEdit: (slaId: string | null) => void
  onListEditModeChange: (editing: boolean) => void
  editAfterCreateId: string | null
  onClearEditAfterCreate: () => void
  pendingNavigation: (() => void) | null
  onClearPendingNavigation: () => void
}

export function SLAPage({
  slas,
  onDeleteSLA,
  onCommitLists,
  onNavigateToEdit,
  onListEditModeChange,
  editAfterCreateId,
  onClearEditAfterCreate,
  pendingNavigation,
  onClearPendingNavigation,
}: Props) {
  const slaMap = useMemo(() => new Map(slas.map(s => [s.id, s])), [slas])

  const [isEditMode, setIsEditMode] = useState(false)
  const [draftLists, setDraftLists] = useState<DraftLists>({ active: [], pending: [] })
  const [savedSnapshot, setSavedSnapshot] = useState<DraftLists>({ active: [], pending: [] })
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null)

  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [overContainer, setOverContainer] = useState<ContainerId | null>(null)

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const enterEditMode = useCallback((lists?: DraftLists) => {
    const next = lists ?? listsFromSLAs(slas)
    setDraftLists(next)
    setSavedSnapshot(next)
    setIsEditMode(true)
    onListEditModeChange(true)
  }, [slas, onListEditModeChange])

  const exitEditMode = useCallback(() => {
    setIsEditMode(false)
    setActiveDragId(null)
    setOverContainer(null)
    setNewlyCreatedId(null)
    onListEditModeChange(false)
  }, [onListEditModeChange])

  const enterEditModeAfterCreate = useCallback((slaId: string) => {
    const base = listsFromSLAs(slas)
    const snapshot: DraftLists = {
      active: base.active.filter(id => id !== slaId),
      pending: base.pending.filter(id => id !== slaId),
    }
    const draft: DraftLists = {
      active: [...snapshot.active, slaId],
      pending: snapshot.pending,
    }
    setDraftLists(draft)
    setSavedSnapshot(snapshot)
    setNewlyCreatedId(slaId)
    setIsEditMode(true)
    onListEditModeChange(true)
  }, [slas, onListEditModeChange])

  useEffect(() => {
    if (!editAfterCreateId) return
    enterEditModeAfterCreate(editAfterCreateId)
    onClearEditAfterCreate()
  }, [editAfterCreateId, enterEditModeAfterCreate, onClearEditAfterCreate])

  useEffect(() => {
    if (!isEditMode) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isEditMode])

  useEffect(() => {
    if (pendingNavigation && isEditMode) {
      setShowDiscardDialog(true)
    }
  }, [pendingNavigation, isEditMode])

  const handleSaveOrder = () => {
    onCommitLists(draftLists)
    setNewlyCreatedId(null)
    exitEditMode()
  }

  const handleCancelOrder = () => {
    if (newlyCreatedId) {
      onCommitLists({
        active: savedSnapshot.active,
        pending: [...savedSnapshot.pending, newlyCreatedId],
      })
    } else {
      setDraftLists(savedSnapshot)
    }
    exitEditMode()
  }

  const handleAddToActiveAndEdit = (slaId: string) => {
    const lists = listsFromSLAs(slas)
    if (!lists.active.includes(slaId)) {
      lists.active = [...lists.active, slaId]
      lists.pending = lists.pending.filter(id => id !== slaId)
    }
    enterEditMode(lists)
  }

  const handleMoveToPendingAndEdit = (slaId: string) => {
    const lists = listsFromSLAs(slas)
    lists.active = lists.active.filter(id => id !== slaId)
    lists.pending = [slaId, ...lists.pending.filter(id => id !== slaId)]
    enterEditMode(lists)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    setDraftLists(prev => {
      const sourceContainer = findContainer(activeId, prev)
      let targetContainerId = findContainer(overId, prev)
      if (!sourceContainer || !targetContainerId) return prev
      if (sourceContainer === targetContainerId) return prev

      const sourceItems = [...prev[sourceContainer]]
      const targetItems = [...prev[targetContainerId]]
      const sourceIndex = sourceItems.indexOf(activeId)
      if (sourceIndex === -1) return prev

      sourceItems.splice(sourceIndex, 1)

      let insertIndex: number
      if (sourceContainer === 'active' && targetContainerId === 'pending') {
        insertIndex = 0
      } else if (sourceContainer === 'pending' && targetContainerId === 'active') {
        insertIndex = targetItems.length
      } else if (overId !== targetContainerId) {
        const overIndex = targetItems.indexOf(overId)
        insertIndex = overIndex >= 0 ? overIndex : targetItems.length
      } else {
        insertIndex = targetItems.length
      }

      targetItems.splice(insertIndex, 0, activeId)
      setOverContainer(targetContainerId)
      return { ...prev, [sourceContainer]: sourceItems, [targetContainerId]: targetItems }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)
    setOverContainer(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    setDraftLists(prev => {
      const sourceContainer = findContainer(activeId, prev)
      const targetContainerId = findContainer(overId, prev)
      if (!sourceContainer || !targetContainerId) return prev

      if (sourceContainer === targetContainerId) {
        const items = prev[sourceContainer]
        const oldIndex = items.indexOf(activeId)
        const newIndex = items.indexOf(overId)
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev
        return { ...prev, [sourceContainer]: arrayMove(items, oldIndex, newIndex) }
      }
      return prev
    })
  }

  const displayLists = isEditMode ? draftLists : listsFromSLAs(slas)
  const activeSlas = displayLists.active.map(id => slaMap.get(id)).filter(Boolean) as SLA[]
  const pendingSlas = displayLists.pending.map(id => slaMap.get(id)).filter(Boolean) as SLA[]
  const activeEmpty = activeSlas.length === 0

  const slaToDelete = deleteConfirmId ? slaMap.get(deleteConfirmId) : null

  const renderList = (containerId: ContainerId, items: SLA[], showPriorityMarkers: boolean) => {
    const isOver = isEditMode && overContainer === containerId

    if (items.length === 0 && containerId === 'pending') {
      return (
        <DroppableSection
          id="pending"
          isEditMode={isEditMode}
          isOver={isOver}
          className="min-h-[72px] flex items-center justify-center"
        >
          {isEditMode ? (
            <SortableContext items={[]} strategy={verticalListSortingStrategy}>
              <p className="px-4 py-8 text-center text-sm text-content-secondary w-full">
                No pending SLAs
              </p>
            </SortableContext>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-content-secondary w-full">
              No pending SLAs
            </p>
          )}
        </DroppableSection>
      )
    }

    if (items.length === 0 && containerId === 'active' && !isEditMode) {
      return (
        <DroppableSection id="active" isEditMode={isEditMode} isOver={isOver}>
          <p className="px-4 py-8 text-center text-sm text-content-secondary">
            No active SLAs. Add an SLA from Pending or{' '}
            <button type="button" onClick={() => onNavigateToEdit(null)} className="text-brand-600 font-medium hover:underline">
              create a new one
            </button>
            .
          </p>
        </DroppableSection>
      )
    }

    const body = (
      <>
        {showPriorityMarkers && (
          <p className="px-4 pt-3 pb-1 text-xs text-content-placeholder flex items-center gap-1">
            <FiArrowUp size={12} /> Highest priority
          </p>
        )}
        <SortableContext items={items.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {items.map((sla, i) => (
            <SortableListRow
              key={sla.id}
              sla={sla}
              containerId={containerId}
              isLast={i === items.length - 1}
              isEditMode={isEditMode}
              onEdit={() => onNavigateToEdit(sla.id)}
              onAddToActive={() => handleAddToActiveAndEdit(sla.id)}
              onMoveToPending={() => handleMoveToPendingAndEdit(sla.id)}
              onDelete={() => setDeleteConfirmId(sla.id)}
            />
          ))}
        </SortableContext>
        {showPriorityMarkers && (
          <p className={`px-4 pb-3 pt-1 text-xs text-content-placeholder flex items-center gap-1 ${items.length === 0 ? 'pt-6' : ''}`}>
            <FiArrowDown size={12} /> Lowest priority
          </p>
        )}
      </>
    )

    if (isEditMode) {
      return (
        <DroppableSection
          id={containerId}
          isEditMode={isEditMode}
          isOver={isOver}
          className={items.length === 0 ? 'min-h-[72px]' : ''}
        >
          {body}
        </DroppableSection>
      )
    }

    return (
      <DroppableSection id={containerId} isEditMode={false} isOver={false}>
        {body}
      </DroppableSection>
    )
  }

  const listContent = (
    <div className="w-full max-w-[720px]">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-[16px] font-semibold text-content-primary">Active</h2>
            <p className="text-xs text-content-secondary mt-0.5 max-w-[720px]">SLAs that are actively running on tickets</p>
          </div>
          {!isEditMode ? (
            !activeEmpty && (
              <button
                type="button"
                onClick={() => enterEditMode()}
                className="text-[14px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Edit active
              </button>
            )
          ) : (
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleCancelOrder} className="text-[14px] font-medium text-content-secondary hover:text-content-primary transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleSaveOrder} className="px-4 py-1.5 text-[14px] font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors">
                Save
              </button>
            </div>
          )}
        </div>
        {isEditMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {renderList('active', activeSlas, true)}
            <div className="mt-8 mb-1">
              <h2 className="text-[16px] font-semibold text-content-primary">Pending</h2>
              <p className="text-xs text-content-secondary mt-0.5 max-w-[720px]">SLAs that you&apos;ve configured that are not running on tickets</p>
            </div>
            {renderList('pending', pendingSlas, false)}
            <DragOverlay dropAnimation={null}>
              {activeDragId && slaMap.get(activeDragId) ? (
                <div className="opacity-90 shadow-lg rounded-lg bg-white">
                  <SLAListRow sla={slaMap.get(activeDragId)!} showDragHandle />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <>
            {renderList('active', activeSlas, true)}
            <div className="mt-8 mb-1">
              <h2 className="text-[16px] font-semibold text-content-primary">Pending</h2>
              <p className="text-xs text-content-secondary mt-0.5 max-w-[720px]">SLAs that you&apos;ve configured that are not running on tickets</p>
            </div>
            {renderList('pending', pendingSlas, false)}
          </>
        )}
      </div>

    </div>
  )

  return (
    <div className="mx-auto w-full max-w-[720px] px-6 py-8">
      <div className="text-center mb-10">
        <DocIcon />
        <h2 className="text-[20px] font-semibold text-content-primary mb-2">Service Level Agreements</h2>
        <p className="text-sm text-content-secondary max-w-[720px] mx-auto mb-5">
          SLAs are applied using rules configured within each SLA. When multiple rules match, the first one in the list wins — so order matters. Place specific conditions like VIP or after-hours at the top, and general rules at the bottom as a fallback.
        </p>
        <button
          type="button"
          onClick={() => onNavigateToEdit(null)}
          disabled={isEditMode}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus size={14} /> Create SLA
        </button>
      </div>

      {listContent}

      {deleteConfirmId && slaToDelete && (
        <DeleteConfirmDialog
          slaName={slaToDelete.name || 'This SLA'}
          onConfirm={() => { onDeleteSLA(deleteConfirmId); setDeleteConfirmId(null) }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {showDiscardDialog && (
        <DiscardChangesDialog
          onCancel={() => { setShowDiscardDialog(false); onClearPendingNavigation() }}
          onDiscard={() => {
            setShowDiscardDialog(false)
            handleCancelOrder()
            onClearPendingNavigation()
            pendingNavigation?.()
          }}
        />
      )}

    </div>
  )
}
