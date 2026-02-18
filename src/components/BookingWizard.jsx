import { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Hotel, 
  Bus, 
  Plane, 
  Train, 
  Car, 
  Bike,
  ChevronRight, 
  ChevronLeft, 
  Check,
  Info,
  Phone,
  Mail,
  CreditCard,
  Shield,
  AlertCircle,
  Sparkles,
  X,
  Save,
  ArrowRightLeft
} from 'lucide-react';
import { destinations, statePackages, getAllStates, getDestinationById } from '../data/destinations';
import { 
  calculateTourPrice, 
  getBudgetRecommendations, 
  getSmartSuggestions,
  compareTourOptions,
  transportRates,
  hotelRates 
} from '../data/pricingEngine';
import { getDestinationImage } from '../lib/unsplash';
import { useAuth } from '../contexts/AuthContext';
import { createInquiry, syncUserCRM } from '../lib/firestore';

// Tour type definitions
const TOUR_TYPES = [
  { id: 'fixed', label: 'Fixed Package', icon: '📦', description: 'Preset routes with best prices' },
  { id: 'state', label: 'State-wise Tour', icon: '🗺️', description: 'Explore an entire state' },
  { id: 'multi', label: 'Multi-Destination', icon: '🛤️', description: 'Create your own route' },
  { id: 'single', label: 'Single City', icon: '🏙️', description: 'Deep dive into one city' },
  { id: 'custom', label: 'Custom Package', icon: '✨', description: 'Build your dream trip' }
];

// Transport options
const TRANSPORT_OPTIONS = [
  { id: 'flight', label: 'Flight', icon: Plane, description: 'Fast & comfortable' },
  { id: 'train', label: 'Train', icon: Train, description: 'Scenic & economical' },
  { id: 'bus', label: 'Bus', icon: Bus, description: 'Budget friendly' },
  { id: 'car', label: 'Car', icon: Car, description: 'Private & flexible' },
  { id: 'bike', label: 'Bike', icon: Bike, description: 'Adventure mode' }
];

// Hotel star options
const HOTEL_OPTIONS = [
  { stars: '2', label: 'Budget', description: 'Clean & comfortable', priceLabel: 'From ₹1,200/night' },
  { stars: '3', label: 'Standard', description: 'Good amenities', priceLabel: 'From ₹2,500/night' },
  { stars: '4', label: 'Premium', description: 'Luxury experience', priceLabel: 'From ₹5,000/night' },
  { stars: '5', label: 'Luxury', description: 'World-class', priceLabel: 'From ₹10,000/night' }
];

// Budget ranges
const BUDGET_RANGES = [
  { id: 'low', label: 'Budget', range: '₹5K - ₹20K', color: 'bg-green-100 text-green-800' },
  { id: 'medium', label: 'Standard', range: '₹20K - ₹50K', color: 'bg-blue-100 text-blue-800' },
  { id: 'high', label: 'Premium', range: '₹50K - ₹1L', color: 'bg-purple-100 text-purple-800' },
  { id: 'luxury', label: 'Luxury', range: '₹1L+', color: 'bg-amber-100 text-amber-800' }
];

