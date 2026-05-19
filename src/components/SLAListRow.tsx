import { useEffect, useRef, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiMoreHorizontal, FiX } from 'react-icons/fi'
import { SLA } from '../types'
import { conditionsSummary } from '../data'

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-content-placeholder">
    <circle cx="4" cy="3" r="1" fill="currentColor" />
    <circle cx="4" cy="7" r="1" fill="currentColor" />
    <circle cx="4" cy="11" r="1" fill="currentColor" />
    <circle cx="10" cy="3" r="1" fill="currentColor" />
    <circle cx="10" cy="7" r="1" fill="currentColor" />
    <circle cx="10" cy="11" r="1" fill="currentColor" />
  </svg>
)

type ListSection = 'active' | 'pending'

interface Props {
  sla: SLA
  section?: ListSection
  showDragHandle?: boolean
  showContextMenu?: boolean
  dragHandleListeners?: Record<string, unknown>
  dragHandleAttributes?: Record<string, unknown>
  onEdit?: () => void
  onAddToActive?: () => void
  onMoveToPending?: () => void
  onDelete?: () => void
  onRowClick?: () => void
  isLast?: boolean
}

export function SLAListRow({
  sla,
  section = 'pending',
  showDragHandle = false,
  showContextMenu = false,
  dragHandleListeners,
  dragHandleAttributes,
  onEdit,
  onAddToActive,
  onMoveToPending,
  onDelete,
  onRowClick,
  isLast = false,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const summary = conditionsSummary(sla.conditions)

  const isInteractive = !!onRowClick

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-4 transition-colors ${
        !isLast ? 'border-b border-border-card' : ''
      } ${isInteractive ? 'cursor-pointer hover:bg-[rgba(229,228,224,0.55)]' : ''}`}
      onClick={isInteractive ? onRowClick : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onRowClick?.()
        }
      } : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {showDragHandle && (
        <button
          type="button"
          {...dragHandleListeners}
          {...dragHandleAttributes}
          onClick={e => e.stopPropagation()}
          className="shrink-0 mt-0.5 p-1 rounded text-content-placeholder hover:text-content-tertiary hover:bg-bg-secondary cursor-grab active:cursor-grabbing transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <GripIcon />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold text-content-primary leading-[1.44]">{sla.name}</h3>
        <p className="text-xs text-content-secondary mt-0.5">
          {'{{'}
          {summary}
          {'}}'}
        </p>
      </div>

      {showContextMenu && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            className={`p-1.5 rounded-md text-content-tertiary hover:text-content-primary transition-opacity ${
              menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            aria-label="SLA options"
            aria-expanded={menuOpen}
          >
            <FiMoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-30 w-52 bg-white border border-border-card rounded-lg shadow-lg py-1 overflow-hidden"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit?.() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[14px] text-content-primary hover:bg-bg-secondary transition-colors text-left"
              >
                <FiEdit2 size={14} className="text-content-secondary shrink-0" />
                Edit
              </button>
              {section === 'active' ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); onMoveToPending?.() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[14px] text-content-primary hover:bg-bg-secondary transition-colors text-left"
                >
                  <FiX size={14} className="text-content-secondary shrink-0" />
                  Move to pending...
                </button>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); onAddToActive?.() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[14px] text-content-primary hover:bg-bg-secondary transition-colors text-left"
                >
                  <FiPlus size={14} className="text-content-secondary shrink-0" />
                  Add to active list...
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete?.() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[14px] text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <FiTrash2 size={14} className="shrink-0" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
