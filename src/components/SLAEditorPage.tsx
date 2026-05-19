import { useState, useRef, useEffect } from 'react'
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi'
import { SLA, Condition, Targets, TargetLevel, SLATimerControls } from '../types'
import {
  PSA_PRIORITIES,
  BUSINESS_HOURS_OPTIONS,
  SOURCE_OPTIONS,
  TIMER_STATUS_PRESETS,
} from '../data'
import { FilterConditions } from './FilterConditions'

const TIME_UNITS = ['Minutes', 'Hours', 'Workdays'] as const
type TimeUnit = (typeof TIME_UNITS)[number]

const DEFAULT_TARGETS: Targets = {
  p1: { response: '1 hr', resolution: '4 hr', sources: 'all' },
  p2: { response: '4 hr', resolution: '1 business day', sources: 'all' },
  p3: { response: '1 business day', resolution: '5 business days', sources: 'all' },
  p4: { response: '2 business days', resolution: '10 business days', sources: 'all' },
}

const EMPTY_TIMER_CONTROLS: SLATimerControls = {
  stopResponse: [],
  pause: [],
  stopResolution: [],
}

function parseTime(value: string): { amount: number; unit: TimeUnit } {
  if (value.includes('business day')) {
    const m = value.match(/(\d+)/)
    return { amount: m ? parseInt(m[1], 10) : 1, unit: 'Workdays' }
  }
  if (value.includes('hr')) {
    const m = value.match(/(\d+)/)
    return { amount: m ? parseInt(m[1], 10) : 1, unit: 'Hours' }
  }
  const m = value.match(/(\d+)/)
  return { amount: m ? parseInt(m[1], 10) : 15, unit: 'Minutes' }
}

function formatTime(amount: number, unit: TimeUnit): string {
  if (unit === 'Workdays') return `${amount} business day${amount === 1 ? '' : 's'}`
  if (unit === 'Hours') return `${amount} hr`
  return `${amount} min`
}

function newBlankSLA(): SLA {
  return {
    id: `sla-${Date.now()}`,
    name: '',
    conditions: [],
    schedule: 'business',
    targets: { ...DEFAULT_TARGETS },
    timerControls: { ...EMPTY_TIMER_CONTROLS },
    isDefault: false,
    listStatus: 'pending',
  }
}

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-content-secondary">
    <circle cx="4" cy="3" r="1" fill="currentColor" />
    <circle cx="4" cy="7" r="1" fill="currentColor" />
    <circle cx="4" cy="11" r="1" fill="currentColor" />
    <circle cx="10" cy="3" r="1" fill="currentColor" />
    <circle cx="10" cy="7" r="1" fill="currentColor" />
    <circle cx="10" cy="11" r="1" fill="currentColor" />
  </svg>
)

function TimeInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const { amount, unit } = parseTime(value)
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={1}
        value={amount}
        onChange={e => onChange(formatTime(parseInt(e.target.value, 10) || 1, unit))}
        className="w-12 text-[13px] text-content-primary border border-border-secondary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <select
        value={unit}
        onChange={e => onChange(formatTime(amount, e.target.value as TimeUnit))}
        className="text-[13px] text-content-primary border border-border-secondary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {TIME_UNITS.map(u => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
    </div>
  )
}

function TimerStatusRow({
  label,
  subtitle,
  statuses,
  presets,
  onChange,
}: {
  label: string
  subtitle: string
  statuses: string[]
  presets: string[]
  onChange: (statuses: string[]) => void
}) {
  const remaining = presets.filter(s => !statuses.includes(s))

  return (
    <div className="px-5 py-4 border-b border-border-card last:border-b-0">
      <p className="text-[14px] font-semibold text-content-primary">{label}</p>
      <p className="text-xs text-content-secondary mt-0.5 mb-3">{subtitle}</p>
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map(status => (
          <span
            key={status}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-bg-secondary text-content-primary rounded-md border border-border-card"
          >
            {status}
            <button
              type="button"
              onClick={() => onChange(statuses.filter(s => s !== status))}
              className="text-content-secondary hover:text-content-primary"
              aria-label={`Remove ${status}`}
            >
              ×
            </button>
          </span>
        ))}
        {remaining.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([...statuses, remaining[0]])}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <FiPlus size={12} /> Add
          </button>
        )}
      </div>
    </div>
  )
}

