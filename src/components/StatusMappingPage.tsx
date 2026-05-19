import { useState, useRef, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const ChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ChevronDownSm = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M8 7v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="8" cy="5" r="0.75" fill="currentColor"/>
  </svg>
)

// ─── Inline select (mock) ─────────────────────────────────────────────────────
function InlineSelect({ value }: { value?: string }) {
  return (
    <span className="inline-flex items-center gap-2 border border-gray-300 rounded px-2 py-0.5 text-[13px] text-gray-400 cursor-default">
      <span>{value || 'Select'}</span>
      <ChevronDown />
    </span>
  )
}

// ─── Status group tag (blue pill in Figma) ────────────────────────────────────
function GroupTag({ label, color, bgColor }: { label: string; color: string; bgColor: string }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-1 rounded-[4px] text-sm font-semibold ${color} ${bgColor}`}>
      {label}
    </span>
  )
}

// ─── Multi-select dropdown for status groups ──────────────────────────────────
function StatusMultiSelect({ selected, options, onChange }: {
  selected: string[]
  options: string[]
  onChange: (s: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggle = (val: string) => {
    onChange(
      selected.includes(val)
        ? selected.filter(s => s !== val)
        : [...selected, val]
    )
  }

  return (
    <div ref={ref} className="relative flex-1 px-3 py-2.5">
      <div className="flex flex-wrap gap-1.5 items-center">
        {selected.map(s => (
          <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-bg-secondary border border-gray-200 text-xs font-medium text-gray-700">
            {s}
            <button
              onClick={() => toggle(s)}
              className="text-content-secondary hover:text-content-primary transition-colors"
            >
              <FiX size={10} />
            </button>
          </span>
        ))}
        <button
          onClick={() => setOpen(v => !v)}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-brand-600 border border-dashed border-brand-300 rounded hover:bg-brand-50 transition-colors"
        >
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden mt-1">
          <div className="max-h-48 overflow-y-auto py-1">
            {options.filter(o => !selected.includes(o)).map(opt => (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {opt}
              </button>
            ))}
            {options.filter(o => !selected.includes(o)).length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-400">All statuses added</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Status action row ────────────────────────────────────────────────────────
interface StatusAction {
  trigger: string
  description: string
}

function StatusActionRow({ action }: { action: StatusAction }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-sm font-semibold text-black">Set thread to</span>
        <InlineSelect />
        <span className="text-sm font-semibold text-black">{action.trigger}</span>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{action.description}</p>
    </div>
  )
}

// ─── Status group data ────────────────────────────────────────────────────────
interface StatusGroupConfig {
  name: string
  tagColor: string
  tagBg: string
  statuses: string[]
}

// ─── Board card data ──────────────────────────────────────────────────────────
interface BoardData {
  name: string
  statusActions: StatusAction[]
  statusGroups: StatusGroupConfig[]
}

const ALL_STATUSES = [
  'New', 'In Progress', 'Assigned', 'Reopened', 'Escalated',
  'Waiting on Client', 'Waiting on Vendor', 'On Hold',
  'Completed', 'Closed', 'Resolved', 'Cancelled',
]

const INITIAL_BOARDS: BoardData[] = [
  {
    name: 'Professional Services',
    statusActions: [
      { trigger: 'after my first reply', description: 'Automatically update a thread\'s status when an Inbox or Pods user sends their first reply to the contact. This updates SLAs and provides customers with real-time progress.' },
      { trigger: 'when TimePad entry has a resolution flag', description: 'Automatically update a thread\'s status when an Inbox or Pods user sends their first reply to the contact. This updates SLAs and provides customers with real-time progress.' },
      { trigger: 'when a contact replies to a closed thread', description: 'Automatically move closed threads to a status to ensure follow-ups are visible. When unset, threads will follow PSA logic mapping if applicable or stay unchanged.' },
      { trigger: 'when accepting a thread from a notification', description: 'The status applied to a thread when it\'s accepted from a notification banner.' },
    ],
    statusGroups: [
      { name: 'Active', tagColor: 'text-[#00967A]', tagBg: 'bg-[#CCF1EB]', statuses: ['New', 'In Progress', 'Assigned', 'Reopened', 'Escalated'] },
      { name: 'Waiting', tagColor: 'text-[#91792E]', tagBg: 'bg-[#FCF4DB]', statuses: ['Waiting on Client', 'Waiting on Vendor', 'On Hold'] },
      { name: 'Done', tagColor: 'text-[#1C4D8E]', tagBg: 'bg-[#D5E6FB]', statuses: ['Completed', 'Closed'] },
    ],
  },
  {
    name: 'Help Desk',
    statusActions: [
      { trigger: 'after my first reply', description: 'Automatically update a thread\'s status when an Inbox or Pods user sends their first reply to the contact. This updates SLAs and provides customers with real-time progress.' },
      { trigger: 'when TimePad entry has a resolution flag', description: 'Automatically update a thread\'s status when an Inbox or Pods user sends their first reply to the contact. This updates SLAs and provides customers with real-time progress.' },
      { trigger: 'when a contact replies to a closed thread', description: 'Automatically move closed threads to a status to ensure follow-ups are visible. When unset, threads will follow PSA logic mapping if applicable or stay unchanged.' },
      { trigger: 'when accepting a thread from a notification', description: 'The status applied to a thread when it\'s accepted from a notification banner.' },
    ],
    statusGroups: [
      { name: 'Active', tagColor: 'text-[#00967A]', tagBg: 'bg-[#CCF1EB]', statuses: ['New', 'In Progress'] },
      { name: 'Waiting', tagColor: 'text-[#91792E]', tagBg: 'bg-[#FCF4DB]', statuses: ['Waiting on Client'] },
      { name: 'Done', tagColor: 'text-[#1C4D8E]', tagBg: 'bg-[#D5E6FB]', statuses: ['Completed', 'Closed'] },
    ],
  },
]

// ─── Board card ───────────────────────────────────────────────────────────────
function BoardCard({ board, onChange }: {
  board: BoardData
  onChange: (board: BoardData) => void
}) {
  const [expanded, setExpanded] = useState(true)

  const updateGroupStatuses = (groupIdx: number, statuses: string[]) => {
    const newGroups = board.statusGroups.map((g, i) => i === groupIdx ? { ...g, statuses } : g)
    onChange({ ...board, statusGroups: newGroups })
  }

  return (
    <div className="bg-white border-[0.5px] border-[#e2e2e2] rounded-lg shadow-[0px_0px_1px_0px_rgba(0,0,0,0.12),0px_1px_2px_0px_rgba(0,0,0,0.18)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h3 className="text-base font-semibold text-black">{board.name}</h3>
        <button
          onClick={() => setExpanded(v => !v)}
          className="p-2 rounded text-gray-500 hover:bg-gray-50 transition-colors"
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {expanded && (
        <>
          {/* Divider */}
          <div className="border-t border-[#e2e2e2]" />

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Status actions */}
            <div>
              <h4 className="text-base font-semibold text-black mb-6">Status actions</h4>
              <div className="space-y-6">
                {board.statusActions.map((action, i) => (
                  <StatusActionRow key={i} action={action} />
                ))}
              </div>
            </div>

            {/* Status Groups */}
            <div>
              <h4 className="text-base font-semibold text-black">Status Groups</h4>
              <p className="text-sm text-gray-500 mt-1 mb-5">
                Map two or more board statuses to support two-step close. Status groups also drive SLA timers: <strong className="text-gray-600">Active</strong> = running, <strong className="text-gray-600">Waiting</strong> = paused, <strong className="text-gray-600">Done</strong> = stopped.
              </p>

              {/* Group table */}
              <div className="border-[0.5px] border-[#e2e2e2] rounded">
                {board.statusGroups.map((group, gi) => (
                  <div key={group.name} className={`relative flex items-stretch ${gi > 0 ? 'border-t border-[#e2e2e2]' : ''}`} style={{ zIndex: board.statusGroups.length - gi }}>
                    {/* Tag column */}
                    <div className="w-[180px] shrink-0 p-3 flex items-start border-r border-[#e2e2e2]">
                      <GroupTag label={group.name} color={group.tagColor} bgColor={group.tagBg} />
                    </div>
                    {/* Multi-select column */}
                    <StatusMultiSelect
                      selected={group.statuses}
                      options={ALL_STATUSES}
                      onChange={s => updateGroupStatuses(gi, s)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer divider + delete */}
          <div className="border-t border-[#e2e2e2]" />
          <div className="px-6 py-4">
            <button className="px-2 py-1.5 text-sm font-semibold text-red-500 rounded hover:bg-red-50 transition-colors">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── StatusMappingPage ────────────────────────────────────────────────────────
export function StatusMappingPage() {
  const [boards, setBoards] = useState<BoardData[]>(INITIAL_BOARDS)

  const updateBoard = (idx: number, board: BoardData) => {
    setBoards(bs => bs.map((b, i) => i === idx ? board : b))
  }

  return (
    <div className="max-w-[720px] mx-auto px-2.5 py-8 space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black">PSA board mappings</h1>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-brand-500 rounded hover:bg-brand-600 transition-colors">
            <PlusIcon /> Add board
          </button>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed max-w-[460px]">
          By mapping statuses for each stage of your workflow, you can set up triggers that automatically move tasks to the next phase.
        </p>
      </div>

      {/* Board cards */}
      <div className="space-y-3">
        {boards.map((board, idx) => (
          <BoardCard
            key={board.name}
            board={board}
            onChange={b => updateBoard(idx, b)}
          />
        ))}
      </div>
    </div>
  )
}
