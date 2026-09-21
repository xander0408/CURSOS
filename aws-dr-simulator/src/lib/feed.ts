import type { FeedEntry, FeedLevel } from '../types/console'

export function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function nowLabel(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

export function pushFeed(entries: FeedEntry[], level: FeedLevel, message: string, max = 60): FeedEntry[] {
  return [{ id: uid('feed'), time: nowLabel(), level, message }, ...entries].slice(0, max)
}

export function seedFeed(items: Array<[FeedLevel, string]>): FeedEntry[] {
  return items.map(([level, message], index) => ({
    id: `seed-${index}`,
    time: nowLabel(),
    level,
    message,
  }))
}
