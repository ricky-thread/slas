export interface TargetLevel {
  response: string
  resolution: string
  sources?: string
}

export interface SLATimerControls {
  stopResponse: string[]
  pause: string[]
  stopResolution: string[]
}

export type Targets = Record<string, TargetLevel>

export interface Condition {
  field: string
  operator?: string
  values: string[]
}

export type SLAListStatus = 'active' | 'pending'

export interface SLA {
  id: string
  name: string
  conditions: Condition[]
  schedule?: string
  targets: Targets
  isDefault: boolean
  /** Whether the SLA is running on tickets (active) or configured but not applied (pending). */
  listStatus: SLAListStatus
  timerControls?: SLATimerControls
}

export interface FieldDef {
  key: string
  label: string
  values: string[]
}

export interface SimulateTicket {
  contactType: string
  companyType: string
  agreementType: string
  timeOfDay: string
  source: string
}

export interface SimulateResult {
  sla: SLA
  matchedConditions: string[]
  isDefault: boolean
}
