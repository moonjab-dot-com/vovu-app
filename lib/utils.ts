import { CAMPUS_DOMAINS } from './constants'

export function getCampusName(domain: string): string {
  return CAMPUS_DOMAINS[domain] ?? domain
}

export function getEmailDomain(email: string): string {
  return email.split('@')[1] ?? ''
}

export function isEduEmail(email: string): boolean {
  return email.includes('@') && email.toLowerCase().endsWith('.edu')
}

export function getInitial(name: string | null): string {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

export function timeUntilExpiry(expiresAt: string): string | null {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return null
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `Expires in ${mins}min`
  return null
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