interface Props {
  initialSLA: SLA | null
  onSave: (sla: SLA) => void
  onCancel: () => void
}

export function SLAEditorPage({ initialSLA, onSave, onCancel }: Props) {
  const [sla, setSLA] = useState<SLA>(() => {
    if (initialSLA) {
      return {
        ...initialSLA,
        schedule: initialSLA.schedule ?? 'business',
        timerControls: initialSLA.timerControls ?? { ...EMPTY_TIMER_CONTROLS },
        targets: Object.keys(initialSLA.targets).length > 0
          ? initialSLA.targets
          : { ...DEFAULT_TARGETS },
      }
    }
    return newBlankSLA()
  })
  const [nameError, setNameError] = useState(false)
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

  const activeRows = PSA_PRIORITIES.filter(p => sla.targets[p.key])
  const availablePriorities = PSA_PRIORITIES.filter(p => !sla.targets[p.key])
  const timerControls = sla.timerControls ?? EMPTY_TIMER_CONTROLS

  const updateTimer = (key: keyof SLATimerControls, statuses: string[]) => {
    setSLA(s => ({ ...s, timerControls: { ...timerControls, [key]: statuses } }))
  }

  const handleTargetChange = (
    priority: string,
    field: 'response' | 'resolution' | 'sources',
    value: string,
  ) => {
    setSLA(s => ({
      ...s,
      targets: {
        ...s.targets,
        [priority]: { ...s.targets[priority], [field]: value } as TargetLevel,
      },
    }))
  }

  const removePriority = (key: string) => {
    setSLA(s => {
      const newTargets = { ...s.targets }
      delete newTargets[key]
      return { ...s, targets: newTargets }
    })
  }

  const addPriority = (key: string) => {
    setSLA(s => ({
      ...s,
      targets: {
        ...s.targets,
        [key]: { response: '1 hr', resolution: '4 hr', sources: 'all' },
      },
    }))
    setShowPriorityPicker(false)
  }

  const handleSave = () => {
    if (!sla.name.trim()) { setNameError(true); return }
    onSave({ ...sla, name: sla.name.trim() })
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 px-8 py-6 max-w-[960px]">
        {/* SLA configs */}
        <h2 className="text-[16px] font-semibold text-content-primary mb-3">SLA configs</h2>
        <div className="bg-surface-card border border-border-card rounded-lg shadow-[0px_0px_1px_0px_rgba(0,0,0,0.12),0px_1px_2px_0px_rgba(0,0,0,0.18)] mb-8">
          <div className="px-5 py-4 border-b border-border-card">
            <input
              type="text"
              value={sla.name}
              onChange={e => { setSLA(s => ({ ...s, name: e.target.value })); setNameError(false) }}
              placeholder="Name your SLA..."
              className={`w-full text-[14px] text-content-primary placeholder:text-content-placeholder bg-transparent outline-none ${
                nameError ? 'border-b border-red-400' : ''
              }`}
            />
            {nameError && <p className="mt-1 text-xs text-red-600">SLA name is required.</p>}
          </div>

          <div className="px-5 py-5 border-b border-border-card">
            <h3 className="text-[14px] font-semibold text-content-primary mb-1">
              When should this SLA apply?
            </h3>
            <p className="text-xs text-content-secondary mb-4">
              A ticket must match <strong>all</strong> conditions. Leave empty to match all tickets.
            </p>
            <FilterConditions
              conditions={sla.conditions}
              onChange={(conditions: Condition[]) => setSLA(s => ({ ...s, conditions }))}
            />
            {sla.conditions.length === 0 && (
              <p className="mt-3 text-xs text-[#1C4D8E] flex items-center gap-1.5">
                <FiInfo size={12} className="shrink-0 text-[#2F80ED]" />
                No conditions — this SLA will match all tickets.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-6 px-5 py-5 border-b border-border-card">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-content-primary">Business hours</p>
              <p className="text-xs text-content-secondary mt-0.5">
                Business hours can be set at the client, team, or workspace level.
              </p>
            </div>
            <select
              value={sla.schedule ?? 'business'}
              onChange={e => setSLA(s => ({ ...s, schedule: e.target.value }))}
              className="shrink-0 text-[13px] text-content-primary bg-surface-card border border-border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {BUSINESS_HOURS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="px-5 py-5">
            <h3 className="text-[14px] font-semibold text-content-primary mb-1">
              Response & resolution targets
            </h3>
            <p className="text-xs text-content-secondary mb-4">
              Set the maximum allowed time before first response and full resolution for each priority level.
            </p>
            <div className="rounded-lg border border-border-card overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-bg-secondary border-b border-border-card">
                    <th className="text-left px-4 py-2 font-medium text-content-secondary text-xs w-8" />
                    <th className="text-left px-4 py-2 font-medium text-content-secondary text-xs">Priority</th>
                    <th className="text-left px-4 py-2 font-medium text-content-secondary text-xs">Sources</th>
                    <th className="text-left px-4 py-2 font-medium text-content-secondary text-xs">Target response</th>
                    <th className="text-left px-4 py-2 font-medium text-content-secondary text-xs">Target resolution</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card">
                  {activeRows.map(({ key, label, dotColor, textColor }) => (
                    <tr key={key} className="bg-surface-card group/row">
                      <td className="pl-3 py-2.5">
                        <span className="p-1 text-content-secondary inline-flex">
                          <GripIcon />
                        </span>
                      </td>
                      <td className="px-2 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${textColor}`}>
                          <span className={`w-2 h-2 rounded-sm ${dotColor}`} />
                          {label}
                        </span>
                      </td>
                      <td className="px-2 py-2.5">
                        <select
                          value={sla.targets[key]?.sources ?? 'all'}
                          onChange={e => handleTargetChange(key, 'sources', e.target.value)}
                          className="text-[13px] text-content-primary border border-border-secondary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {SOURCE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2.5">
                        <TimeInput
                          value={sla.targets[key]?.response ?? '1 hr'}
                          onChange={v => handleTargetChange(key, 'response', v)}
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <TimeInput
                          value={sla.targets[key]?.resolution ?? '4 hr'}
                          onChange={v => handleTargetChange(key, 'resolution', v)}
                        />
                      </td>
                      <td className="pr-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => removePriority(key)}
                          className="p-1.5 rounded-md text-transparent group-hover/row:text-content-secondary hover:!text-red-500 hover:bg-red-50 transition-colors"
                          aria-label={`Remove ${label}`}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {availablePriorities.length > 0 && (
                <div className="border-t border-border-card px-4 py-2.5 relative" ref={pickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowPriorityPicker(v => !v)}
                    className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    <FiPlus size={12} /> Add priority
                  </button>
                  {showPriorityPicker && (
                    <div className="absolute bottom-full mb-1 left-4 z-30 bg-white border border-border-card rounded-lg shadow-lg py-1 w-28">
                      {availablePriorities.map(({ key, label, dotColor, textColor }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => addPriority(key)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left hover:bg-bg-secondary transition-colors"
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

        {/* Timer controls */}
        <h2 className="text-[16px] font-semibold text-content-primary mb-3">Timer controls</h2>
        <p className="text-xs text-content-secondary mb-3">
          Configure how SLA timers start, pause, and stop based on ticket status.
        </p>
        <div className="bg-surface-card border border-border-card rounded-lg shadow-[0px_0px_1px_0px_rgba(0,0,0,0.12),0px_1px_2px_0px_rgba(0,0,0,0.18)] mb-24">
          <TimerStatusRow
            label="Stop response timer"
            subtitle="Statuses that stop the response timer"
            statuses={timerControls.stopResponse}
            presets={TIMER_STATUS_PRESETS.stopResponse}
            onChange={s => updateTimer('stopResponse', s)}
          />
          <TimerStatusRow
            label="Pause timer"
            subtitle="Statuses that pause all SLA timers"
            statuses={timerControls.pause}
            presets={TIMER_STATUS_PRESETS.pause}
            onChange={s => updateTimer('pause', s)}
          />
          <TimerStatusRow
            label="Stop resolution timer"
            subtitle="Statuses that stop the resolution timer"
            statuses={timerControls.stopResolution}
            presets={TIMER_STATUS_PRESETS.stopResolution}
            onChange={s => updateTimer('stopResolution', s)}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-border-card bg-surface-card px-8 py-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-[14px] font-medium text-content-secondary hover:text-content-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 text-[14px] font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}
