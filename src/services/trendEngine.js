import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export const GLOBAL_MARKET_TTL_MS = 24 * 60 * 60 * 1000
export const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours for cache

export async function getBlendedTrendStats() {
  // Cache-First logic for 2G optimization
  const cacheKey = 'global_trends_cache'
  const cachedData = localStorage.getItem(cacheKey)
  
  if (cachedData) {
    try {
      const parsedCache = JSON.parse(cachedData)
      const cacheAge = Date.now() - parsedCache.timestamp
      
      // If cache is less than 6 hours old, return it immediately
      if (cacheAge < CACHE_TTL_MS) {
        console.log('🔄 Using cached trends for instant 2G load')
        return parsedCache.data
      }
    } catch (e) {
      console.warn('⚠️ Cache parsing failed, fetching from Firestore')
    }
  }

  // Fetch from Firestore in background
  try {
    // Try to get from new global_trending_now document first
    const globalTrendingRef = doc(db, 'metadata', 'global_trending_now')
    const trendingSnap = await getDoc(globalTrendingRef)
    
    let stats = {}
    
    if (trendingSnap.exists()) {
      const trendingData = trendingSnap.data()
      const trends = trendingData.trends || {}
      
      // Convert Firestore trends to stats format
      Object.entries(trends).forEach(([destination, data]) => {
        stats[destination] = {
          count: data.trendScore || 0,
          trendScore: data.trendScore || 0,
          mentions: data.mentions || {},
        }
      })
    } else {
      // Fallback to old global_trends document
      const globalTrendsRef = doc(db, 'metadata', 'global_trends')
      const globalTrendsSnap = await getDoc(globalTrendsRef)
      
      if (globalTrendsSnap.exists()) {
        const globalTrendsData = globalTrendsSnap.data()
        const clickStats = globalTrendsData.stats || {}

        Object.entries(clickStats).forEach(([name, value]) => {
          const clicks = value?.count || 0
          if (clicks > 0) {
            stats[name] = {
              count: clicks,
              clicks,
              marketScore: 0,
            }
          }
        })
      }
    }

    // Update cache for next visit
    const cacheData = {
      data: stats,
      timestamp: Date.now()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    
    console.log('✅ Trends fetched from Firestore and cached')
    return stats
    
  } catch (error) {
    console.error('❌ Error fetching trends from Firestore:', error)
    return {} // Return empty object on error
  }
}

