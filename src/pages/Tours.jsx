import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  ArrowRight, 
  Filter,
  Search,
  Heart,
  Compass,
  Mountain,
  Umbrella,
  Building2,
  Palmtree
} from 'lucide-react';
import { tours } from '../data/tours';
import { destinations, getAllStates } from '../data/destinations';
import { getDestinationImage } from '../lib/unsplash';
import BookingWizard from '../components/BookingWizard';
import ScrollReveal from '../components/ScrollReveal';

const TOUR_CATEGORIES = [
  { id: 'all', label: 'All Tours', icon: Compass },
  { id: 'hill-station', label: 'Hill Stations', icon: Mountain },
  { id: 'beach-destination', label: 'Beaches', icon: Umbrella },
  { id: 'heritage-city', label: 'Heritage', icon: Building2 },
  { id: 'international', label: 'International', icon: Palmtree }
];

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'budget', label: 'Under ₹20K', min: 0, max: 20000 },
  { id: 'standard', label: '₹20K - ₹50K', min: 20000, max: 50000 },
  { id: 'premium', label: '₹50K - ₹1L', min: 50000, max: 100000 },
  { id: 'luxury', label: 'Above ₹1L', min: 100000, max: Infinity }
];

export default function Tours() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [destinationImages, setDestinationImages] = useState({});
  const [savedTours, setSavedTours] = useState(() => {
    const saved = localStorage.getItem('savedTours');
    return saved ? JSON.parse(saved) : [];
  });

  const states = getAllStates();

  // Load destination images
  useEffect(() => {
    const loadImages = async () => {
      const images = {};
      for (const tour of tours.slice(0, 8)) {
        const destId = tour.destination.toLowerCase().replace(/\s+/g, '-');
        try {
          const img = await getDestinationImage(destId, 'hero');
          images[tour.id] = img.url;
        } catch (e) {
          images[tour.id] = tour.image;
        }
      }
      setDestinationImages(images);
    };
    loadImages();
  }, []);

  // Save tours to localStorage
  useEffect(() => {
    localStorage.setItem('savedTours', JSON.stringify(savedTours));
  }, [savedTours]);

  // Filter tours
  const filteredTours = tours.filter(tour => {
    // Category filter
    if (selectedCategory !== 'all') {
      const destId = tour.destination.toLowerCase().replace(/\s+/g, '-');
      const destData = destinations[destId];
      if (selectedCategory === 'international') {
        if (!destData || destData.country === 'India') return false;
      } else if (!destData || destData.type !== selectedCategory) {
        return false;
      }
    }

    // Price filter
    if (selectedPriceRange !== 'all') {
      const range = PRICE_RANGES.find(r => r.id === selectedPriceRange);
      if (range && (tour.pricePerGuest < range.min || tour.pricePerGuest > range.max)) {
        return false;
      }
    }

    // State filter
    if (selectedState !== 'all') {
      const destId = tour.destination.toLowerCase().replace(/\s+/g, '-');
      const destData = destinations[destId];
      if (!destData || destData.state !== selectedState) {
        return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = tour.name.toLowerCase().includes(query);
      const matchesDestination = tour.destination.toLowerCase().includes(query);
      if (!matchesName && !matchesDestination) return false;
    }

    return true;
  });

  const handleBookNow = (tour) => {
    setSelectedTour(tour);
    setShowWizard(true);
  };

  const handleSaveTour = (tour) => {
    const isSaved = savedTours.find(t => t.id === tour.id);
    if (isSaved) {
      setSavedTours(savedTours.filter(t => t.id !== tour.id));
    } else {
      setSavedTours([...savedTours, { ...tour, savedAt: new Date().toISOString() }]);
    }
  };

  const isTourSaved = (tourId) => savedTours.some(t => t.id === tourId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Amazing Destinations</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Choose from our curated selection of tours or create your own custom package
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations, tours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              {TOUR_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Price Filter */}
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              {PRICE_RANGES.map((range) => (
                <option key={range.id} value={range.id}>{range.label}</option>
              ))}
            </select>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              <option value="all">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredTours.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No tours found matching your criteria</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedPriceRange('all');
                  setSelectedState('all');
                  setSearchQuery('');
                }}
                className="mt-4 text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">{filteredTours.length} tours found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTours.map((tour, index) => (
                  <ScrollReveal key={tour.id} variant="slideUp" staggerIndex={index % 6}>
                    <TourCard
                      tour={tour}
                      image={destinationImages[tour.id] || tour.image}
                      isSaved={isTourSaved(tour.id)}
                      onSave={() => handleSaveTour(tour)}
                      onBook={() => handleBookNow(tour)}
                    />
                  </ScrollReveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Create Custom Tour CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-indigo-100 mb-8 text-lg">
            Create your own custom tour package tailored to your preferences
          </p>
          <button
            onClick={() => {
              setSelectedTour(null);
              setShowWizard(true);
            }}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
          >
            <Compass className="w-5 h-5" />
            Create Custom Tour
          </button>
        </div>
      </section>

      {/* Booking Wizard Modal */}
      {showWizard && (
        <BookingWizard
          initialTour={selectedTour}
          onClose={() => setShowWizard(false)}
          onComplete={() => {
            setShowWizard(false);
            // Show success message or redirect
          }}
          savedTours={savedTours}
          onSaveTour={handleSaveTour}
        />
      )}
    </div>
  );
}

// Tour Card Component
function TourCard({ tour, image, isSaved, onSave, onBook }) {
  const nights = tour.nights || 3;
  const days = nights + 1;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={tour.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>

        {/* Featured Badge */}
        {tour.isFeatured && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
            Featured
          </span>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/80 text-xs">Starting from</p>
              <p className="text-white text-xl font-bold">₹{tour.pricePerGuest?.toLocaleString()}</p>
            </div>
            {tour.offer && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                {tour.offer}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{tour.name}</h3>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {tour.destination}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {nights}N/{days}D
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{tour.viewing || 0} viewing</span>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/itinerary/${tour.id}`}
              className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Details
            </Link>
            <button
              onClick={onBook}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              Book
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
