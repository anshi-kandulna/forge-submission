'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  FileText,
  Network,
  Swords,
  ClipboardCheck,
  Hexagon,
  Circle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export type Section =
  | 'intake'
  | 'graph'
  | 'personas'
  | 'synthesis'

const NAV: { id: Section; label: string; icon: typeof FileText; meta: string }[] =
  [
    { id: 'intake', label: 'Idea Intake', icon: FileText, meta: '01' },
    { id: 'graph', label: 'Graph Analysis', icon: Network, meta: '02' },
    { id: 'personas', label: 'Persona Attacks', icon: Swords, meta: '03' },
    { id: 'synthesis', label: 'Synthesis Report', icon: ClipboardCheck, meta: '04' },
  ]

export function Sidebar({
  active,
  onChange,
  graphId,
}: {
  active: Section
  onChange: (s: Section) => void
  graphId: string
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex h-full shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -right-2 z-50 flex -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-200"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>

      {/* Logo Area */}
      <div className={cn(
        'flex h-[88px] items-center border-b border-border px-4 transition-all duration-300',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {isCollapsed ? (
          <div className="flex size-7 items-center justify-center rounded-sm border border-border-strong bg-surface-2">
            <Hexagon className="size-4 text-foreground" strokeWidth={1.5} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 overflow-hidden animate-fade-in">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface-2">
              <Hexagon className="size-4 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold tracking-tight text-foreground whitespace-nowrap">
                Zero-to-One
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
                Builder
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 py-4 transition-all duration-300', isCollapsed ? 'px-2' : 'px-3')}>
        {!isCollapsed && (
          <div className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground animate-fade-in">
            Analysis Pipeline
          </div>
        )}
        <ul className={cn('flex flex-col gap-1', isCollapsed ? 'items-center' : '')}>
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <li key={item.id} className="w-full flex justify-center">
                {isCollapsed ? (
                  <button
                    onClick={() => onChange(item.id)}
                    className={cn(
                      'group relative flex size-9 items-center justify-center rounded-sm transition-colors cursor-pointer',
                      isActive
                        ? 'bg-surface-3 text-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-4 shrink-0',
                        isActive ? 'text-foreground' : 'text-muted-foreground',
                      )}
                      strokeWidth={1.5}
                    />
                    {/* Floating Tooltip */}
                    <div className="absolute left-full ml-3 z-50 hidden group-hover:block rounded bg-popover border border-border px-2 py-1 text-xs text-popover-foreground shadow-md whitespace-nowrap pointer-events-none font-medium">
                      {item.label}
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => onChange(item.id)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-sm px-2.5 py-2 text-left text-[13px] transition-colors cursor-pointer',
                      isActive
                        ? 'bg-surface-3 text-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-4 shrink-0',
                        isActive ? 'text-foreground' : 'text-muted-foreground',
                      )}
                      strokeWidth={1.5}
                    />
                    <span className="flex-1 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/60">
                      {item.meta}
                    </span>
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom status */}
      <div className={cn('border-t border-border py-4 transition-all duration-300', isCollapsed ? 'px-2' : 'px-4')}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="group relative flex cursor-pointer items-center justify-center">
              <Circle className="size-2.5 fill-current text-[#22d3ee]" />
              <div className="absolute left-full ml-3 z-50 hidden group-hover:block rounded bg-popover border border-border px-2 py-1 text-xs text-popover-foreground shadow-md whitespace-nowrap pointer-events-none font-medium">
                Graph: Analyzed
              </div>
            </div>
            <div className="group relative flex cursor-pointer items-center justify-center">
              <Circle className="size-2.5 fill-current text-[#22d3ee]" />
              <div className="absolute left-full ml-3 z-50 hidden group-hover:block rounded bg-popover border border-border px-2 py-1 text-xs text-popover-foreground shadow-md whitespace-nowrap pointer-events-none font-medium">
                System: Operational
              </div>
            </div>
          </div>
        ) : (
          <>
            <StatusRow label="Graph Status" value="Analyzed" tone="ok" />
            <StatusRow label="System" value="Operational" tone="ok" />
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">
                Graph ID
              </span>
              <span className="font-mono text-[10px] text-secondary-foreground truncate max-w-[120px]" title={graphId}>
                {graphId}
              </span>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'ok' | 'warn'
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-[11px] text-secondary-foreground">
        <Circle
          className="size-2 fill-current"
          style={{ color: tone === 'ok' ? '#22d3ee' : '#f59e0b' }}
        />
        {value}
      </span>
    </div>
  )
}
