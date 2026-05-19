import { useState } from 'react'
import { SLA } from '../types'
import { FIELD_DEFS, simulateTicket } from '../data'

// ─── Icons ────────────────────────────────────────────────────────────────────
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const PlayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M4 3l10 5-10 5V3z" fill="currentColor"/>
  </svg>
)

// ─── Priority rows ───────────────────────────────────────────────────────────
const PRIORITY_ROWS = [
  { key: 'p1' as const, label: 'P1', color: 'bg-red-400',    text: 'text-red-700' },
  { key: 'p2' as const, label: 'P2', color: 'bg-amber-400',  text: 'text-amber-700' },
  { key: 'p3' as const, label: 'P3', color: 'bg-yellow-300', text: 'text-yellow-700' },
  { key: 'p4' as const, label: 'P4', color: 'bg-blue-400',   text: 'text-blue-700' },
]

// ─── Select field ─────────────────────────────────────────────────────────────
function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
        >
          <option value="">— Any —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
          <ChevronDown />
        </span>
      </div>
    </div>
  )
}

// ─── SimulateModal ────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean
  slas: SLA[]
  onClose: () => void
}

const SIMULATE_FIELDS = ['contactType', 'companyType', 'agreementType', 'timeOfDay', 'source']

type TicketState = Record<string, string>

export function SimulateModal({ isOpen, slas, onClose }: Props) {
  const [ticket, setTicket] = useState<TicketState>({})
  const [result, setResult] = useState<ReturnType<typeof simulateTicket> | null>(null)

  if (!isOpen) return null

  const handleRun = () => {
    const t = {
      contactType:   ticket.contactType   ?? '',
      companyType:   ticket.companyType   ?? '',
      agreementType: ticket.agreementType ?? '',
      timeOfDay:     ticket.timeOfDay     ?? '',
      source:        ticket.source        ?? '',
    }
    setResult(simulateTicket(t, slas))
  }

  const handleReset = () => { setTicket({}); setResult(null) }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 bg-brand-50 rounded-lg text-brand-600">
                <PlayIcon />
              </span>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Simulate a ticket</h3>
                <p className="text-xs text-gray-500">See which SLA would apply</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <XIcon />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              {SIMULATE_FIELDS.map(fieldKey => {
                const def = FIELD_DEFS.find(f => f.key === fieldKey)
                if (!def) return null
                return (
                  <SelectField
                    key={fieldKey}
                    label={def.label}
                    value={ticket[fieldKey] ?? ''}
                    onChange={v => { setTicket(t => ({ ...t, [fieldKey]: v })); setResult(null) }}
                    options={def.values}
                  />
                )
              })}
            </div>

            {/* Result */}
            {result && (
              <div className={`mt-5 rounded-xl border p-4 ${
                result.isDefault
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-brand-50 border-brand-200'
              }`}>
                <div className="mb-3">
                  <span className="text-sm font-semibold text-gray-900">{result.sla.name}</span>
                  {result.isDefault ? (
                    <p className="text-xs text-gray-600 mt-0.5">
                      No specific SLA matched. The <strong>Default</strong> catch-all SLA applies.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-700 mt-0.5">
                      Matched because <strong>{result.matchedConditions.join(' and ')}</strong>.
                    </p>
                  )}
                </div>

                {/* Targets table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50/80">
                        <th className="text-left px-3 py-1.5 font-medium text-gray-500">Priority</th>
                        <th className="text-left px-3 py-1.5 font-medium text-gray-500">Response</th>
                        <th className="text-left px-3 py-1.5 font-medium text-gray-500">Resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {PRIORITY_ROWS.map(({ key, label, color, text }) => (
                        <tr key={key} className="bg-white">
                          <td className="px-3 py-1.5">
                            <span className={`inline-flex items-center gap-1 font-semibold ${text}`}>
                              <span className={`w-1.5 h-1.5 rounded-sm ${color}`} />
                              {label}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-gray-700">{result.sla.targets[key].response}</td>
                          <td className="px-3 py-1.5 text-gray-700">{result.sla.targets[key].resolution}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Reset
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleRun}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
              >
                <PlayIcon />
                Run simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
