import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTourById } from '../data/toursData'
import { getTourById } from '../data/tours'
import { useAuth } from '../contexts/AuthContext'
import { 
  createInquiry,
  syncUserCRM,
  trackGlobalTrend
} from '../lib/firestore'
import ScrollReveal from '../components/ScrollReveal'
import { getVibe } from '../utils/destinationVibe'
import EnhancedBookSection from '../components/EnhancedBookSection'
import BookingWizard from '../components/BookingWizard'
import { 
  MapPin, 
  Calendar, 
  Sun, 
  Cloud, 
  Snowflake, 
  Umbrella, 
  Phone, 
  MessageCircle, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Hotel,
  Utensils,
  Car,
  Shield,
  Sparkles,
  Clock,
  Moon,
  Users,
  Heart,
  Bookmark
} from 'lucide-react'
import { getDestinationById } from '../data/destinations'
import { getDestinationImage } from '../lib/unsplash'

function BookSection({ tour, formatPrice }) {
  // Use the new EnhancedBookSection for all booking functionality
  return <EnhancedBookSection tour={tour} formatPrice={formatPrice} />
}

export default function Itinerary() {
  const { id } = useParams()
  const { user } = useAuth() // Access user for CRM tracking
  const { tour: tourFromHook, loading } = useTourById(id)
  const tour = tourFromHook || (id ? getTourById(id) : null)

  // CRM: TRACK VIEW & SEARCH INTENT
  useEffect(() => {
    if (tour?.id) {
      // Track Global Popularity
      trackGlobalTrend(tour.destination || tour.name);
      
      // Track Personal History
      if (user?.uid) {
        syncUserCRM(user.uid, {
          lastViewed: tour.name,
          lastViewedId: tour.id,
          category: tour.category || 'general',
          viewCount: 1 // syncUserCRM handles the increment logic
        });
      }
    }
  }, [user?.uid, tour?.id, tour?.name]);

  // CRM: Sentiment Handlers
  const handleSentiment = (type) => {
    if (!user) return;
    syncUserCRM(user.uid, { 
      [`sentiment.${tour.id}`]: type,
      lastAction: `${type}d ${tour.name}`
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white fixed inset-0 z-[100]">
        <div className="relative w-48 h-24 flex items-center justify-center">
          <div className="absolute top-0 left-4 animate-pulse opacity-40 text-xl">☁️</div>
          <div className="absolute top-4 right-8 animate-pulse delay-75 opacity-40 text-xl">☁️</div>
          <div className="absolute z-20 animate-bounce" style={{ animationDuration: '2s' }}><div className="text-5xl transform -rotate-12">✈️</div></div>
          <div className="absolute bottom-4 w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-1/2 animate-road-slide"></div></div>
          <div className="absolute bottom-1 animate-pulse text-3xl">🚗</div>
        </div>
      </div>
    )
  }
  
  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 pt-20">
        <div className="text-center">
          <h1 className="font-display text-2xl text-neutral-950">Tour not found</h1>
          <Link to="/" className="mt-4 inline-block btn-gradient">Back to Tours</Link>
        </div>
      </div>
    )
  }

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }
  const formatDateShort = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const formatPrice = (n) => `₹${(n / 1000).toFixed(0)}K`
  const routeLabel = tour.ports?.length ? tour.ports.join(' - ') : `${tour.origin || ''} - ${tour.destination || ''}`
  const nights = tour.nights || 0
  const nightsDays = `${nights}N/${nights + 1}D`
  const vibe = getVibe(tour)
  const isCold = vibe === 'cold'

  // Safe arrays with defaults
  const itinerary = tour.itinerary || []
  const highlightImages = tour.highlightImages || []
  const galleryThumbnails = tour.galleryThumbnails || []
  const shoreExcursionImages = tour.shoreExcursionImages || []
  const inclusionDetails = tour.inclusionDetails || tour.inclusions || []
  const entertainmentShows = tour.entertainmentShows || []

  return (
    <div className="bg-white min-h-screen">
      {/* Hero - destination themed with parallax & vibe overlay */}
      <section className="relative min-h-[55vh] sm:min-h-[65vh] md:min-h-[75vh] flex items-end overflow-hidden">
        <HeroBackground destination={tour?.destination} tourName={tour?.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Snowflakes for cold destinations */}
        {isCold && (
          <div className="snowflakes" aria-hidden>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="snowflake" />
            ))}
          </div>
        )}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Upcoming Tours
          </Link>
          <p className="text-white/80 font-medium uppercase tracking-wider text-sm mb-2">
            {tour.tagline}
          </p>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight max-w-4xl drop-shadow-lg">
            {tour.name}
          </h1>

          {/* CRM INTERACTION: Like / Save */}
          <div className="mt-4 flex gap-4">
            <LikeButton 
              onClick={() => handleSentiment('like')} 
              tourId={tour?.id}
            />
            <SaveButton 
              onClick={() => handleSentiment('save')} 
              tourId={tour?.id}
            />
          </div>

          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
            <div>
              <p className="font-display text-xl md:text-3xl font-semibold text-white">
                Starting from ₹{tour.pricePerGuest?.toLocaleString('en-IN') || '0'}
              </p>
              <p className="text-sm text-white/70 mt-1">
                per person on twin sharing
              </p>
            </div>
            <a href="#book" className="btn-gradient min-h-[44px] md:min-h-0 inline-flex items-center justify-center w-full sm:w-auto">
              Book Now
            </a>
          </div>
        </div>
      </section>

      {/* Trip summary strip - white theme */}
      <section className="bg-neutral-50 border-b border-neutral-200 shadow-sm">
        <ScrollReveal variant="slideUp" duration={600}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-neutral-950">
                {routeLabel} {nightsDays}
              </h2>
              <p className="text-sm">
                <span className="text-pink-600 font-medium">Embarkation: {formatDateShort(tour.departureDate)}</span>
                {' · '}
                <span className="text-pink-600 font-medium">Disembarkation: {tour.endDate ? formatDateShort(tour.endDate) : '—'}</span>
              </p>
              <p className="text-sm text-neutral-600">
                Route: {tour.ports?.join(' | ') || `${tour.origin || ''} | ${tour.destination || ''}`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-left md:text-right w-full sm:w-auto">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Starting From</p>
                <p className="font-display text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                  ₹{tour.pricePerGuest?.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-neutral-500">Excl. GST Per Person in Double Occupancy</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <a href="#book" className="btn-gradient text-sm py-3 md:py-2.5 px-5 min-h-[44px] md:min-h-0 inline-flex items-center justify-center">
                  View Packages
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm min-h-[44px] md:min-h-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Change Itinerary
                </Link>
              </div>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* Premium Hero Carousel - Auto-fetched 4K images from Unsplash */}
      <HeroCarousel destination={tour?.destination} />

      {/* Destination Info - Climate, Best Time, Logistics */}
      <DestinationInfoSection destination={tour?.destination} />

      {/* Visual Itinerary Timeline with Auto-fetched Images */}
      <VisualItineraryTimeline 
        itinerary={itinerary} 
        destination={tour?.destination}
        nights={nights}
      />

      {/* Standard Inclusions - Clean Global List */}
      <StandardInclusions />

      {/* Book Section */}
      <BookSection tour={tour} formatPrice={formatPrice} />
    </div>
  )
}

