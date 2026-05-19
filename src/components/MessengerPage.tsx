export function MessengerPage() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-8">
      <h1 className="text-[20px] font-semibold text-content-primary leading-[1.2] mb-2">Messenger</h1>
      <p className="text-xs text-content-secondary mb-8">
        Configure your Messenger settings including business hours, availability, and appearance.
      </p>
      <div className="bg-surface-card border-[0.5px] border-border-card rounded-lg shadow-[0px_0px_1px_0px_rgba(0,0,0,0.12),0px_1px_2px_0px_rgba(0,0,0,0.18)] px-6 py-12 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-content-tertiary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[14px] font-semibold text-content-primary">Messenger settings</p>
        <p className="text-xs text-content-secondary max-w-xs">
          This page is under construction. Business hours and other Messenger settings will be configurable here.
        </p>
      </div>
    </div>
  )
}
