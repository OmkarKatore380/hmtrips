import { tours as staticTours } from '../data/tours'

export const GLOBAL_TRENDS_TTL_MS = 24 * 60 * 60 * 1000

let cachedGlobalTrendStats = null
let cachedGlobalTrendFetchedAt = 0

export function getCachedGlobalTrendStats() {
  return {
    stats: cachedGlobalTrendStats,
    fetchedAt: cachedGlobalTrendFetchedAt,
  }
}

export function setCachedGlobalTrendStats(stats) {
  cachedGlobalTrendStats = stats
  cachedGlobalTrendFetchedAt = Date.now()
}

export function buildTrendingToursFromStats(stats) {
  if (!stats) return []

  const sortedKeys = Object.entries(stats)
    .map(([key, value]) => ({
      key,
      count: value?.count || 0,
    }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.key)
    .slice(0, 20)

  const combined = []
  sortedKeys.forEach((term) => {
    const match = staticTours.find(
      (tour) =>
        tour.destination === term ||
        tour.name === term
    )
    if (match && !combined.some((t) => t.id === match.id)) {
      combined.push(match)
    }
  })

  return combined
}
