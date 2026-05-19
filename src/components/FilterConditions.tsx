import { useState, useRef, useEffect } from 'react'
import {
  FiUser, FiHome, FiFileText, FiMail, FiLayout,
  FiSearch, FiCheck, FiPlus, FiX,
} from 'react-icons/fi'
import { Condition, FieldDef } from '../types'
import { FIELD_DEFS } from '../data'

const OPERATORS = ['is', 'is not', 'Is blank', 'Is not blank']

const FIELD_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  contactType:   FiUser,
  companyType:   FiHome,
  agreementType: FiFileText,
  source:        FiMail,
  board:         FiLayout,
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({ children, onClose, width = 'w-52', left = 0 }: {
  children: React.ReactNode; onClose: () => void; width?: string; left?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])
  return (
    <div
      ref={ref}
      style={{ left }}
      className={`absolute top-full mt-1 z-30 ${width} bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden`}
    >
      {children}
    </div>
  )
}

// ─── Condition pill ───────────────────────────────────────────────────────────
function ConditionPill({
  condition, fieldDef, openPanel, onOpenOperator, onOpenValues, onCloseAll,
  onChange, onChangeOperator, onRemove,
}: {
  condition: Condition
  fieldDef: FieldDef
  openPanel: 'operator' | 'values' | null
  onOpenOperator: () => void
  onOpenValues: () => void
  onCloseAll: () => void
  onChange: (values: string[]) => void
  onChangeOperator: (op: string) => void
  onRemove: () => void
}) {
  const [search, setSearch] = useState('')
  const operatorRef = useRef<HTMLButtonElement>(null)
  const valuesRef = useRef<HTMLButtonElement>(null)
  const operator = condition.operator ?? 'is'
  const isBlankOp = operator === 'Is blank' || operator === 'Is not blank'
  const filtered = fieldDef.values.filter(v => v.toLowerCase().includes(search.toLowerCase()))
  const FieldIcon = FIELD_ICONS[fieldDef.key] ?? FiFileText

  const valueLabel =
    condition.values.length === 0
      ? '...'
      : condition.values.length === 1
      ? condition.values[0]
      : `${condition.values.length} ${fieldDef.label.toLowerCase()}s`

  return (
    <div className="relative">
      {/* Pill */}
      <div className="inline-flex items-center h-6 rounded-[4px] border-[0.5px] border-gray-300 overflow-hidden text-[13px] bg-white select-none">

        {/* Field label */}
        <div className="flex items-center gap-1 px-2 h-full border-r border-gray-200 text-gray-800 shrink-0">
          <FieldIcon size={11} className="text-content-secondary" />
          <span className="leading-none">{fieldDef.label}</span>
        </div>

        {/* Operator */}
        <button
          ref={operatorRef}
          onClick={onOpenOperator}
          className={`flex items-center px-1.5 h-full border-r border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors ${
            openPanel === 'operator' ? 'bg-gray-50' : ''
          }`}
        >
          {operator}
        </button>

        {/* Values */}
        {!isBlankOp && (
          <button
            ref={valuesRef}
            onClick={onOpenValues}
            className={`flex items-center px-2 h-full border-r border-gray-200 font-medium text-gray-800 hover:bg-gray-50 transition-colors max-w-[140px] ${
              openPanel === 'values' ? 'bg-gray-50' : ''
            }`}
          >
            <span className="truncate">{valueLabel}</span>
          </button>
        )}

        {/* Remove */}
        <button
          onClick={onRemove}
          className="flex items-center justify-center w-5 h-full text-[#6B7280] hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          <FiX size={10} />
        </button>
      </div>

      {/* Operator dropdown — anchored below the operator button */}
      {openPanel === 'operator' && (
        <Dropdown
          onClose={onCloseAll}
          width="w-44"
          left={operatorRef.current?.offsetLeft ?? 0}
        >
          <div className="py-1">
            {OPERATORS.map(op => (
              <button
                key={op}
                onClick={() => { onChangeOperator(op); onCloseAll() }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-left hover:bg-gray-50 transition-colors text-gray-700"
              >
                {op}
                {op === operator && <FiCheck size={12} className="text-brand-500" />}
              </button>
            ))}
          </div>
        </Dropdown>
      )}

      {/* Values dropdown — anchored below the values button */}
      {openPanel === 'values' && !isBlankOp && (
        <Dropdown
          onClose={onCloseAll}
          width="w-56"
          left={valuesRef.current?.offsetLeft ?? 0}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 text-gray-400">
            <FiSearch size={13} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 text-[13px] text-gray-800 outline-none placeholder-gray-400 bg-transparent"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.map(value => {
              const checked = condition.values.includes(value)
              return (
                <button
                  key={value}
                  onClick={() => {
                    onChange(checked
                      ? condition.values.filter(v => v !== value)
                      : [...condition.values, value]
                    )
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-left transition-colors text-gray-700 ${
                    checked ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                    checked ? 'bg-brand-500 border-brand-500' : 'border-gray-300 bg-white'
                  }`}>
                    {checked && <FiCheck size={9} color="white" strokeWidth={3} />}
                  </span>
                  {value}
                </button>
              )
            })}
          </div>
        </Dropdown>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  conditions: Condition[]
  onChange: (conditions: Condition[]) => void
}

export function FilterConditions({ conditions, onChange }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const usedFields = conditions.map(c => c.field)
  const availableFields = FIELD_DEFS.filter(
    f => !usedFields.includes(f.key) && f.label.toLowerCase().includes(search.toLowerCase())
  )

  const closeAll = () => { setSearch(''); setOpen(null) }

  const handleFieldSelect = (fieldKey: string) => {
    onChange([...conditions, { field: fieldKey, operator: 'is', values: [] }])
    setSearch('')
    setOpen(`${fieldKey}:values`)
  }

  const handleValueChange = (fieldKey: string, values: string[]) => {
    onChange(conditions.map(c => c.field === fieldKey ? { ...c, values } : c))
  }

  const handleOperatorChange = (fieldKey: string, op: string) => {
    const isBlank = op === 'Is blank' || op === 'Is not blank'
    onChange(conditions.map(c =>
      c.field === fieldKey ? { ...c, operator: op, values: isBlank ? [] : c.values } : c
    ))
  }

  const handleRemove = (fieldKey: string) => {
    onChange(conditions.filter(c => c.field !== fieldKey))
    if (open?.startsWith(fieldKey)) setOpen(null)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closeAll()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2 items-center relative">
      {conditions.map(cond => {
        const def = FIELD_DEFS.find(f => f.key === cond.field)
        if (!def) return null
        const openPanel =
          open === `${cond.field}:operator` ? 'operator' :
          open === `${cond.field}:values` ? 'values' : null
        return (
          <ConditionPill
            key={cond.field}
            condition={cond}
            fieldDef={def}
            openPanel={openPanel}
            onOpenOperator={() => setOpen(open === `${cond.field}:operator` ? null : `${cond.field}:operator`)}
            onOpenValues={() => setOpen(open === `${cond.field}:values` ? null : `${cond.field}:values`)}
            onCloseAll={closeAll}
            onChange={values => handleValueChange(cond.field, values)}
            onChangeOperator={op => handleOperatorChange(cond.field, op)}
            onRemove={() => handleRemove(cond.field)}
          />
        )
      })}

      {/* Add condition */}
      <div className="relative">
        <button
          onClick={() => { setSearch(''); setOpen('fields') }}
          className="inline-flex items-center gap-1 h-6 px-2 text-[13px] font-medium text-brand-600 border-[0.5px] border-dashed border-brand-300 rounded-[4px] hover:bg-brand-50 transition-colors"
        >
          <FiPlus size={11} />
          Add condition
        </button>

        {open === 'fields' && (
          <Dropdown onClose={closeAll}>
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 text-gray-400">
              <FiSearch size={13} />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search"
                className="flex-1 text-[13px] text-gray-800 outline-none placeholder-gray-400 bg-transparent"
              />
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {availableFields.length === 0 ? (
                <div className="px-3 py-2 text-[13px] text-gray-400">
                  {usedFields.length === FIELD_DEFS.length ? 'All fields added' : 'No results'}
                </div>
              ) : (
                availableFields.map(field => {
                  const Icon = FIELD_ICONS[field.key] ?? FiFileText
                  return (
                    <button
                      key={field.key}
                      onClick={() => handleFieldSelect(field.key)}
                      className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon size={13} className="text-content-secondary" />
                      {field.label}
                    </button>
                  )
                })
              )}
            </div>
          </Dropdown>
        )}
      </div>
    </div>
  )
}
