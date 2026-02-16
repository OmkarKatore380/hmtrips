import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { buildTrendingToursFromStats, GLOBAL_TRENDS_TTL_MS, getCachedGlobalTrendStats, setCachedGlobalTrendStats } from '../utils/trendingUtils'
import { getBlendedTrendStats } from '../services/trendEngine'
import { tours as staticTours } from '../data/tours'
import ScrollReveal from '../components/ScrollReveal'
import TourInteractions from '../components/TourInteractions'
import { trackGlobalTrend, syncUserCRM } from '../lib/firestore'
import { useAuth } from '../contexts/AuthContext'

export default function TrendingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const { stats: cachedStats, fetchedAt } = getCachedGlobalTrendStats()
        const now = Date.now()
        if (cachedStats && now - fetchedAt < GLOBAL_TRENDS_TTL_MS) {
          setStats(cachedStats)
          setLoading(false)
          return
        }

        const stats = await getBlendedTrendStats()
        setStats(stats)
        setCachedGlobalTrendStats(stats)
      } catch {
        setStats(null)
        setLoading(false)
        return
      }
      setLoading(false)
    }
    fetchTrends()
  }, [])

  const trendingTours = useMemo(() => {
    const fromStats = buildTrendingToursFromStats(stats)
    if (fromStats.length > 0) return fromStats
    return staticTours.slice(0, 24)
  }, [stats])

  const handleTourClick = (tour, section) => {
    trackGlobalTrend(tour.destination || tour.name)
    if (user?.uid && tour) {
      syncUserCRM(user.uid, {
        lastClickedTour: tour.name || 'Unknown',
        category: tour.category || 'general',
        lastInteraction: section
      })
    }
    navigate(`/itinerary/${tour.id}`)
  }

  const handleBookClick = (tour) => {
    trackGlobalTrend(tour.destination || tour.name)
    if (user?.uid && tour) {
      syncUserCRM(user.uid, {
        lastClickedTour: tour.name || 'Unknown',
        category: tour.category || 'general',
        lastInteraction: 'trending_book_now'
      })
    }
    navigate(`/itinerary/${tour.id}#book`)
  }

  const gridCols =
    'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'

  return (
    <div className="bg-white min-h-screen">
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: '"Californian FB", serif' }}
          >
            Trending Destinations
          </h1>
        </div>

        {loading && (
          <div className={gridCols}>
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[32px] border border-neutral-100 bg-white overflow-hidden shadow-sm"
              >
                <div className="h-52 w-full bg-slate-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse" />
                  <div className="h-10 bg-slate-100 rounded mt-4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className={gridCols}>
            {trendingTours.map((tour, index) => (
              <ScrollReveal key={tour.id} staggerIndex={index}>
                <div className="group rounded-[32px] overflow-hidden border border-neutral-100 bg-white hover:shadow-xl transition-all h-full flex flex-col">
                  <div className="relative w-full aspect-[16/9] bg-slate-100">
                    <img src={tour.image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-neutral-900">{tour.name}</h3>
                    <p className="text-[11px] text-neutral-500 mb-4">
                      {tour.origin} → {tour.destination}
                    </p>

                    <TourInteractions tour={tour} />

                    <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-neutral-500">
                          Starting from
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          ₹{tour.pricePerGuest.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleBookClick(tour)}
                        className="px-4 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
