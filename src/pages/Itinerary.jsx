import { useState, useEffect } from 'react' // Added useEffect
import { useParams, Link } from 'react-router-dom'
import { useTourById } from '../data/toursData'
import { getTourById } from '../data/tours'
import { useAuth } from '../contexts/AuthContext'
import { 
  createOrder, 
  createPayment, 
  updatePayment, 
  updateOrderStatus, 
  createInquiry,
  syncUserCRM,     // Added
  trackGlobalTrend // Added
} from '../lib/firestore'
import { openRazorpayCheckout } from '../lib/razorpay'
import ScrollReveal from '../components/ScrollReveal'
import { getVibe } from '../utils/destinationVibe'

// Use relative /api so: production = same-origin on Vercel; local = Vite proxy (set VITE_API_BASE_URL in .env)
const API_BASE = ''
// Key ID is public; fallback so payment works even without .env (secret stays on server)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SEo7lCnNbH00WM'

function BookSection({ tour, formatPrice }) {
  const { user } = useAuth()
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPaymentError('')
    setSubmitting(true)
    try {
      const amount = (tour.pricePerGuest || 0) * guests
      if (amount < 1) {
        setPaymentError('Amount must be at least ₹1.')
        setSubmitting(false)
        return
      }

      const orderId = await createOrder({
        userId: user?.uid || null,
        userEmail: user?.email || null,
        userPhone: user?.phoneNumber || null,
        userName: user?.displayName || null,
        tourId: tour.id,
        tourName: tour.name,
        amount,
        guests,
        status: 'pending',
      })

      const paymentId = await createPayment({
        orderId,
        userId: user?.uid || null,
        amount,
        status: 'pending',
        method: 'razorpay',
      })

      const keyId = RAZORPAY_KEY_ID
      if (!keyId) {
        setPaymentError('Payment is not configured. Please contact support.')
        setSubmitting(false)
        return
      }

      const createOrderRes = await fetch(`${API_BASE}/api/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          receipt: orderId,
          tourName: tour.name,
        }),
      })
      const createOrderText = await createOrderRes.text()
      let createOrderData = {}
      try {
        createOrderData = createOrderText ? JSON.parse(createOrderText) : {}
      } catch (_) {
        createOrderData = {}
      }
      if (!createOrderRes.ok) {
        setPaymentError(createOrderData.error || (createOrderRes.status === 404 ? 'Payment API not found. For local dev, set VITE_API_BASE_URL in .env to your Vercel URL and restart.' : 'Could not create payment.'))
        setSubmitting(false)
        return
      }

      const response = await openRazorpayCheckout({
        keyId,
        orderId: createOrderData.orderId,
        amount: createOrderData.amount,
        currency: createOrderData.currency || 'INR',
        name: 'HM Tours',
        description: `${tour.name} — ${guests} guest(s)`,
        prefillEmail: user?.email || undefined,
        prefillContact: user?.phoneNumber || undefined,
      })

      const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      })
      const verifyText = await verifyRes.text()
      let verifyData = {}
      try {
        verifyData = verifyText ? JSON.parse(verifyText) : {}
      } catch (_) {
        verifyData = {}
      }
      if (!verifyData.success) {
        setPaymentError('Payment verification failed. Please contact support with your order details.')
        setSubmitting(false)
        return
      }

      await updatePayment(paymentId, {
        status: 'completed',
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
      })
      await updateOrderStatus(orderId, 'confirmed')

      // CRM: TRACK BOOKING SUCCESS
      if (user?.uid) {
        syncUserCRM(user.uid, {
          totalSpent: amount,
          lastBooked: tour.name,
          bookingCount: 1, // Logic inside syncUserCRM handles increment
          action: 'conversion'
        });
      }

      if (message) {
        await createInquiry({
          userId: user?.uid || null,
          userEmail: user?.email || null,
          userPhone: user?.phoneNumber || null,
          userName: user?.displayName || null,
          tourId: tour.id,
          tourName: tour.name,
          message,
        })
      }
      setSubmitted(true)
    } catch (err) {
      if (err?.message === 'Payment closed') {
        setPaymentError('Payment was cancelled.')
      } else {
        setPaymentError(err?.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section id="book" className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-2">Booking & payment confirmed</h2>
          <p className="text-neutral-600">Thank you! We&apos;ll send you the booking details shortly.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="book" className="py-12 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-950 mb-4 text-center">
          Ready to Book?
        </h2>
        <p className="text-neutral-700 text-sm md:text-base mb-8 max-w-xl mx-auto text-center">
          Secure your spot for {tour.name}. From {formatPrice(tour.pricePerGuest)} per guest. Pay securely with Razorpay.
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Number of guests</label>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value) || 1)}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Message (optional)</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-900"
              placeholder="Special requests..."
            />
          </div>
          <p className="text-sm text-neutral-600 font-medium">
            Total: ₹{((tour.pricePerGuest || 0) * guests).toLocaleString('en-IN')}
          </p>
          {paymentError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{paymentError}</p>
          )}
          <button type="submit" disabled={submitting} className="btn-gradient w-full py-4 rounded-lg disabled:opacity-50">
            {submitting ? 'Opening payment…' : 'Pay & Book'}
          </button>
        </form>
      </div>
    </section>
  )
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
        <div className="absolute inset-0">
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
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

          {/* CRM INTERACTION: Like / Dislike / Save */}
          <div className="mt-4 flex gap-4">
            <button 
              onClick={() => handleSentiment('like')}
              className="p-3 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md transition-all border border-white/20 active:scale-95"
              title="Like this tour"
            >
              <span className="text-xl md:text-2xl">❤️</span>
            </button>
            <button 
              onClick={() => handleSentiment('dislike')}
              className="p-3 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md transition-all border border-white/20 active:scale-95"
              title="Not interested"
            >
              <span className="text-xl md:text-2xl">👎</span>
            </button>
            <button 
              onClick={() => handleSentiment('save')}
              className="p-3 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md transition-all border border-white/20 active:scale-95"
              title="Save for later"
            >
              <span className="text-xl md:text-2xl">🔖</span>
            </button>
          </div>

          <div className="mt-4 md:mt-6 flex flex-wrap gap-x-4 gap-y-1 md:gap-6 text-white/90 text-sm md:text-base">
            <span>Departs {formatDate(tour.departureDate)}</span>
            <span className="hidden sm:inline">•</span>
            <span>{nights} Night{nights > 1 ? 's' : ''}</span>
            <span className="hidden sm:inline">•</span>
            <span>{tour.origin || ''} → {tour.destination || ''}</span>
          </div>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
            <p className="font-display text-xl md:text-3xl font-semibold text-white">
              From {formatPrice(tour.pricePerGuest)}
              <span className="text-base md:text-lg font-body font-normal text-white/80 ml-2">per guest</span>
            </p>
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
          {/* Gallery thumbnails - 3 preview images */}
          {(galleryThumbnails.length > 0 || highlightImages.slice(0, 3).length > 0) && (
            <div className="flex gap-4 mt-6 pt-6 border-t border-neutral-100 overflow-x-auto">
              {(galleryThumbnails.length > 0 ? galleryThumbnails : highlightImages.slice(0, 3)).map((src, i) => (
                <div key={i} className="flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        </ScrollReveal>
      </section>

      {/* Your Trip Highlight - 4 images */}
      <section className="py-10 md:py-16 bg-white border-y border-neutral-200">
        <ScrollReveal variant="slideUp" staggerIndex={1} duration={600}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-6 md:mb-8">
            Your Trip Highlight
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {highlightImages.length > 0
              ? highlightImages.map((img, i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-md border border-neutral-200">
                    <img
                      src={img}
                      alt={`Trip highlight ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              : [1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                    <span className="text-neutral-400 text-sm">Highlight {i}</span>
                  </div>
                ))}
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* Itinerary - Day wise details */}
      <section id="itinerary" className="py-10 md:py-16 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="slideLeft" duration={500}>
          <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-1">
            Itinerary
          </h2>
          <p className="text-neutral-600 text-sm mb-8">Day wise details of your package</p>

          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-200 via-blue-100 to-transparent hidden sm:block" aria-hidden />

            {itinerary.length > 0 ? (
              itinerary.map((day, i) => (
                <div key={day.day || i} className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0">
                  {/* Day number */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-display text-base font-bold shadow-lg ring-4 ring-white">
                    {day.day || i + 1}
                  </div>

                  {/* Day content card */}
                  <div className="flex-1 min-w-0 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Day {day.day || i + 1}
                      </span>
                      <span className="text-neutral-300">·</span>
                      <h3 className="font-display text-lg md:text-xl font-semibold text-neutral-900 break-words">
                        {day.port || ''}
                      </h3>
                    </div>
                    {day.subtitle && (
                      <p className="mt-1.5 text-emerald-600 text-sm font-medium break-words">
                        {day.subtitle}
                      </p>
                    )}
                    <p className="mt-3 text-neutral-600 text-sm leading-relaxed break-words max-w-3xl">
                      {day.description || ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-center py-8">No itinerary details available.</p>
            )}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Shore Excursions */}
      {shoreExcursionImages.length > 0 && (
        <section className="py-16 bg-white border-y border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-2 inline-flex items-center gap-2">
              Shore Excursions
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-300 text-neutral-600 text-xs" title="Information">i</span>
            </h2>
            <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
              {shoreExcursionImages.map((src, i) => (
                <div key={i} className="flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                  <img src={src} alt={`Shore excursion ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <Link to="#itinerary" className="inline-flex items-center gap-1 mt-4 text-blue-600 font-medium text-sm hover:text-blue-700">
              View Full Itinerary
              <span className="text-lg">&gt;</span>
            </Link>
          </div>
        </section>
      )}

      {/* Inclusions + Entertainment Shows */}
      <section className="py-10 md:py-16 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Inclusions */}
            <div>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-6">
                Inclusions
              </h2>
              {inclusionDetails.length > 0 ? (
                <ul className="space-y-3">
                  {inclusionDetails.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-neutral-700">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-500 text-sm">Inclusion details will be added soon.</p>
              )}
              {tour.inclusionNote && (
                <p className="mt-4 text-neutral-500 text-sm">{tour.inclusionNote}</p>
              )}
            </div>

            {/* Entertainment Shows */}
            <div>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-6">
                Entertainment Shows
              </h2>
              {entertainmentShows.length > 0 ? (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-950">Entertainment Shows</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-950">{nights} Night</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entertainmentShows.map((show, i) => (
                        <tr key={i} className="border-b border-neutral-100 last:border-0">
                          <td className="py-3 px-4 text-neutral-700">{show.name}</td>
                          <td className="py-3 px-4">
                            {show.available ? (
                              <span className="text-emerald-500" aria-label="Available">
                                <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            ) : (
                              <span className="text-red-500" aria-label="Not available">
                                <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Entertainment schedule available on board.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <BookSection tour={tour} formatPrice={formatPrice} />
    </div>
  )
}