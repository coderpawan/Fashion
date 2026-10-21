export type LookHighlightState = 'today' | 'yesterday' | 'none'

type DateCandidate = {
  created_at?: string | null
  published_at?: string | null
}

const IST_TIMEZONE = 'Asia/Kolkata'
const DAY_IN_MS = 24 * 60 * 60 * 1000

const pad = (value: number) => String(value).padStart(2, '0')

const getDatePartsInIst = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  const map = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )

  return {
    year: Number(map.year),
    month: Number(map.month) - 1,
    day: Number(map.day),
  }
}

const getDateKeyInIst = (date: Date) => {
  const { year, month, day } = getDatePartsInIst(date)
  return Date.UTC(year, month, day)
}

export const getLookHighlightState = (look?: DateCandidate | null, now = new Date()): LookHighlightState => {
  const uploadedAt = look?.published_at ?? look?.created_at
  if (!uploadedAt) return 'none'

  const date = new Date(uploadedAt)
  if (Number.isNaN(date.getTime())) return 'none'

  const differenceInDays = Math.round((getDateKeyInIst(now) - getDateKeyInIst(date)) / DAY_IN_MS)

  if (differenceInDays === 0) return 'today'
  if (differenceInDays === 1) return 'yesterday'

  return 'none'
}

export const getNextIstMidnightMs = (now = new Date()) => {
  const { year, month, day } = getDatePartsInIst(now)
  const currentMidnight = new Date(`${year}-${pad(month + 1)}-${pad(day)}T00:00:00+05:30`).getTime()
  const nextMidnight = currentMidnight + DAY_IN_MS

  return nextMidnight - now.getTime()
}
