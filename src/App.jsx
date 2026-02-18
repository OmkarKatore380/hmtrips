import { useState, useEffect, Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import AIChatBox from './components/AIChatBox'
import SiteLayout from './components/SiteLayout'
import UpcomingTours from './pages/UpcomingTours'
import Itinerary from './pages/Itinerary'
import TrendingPage from './pages/TrendingPage'
import Tours from './pages/Tours'
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTrips from './pages/admin/AdminTrips'
import AdminInquiries from './pages/admin/AdminInquiries'
import AdminOrders from './pages/admin/AdminOrders'
import AdminPayments from './pages/admin/AdminPayments'

const TravelLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white fixed inset-0 z-[100]">
    <div className="relative w-48 h-24 flex items-center justify-center">
      <div className="absolute top-0 left-4 animate-pulse opacity-40 text-xl">☁️</div>
      <div className="absolute top-4 right-8 animate-pulse delay-75 opacity-40 text-xl">☁️</div>
      <div className="absolute z-20 animate-bounce" style={{ animationDuration: '2s' }}>
        <div className="text-5xl transform -rotate-12 drop-shadow-lg">✈️</div>
      </div>
      <div className="absolute bottom-4 w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 w-1/2 animate-road-slide"></div>
      </div>
      <div className="absolute bottom-1 animate-pulse text-3xl">🚗</div> 
    </div>
    <div className="text-center mt-6">
      <h3 className="text-neutral-800 font-bold text-xl tracking-tight">Starting Your Journey</h3>
      <p className="text-neutral-400 text-sm mt-1">Fetching the best deals for you...</p>
    </div>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const SPLASH_DURATION_MS = 2500
const SPLASH_FADEOUT_MS = 500

function App() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [splashRemoved, setSplashRemoved] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSplashVisible(false), SPLASH_DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!splashVisible) {
      const t = setTimeout(() => setSplashRemoved(true), SPLASH_FADEOUT_MS)
      return () => clearTimeout(t)
    }
  }, [splashVisible])

  return (
    // ADDED dark:bg-[#050b1a] transition-colors
    <div className="min-h-screen bg-white dark:bg-[#050b1a] transition-colors duration-500">
      <ScrollToTop />
      {!splashRemoved && <SplashScreen visible={splashVisible} />}
      {splashRemoved && <AIChatBox />}

      <Suspense fallback={<TravelLoader />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="trips" element={<AdminTrips />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>
          <Route path="/" element={<SiteLayout />}>
            <Route index element={<UpcomingTours />} />
            <Route path="tours" element={<Tours />} />
            <Route path="itinerary/:id" element={<Itinerary />} />
            <Route path="trending" element={<TrendingPage />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}
export default App