// Destination Info Section Component with Live Weather
function DestinationInfoSection({ destination }) {
  const destData = getDestinationById(destination?.toLowerCase().replace(/\s+/g, '-'));
  const [weather, setWeather] = useState(null);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWeather = async () => {
      if (!destination) return;
      
      setLoading(true);
      try {
        // Dynamic import to avoid issues if module isn't ready
        const { getCurrentWeather, getCurrentSeason, getWeatherIconUrl } = await import('../lib/weather.js');
        const weatherData = await getCurrentWeather(destination.toLowerCase().replace(/\s+/g, '-'));
        const season = getCurrentSeason(destination.toLowerCase().replace(/\s+/g, '-'));
        
        setWeather(weatherData);
        setCurrentSeason(season);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeather();
  }, [destination]);
  
  if (!destData) return null;

  const getClimateIcon = (type, isActive = false) => {
    const baseClasses = "w-5 h-5 transition-all";
    const activeClasses = isActive ? "scale-110 font-bold" : "opacity-50";
    
    switch (type) {
      case 'summer': return <Sun className={`${baseClasses} text-orange-500 ${activeClasses}`} />;
      case 'winter': return <Snowflake className={`${baseClasses} text-blue-500 ${activeClasses}`} />;
      case 'monsoon': return <Umbrella className={`${baseClasses} text-teal-500 ${activeClasses}`} />;
      default: return <Cloud className={`${baseClasses} text-gray-500 ${activeClasses}`} />;
    }
  };

  const isSeasonActive = (seasonType) => currentSeason?.type === seasonType;

  return (
    <section className="py-10 md:py-16 bg-gradient-to-br from-blue-50 to-indigo-50 border-y border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="slideUp" duration={600}>
          <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-6">
            Destination Guide: {destData.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Live Climate Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-500" />
                Live Climate
                {weather?.isSimulated && (
                  <span className="text-xs text-gray-400 font-normal">(Estimated)</span>
                )}
              </h3>
              
              {/* Current Weather */}
              {weather && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{weather.temperature}°C</p>
                      <p className="text-sm text-blue-100 capitalize">{weather.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-100">Feels like</p>
                      <p className="font-semibold">{weather.feelsLike}°C</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Seasonal Temperatures */}
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-2 rounded-lg ${isSeasonActive('summer') ? 'bg-orange-50 border border-orange-200' : ''}`}>
                  <div className="flex items-center gap-2">
                    {getClimateIcon('summer', isSeasonActive('summer'))}
                    <span className={`text-sm ${isSeasonActive('summer') ? 'font-bold text-orange-700' : 'text-gray-600'}`}>
                      Summer {isSeasonActive('summer') && '(Now)'}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${isSeasonActive('summer') ? 'text-orange-700 font-bold' : ''}`}>
                    {destData.climate.summer.temp}
                  </span>
                </div>
                
                <div className={`flex items-center justify-between p-2 rounded-lg ${isSeasonActive('winter') ? 'bg-blue-50 border border-blue-200' : ''}`}>
                  <div className="flex items-center gap-2">
                    {getClimateIcon('winter', isSeasonActive('winter'))}
                    <span className={`text-sm ${isSeasonActive('winter') ? 'font-bold text-blue-700' : 'text-gray-600'}`}>
                      Winter {isSeasonActive('winter') && '(Now)'}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${isSeasonActive('winter') ? 'text-blue-700 font-bold' : ''}`}>
                    {destData.climate.winter.temp}
                  </span>
                </div>
                
                {destData.climate.monsoon.temp !== 'N/A' && (
                  <div className={`flex items-center justify-between p-2 rounded-lg ${isSeasonActive('monsoon') ? 'bg-teal-50 border border-teal-200' : ''}`}>
                    <div className="flex items-center gap-2">
                      {getClimateIcon('monsoon', isSeasonActive('monsoon'))}
                      <span className={`text-sm ${isSeasonActive('monsoon') ? 'font-bold text-teal-700' : 'text-gray-600'}`}>
                        Monsoon {isSeasonActive('monsoon') && '(Now)'}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isSeasonActive('monsoon') ? 'text-teal-700 font-bold' : ''}`}>
                      {destData.climate.monsoon.temp}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Best Time Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Best Time to Visit
              </h3>
              <div className="flex flex-wrap gap-2">
                {destData.bestMonths.map(month => (
                  <span key={month} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {month}
                  </span>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Seasonal Pricing:</p>
                <div className="space-y-1 text-sm">
                  <p className="text-amber-700">
                    Peak: {destData.peakSeason.multiplier}x ({destData.peakSeason.months.slice(0, 3).join(', ')}...)
                  </p>
                  <p className="text-green-700">
                    Off: {destData.offSeason.multiplier}x ({destData.offSeason.months.slice(0, 3).join(', ')}...)
                  </p>
                </div>
              </div>
            </div>

            {/* Attractions Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Top Attractions
              </h3>
              <ul className="space-y-2">
                {destData.attractions.slice(0, 5).map((attraction, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {attraction}
                  </li>
                ))}
              </ul>
            </div>

            {/* Logistics Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-500" />
                Logistics
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Airport:</span><br/>
                  {destData.logistics.nearestAirport}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Railway:</span><br/>
                  {destData.logistics.nearestRailway}
                </p>
                {destData.logistics.passportRequired && (
                  <div className="mt-3 p-2 bg-amber-50 rounded text-amber-800 text-xs">
                    <strong>⚠️ Passport & Visa Required</strong>
                    <p>{destData.logistics.visaType}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border border-blue-100">
            <p className="text-gray-700">{destData.description}</p>
          </div>

          {/* Expert Advisor */}
          <div className="mt-6 flex flex-wrap items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8" />
              <div>
                <p className="font-semibold">Need Expert Advice?</p>
                <p className="text-sm text-blue-100">Our travel experts can help plan your perfect trip</p>
              </div>
            </div>
            <a 
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '918805795706'}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-3 sm:mt-0 px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ============================================
// NEW PROFESSIONAL COMPONENTS
// ============================================

/**
 * Hero Carousel Component
 * Premium image slider with Unsplash API integration and attribution
 */
function HeroCarousel({ destination, tourTitle }) {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      if (!destination) return;
      
      setLoading(true);
      try {
        // Use the new fetchDestinationImages for 4K HD images with attribution
        const { fetchDestinationImages } = await import('../lib/unsplash.js');
        const imageData = await fetchDestinationImages(destination, 6);
        setImages(imageData);
      } catch (error) {
        console.error('Failed to fetch carousel images:', error);
        // Fallback images
        setImages([
          { url: `https://source.unsplash.com/1200x600/?${encodeURIComponent(destination)},travel`, alt: destination, attribution: 'Photo by Unsplash' },
          { url: `https://source.unsplash.com/1200x600/?${encodeURIComponent(destination)},tourism`, alt: destination, attribution: 'Photo by Unsplash' },
          { url: `https://source.unsplash.com/1200x600/?${encodeURIComponent(destination)},landscape`, alt: destination, attribution: 'Photo by Unsplash' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [destination]);

  useEffect(() => {
    if (images.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => setCurrentIndex(index);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);

  if (loading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading beautiful photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
      {/* Main Image with Attribution */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image.url || image}
            alt={image.alt || `${destination} - View ${index + 1}`}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Unsplash Attribution - Elegant overlay */}
          <div className="absolute bottom-20 right-4 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full">
            {image.attribution || `Photo by ${image.credit?.name || 'Unsplash'} on Unsplash`}
          </div>
        </div>
      ))}

      {/* Title Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <h2 className="text-white text-2xl md:text-3xl font-bold font-display mb-2">
          {tourTitle}
        </h2>
        <p className="text-white/80 text-sm md:text-base flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {destination}
        </p>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all group"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all group"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white w-6' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

/**
 * Standard Inclusions Component
 * Global list of inclusions with green checkmarks
 */
function StandardInclusions({ hotelStars }) {
  const inclusions = [
    { icon: Hotel, text: `Hotel Accommodation (${hotelStars}★ Category)` },
    { icon: Utensils, text: 'Breakfast & Dinner included' },
    { icon: Car, text: 'Private Cab for Transfers & Sightseeing' },
    { icon: Shield, text: 'All Tolls, Parking, and Driver Allowance' },
    { icon: Users, text: 'Professional Tour Guide' },
    { icon: Sparkles, text: '24/7 Customer Support' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      <h2 className="font-display text-xl md:text-2xl font-semibold text-gray-900 mb-6">
        Package Inclusions
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {inclusions.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-4 bg-green-50/50 rounded-xl hover:bg-green-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-700 font-medium">{item.text}</span>
            <Check className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Visual Itinerary Timeline Component
 * Beautiful timeline with auto-fetched images for each day
 * Uses fetchActivityImage for location-specific images
 */
function VisualItineraryTimeline({ itinerary, destination }) {
  const [dayImages, setDayImages] = useState({});

  useEffect(() => {
    const fetchDayImages = async () => {
      const images = {};
      
      for (let i = 0; i < itinerary.length; i++) {
        const day = itinerary[i];
        // Extract location/activity from day title or description
        const locationMatch = day.title.match(/:\s*(.+)$/) || 
                             day.description.match(/in\s+([A-Za-z\s]+)/i);
        const activity = locationMatch ? locationMatch[1].trim() : 
                        day.activities?.[0] || destination;
        
        try {
          // Use fetchActivityImage for specific activity/location images
          const { fetchActivityImage } = await import('../lib/unsplash.js');
          const imageData = await fetchActivityImage(activity);
          images[i] = imageData;
        } catch (error) {
          console.error(`Failed to fetch image for ${activity}:`, error);
          // Fallback
          images[i] = null;
        }
      }
      
      setDayImages(images);
    };

    if (itinerary?.length > 0) {
      fetchDayImages();
    }
  }, [itinerary, destination]);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      <h2 className="font-display text-xl md:text-2xl font-semibold text-gray-900 mb-8">
        Day-wise Itinerary
      </h2>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />
        
        <div className="space-y-8">
          {itinerary.map((day, index) => (
            <div key={index} className="relative pl-16 md:pl-20">
              {/* Day Number Badge */}
              <div className="absolute left-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                {day.day}
              </div>
              
              {/* Content Card */}
              <div className="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Auto-fetched Activity Image with Skeleton */}
                  <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {dayImages[index] ? (
                      <img
                        src={dayImages[index].thumb || dayImages[index].url}
                        alt={dayImages[index].alt || day.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : dayImages.hasOwnProperty(index) ? (
                      // Image fetch completed but returned null - show placeholder
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <MapPin className="w-8 h-8 text-gray-300" />
                      </div>
                    ) : (
                      // Still loading
                      <div className="w-full h-full animate-pulse bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {day.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {day.description}
                    </p>
                    
                    {/* Activities Tags */}
                    {day.activities && (
                      <div className="flex flex-wrap gap-2">
                        {day.activities.map((activity, i) => (
                          <span 
                            key={i}
                            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Meals */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {day.meals?.includes('breakfast') && (
                        <span className="flex items-center gap-1">
                          <Sun className="w-3 h-3" /> Breakfast
                        </span>
                      )}
                      {day.meals?.includes('lunch') && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Lunch
                        </span>
                      )}
                      {day.meals?.includes('dinner') && (
                        <span className="flex items-center gap-1">
                          <Moon className="w-3 h-3" /> Dinner
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Like Button Component with CRM Integration
 * Provides visual feedback and syncs with CRM
 */
function LikeButton({ onClick, tourId }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();

  // Check if already liked from localStorage
  useEffect(() => {
    if (tourId) {
      const likedTours = JSON.parse(localStorage.getItem('likedTours') || '[]');
      setIsLiked(likedTours.includes(tourId));
    }
  }, [tourId]);

  const handleClick = () => {
    if (!user) {
      // Show login prompt or alert
      alert('Please login to like this tour');
      return;
    }

    setIsAnimating(true);
    setIsLiked(!isLiked);
    
    // Update localStorage
    const likedTours = JSON.parse(localStorage.getItem('likedTours') || '[]');
    if (!isLiked) {
      likedTours.push(tourId);
    } else {
      const index = likedTours.indexOf(tourId);
      if (index > -1) likedTours.splice(index, 1);
    }
    localStorage.setItem('likedTours', JSON.stringify(likedTours));
    
    // Call CRM handler
    onClick();
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button 
      onClick={handleClick}
      className={`p-3 rounded-full backdrop-blur-md transition-all border border-white/20 active:scale-95 group ${
        isLiked 
          ? 'bg-red-500/30 border-red-400/50' 
          : 'bg-white/10 hover:bg-white/30'
      }`}
      title={isLiked ? 'Liked!' : 'Like this tour'}
    >
      <Heart 
        className={`w-6 h-6 transition-all ${
          isLiked 
            ? 'text-red-400 fill-red-400 scale-110' 
            : 'text-white group-hover:text-red-400 group-hover:fill-red-400'
        } ${isAnimating ? 'animate-pulse' : ''}`} 
      />
    </button>
  );
}

/**
 * Hero Background Component
 * Fetches 4K/HD Unsplash image for hero section
 */
function HeroBackground({ destination, tourName }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroImage = async () => {
      if (!destination) return;
      
      setLoading(true);
      try {
        const { fetchDestinationImages } = await import('../lib/unsplash.js');
        const images = await fetchDestinationImages(destination, 1);
        if (images && images[0]) {
          setImage(images[0]);
        }
      } catch (error) {
        console.error('Failed to fetch hero image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImage();
  }, [destination]);

  return (
    <div className="absolute inset-0">
      {loading ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
      ) : image ? (
        <>
          <img 
            src={image.url} 
            alt={tourName || destination} 
            className="w-full h-full object-cover"
          />
          {/* Unsplash Attribution */}
          <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full">
            {image.attribution || `Photo by ${image.credit?.name || 'Unsplash'} on Unsplash`}
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900" />
      )}
    </div>
  );
}

/**
 * Save Button Component with CRM Integration
 * Provides visual feedback and syncs with CRM
 */
function SaveButton({ onClick, tourId }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();

  // Check if already saved from localStorage
  useEffect(() => {
    if (tourId) {
      const savedTours = JSON.parse(localStorage.getItem('savedTours') || '[]');
      setIsSaved(savedTours.includes(tourId));
    }
  }, [tourId]);

  const handleClick = () => {
    if (!user) {
      // Show login prompt or alert
      alert('Please login to save this tour');
      return;
    }

    setIsAnimating(true);
    setIsSaved(!isSaved);
    
    // Update localStorage
    const savedTours = JSON.parse(localStorage.getItem('savedTours') || '[]');
    if (!isSaved) {
      savedTours.push(tourId);
    } else {
      const index = savedTours.indexOf(tourId);
      if (index > -1) savedTours.splice(index, 1);
    }
    localStorage.setItem('savedTours', JSON.stringify(savedTours));
    
    // Call CRM handler
    onClick();
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button 
      onClick={handleClick}
      className={`p-3 rounded-full backdrop-blur-md transition-all border border-white/20 active:scale-95 group ${
        isSaved 
          ? 'bg-yellow-500/30 border-yellow-400/50' 
          : 'bg-white/10 hover:bg-white/30'
      }`}
      title={isSaved ? 'Saved!' : 'Save for later'}
    >
      <Bookmark 
        className={`w-6 h-6 transition-all ${
          isSaved 
            ? 'text-yellow-400 fill-yellow-400 scale-110' 
            : 'text-white group-hover:text-yellow-400 group-hover:fill-yellow-400'
        } ${isAnimating ? 'animate-pulse' : ''}`} 
      />
    </button>
  );
}

