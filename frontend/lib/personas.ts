import type { PersonaName } from './types'
import { TrendingDown, Cpu, Users, Briefcase, type LucideIcon } from 'lucide-react'

export const PERSONA_AVATARS: Record<PersonaName, string> = {
  'Market Skeptic': '/personas/market-skeptic.png',
  'Technical Expert': '/personas/technical-expert.png',
  'Customer Persona': '/personas/customer-persona.png',
  'Operations Expert': '/personas/operations-expert.png',
}

/** Icon and accent colour for each persona */
export const PERSONA_ICONS: Record<PersonaName, { icon: LucideIcon; color: string }> = {
  'Market Skeptic':    { icon: TrendingDown, color: '#a78bfa' },
  'Technical Expert':  { icon: Cpu,          color: '#22d3ee' },
  'Customer Persona':  { icon: Users,        color: '#f59e0b' },
  'Operations Expert': { icon: Briefcase,    color: '#34d399' },
}

/**
 * Maps any persona name (dynamic or static) to one of the 4 verified avatar images.
 */
export function getPersonaAvatar(name: string): string {
  const normalized = name.toLowerCase()
  if (normalized.includes('market') || normalized.includes('skeptic') || normalized.includes('investor')) {
    return PERSONA_AVATARS['Market Skeptic']
  }
  if (normalized.includes('technical') || normalized.includes('tech') || normalized.includes('engineer') || normalized.includes('architect')) {
    return PERSONA_AVATARS['Technical Expert']
  }
  if (normalized.includes('customer') || normalized.includes('user') || normalized.includes('controller') || normalized.includes('buyer')) {
    return PERSONA_AVATARS['Customer Persona']
  }
  if (normalized.includes('operations') || normalized.includes('ops') || normalized.includes('pragmatic') || normalized.includes('veteran')) {
    return PERSONA_AVATARS['Operations Expert']
  }
  return PERSONA_AVATARS['Market Skeptic']
}

/**
 * Returns the Lucide icon component and accent colour for a persona name.
 */
export function getPersonaIcon(name: string): { icon: LucideIcon; color: string } {
  const normalized = name.toLowerCase()
  if (normalized.includes('market') || normalized.includes('skeptic') || normalized.includes('investor')) {
    return PERSONA_ICONS['Market Skeptic']
  }
  if (normalized.includes('technical') || normalized.includes('tech') || normalized.includes('engineer') || normalized.includes('architect')) {
    return PERSONA_ICONS['Technical Expert']
  }
  if (normalized.includes('customer') || normalized.includes('user') || normalized.includes('controller') || normalized.includes('buyer')) {
    return PERSONA_ICONS['Customer Persona']
  }
  if (normalized.includes('operations') || normalized.includes('ops') || normalized.includes('pragmatic') || normalized.includes('veteran')) {
    return PERSONA_ICONS['Operations Expert']
  }
  return PERSONA_ICONS['Market Skeptic']
}
