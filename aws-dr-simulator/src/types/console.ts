export type ConsoleView = 'dr' | 'backup' | 'migration' | 'wellarchitected' | 'ml' | 'security'

export type FeedLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'CRITICAL'

export interface FeedEntry {
  id: string
  time: string
  level: FeedLevel
  message: string
}
