import type { ChatMessage } from '../types'
import { formatDayLabel } from './formatTime'

export type ThreadRow =
  | { kind: 'day'; id: string; label: string }
  | {
      kind: 'msg'
      id: string
      message: ChatMessage
      clusterTop: boolean
    }

const CLUSTER_GAP_MS = 5 * 60 * 1000

/** Sort ascending by time, insert day breaks, cluster consecutive same-author messages */
export function buildThreadRows(messages: ChatMessage[]): ThreadRow[] {
  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  const rows: ThreadRow[] = []
  let lastDay: string | null = null
  let prev: ChatMessage | undefined

  for (const m of sorted) {
    const dayKey = new Date(m.createdAt).toDateString()
    if (dayKey !== lastDay) {
      lastDay = dayKey
      rows.push({
        kind: 'day',
        id: `day-${dayKey}`,
        label: formatDayLabel(m.createdAt),
      })
    }

    const gap =
      prev &&
      prev.author === m.author &&
      new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() <= CLUSTER_GAP_MS

    rows.push({
      kind: 'msg',
      id: m.id,
      message: m,
      clusterTop: !gap,
    })
    prev = m
  }

  return rows
}