export default function BookingWizard({ 
  initialTour = null, 
  onClose, 
  onComplete,
  savedTours = [],
  onSaveTour,
  onCompareTour
}) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [destinationImages, setDestinationImages] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    tourType: initialTour ? 'fixed' : '',
    origin: 'Delhi',
    destination: initialTour?.destination || '',
    destinations: [], // For multi-destination
    state: '', // For state-wise
    startDate: '',
    endDate: '',
    nights: initialTour?.nights || 3,
    guests: 2,
    rooms: 1,
    transportType: 'bus',
    transportClass: 'ac',
    hotelStars: '3',
    mealPlan: 'cp',
    budget: 30000,
    activities: ['sightseeing'],
    specialRequests: '',
    // Lead form fields
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    pickupLocation: '',
    // Pricing
    priceBreakdown: null
  });

  const [comparisonData, setComparisonData] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [groupDiscountMessage, setGroupDiscountMessage] = useState('');

  // Load destination images
  useEffect(() => {
    const loadImages = async () => {
      const images = {};
      const allDests = Object.keys(destinations);
      
      for (const destId of allDests.slice(0, 6)) { // Load first 6 for performance
        try {
          const img = await getDestinationImage(destId, 'hero');
          images[destId] = img.url;
        } catch (e) {
          images[destId] = null;
        }
      }
      
      setDestinationImages(images);
    };
    
    loadImages();
  }, []);

  // Calculate price when relevant fields change
  useEffect(() => {
    if (step >= 4 && formData.destination) {
      calculatePrice();
    }
  }, [formData.destination, formData.nights, formData.guests, formData.transportType, formData.hotelStars, formData.budget]);

  // Check group discount
  useEffect(() => {
    if (formData.guests > 7) {
      setGroupDiscountMessage('For group discounts contact 📞 +91-98765-43210');
    } else {
      setGroupDiscountMessage('');
    }
  }, [formData.guests]);

  const calculatePrice = useCallback(() => {
    const priceData = calculateTourPrice({
      origin: formData.origin,
      destination: formData.destination,
      destinations: formData.destinations,
      transportType: formData.transportType,
      transportClass: formData.transportClass,
      hotelStars: formData.hotelStars,
      nights: formData.nights,
      passengers: formData.guests,
      rooms: formData.rooms,
      mealPlan: formData.mealPlan,
      activityTypes: formData.activities,
      travelMonth: formData.startDate ? new Date(formData.startDate).getMonth() + 1 : new Date().getMonth() + 1
    });

    setFormData(prev => ({ ...prev, priceBreakdown: priceData }));
  }, [formData]);

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitLead = async () => {
    setIsLoading(true);
    
    try {
      // Create inquiry
      await createInquiry({
        userId: user?.uid || null,
        userEmail: formData.email,
        userPhone: formData.phone,
        userName: user?.displayName || null,
        tourName: `${formData.tourType} - ${formData.destination || formData.state}`,
        message: formData.specialRequests,
        numberOfGuests: formData.guests,
        preferredDate: formData.startDate,
        tripInterest: formData.tourType,
        priceQuote: formData.priceBreakdown?.total,
        notes: JSON.stringify({
          origin: formData.origin,
          destination: formData.destination,
          nights: formData.nights,
          transport: formData.transportType,
          hotel: formData.hotelStars,
          budget: formData.budget
        })
      });

      // Track in CRM
      if (user?.uid) {
        syncUserCRM(user.uid, {
          lastInquiry: `${formData.tourType} - ${formData.destination || formData.state}`,
          inquiryValue: formData.priceBreakdown?.total,
          action: 'inquiry_submitted'
        });
      }

      handleNext(); // Go to payment step
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTour = () => {
    const tourData = {
      id: Date.now().toString(),
      ...formData,
      savedAt: new Date().toISOString()
    };
    onSaveTour?.(tourData);
  };

  const handleCompare = () => {
    const comparison = compareTourOptions({
      origin: formData.origin,
      destination: formData.destination,
      nights: formData.nights,
      passengers: formData.guests,
      rooms: formData.rooms,
      mealPlan: formData.mealPlan,
      activityTypes: formData.activities
    });
    setComparisonData(comparison);
    setShowComparison(true);
  };

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <TourTypeStep formData={formData} updateForm={updateForm} />;
      case 2:
        return <DestinationStep formData={formData} updateForm={updateForm} destinationImages={destinationImages} />;
      case 3:
        return <DetailsStep formData={formData} updateForm={updateForm} />;
      case 4:
        return <PreferencesStep formData={formData} updateForm={updateForm} />;
      case 5:
        return <LeadFormStep formData={formData} updateForm={updateForm} priceBreakdown={formData.priceBreakdown} groupDiscountMessage={groupDiscountMessage} />;
      case 6:
        return <PaymentStep formData={formData} onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Plan Your Perfect Trip</h2>
              <p className="text-blue-100 text-sm mt-1">Step {step} of 6</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div 
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between bg-gray-50">
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {step === 4 && (
              <button
                onClick={handleCompare}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Compare Options
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            {step === 4 && (
              <button
                onClick={handleSaveTour}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save for Later
              </button>
            )}
            
            {step < 6 ? (
              <button
                onClick={step === 5 ? handleSubmitLead : handleNext}
                disabled={isLoading || (step === 5 && (!formData.email || !formData.phone))}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : step === 5 ? 'Proceed to Payment' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparison && comparisonData && (
        <ComparisonModal 
          data={comparisonData} 
          onClose={() => setShowComparison(false)} 
        />
      )}
    </div>
  );
}

// Step 1: Tour Type Selection
function TourTypeStep({ formData, updateForm }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900">What type of trip are you planning?</h3>
        <p className="text-gray-500 mt-2">Select the option that best fits your travel style</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOUR_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => updateForm('tourType', type.id)}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              formData.tourType === type.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-3xl mb-3">{type.icon}</div>
            <h4 className="font-semibold text-gray-900">{type.label}</h4>
            <p className="text-sm text-gray-500 mt-1">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Destination Selection
function DestinationStep({ formData, updateForm, destinationImages }) {
  const allStates = getAllStates();
  const allDestinations = Object.values(destinations);

  const renderFixedPackage = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {allDestinations.slice(0, 12).map((dest) => (
        <button
          key={dest.id}
          onClick={() => updateForm('destination', dest.id)}
          className={`relative rounded-xl overflow-hidden aspect-[4/3] group ${
            formData.destination === dest.id ? 'ring-4 ring-blue-500' : ''
          }`}
        >
          <img
            src={destinationImages[dest.id] || dest.image}
            alt={dest.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h4 className="text-white font-semibold">{dest.name}</h4>
            <p className="text-white/80 text-xs">{dest.state || dest.country}</p>
          </div>
          {formData.destination === dest.id && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );

  const renderStateWise = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(statePackages).map(([state, data]) => (
          <button
            key={state}
            onClick={() => {
              updateForm('state', state);
              updateForm('destinations', data.destinations.map(d => ({ id: d, nights: 2 })));
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.state === state
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <h4 className="font-semibold text-gray-900">{state}</h4>
            <p className="text-sm text-gray-500 mt-1">{data.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {data.destinations.slice(0, 4).map(d => (
                <span key={d} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {d}
                </span>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Suggested: {data.suggestedRoute.join(' → ')}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderMultiDestination = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <Info className="w-4 h-4 inline mr-1" />
          Select multiple destinations to create your custom route
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {allDestinations.map((dest) => {
          const isSelected = formData.destinations.find(d => d.id === dest.id);
          return (
            <button
              key={dest.id}
              onClick={() => {
                if (isSelected) {
                  updateForm('destinations', formData.destinations.filter(d => d.id !== dest.id));
                } else {
                  updateForm('destinations', [...formData.destinations, { id: dest.id, nights: 2 }]);
                }
              }}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h4 className="font-medium text-gray-900">{dest.name}</h4>
              {isSelected && (
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={isSelected.nights}
                  onChange={(e) => {
                    const nights = parseInt(e.target.value);
                    updateForm('destinations', 
                      formData.destinations.map(d => 
                        d.id === dest.id ? { ...d, nights } : d
                      )
                    );
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 w-20 text-sm border rounded px-2 py-1"
                  placeholder="Nights"
                />
              )}
            </button>
          );
        })}
      </div>
      {formData.destinations.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Your Route:</h5>
          <p className="text-blue-600">
            {formData.origin} → {formData.destinations.map(d => destinations[d.id]?.name).join(' → ')}
          </p>
        </div>
      )}
    </div>
  );

  const renderSingleCity = () => renderFixedPackage();
  
  const renderCustom = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Nights)</label>
          <input
            type="number"
            min="1"
            max="30"
            value={formData.nights}
            onChange={(e) => updateForm('nights', parseInt(e.target.value))}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
          <input
            type="range"
            min="5000"
            max="200000"
            step="5000"
            value={formData.budget}
            onChange={(e) => updateForm('budget', parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-center text-blue-600 font-medium">₹{formData.budget.toLocaleString()}</p>
        </div>
      </div>
      {renderFixedPackage()}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {formData.tourType === 'state' ? 'Select a State' : 
           formData.tourType === 'multi' ? 'Build Your Route' :
           formData.tourType === 'custom' ? 'Customize Your Trip' :
           'Choose Your Destination'}
        </h3>
      </div>
      
      {formData.tourType === 'state' && renderStateWise()}
      {formData.tourType === 'multi' && renderMultiDestination()}
      {formData.tourType === 'single' && renderSingleCity()}
      {formData.tourType === 'custom' && renderCustom()}
      {(formData.tourType === 'fixed' || !formData.tourType) && renderFixedPackage()}
    </div>
  );
}

// Step 3: Trip Details
function DetailsStep({ formData, updateForm }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Trip Details</h3>
        <p className="text-gray-500">Tell us about your travel plans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Origin City
          </label>
          <select
            value={formData.origin}
            onChange={(e) => updateForm('origin', e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Chennai">Chennai</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Travel Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => updateForm('startDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Number of Guests
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateForm('guests', Math.max(1, formData.guests - 1))}
              className="w-10 h-10 rounded-full border hover:bg-gray-100"
            >
              -
            </button>
            <span className="text-xl font-semibold w-8 text-center">{formData.guests}</span>
            <button
              onClick={() => updateForm('guests', formData.guests + 1)}
              className="w-10 h-10 rounded-full border hover:bg-gray-100"
            >
              +
            </button>
          </div>
          {formData.guests > 7 && (
            <p className="text-amber-600 text-sm mt-2 flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              For group discounts contact 📞 +91-98765-43210
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hotel className="w-4 h-4 inline mr-1" />
            Rooms Required
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateForm('rooms', Math.max(1, formData.rooms - 1))}
              className="w-10 h-10 rounded-full border hover:bg-gray-100"
            >
              -
            </button>
            <span className="text-xl font-semibold w-8 text-center">{formData.rooms}</span>
            <button
              onClick={() => updateForm('rooms', formData.rooms + 1)}
              className="w-10 h-10 rounded-full border hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Season info */}
      {formData.destination && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Destination Insights</h4>
          {(() => {
            const dest = destinations[formData.destination];
            if (!dest) return null;
            return (
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Best Time:</strong> {dest.bestMonths.join(', ')}</p>
                <p><strong>Climate:</strong> {dest.climate.type}</p>
                <p><strong>Peak Season:</strong> {dest.peakSeason.months.join(', ')} (Price multiplier: {dest.peakSeason.multiplier}x)</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Step 4: Preferences
function PreferencesStep({ formData, updateForm }) {
  const recommendations = getBudgetRecommendations(formData.budget, { 
    passengers: formData.guests, 
    nights: formData.nights 
  });

  const getTransportClassOptions = () => {
    switch (formData.transportType) {
      case 'train':
        return [
          { id: 'sleeper', label: 'Sleeper Class' },
          { id: 'ac3', label: 'AC 3 Tier' },
          { id: 'ac2', label: 'AC 2 Tier' },
          { id: 'ac1', label: 'AC First Class' }
        ];
      case 'bus':
        return [
          { id: 'ordinary', label: 'Ordinary' },
          { id: 'ac', label: 'AC Bus' },
          { id: 'volvo', label: 'Volvo' },
          { id: 'luxury', label: 'Luxury' }
        ];
      case 'car':
        return [
          { id: 'hatchback', label: 'Hatchback' },
          { id: 'sedan', label: 'Sedan' },
          { id: 'suv', label: 'SUV' },
          { id: 'luxury', label: 'Luxury' }
        ];
      case 'bike':
        return [
          { id: 'scooter', label: 'Scooter' },
          { id: 'motorcycle', label: 'Motorcycle' },
          { id: 'premium', label: 'Premium Bike' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Travel Preferences</h3>
        <p className="text-gray-500">Customize your travel experience</p>
      </div>

      {/* Smart Suggestions */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">Smart Suggestions for Your Budget</h4>
            <p className="text-sm text-amber-800 mt-1">
              Based on ₹{formData.budget.toLocaleString()}, we recommend:
            </p>
            <ul className="text-sm text-amber-800 mt-2 space-y-1">
              <li>• Transport: {recommendations.transport.type === 'flight' ? 'Flight' : 
                  recommendations.transport.type === 'train' ? 'AC Train' : 'AC Bus'}</li>
              <li>• Hotel: {hotelRates[recommendations.hotel.stars].name}</li>
              <li>• Activities: {recommendations.activities.join(', ')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transport Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Mode of Transport</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {TRANSPORT_OPTIONS.map((transport) => (
            <button
              key={transport.id}
              onClick={() => {
                updateForm('transportType', transport.id);
                // Set default class
                if (transport.id === 'flight') updateForm('transportClass', null);
                else if (transport.id === 'train') updateForm('transportClass', 'ac3');
                else if (transport.id === 'bus') updateForm('transportClass', 'ac');
                else if (transport.id === 'car') updateForm('transportClass', 'sedan');
                else if (transport.id === 'bike') updateForm('transportClass', 'motorcycle');
              }}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                formData.transportType === transport.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <transport.icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-sm">{transport.label}</p>
              <p className="text-xs text-gray-500">{transport.description}</p>
            </button>
          ))}
        </div>

        {/* Transport Class Selection */}
        {formData.transportType !== 'flight' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Class/Type</label>
            <div className="flex flex-wrap gap-2">
              {getTransportClassOptions().map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateForm('transportClass', option.id)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    formData.transportClass === option.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hotel Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Hotel Category</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {HOTEL_OPTIONS.map((hotel) => (
            <button
              key={hotel.stars}
              onClick={() => updateForm('hotelStars', hotel.stars)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.hotelStars === hotel.stars
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                {[...Array(parseInt(hotel.stars))].map((_, i) => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="font-medium text-sm">{hotel.label}</p>
              <p className="text-xs text-gray-500">{hotel.description}</p>
              <p className="text-xs text-blue-600 mt-1">{hotel.priceLabel}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Meal Plan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meal Plan</label>
        <select
          value={formData.mealPlan}
          onChange={(e) => updateForm('mealPlan', e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="cp">CP - Breakfast Only</option>
          <option value="map">MAP - Breakfast & Dinner</option>
          <option value="ap">AP - All Meals</option>
        </select>
      </div>

      {/* Price Preview */}
      {formData.priceBreakdown && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Price Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transport</span>
              <span>₹{formData.priceBreakdown.breakdown.transport.cost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hotel ({formData.nights} nights)</span>
              <span>₹{formData.priceBreakdown.breakdown.hotel.cost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Activities</span>
              <span>₹{formData.priceBreakdown.breakdown.activities.cost.toLocaleString()}</span>
            </div>
            {formData.priceBreakdown.breakdown.seasonal.adjustment !== 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Seasonal Adjustment ({formData.priceBreakdown.breakdown.seasonal.multiplier}x)</span>
                <span>₹{formData.priceBreakdown.breakdown.seasonal.adjustment.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">GST (5%)</span>
              <span>₹{formData.priceBreakdown.breakdown.gst.amount.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-blue-600">₹{formData.priceBreakdown.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>50% Down Payment</span>
              <span>₹{formData.priceBreakdown.downPayment.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 5: Lead Form
function LeadFormStep({ formData, updateForm, priceBreakdown, groupDiscountMessage }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Almost There!</h3>
        <p className="text-gray-500">Enter your details to proceed with booking</p>
      </div>

      {/* Price Summary */}
      {priceBreakdown && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-4">Booking Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Trip Type</p>
              <p className="font-medium text-blue-900 capitalize">{formData.tourType} Package</p>
            </div>
            <div>
              <p className="text-blue-700">Destination</p>
              <p className="font-medium text-blue-900">
                {formData.destination ? destinations[formData.destination]?.name : formData.state}
              </p>
            </div>
            <div>
              <p className="text-blue-700">Guests</p>
              <p className="font-medium text-blue-900">{formData.guests} persons</p>
            </div>
            <div>
              <p className="text-blue-700">Duration</p>
              <p className="font-medium text-blue-900">{formData.nights} nights</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Total Amount</span>
              <span className="text-2xl font-bold text-blue-900">₹{priceBreakdown.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-green-700">Pay Now (50%)</span>
              <span className="text-xl font-semibold text-green-700">₹{priceBreakdown.downPayment.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateForm('email', e.target.value)}
            placeholder="your@email.com"
            className="w-full border rounded-lg px-4 py-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateForm('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full border rounded-lg px-4 py-3"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Pickup Location
        </label>
        <input
          type="text"
          value={formData.pickupLocation}
          onChange={(e) => updateForm('pickupLocation', e.target.value)}
          placeholder="Enter your pickup address"
          className="w-full border rounded-lg px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests
        </label>
        <textarea
          value={formData.specialRequests}
          onChange={(e) => updateForm('specialRequests', e.target.value)}
          placeholder="Any special requirements, dietary preferences, etc."
          rows={3}
          className="w-full border rounded-lg px-4 py-3"
        />
      </div>

      {/* Group Discount Notice */}
      {groupDiscountMessage && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Group Booking Detected!</p>
            <p className="text-sm text-amber-800">{groupDiscountMessage}</p>
          </div>
        </div>
      )}

      {/* Policies */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-green-600 mt-0.5" />
          <p className="text-gray-600">
            <strong>Cancellation Policy:</strong> 10% cancellation charge applies to all bookings. 
            Free rescheduling up to 7 days before travel.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CreditCard className="w-4 h-4 text-blue-600 mt-0.5" />
          <p className="text-gray-600">
            <strong>Payment Terms:</strong> 50% down payment required to confirm booking. 
            Balance due 7 days before departure.
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 6: Payment
function PaymentStep({ formData, onComplete }) {
  return (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      
      <h3 className="text-2xl font-semibold text-gray-900">Booking Confirmed!</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Your trip details have been saved. Proceed to payment to confirm your booking.
      </p>

      {formData.priceBreakdown && (
        <div className="bg-gray-50 p-6 rounded-xl max-w-md mx-auto">
          <p className="text-gray-600 mb-2">Amount to Pay Now (50%)</p>
          <p className="text-4xl font-bold text-blue-600">
            ₹{formData.priceBreakdown.downPayment.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Balance ₹{formData.priceBreakdown.remainingAmount.toLocaleString()} due 7 days before travel
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Proceed to Payment
        </button>
      </div>

      <p className="text-sm text-gray-400">
        Secure payment powered by Razorpay
      </p>
    </div>
  );
}

// Comparison Modal
function ComparisonModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-semibold">Compare Options</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            {['budget', 'standard', 'premium', 'luxury'].map((tier) => (
              <div key={tier} className="border rounded-xl p-4">
                <h4 className="font-semibold capitalize text-lg mb-2">{tier}</h4>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{data[tier]?.total?.toLocaleString()}
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-gray-600">
                    <strong>Hotel:</strong> {data[tier]?.breakdown?.hotel?.stars}★
                  </p>
                  <p className="text-gray-600">
                    <strong>Transport:</strong> {data[tier]?.breakdown?.transport?.type}
                  </p>
                  <p className="text-gray-600">
                    <strong>Activities:</strong> ₹{data[tier]?.breakdown?.activities?.cost?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
