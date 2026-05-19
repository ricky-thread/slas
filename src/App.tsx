import { useState, useCallback } from 'react'
import { SLA } from './types'
import { INITIAL_SLAS } from './data'
import { SLAPage } from './components/SLAPage'
import { SLAEditorPage } from './components/SLAEditorPage'
import { StatusMappingPage } from './components/StatusMappingPage'
import { MessengerPage } from './components/MessengerPage'
import {
  FiZap, FiStar, FiCheckSquare, FiMessageSquare, FiPhone,
  FiUsers, FiSettings, FiTarget, FiUser, FiGrid, FiShield,
  FiBarChart2, FiClock, FiInbox, FiHelpCircle, FiChevronDown, FiArrowLeft,
} from 'react-icons/fi'

type Page =
  | { kind: 'slas' }
  | { kind: 'sla-edit'; slaId: string | null }
  | { kind: 'status-mapping' }
  | { kind: 'messenger' }

type SidebarPage = 'SLAs' | 'Status Mapping' | 'Messenger'

type NavItem = { label: string; icon: React.ReactNode; sidebarPage?: SidebarPage }
type NavSection = { section: string | null; items: NavItem[] }

const I = 16

const NAV: NavSection[] = [
  { section: null, items: [{ label: 'Get started', icon: <FiZap size={I} /> }] },
  {
    section: 'MAGIC AI',
    items: [
      { label: 'Assistive AI', icon: <FiStar size={I} /> },
      { label: 'Magic Agents', icon: <FiStar size={I} /> },
      { label: 'Intelligence', icon: <FiStar size={I} /> },
    ],
  },
  {
    section: 'AUTOMATION',
    items: [
      { label: 'Status Mapping', icon: <FiCheckSquare size={I} />, sidebarPage: 'Status Mapping' },
      { label: 'Flows', icon: <FiGrid size={I} /> },
    ],
  },
  {
    section: 'COMMUNICATION',
    items: [
      { label: 'Messenger', icon: <FiMessageSquare size={I} />, sidebarPage: 'Messenger' },
      { label: 'Voice', icon: <FiPhone size={I} /> },
      { label: 'Clients', icon: <FiUsers size={I} /> },
    ],
  },
  {
    section: 'GENERAL',
    items: [
      { label: 'Workspace', icon: <FiSettings size={I} /> },
      { label: 'Plans & Licenses', icon: <FiTarget size={I} /> },
      { label: 'Members', icon: <FiUser size={I} /> },
      { label: 'Integrations', icon: <FiGrid size={I} /> },
      { label: 'Security center', icon: <FiShield size={I} /> },
      { label: 'Analytics', icon: <FiBarChart2 size={I} /> },
      { label: 'SLAs', icon: <FiClock size={I} />, sidebarPage: 'SLAs' },
      { label: 'Feedback', icon: <FiStar size={I} /> },
    ],
  },
]

function sidebarPageFromRoute(page: Page): SidebarPage {
  switch (page.kind) {
    case 'slas':
    case 'sla-edit':
      return 'SLAs'
    case 'status-mapping':
      return 'Status Mapping'
    case 'messenger':
      return 'Messenger'
  }
}

function pageTitle(page: Page): string {
  switch (page.kind) {
    case 'slas':
      return 'SLAs'
    case 'sla-edit':
      return page.slaId ? 'Edit SLA' : 'Create SLA'
    case 'status-mapping':
      return 'Status Mapping'
    case 'messenger':
      return 'Messenger'
  }
}

