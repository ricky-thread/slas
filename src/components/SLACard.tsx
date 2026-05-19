import { useState, useEffect, useRef, useCallback } from 'react'
import { FiEdit2, FiTrash2, FiPlus, FiLock, FiArrowUpRight, FiInfo } from 'react-icons/fi'
import { SLA, Condition, TargetLevel } from '../types'
import { conditionsSummary, TIME_OPTIONS, PSA_PRIORITIES, SCHEDULE_OPTIONS } from '../data'
import { FilterConditions } from './FilterConditions'

// ─── Icons ────────────────────────────────────────────────────────────────────
const PencilIcon = () => <FiEdit2 size={14} />
const TrashIcon = () => <FiTrash2 size={14} />
const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="4" cy="3" r="1" fill="currentColor"/>
    <circle cx="4" cy="7" r="1" fill="currentColor"/>
    <circle cx="4" cy="11" r="1" fill="currentColor"/>
    <circle cx="10" cy="3" r="1" fill="currentColor"/>
    <circle cx="10" cy="7" r="1" fill="currentColor"/>
    <circle cx="10" cy="11" r="1" fill="currentColor"/>
  </svg>
)
const LockIcon = () => <FiLock size={13} />


// ─── Clamped text with tooltip ────────────────────────────────────────────────
function ClampedText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [clamped, setClamped] = useState(false)

  const check = useCallback(() => {
    const el = ref.current
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1)
  }, [])

  useEffect(() => {
    check()
    const observer = new ResizeObserver(check)
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [check, text])

  return (
    <div className="relative group/ct w-full min-w-0">
      <p ref={ref} className={`line-clamp-2 ${className ?? ''}`}>{text}</p>
      {clamped && (
        <div className="absolute left-0 bottom-full mb-1.5 z-50 hidden group-hover/ct:block w-64 bg-gray-900 text-white text-xs rounded-md px-2.5 py-1.5 shadow-lg pointer-events-none leading-relaxed">
          {text}
          <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

// ─── Overlap warning ─────────────────────────────────────────────────────────
export function OverlapWarning() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-t-lg rounded-b-none -mb-[1px] relative z-10 text-amber-800">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
        <path d="M8 2L1.5 13h13L8 2z" stroke="#D97706" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8 7v3M8 11.5v.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span className="text-xs leading-relaxed">
        <strong className="font-semibold">These SLAs can match the same ticket.</strong>{' '}
        The one higher in the list will always win.
      </span>
    </div>
  )
}

// ─── SLACard ─────────────────────────────────────────────────────────────────
interface Props {
  sla: SLA
  editing: boolean
  onStartEdit: () => void
  onSave: (sla: SLA) => void
  onCancelEdit: () => void
  onDelete: () => void
  onNavigateToMessenger?: () => void
  dragHandleListeners?: Record<string, unknown>
  dragHandleAttributes?: Record<string, unknown>
}

export function SLACard({
  sla, editing, onStartEdit, onSave, onCancelEdit,
  onDelete, onNavigateToMessenger, dragHandleListeners, dragHandleAttributes,
}: Props) {
  const summary = conditionsSummary(sla.conditions)

  // ── Edit state (local draft) ──────────────────────────────────────────
  const [draft, setDraft] = useState<SLA>({ ...sla })
  const [nameError, setNameError] = useState(false)

  // Reset draft when entering edit mode or sla changes
  useEffect(() => {
    setDraft({ ...sla })
    setNameError(false)
  }, [editing, sla.id])

  const handleTargetChange = (
    priority: string,
    field: 'response'|'resolution',
    value: string
  ) => {
    setDraft(d => ({
      ...d,
      targets: {
        ...d.targets,
        [priority]: { ...d.targets[priority], [field]: value } as TargetLevel,
      },
    }))
  }

  const removePriority = (key: string) => {
    setDraft(d => {
      const newTargets = { ...d.targets }
      delete newTargets[key]
      return { ...d, targets: newTargets }
    })
  }

  const handleSave = () => {
    if (!draft.name.trim()) { setNameError(true); return }
    onSave({ ...draft, name: draft.name.trim() })
  }

  // ── Priority picker ───────────────────────────────────────────────────
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPriorityPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeRows = PSA_PRIORITIES.filter(p => draft.targets[p.key])
  const availablePriorities = PSA_PRIORITIES.filter(p => !draft.targets[p.key])

  // Validate that lower priorities don't have faster targets than higher ones
  const targetErrors = new Set<string>()
  activeRows.forEach((row, i) => {
    const myResponse   = TIME_OPTIONS.indexOf(draft.targets[row.key]?.response ?? '')
    const myResolution = TIME_OPTIONS.indexOf(draft.targets[row.key]?.resolution ?? '')
    for (let j = 0; j < i; j++) {
      const higherKey = activeRows[j].key
      if (myResponse   < TIME_OPTIONS.indexOf(draft.targets[higherKey]?.response ?? ''))
        targetErrors.add(`${row.key}:response`)
      if (myResolution < TIME_OPTIONS.indexOf(draft.targets[higherKey]?.resolution ?? ''))
        targetErrors.add(`${row.key}:resolution`)
    }
  })

  const addPriority = (key: string) => {
    setDraft(d => ({
      ...d,
      targets: {
        ...d.targets,
        [key]: { response: '1 hr', resolution: '4 hr' },
      },
    }))
    setShowPriorityPicker(false)
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="bg-surface-card border-[0.5px] border-border-card rounded-lg shadow-[0px_0px_1px_0px_rgba(0,0,0,0.12),0px_1px_2px_0px_rgba(0,0,0,0.18)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 group">
        {/* Drag handle or lock */}
        {sla.isDefault ? (
          <span className="shrink-0 w-[28px] h-[28px] flex items-center justify-center text-content-secondary">
            <LockIcon />
          </span>
        ) : !editing ? (
          <button
            {...dragHandleListeners}
            {...dragHandleAttributes}
            onClick={e => e.stopPropagation()}
            className="shrink-0 p-[7px] rounded text-content-secondary hover:text-content-primary hover:bg-bg-secondary cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <GripIcon />
          </button>
        ) : (
          <span className="shrink-0 p-[7px] text-content-secondary">
            <GripIcon />
          </span>
        )}

        {/* Name */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              type="text"
              value={draft.name}
              onChange={e => { setDraft(d => ({ ...d, name: e.target.value })); setNameError(false) }}
              placeholder="SLA name..."
              autoFocus
              onClick={e => e.stopPropagation()}
              className={`w-full text-[14px] font-semibold text-content-primary leading-[1.44] bg-transparent border-b outline-none pb-0.5 transition-colors ${
                nameError ? 'border-red-400' : 'border-border-secondary focus:border-brand-500'
              }`}
            />
          ) : (
            <>
              <h3 className="text-[14px] font-semibold text-content-primary leading-[1.44]">{sla.name}</h3>
              {sla.isDefault ? (
                <p className="text-xs text-content-secondary mt-0.5">
                  Applies to all tickets that don't match any other SLA above.
                </p>
              ) : (
                <ClampedText text={summary} className="text-xs text-content-secondary mt-0.5" />
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={e => { e.stopPropagation(); onStartEdit() }}
              className="p-[7px] rounded-md text-content-secondary hover:text-content-primary hover:bg-bg-secondary transition-colors"
              title="Edit SLA"
            >
              <PencilIcon />
            </button>
            {!sla.isDefault && (
              <button
                onClick={e => { e.stopPropagation(); onDelete() }}
                className="p-[7px] rounded-md text-content-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete SLA"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit mode content — animated via grid-template-rows trick */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${editing ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
      <div className="overflow-hidden">
        <>
          <div className="border-t border-border-primary" />

          <div className="px-4">
            {/* Conditions */}
            <div className="py-5">
              <h4 className="text-[14px] font-semibold text-content-primary mb-1 leading-[1.44]">
                {editing ? 'When should this SLA apply?' : 'Conditions'}
              </h4>
              {editing ? (
                sla.isDefault ? (
                  <div className="px-3.5 py-2.5 bg-bg-secondary border border-border-card rounded-lg">
                    <p className="text-xs text-content-secondary">This SLA automatically applies to any ticket that doesn't match any of the other SLAs above. Conditions cannot be added.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-content-secondary mb-3">
                      A ticket must match <strong>all</strong> conditions. Leave empty to match all tickets.
                    </p>
                    <FilterConditions
                      conditions={draft.conditions}
                      onChange={(conditions: Condition[]) => setDraft(d => ({ ...d, conditions }))}
                    />
                    {draft.conditions.length === 0 && (
                      <p className="mt-3 text-xs text-[#1C4D8E] flex items-center gap-1.5">
                        <FiInfo size={12} className="shrink-0 text-[#2F80ED]" />
                        No conditions — this SLA will match all tickets.
                      </p>
                    )}
                  </>
                )
              ) : (
                sla.isDefault ? (
                  <p className="text-xs text-content-secondary">Matches all tickets (catch-all).</p>
                ) : sla.conditions.length === 0 ? (
                  <p className="text-xs text-content-secondary italic">No conditions — matches all tickets.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {sla.conditions.map((cond, ci) => {
                      const label = summary.split(' AND ')[ci]
                      return (
                        <span key={cond.field}>
                          {ci > 0 && <span className="text-xs text-content-tertiary mx-1">AND</span>}
                          <span className="inline-flex items-center px-2.5 py-1 text-xs bg-bg-secondary text-content-primary rounded-full font-medium">
                            {label}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                )
              )}
            </div>

            {/* Divider: conditions → schedule (or targets) */}
            <div className="border-t border-border-card" />

            {/* Schedule */}
            {!sla.isDefault && (
              <>
                <div className="flex items-center justify-between gap-6 py-5">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-content-primary leading-[1.44]">Hours</p>
                    <p className="text-xs text-content-secondary mt-0.5">
                      Restrict when this SLA is active based on your{' '}
                      <button
                        onClick={onNavigateToMessenger}
                        className="inline-flex items-center gap-0.5 font-medium text-content-secondary hover:text-content-primary transition-colors"
                      >
                        Messenger
                        <FiArrowUpRight size={11} />
                      </button>{' '}
                      business hours settings.
                    </p>
                  </div>
                  <select
                    value={draft.schedule ?? 'any'}
                    onChange={e => setDraft(d => ({ ...d, schedule: e.target.value }))}
                    className="shrink-0 text-[13px] text-content-primary bg-surface-card border border-border-secondary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {SCHEDULE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                {/* Divider: schedule → targets */}
                <div className="border-t border-border-card" />
              </>
            )}

            {/* Targets matrix */}
            <div className="py-5">
              <h4 className="text-[14px] font-semibold text-content-primary mb-2 leading-[1.44]">Response & resolution targets</h4>
              {editing && (
                <p className="text-xs text-content-secondary mb-3">
                  Set the maximum allowed time before first response and full resolution for each priority level.
                </p>
              )}
              <div className="rounded-lg border border-border-card overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-bg-secondary">
                      <th className="text-left px-4 py-2 font-medium text-content-secondary text-xs w-16">Priority</th>
                      <th className="text-left px-4 py-2 font-medium text-content-secondary text-xs">Target response</th>
                      <th className="text-left px-4 py-2 font-medium text-content-secondary text-xs">Target resolution</th>
                      {editing && <th className="w-8" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-card">
                    {activeRows.map(({ key, label, dotColor, textColor }) => (
                      <tr key={key} className="bg-surface-card group/row">
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${textColor}`}>
                            <span className={`w-2 h-2 rounded-sm ${dotColor}`} />
                            {label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {editing ? (
                            <select
                              value={draft.targets[key]?.response ?? '1 hr'}
                              onChange={e => handleTargetChange(key, 'response', e.target.value)}
                              className={`text-[13px] text-content-primary bg-surface-card border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:border-transparent ${
                                targetErrors.has(`${key}:response`)
                                  ? 'border-red-400 focus:ring-red-400'
                                  : 'border-border-secondary focus:ring-brand-500'
                              }`}
                            >
                              {TIME_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </select>
                          ) : (
                            <span className="text-content-primary">{sla.targets[key]?.response}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {editing ? (
                            <select
                              value={draft.targets[key]?.resolution ?? '4 hr'}
                              onChange={e => handleTargetChange(key, 'resolution', e.target.value)}
                              className={`text-[13px] text-content-primary bg-surface-card border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:border-transparent ${
                                targetErrors.has(`${key}:resolution`)
                                  ? 'border-red-400 focus:ring-red-400'
                                  : 'border-border-secondary focus:ring-brand-500'
                              }`}
                            >
                              {TIME_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </select>
                          ) : (
                            <span className="text-content-primary">{sla.targets[key]?.resolution}</span>
                          )}
                        </td>
                        {editing && (
                          <td className="pr-3 py-2.5">
                            <button
                              onClick={() => removePriority(key)}
                              className="p-[7px] rounded-md text-transparent group-hover/row:text-content-secondary hover:!text-red-500 hover:bg-red-50 transition-colors"
                              title={`Remove ${label}`}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Add priority */}
                {editing && availablePriorities.length > 0 && (
                  <div className="border-t border-border-card px-4 py-2 relative" ref={pickerRef}>
                    <button
                      onClick={() => setShowPriorityPicker(v => !v)}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      <FiPlus size={12} />
                      Add priority
                    </button>
                    {showPriorityPicker && (
                      <div className="absolute bottom-full mb-1 left-4 z-30 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1 w-28">
                        {availablePriorities.map(({ key, label, dotColor, textColor }) => (
                          <button
                            key={key}
                            onClick={() => addPriority(key)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className={`inline-flex items-center gap-1.5 font-semibold ${textColor}`}>
                              <span className={`w-2 h-2 rounded-sm ${dotColor}`} />
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit mode footer with Save/Cancel */}
          {editing && (
            <>
              <div className="border-t border-border-primary" />
              <div className="flex items-center justify-end gap-3 px-4 py-3">
                <button
                  onClick={onCancelEdit}
                  className="px-4 py-1.5 text-[13px] font-semibold text-content-secondary rounded-lg border border-border-card hover:bg-bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-[13px] font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </>
          )}
        </>
      </div>
      </div>
    </div>
  )
}
