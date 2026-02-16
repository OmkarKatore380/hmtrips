import { useState, useEffect, useMemo } from 'react'
import { tours as staticTours } from '../data/tours'
import { useNavigate } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal'
import CallbackCard from '../components/CallbackCard'
import TourInteractions from '../components/TourInteractions'
import { useAuth } from '../contexts/AuthContext' 
import { db } from '../lib/firebase' 
import { syncUserCRM, trackGlobalTrend } from '../lib/firestore' 
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc } from 'firebase/firestore'
import { GLOBAL_TRENDS_TTL_MS, getCachedGlobalTrendStats, setCachedGlobalTrendStats } from '../utils/trendingUtils'
import { getBlendedTrendStats } from '../services/trendEngine'

const CATEGORIES = [
  { id: 'honeymoon', title: 'Honeymoon Packages', theme: 'from-pink-500/80 to-rose-400/20', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80', icon: '❤️' },
  { id: 'free-visa', title: 'Free Visa Packages', theme: 'from-sky-500/80 to-blue-400/20', image: 'https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?q=80&w=1170&auto=format&fit=crop', icon: '✈️' },
  { id: 'intl-visa', title: 'Passport & Visa Required', theme: 'from-emerald-500/80 to-teal-400/20', image: 'https://www.shutterstock.com/shutterstock/photos/2712081267/display_1500/stock-photo-passports-of-citizens-of-different-countries-of-the-world-background-consisting-of-passports-of-2712081267.jpg', icon: '🌍' },
  { id: 'historical', title: 'Historian Places', theme: 'from-amber-500/80 to-yellow-600/20', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80', icon: '🏛️' },
  { id: 'seasonal', title: 'Best Season to Travel', theme: 'from-purple-500/80 to-indigo-400/20', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80', icon: '🗓️' },
  /* 6TH NEW PACKAGE ADDED WITH CUSTOM URL */
  { id: 'jyotirlinga', title: '12 Jyotirlingas', theme: 'from-orange-600/80 to-amber-500/20', image: 'https://images.unsplash.com/photo-1605292356183-a77d0a9c9d1d?q=80&w=712&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', icon: '🪔' }
]

function TrendingSlider({ tours, isMobile, isLoading }) {
  const navigate = useNavigate()
  const maxCards = isMobile ? 4 : 6
  const hasTours = tours && tours.length > 0
  const visibleTours = hasTours ? tours.slice(0, maxCards) : []

  return (
    <section className="mb-10 min-h-[260px]">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight"
          style={{ fontFamily: '"Californian FB", serif' }}
        >
          Global Trending Destinations
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {isLoading &&
          Array.from({ length: maxCards }).map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-64 md:w-72 rounded-[32px] overflow-hidden border border-neutral-100 bg-white shadow-sm"
            >
              <div className="h-40 w-full bg-slate-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse" />
                <div className="h-8 bg-slate-100 rounded mt-2 animate-pulse" />
              </div>
            </div>
          ))}

        {!isLoading &&
          visibleTours.map((tour, index) => (
            <ScrollReveal key={tour.id} staggerIndex={index}>
              <div className="flex-shrink-0 w-64 md:w-72 rounded-[32px] overflow-hidden border border-neutral-100 bg-white hover:shadow-xl transition-all flex flex-col">
                <div className="relative w-full aspect-[16/9] bg-slate-100">
                  <img src={tour.image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-neutral-900">{tour.name}</h3>
                  <p className="text-[11px] text-neutral-500 mb-3">
                    {tour.origin} → {tour.destination}
                  </p>

                  <TourInteractions tour={tour} />

                  <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-neutral-500">Starting from</p>
                      <p className="text-lg font-bold text-blue-900">
                        ₹{tour.pricePerGuest.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          trackGlobalTrend(tour.destination || tour.name)
                          navigate(`/itinerary/${tour.id}#book`)
                        }}
                        className="px-4 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}

        <button
          onClick={() => navigate('/trending')}
          className="flex-shrink-0 w-40 md:w-48 h-40 md:h-44 rounded-[32px] border-2 border-dashed border-blue-300 flex flex-col items-center justify-center text-blue-700 bg-blue-50/40 hover:bg-blue-100/70 transition-colors"
        >
          <span className="text-sm font-semibold mb-1">View More</span>
          <span className="text-[11px] text-blue-500">See all trending trips</span>
        </button>
      </div>
    </section>
  )
}

export default function UpcomingTours() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [recommendedTours, setRecommendedTours] = useState([])
  const [viewLimit, setViewLimit] = useState(9)
  const [isPersonalized, setIsPersonalized] = useState(false) 
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [trendingTours, setTrendingTours] = useState([])
  const [trendStats, setTrendStats] = useState(null)
  const [trendLoading, setTrendLoading] = useState(true)
  
  /* MOBILE VIEW MORE STATE */
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [mobileExpanded, setMobileExpanded] = useState(false)

  // Detect screen size for mobile view logic
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Personalization Logic
  useEffect(() => {
    const fetchUserPreferences = async () => {
      setLoading(true)
      if (user) {
        try {
          const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(1))
          const querySnapshot = await getDocs(q)
          
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          const userData = userDoc.exists() ? userDoc.data() : null

          let targetCategory = null;

          if (!querySnapshot.empty) {
            targetCategory = querySnapshot.docs[0].data().category;
          } else if (userData) {
            targetCategory = userData.category || userData.preferredCategory;
          }

          if (targetCategory) {
            const preferred = staticTours.filter(t => t.category === targetCategory)
            const others = staticTours.filter(t => t.category !== targetCategory)
            setRecommendedTours([...preferred, ...others])
            setIsPersonalized(true)
          } else { 
            setRecommendedTours(staticTours) 
            setIsPersonalized(false)
          }
        } catch (error) { 
          setRecommendedTours(staticTours) 
        }
      } else { 
        setRecommendedTours(staticTours) 
        setIsPersonalized(false)
      }
      setLoading(false)
    }
    fetchUserPreferences()
  }, [user])

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Cache-First logic: Check localStorage for instant 2G loading
        const cacheKey = 'global_trends_cache'
        const cachedData = localStorage.getItem(cacheKey)
        
        if (cachedData) {
          try {
            const parsedCache = JSON.parse(cachedData)
            const cacheAge = Date.now() - parsedCache.timestamp
            
            // If cache is less than 6 hours old, use it immediately
            if (cacheAge < 6 * 60 * 60 * 1000) {
              setTrendStats(parsedCache.data)
              setTrendLoading(false)
              console.log('🔄 Using cached trends for instant 2G load')
              return
            }
          } catch (e) {
            console.warn('⚠️ Cache parsing failed, fetching from Firestore')
          }
        }

        // Set loading state for skeleton
        setTrendLoading(true)
        
        // Fetch from Firestore
        const stats = await getBlendedTrendStats()
        setTrendStats(stats)
        setTrendLoading(false)
        
        console.log('✅ Trends fetched from Firestore')
      } catch (error) {
        console.error('❌ Error fetching trends:', error)
        setTrendStats(null)
        setTrendLoading(false)
      }
    }

    fetchTrending()
  }, [])

  const memoizedTrendingTours = useMemo(() => {
    if (!trendStats) {
      // Pre-launch state: show only featured tours
      return staticTours.filter(tour => tour.isFeatured === true)
    }

    const sortedKeys = Object.entries(trendStats)
      .map(([key, value]) => ({
        key,
        count: value?.count || 0
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
  }, [trendStats])

  useEffect(() => {
    if (memoizedTrendingTours.length > 0) {
      setTrendingTours(memoizedTrendingTours)
    }
    // STRICT LOGIC: Removed else block - TrendingSlider shows only tours present in trendStats
  }, [memoizedTrendingTours])

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId === selectedCategory ? 'all' : catId);
    if (user?.uid && catId) {
      syncUserCRM(user.uid, { 
        preferredCategory: catId,
        category: catId,
        lastInteraction: 'category_filter' 
      });
    }
  };

  const handleSearch = () => {
    if (user?.uid && searchQuery) {
      syncUserCRM(user.uid, { 
        lastSearch: searchQuery,
        searchCount: 1 
      });
    }
  };

  const handleTourClick = (tour) => {
    if (tour) {
      trackGlobalTrend(tour.destination || tour.name)
    }
    if (user?.uid && tour) {
      syncUserCRM(user.uid, {
        lastClickedTour: tour.name || 'Unknown',
        category: tour.category || 'general', 
        lastInteraction: 'view_itinerary_click'
      });
    }
    navigate(`/itinerary/${tour.id}#book`);
  }

  const filteredTours = useMemo(() => {
    return recommendedTours.filter(tour => {
      const matchesSearch = tour.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tour.destination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tour.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recommendedTours, searchQuery, selectedCategory]);

  /* UPDATED DISPLAY TOURS LOGIC FOR MOBILE 4-OPTION LIMIT */
  const displayTours = useMemo(() => {
    const baseList = filteredTours.slice(0, viewLimit);
    if (isMobile && !mobileExpanded) {
      return baseList.slice(0, 4);
    }
    return baseList;
  }, [filteredTours, viewLimit, isMobile, mobileExpanded])

  return (
    <div className="bg-white min-h-screen">
      <section className="max-w-7xl mx-auto px-4 py-12">
        <section className="relative min-h-[420px] flex items-center justify-center overflow-hidden mb-12 rounded-[40px] shadow-2xl bg-slate-50">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80)` }} />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

          <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-7xl mb-4 text-blue-950 tracking-wide" style={{ fontFamily: '"Californian FB", serif' }}>
              {isPersonalized ? "Top Choices for You" : "Explore Trips & Holidays"}
            </h1>
            <p className="text-sm md:text-lg italic mb-10 text-blue-900/80 font-medium">
              {isPersonalized ? "Based on your recent interests" : "Find your next adventure — from tropical shores to winter wonderlands"}
            </p>

            <div className="p-4 md:p-8 rounded-[32px] shadow-2xl border bg-white/90 backdrop-blur-md border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-end gap-4">
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-blue-900/40">Select Destination</label>
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="..." 
                    className="h-12 w-full rounded-xl border border-neutral-200 px-4 outline-none bg-white focus:border-blue-400 transition-colors" 
                  />
                </div>
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-blue-900/40">Select Month</label>
                  <input placeholder="..." className="h-12 w-full rounded-xl border border-neutral-200 px-4 outline-none bg-white focus:border-blue-400 transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-blue-900/40">Select Night</label>
                  <input placeholder="..." className="h-12 w-full rounded-xl border border-neutral-200 px-4 outline-none bg-white focus:border-blue-400 transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-blue-900/40">Select Trip</label>
                  <input placeholder="..." className="h-12 w-full rounded-xl border border-neutral-200 px-4 outline-none bg-white focus:border-blue-400 transition-colors" />
                </div>
                <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 active:scale-95">Apply</button>
              </div>
            </div>
          </div>
        </section>

        <TrendingSlider tours={trendingTours} isMobile={isMobile} isLoading={trendLoading} />

        <h2
          className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 tracking-tight"
          style={{ fontFamily: '"Californian FB", serif' }}
        >
          Popular Trip Styles
        </h2>

        <div className="flex gap-4 overflow-x-auto pb-10 scrollbar-hide">
          {CATEGORIES.map((cat) => (
              <div 
              key={cat.id} 
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex-shrink-0 w-64 h-44 rounded-[30px] relative overflow-hidden group cursor-pointer shadow-md border bg-slate-100 transition-all ${selectedCategory === cat.id ? 'ring-4 ring-blue-500 ring-offset-2' : 'border-neutral-100'}`}
            >
              <img src={cat.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.theme}`} />
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <span className="text-3xl mb-2">{cat.icon}</span>
                <h4 className="font-bold text-lg leading-tight">{cat.title}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-12">
          <aside className="lg:w-72 shrink-0">
            <CallbackCard />
          </aside>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 tracking-tight" style={{ fontFamily: '"Californian FB", serif' }}>
              Top Choices
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[420px]">
              {loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="group rounded-[32px] overflow-hidden border border-neutral-100 bg-white shadow-sm h-full flex flex-col animate-pulse"
                  >
                    <div className="relative w-full aspect-[16/9] bg-slate-200" />
                    <div className="p-5 flex flex-col flex-1 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                      <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                        <div className="h-6 bg-slate-100 rounded w-20" />
                        <div className="h-8 bg-slate-200 rounded w-24" />
                      </div>
                    </div>
                  </div>
                ))}

              {!loading &&
                displayTours.map((tour, index) => (
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
                            <p className="text-[10px] uppercase font-bold text-neutral-500">Starting from</p>
                            <p className="text-xl font-bold text-blue-900">
                              ₹{tour.pricePerGuest.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleTourClick(tour)}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
            </div>

            {/* MOBILE VIEW MORE BUTTON */}
            {isMobile && !mobileExpanded && filteredTours.length > 4 && (
              <div className="mt-10 text-center">
                <button 
                  onClick={() => setMobileExpanded(true)}
                  className="px-8 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                >
                  View More
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
