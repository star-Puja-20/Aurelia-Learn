import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { LearningLevel } from './types'
import { LEVEL_CONFIG } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLevelConfig(level: LearningLevel) {
  return LEVEL_CONFIG[level]
}

export function formatDate(dateString: string | null, format: 'short' | 'long' | 'relative' = 'short'): string {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  if (format === 'relative') {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }
  if (format === 'long') {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function generatePIN(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function progressColor(percent: number): string {
  if (percent >= 80) return '#43A047'  // mint-600
  if (percent >= 50) return '#FFB300'  // gold-600
  return '#E64A19'                      // coral-600
}

export function levelToOrder(level: LearningLevel): number {
  return LEVEL_CONFIG[level].order
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
