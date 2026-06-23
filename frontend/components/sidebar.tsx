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
        'glass-sidebar relative flex h-full shrink-0 flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -right-3 z-50 flex -translate-y-1/2 items-center justify-center cursor-pointer transition-all duration-200"
        style={{ color: 'rgba(255,255,255,0.35)' }}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
      </button>

      {/* Logo Area */}
      <div
        className={cn(
          'flex h-[88px] items-center px-4 transition-all duration-300',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
      >
        {isCollapsed ? (
          <div
            className="flex size-7 items-center justify-center rounded-md"
            style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
          >
            <Hexagon className="size-4 text-foreground" strokeWidth={1.5} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 overflow-hidden animate-fade-in">
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-md"
              style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
            >
              <Hexagon className="size-4 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="leading-tight">
              <div className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-foreground whitespace-nowrap">
                Zero-to-One
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Builder
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 py-4 transition-all duration-300', isCollapsed ? 'px-2' : 'px-3')}>
        {!isCollapsed && (
          <div
            className="px-2 pb-3 font-mono text-[9px] uppercase tracking-[0.25em] animate-fade-in"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            Analysis Pipeline
          </div>
        )}
        <ul className={cn('flex flex-col gap-0.5', isCollapsed ? 'items-center' : '')}>
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <li key={item.id} className="w-full flex justify-center">
                {isCollapsed ? (
                  <button
                    onClick={() => onChange(item.id)}
                    className={cn(
                      'group relative flex size-9 items-center justify-center rounded-lg transition-colors cursor-pointer',
                    )}
                    style={{
                      borderLeft: isActive ? '2px solid #22d3ee' : '2px solid transparent',
                      background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    }}
                  >
                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)' }}
                      strokeWidth={1.5}
                    />
                    {/* Floating Tooltip */}
                    <div
                      className="absolute left-full ml-3 z-50 hidden group-hover:block px-2 py-1 text-[10px] uppercase tracking-[0.14em] whitespace-nowrap pointer-events-none rounded-md"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#000000',
                      }}
                    >
                      {item.label}
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => onChange(item.id)}
                    className="group flex w-full items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer rounded-lg"
                    style={{
                      borderLeft: isActive ? '2px solid #22d3ee' : '2px solid transparent',
                      background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    }}
                  >
                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)' }}
                      strokeWidth={1.5}
                    />
                    <span
                      className="flex-1 font-mono text-[11px] uppercase tracking-[0.12em] whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.40)' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="font-mono text-[9px]"
                      style={{ color: 'rgba(255,255,255,0.18)' }}
                    >
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
      <div
        className={cn('py-4 transition-all duration-300', isCollapsed ? 'px-2' : 'px-4')}
        style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
             <div className="group relative flex cursor-pointer items-center justify-center">
              <Circle className="size-2" style={{ color: '#22d3ee', fill: '#22d3ee' }} />
              <div
                className="absolute left-full ml-3 z-50 hidden group-hover:block px-2 py-1 text-[9px] uppercase tracking-[0.14em] whitespace-nowrap pointer-events-none rounded-md"
                style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#000000' }}
              >
                Graph: Analyzed
              </div>
            </div>
            <div className="group relative flex cursor-pointer items-center justify-center">
              <Circle className="size-2" style={{ color: '#22d3ee', fill: '#22d3ee' }} />
              <div
                className="absolute left-full ml-3 z-50 hidden group-hover:block px-2 py-1 text-[9px] uppercase tracking-[0.14em] whitespace-nowrap pointer-events-none rounded-md"
                style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#000000' }}
              >
                System: Operational
              </div>
            </div>
          </div>
        ) : (
          <>
            <StatusRow label="Graph Status" value="Analyzed" tone="ok" />
            <StatusRow label="System" value="Operational" tone="ok" />
            <div className="mt-3 flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Graph ID
              </span>
              <span className="font-mono text-[9px] truncate max-w-[100px]" style={{ color: 'rgba(255,255,255,0.50)' }} title={graphId}>
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
      <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
        {label}
      </span>
      <span className="flex items-center gap-1.5 font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.50)' }}>
        <Circle
          className="size-1.5"
          style={{ color: tone === 'ok' ? '#22d3ee' : '#f59e0b', fill: tone === 'ok' ? '#22d3ee' : '#f59e0b' }}
        />
        {value}
      </span>
    </div>
  )
}
