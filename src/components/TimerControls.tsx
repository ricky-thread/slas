const ArrowRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

interface Props {
  onNavigate?: () => void
}

export function TimerControls({ onNavigate }: Props) {
  return (
    <div className="bg-surface-card border-[0.5px] border-border-card rounded-lg shadow-[0px_0px_1px_0px_rgba(0,0,0,0.12),0px_1px_2px_0px_rgba(0,0,0,0.18)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-content-secondary leading-relaxed">
            SLA timers are driven by <strong className="text-content-primary">Status Groups</strong> in Status Mapping.
            Tickets in an <span className="inline-flex items-center py-[0.5px] px-1.5 rounded-[4px] font-semibold align-middle bg-[#CCF1EB] text-[#00967A]">Active</span> status start the clock,{' '}
            <span className="inline-flex items-center py-[0.5px] px-1.5 rounded-[4px] font-semibold align-middle bg-[#FCF4DB] text-[#91792E]">Waiting</span> statuses pause it, and{' '}
            <span className="inline-flex items-center py-[0.5px] px-1.5 rounded-[4px] font-semibold align-middle bg-[#D5E6FB] text-[#1C4D8E]">Done</span> statuses stop it permanently.
          </p>
        </div>
        <button
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-[14px] font-semibold text-brand-500 rounded-lg hover:bg-brand-50 transition-colors"
        >
          Status groups
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  )
}
