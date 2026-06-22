import type { PersonaName } from './types'

export const PERSONA_AVATARS: Record<PersonaName, string> = {
  'Market Skeptic': '/personas/market-skeptic.png',
  'Technical Expert': '/personas/technical-expert.png',
  'Customer Persona': '/personas/customer-persona.png',
  'Operations Expert': '/personas/operations-expert.png',
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