function Sidebar({
  activePage,
  onNavigate,
}: {
  activePage: SidebarPage
  onNavigate: (p: SidebarPage) => void
}) {
  return (
    <aside className="w-[238px] flex-shrink-0 bg-[#faf9f6] border-r border-[#dad9dd] flex flex-col h-screen sticky top-0 pt-2">
      <div className="px-3 pb-0">
        <div className="flex items-center gap-2 px-1">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#E8453C" />
                <path d="M8 14l4-8 4 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-bold text-[#E8453C] text-[15px] tracking-tight">ACME</span>
              <span className="text-[#7e7d86]"><FiChevronDown size={14} /></span>
            </div>
            <span className="text-[12px] leading-[1.34] text-[#7e7d86] pl-[30px]">Thread Help</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pt-3 px-1.5">
        {NAV.map((section, si) => (
          <div key={si}>
            {!section.section && section.items.map(item => (
              <button
                key={item.label}
                onClick={() => item.sidebarPage && onNavigate(item.sidebarPage)}
                className="w-full flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded text-[14px] font-medium text-[#161618] text-left transition-colors hover:bg-[rgba(229,228,224,0.55)]"
              >
                <span className="text-content-secondary shrink-0">{item.icon}</span>
                {item.label}
              </button>
            ))}
            {!section.section && <div className="my-3 border-t border-[#dad9dd]" />}

            {section.section && (
              <div className={si > 1 ? 'mt-4' : ''}>
                <div className="px-3 mb-1 text-[12px] font-normal text-[#7e7d86] leading-[1.34]">
                  {section.section}
                </div>
                {section.items.map(item => {
                  const isActive = item.sidebarPage === activePage
                  return (
                    <button
                      key={item.label}
                      onClick={() => item.sidebarPage && onNavigate(item.sidebarPage)}
                      className={`w-full flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded text-[14px] font-medium text-left transition-colors ${
                        isActive
                          ? 'bg-[rgba(229,228,224,0.55)] text-[#161618]'
                          : 'text-[#161618] hover:bg-[rgba(229,228,224,0.35)]'
                      }`}
                    >
                      <span className="text-content-secondary shrink-0">{item.icon}</span>
                      {item.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-[#dad9dd]">
        <div className="flex items-center justify-between px-3 py-2">
          <button className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[12px] font-semibold text-[#605f68] hover:bg-[rgba(229,228,224,0.55)] transition-colors">
            <FiInbox size={14} /> Inbox
          </button>
          <button className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[12px] font-semibold text-[#605f68] hover:bg-[rgba(229,228,224,0.55)] transition-colors">
            <FiHelpCircle size={14} /> Help
          </button>
        </div>
      </div>
    </aside>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>({ kind: 'slas' })
  const [slas, setSLAs] = useState<SLA[]>(INITIAL_SLAS)
  const [listEditMode, setListEditMode] = useState(false)
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null)
  const [editAfterCreateId, setEditAfterCreateId] = useState<string | null>(null)

  const navigateWithGuard = useCallback((action: () => void) => {
    if (listEditMode) {
      setPendingNav(() => action)
    } else {
      action()
    }
  }, [listEditMode])

  const handleSidebarNav = (sp: SidebarPage) => {
    navigateWithGuard(() => {
      if (sp === 'SLAs') setPage({ kind: 'slas' })
      else if (sp === 'Status Mapping') setPage({ kind: 'status-mapping' })
      else if (sp === 'Messenger') setPage({ kind: 'messenger' })
    })
  }

  const handleSaveSLA = (sla: SLA) => {
    const isNew = !slas.some(s => s.id === sla.id)
    setSLAs(list => {
      const exists = list.find(s => s.id === sla.id)
      if (exists) return list.map(s => (s.id === sla.id ? sla : s))
      const active = list.filter(s => s.listStatus === 'active')
      const pending = list.filter(s => s.listStatus === 'pending')
      const newSla = { ...sla, listStatus: 'active' as const }
      return [...active, newSla, ...pending]
    })
    if (isNew) setEditAfterCreateId(sla.id)
    setPage({ kind: 'slas' })
  }

  const handleDeleteSLA = (id: string) => {
    setSLAs(list => list.filter(s => s.id !== id))
  }

  const handleCommitLists = (lists: { active: string[]; pending: string[] }) => {
    setSLAs(prev => {
      const map = new Map(prev.map(s => [s.id, s]))
      const result: SLA[] = []
      lists.active.forEach(id => {
        const s = map.get(id)
        if (s) result.push({ ...s, listStatus: 'active' })
      })
      lists.pending.forEach(id => {
        const s = map.get(id)
        if (s) result.push({ ...s, listStatus: 'pending' })
      })
      return result
    })
  }

  const renderPage = () => {
    switch (page.kind) {
      case 'slas':
        return (
          <SLAPage
            slas={slas}
            onDeleteSLA={handleDeleteSLA}
            onCommitLists={handleCommitLists}
            onNavigateToEdit={slaId =>
              navigateWithGuard(() => setPage({ kind: 'sla-edit', slaId }))
            }
            onListEditModeChange={setListEditMode}
            editAfterCreateId={editAfterCreateId}
            onClearEditAfterCreate={() => setEditAfterCreateId(null)}
            pendingNavigation={pendingNav}
            onClearPendingNavigation={() => setPendingNav(null)}
          />
        )
      case 'sla-edit': {
        const existing = page.slaId ? slas.find(s => s.id === page.slaId) ?? null : null
        return (
          <SLAEditorPage
            initialSLA={existing}
            onSave={handleSaveSLA}
            onCancel={() =>
              navigateWithGuard(() => setPage({ kind: 'slas' }))
            }
          />
        )
      }
      case 'status-mapping':
        return <StatusMappingPage />
      case 'messenger':
        return <MessengerPage />
    }
  }

  return (
    <div className="flex h-screen bg-bg-secondary overflow-hidden font-sans">
      <Sidebar activePage={sidebarPageFromRoute(page)} onNavigate={handleSidebarNav} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-[60px] shrink-0 flex items-center gap-3 px-6 bg-white border-b border-border-card">
          {page.kind === 'sla-edit' && (
            <button
              type="button"
              onClick={() => navigateWithGuard(() => setPage({ kind: 'slas' }))}
              className="p-1 -ml-1 rounded-md text-content-secondary hover:text-content-primary hover:bg-bg-secondary transition-colors"
              aria-label="Back to SLAs"
            >
              <FiArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-[20px] font-semibold text-content-primary leading-[1.2]">
            {pageTitle(page)}
          </h1>
        </header>
        <div className="flex-1 overflow-y-auto bg-bg-secondary">{renderPage()}</div>
      </main>
    </div>
  )
}
