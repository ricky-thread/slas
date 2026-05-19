import { SLA, Condition, FieldDef, SimulateTicket, SimulateResult, Targets } from './types'

// Priorities configured in the PSA (P1–P8)
export const PSA_PRIORITIES = [
  { key: 'p1', label: 'P1', dotColor: 'bg-red-400',    textColor: 'text-red-700' },
  { key: 'p2', label: 'P2', dotColor: 'bg-amber-400',  textColor: 'text-amber-700' },
  { key: 'p3', label: 'P3', dotColor: 'bg-yellow-300', textColor: 'text-yellow-700' },
  { key: 'p4', label: 'P4', dotColor: 'bg-blue-400',   textColor: 'text-blue-700' },
  { key: 'p5', label: 'P5', dotColor: 'bg-gray-300',   textColor: 'text-content-tertiary' },
  { key: 'p6', label: 'P6', dotColor: 'bg-gray-300',   textColor: 'text-content-tertiary' },
  { key: 'p7', label: 'P7', dotColor: 'bg-gray-300',   textColor: 'text-content-tertiary' },
  { key: 'p8', label: 'P8', dotColor: 'bg-gray-300',   textColor: 'text-content-tertiary' },
]

export const TIME_OPTIONS: string[] = [
  '15 min', '30 min', '1 hr', '2 hr', '4 hr', '8 hr',
  '1 business day', '2 business days', '5 business days', '10 business days',
]

const GOLD_TARGETS: Targets = {
  p1: { response: '15 min',        resolution: '1 hr' },
  p2: { response: '1 hr',          resolution: '4 hr' },
  p3: { response: '4 hr',          resolution: '1 business day' },
  p4: { response: '8 hr',          resolution: '5 business days' },
}

const SILVER_TARGETS: Targets = {
  p1: { response: '30 min',        resolution: '4 hr' },
  p2: { response: '2 hr',          resolution: '1 business day' },
  p3: { response: '8 hr',          resolution: '2 business days' },
  p4: { response: '1 business day', resolution: '5 business days' },
}

const STANDARD_TARGETS: Targets = {
  p1: { response: '1 hr',          resolution: '4 hr' },
  p2: { response: '4 hr',          resolution: '2 business days' },
  p3: { response: '1 business day', resolution: '5 business days' },
  p4: { response: '2 business days', resolution: '10 business days' },
}

const DEFAULT_TIMER_CONTROLS = {
  stopResponse: ['Completed', 'Closed', 'Resolved'],
  pause: ['Waiting on client', 'Waiting on vendor', 'On Hold'],
  stopResolution: ['Completed', 'Closed', 'Resolved'],
}

export const INITIAL_SLAS: SLA[] = [
  {
    id: '1',
    name: 'My first SLA',
    conditions: [
      { field: 'agreementType', values: ['Managed Services'] },
      { field: 'source', values: ['Chat'] },
    ],
    targets: GOLD_TARGETS,
    isDefault: false,
    listStatus: 'active',
    schedule: 'business',
    timerControls: DEFAULT_TIMER_CONTROLS,
  },
  {
    id: '2',
    name: 'My second SLA',
    conditions: [
      { field: 'agreementType', values: ['Managed Services'] },
      { field: 'source', values: ['Chat'] },
    ],
    targets: SILVER_TARGETS,
    isDefault: false,
    listStatus: 'active',
    schedule: 'business',
    timerControls: DEFAULT_TIMER_CONTROLS,
  },
  {
    id: '3',
    name: 'My third SLA',
    conditions: [
      { field: 'agreementType', values: ['Managed Services'] },
      { field: 'source', values: ['Chat'] },
    ],
    targets: STANDARD_TARGETS,
    isDefault: false,
    listStatus: 'pending',
    schedule: 'business',
    timerControls: DEFAULT_TIMER_CONTROLS,
  },
]

export const FIELD_DEFS: FieldDef[] = [
  { key: 'contactType',   label: 'Contact type',   values: ['VIP', 'C-Level', 'Owner', 'End User'] },
  { key: 'companyType',   label: 'Company type',   values: ['Client', 'Partner', 'Prospect'] },
  { key: 'agreementType', label: 'Agreement type', values: ['Managed Services', 'Time & Materials', 'Block Hours', 'None'] },
  { key: 'source',        label: 'Source',         values: ['Email', 'Chat', 'Phone', 'Portal'] },
  { key: 'board',         label: 'Board',          values: ['Help Desk', 'Projects', 'T1 Service Desk'] },
]

export const SCHEDULE_OPTIONS = [
  { value: 'any',      label: 'Any time' },
  { value: 'business', label: 'Inside business hours' },
  { value: 'outside',  label: 'Outside business hours' },
]

export const BUSINESS_HOURS_OPTIONS = [
  { value: 'business', label: 'Respect business hours' },
  { value: 'any',      label: 'Any time' },
  { value: 'outside',  label: 'Outside business hours only' },
]

export const SOURCE_OPTIONS = [
  { value: 'all',     label: 'All sources' },
  { value: 'email',   label: 'Email' },
  { value: 'chat',    label: 'Chat' },
  { value: 'phone',   label: 'Phone' },
  { value: 'portal',  label: 'Portal' },
]

export const TIMER_STATUS_PRESETS = {
  stopResponse: ['Completed', 'Closed', 'Resolved'],
  pause: ['Waiting on client', 'Waiting on vendor', 'On Hold'],
  stopResolution: ['Completed', 'Closed', 'Resolved'],
}

/** Returns true if a ticket could plausibly match both SLAs. */
export function slasOverlap(a: SLA, b: SLA): boolean {
  if (a.isDefault || b.isDefault) return false
  if (a.conditions.length === 0 || b.conditions.length === 0) return false
  for (const condA of a.conditions) {
    const condB = b.conditions.find(c => c.field === condA.field)
    if (condB) {
      const hasCommon = condA.values.some(v => condB.values.includes(v))
      if (!hasCommon) return false
    }
  }
  return true
}

export function conditionsSummary(conditions: Condition[]): string {
  if (conditions.length === 0) return 'All tickets'
  return conditions.map(cond => {
    const def = FIELD_DEFS.find(f => f.key === cond.field)
    const label = def?.label ?? cond.field
    if (cond.values.length === 0) return label
    return `${label} is ${cond.values.join(', ')}`
  }).join(' and ')
}

/** SLAs that are actively running on tickets (excludes pending). */
export function activeSLAs(slas: SLA[]): SLA[] {
  return slas.filter(s => s.listStatus === 'active')
}

export function simulateTicket(ticket: SimulateTicket, slas: SLA[]): SimulateResult {
  const fieldMap: Record<string, string> = {
    contactType:   ticket.contactType,
    companyType:   ticket.companyType,
    agreementType: ticket.agreementType,
    timeOfDay:     ticket.timeOfDay,
    source:        ticket.source,
  }

  const active = activeSLAs(slas)
  for (const sla of active) {
    const allMet = sla.conditions.every(cond => {
      const val = fieldMap[cond.field]
      return val && cond.values.includes(val)
    })
    if (allMet) {
      const matched = sla.conditions
        .filter(cond => fieldMap[cond.field] && cond.values.includes(fieldMap[cond.field]))
        .map(cond => {
          const def = FIELD_DEFS.find(f => f.key === cond.field)
          return `${def?.label ?? cond.field} is ${fieldMap[cond.field]}`
        })
      return { sla, matchedConditions: matched, isDefault: false }
    }
  }

  const fallback = active[active.length - 1]
  return { sla: fallback, matchedConditions: [], isDefault: true }
}
