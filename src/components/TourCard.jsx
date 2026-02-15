import { Link } from 'react-router-dom'
import { getVibe, VIBE_COLORS } from '../utils/destinationVibe'
import { useAuth } from '../contexts/AuthContext'
import { syncUserCRM } from '../lib/firestore'

const VIBE_LABELS = {
  cold: 'Winter',
  tropical: 'Tropical',
  island: 'Island',
  urban: 'City',
}

export default function TourCard({ tour, staggerIndex }) {
  const { user } = useAuth() // Get current user
  const vibe = getVibe(tour)
  const colors = VIBE_COLORS[vibe] || VIBE_COLORS.urban

  // Trigger CRM Sync when user clicks to view details
  const handleTrackView = () => {
    if (user?.uid) {
      syncUserCRM(user.uid, { 
        lastViewedId: tour.id,
        category: tour.category,
        action: 'view_details'
      });
    }
  };

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  
  const startDate = formatDate(tour.departureDate)
  const endDate = tour.endDate ? formatDate(tour.endDate) : null
  const routeLabel = tour.ports?.length ? `${tour.origin} Round Trip` : `${tour.origin} → ${tour.destination}`
  const portsLabel = tour.ports?.length ? tour.ports.join(' • ') : `${tour.origin} • ${tour.destination}`

  const viewingCount = Number(tour.viewing) || 0
  const tagLabel = tour.tripTag || tour.shipName || tour.tagline || ''
  const badgeLine1 = VIBE_LABELS[vibe]
  const badgeLine2 = tour.nights ? `${tour.nights} Night${tour.nights > 1 ? 's' : ''}` : (tagLabel.slice(0, 18) + (tagLabel.length > 18 ? '…' : ''))

  return (
    <article
      className="group rounded-xl border border-neutral-200 bg-white overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:border-neutral-300"
      style={{
        boxShadow: staggerIndex != null ? `0 2px 12px -2px ${colors.glow}` : undefined,
      }}
    >
      <div className="flex flex-col sm:flex-row min-w-0">
        <Link 
          to={`/itinerary/${tour.id}`} 
          onClick={handleTrackView} 
          className="sm:w-[40%] min-w-0 relative aspect-[16/10] sm:aspect-[4/3] sm:min-h-[200px] overflow-hidden flex-shrink-0 rounded-l-xl sm:rounded-l-xl"
        >
          <img
            src={tour.image}
            alt={tour.name}
            className="absolute inset-0 w-full h-full object-cover object-center card-image-zoom"
          />
          <div
            className="absolute inset-0 opacity-50 group-hover:opacity-35 transition-opacity duration-300"
            style={{ background: colors.overlay }}
            aria-hidden
          />
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 max-w-[90%]">
            <span
              className="rounded-md px-2 py-1 text-white text-[10px] font-semibold uppercase tracking-wide shadow-md leading-tight w-fit"
              style={{ backgroundColor: colors.accent }}
            >
              {badgeLine1}
            </span>
            <span
              className="rounded-md px-2 py-0.5 text-white/95 text-[10px] font-medium uppercase tracking-wide leading-tight truncate max-w-full w-fit"
              style={{ backgroundColor: colors.accent }}
              title={tagLabel}
            >
              {badgeLine2}
            </span>
          </div>
        </Link>

        <div className="sm:w-[60%] flex flex-col min-w-0 overflow-hidden p-4 sm:p-5">
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-display text-lg font-semibold text-neutral-900 mb-1 leading-tight break-words">
              {tour.name}
            </h3>
            <p className="text-neutral-500 text-sm mb-1 break-words">
              {startDate}{endDate ? ` – ${endDate}` : ''}
            </p>
            <p className="text-neutral-600 text-sm mb-1 break-words">{routeLabel}</p>
            <p className="text-neutral-400 text-xs break-words">Ports: {portsLabel}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="text-neutral-500 text-xs tabular-nums shrink-0" title="People viewing">
              <span className="font-medium text-neutral-700">{viewingCount}</span> viewing
            </span>
            <div className="flex items-baseline gap-2 shrink-0 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-neutral-400">From</p>
              <p
                className="font-display text-lg font-semibold tabular-nums whitespace-nowrap"
                style={{ color: colors.accent }}
              >
                ₹{tour.pricePerGuest?.toLocaleString('en-IN')}
              </p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
              <Link
                to={`/itinerary/${tour.id}`}
                onClick={handleTrackView}
                className="flex-1 sm:flex-none inline-flex items-center justify-center py-2.5 px-4 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 min-w-0"
                style={{ background: colors.accent, boxShadow: `0 2px 8px ${colors.glow}` }}
              >
                View Itinerary
              </Link>
              <Link
                to={`/itinerary/${tour.id}#book`}
                onClick={handleTrackView}
                className="flex-1 sm:flex-none inline-flex items-center justify-center py-2.5 px-4 text-sm font-medium rounded-lg border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors min-w-0"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}