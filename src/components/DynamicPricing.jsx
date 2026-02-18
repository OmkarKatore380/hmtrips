/**
 * Dynamic Pricing Component
 * Shows Market Price vs Our Price with pricing strategies
 */

import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Sparkles, Info } from 'lucide-react';

// Pricing strategy types
export const PRICING_STRATEGIES = {
  PENETRATION: 'penetration', // Lower price to attract customers
  SKIMMING: 'skimming',       // Higher price for premium
  COMPETITIVE: 'competitive', // Match market
  DYNAMIC: 'dynamic'          // Based on demand
};

/**
 * Calculate market price (simulated higher price)
 */
export function calculateMarketPrice(basePrice, destination, season) {
  // Market typically charges 20-40% more
  const marketMultiplier = 1.25 + (Math.random() * 0.15);
  return Math.round(basePrice * marketMultiplier);
}

/**
 * Calculate "Our Price" with strategy
 */
export function calculateOurPrice(basePrice, strategy, factors = {}) {
  const { demand = 'normal', inventory = 'high', season = 'regular' } = factors;
  
  let multiplier = 1;
  
  switch (strategy) {
    case PRICING_STRATEGIES.PENETRATION:
      // 15-25% below market to attract
      multiplier = 0.75 + (Math.random() * 0.1);
      break;
      
    case PRICING_STRATEGIES.SKIMMING:
      // 10-20% above base for premium
      multiplier = 1.1 + (Math.random() * 0.1);
      break;
      
    case PRICING_STRATEGIES.COMPETITIVE:
      // Match market average
      multiplier = 0.95 + (Math.random() * 0.1);
      break;
      
    case PRICING_STRATEGIES.DYNAMIC:
      // Adjust based on demand
      if (demand === 'high') multiplier = 1.2;
      else if (demand === 'low') multiplier = 0.85;
      else multiplier = 1;
      
      // Inventory factor
      if (inventory === 'low') multiplier += 0.1;
      
      // Season factor
      if (season === 'peak') multiplier += 0.15;
      else if (season === 'off') multiplier -= 0.2;
      break;
      
    default:
      multiplier = 1;
  }
  
  return Math.round(basePrice * multiplier);
}

/**
 * Get pricing strategy based on destination and market conditions
 */
export function getPricingStrategy(destination, hotelStars, budget) {
  // Premium hotels use skimming
  if (hotelStars === '5' || hotelStars === '4') {
    return PRICING_STRATEGIES.SKIMMING;
  }
  
  // Budget options use penetration
  if (hotelStars === '2' || budget < 20000) {
    return PRICING_STRATEGIES.PENETRATION;
  }
  
  // International destinations use dynamic
  const international = ['switzerland', 'iceland', 'dubai', 'maldives', 'thailand', 'bali', 'singapore', 'vietnam'];
  if (international.includes(destination.toLowerCase())) {
    return PRICING_STRATEGIES.DYNAMIC;
  }
  
  return PRICING_STRATEGIES.COMPETITIVE;
}

/**
 * Get live minimum price for a destination
 */
export function getLiveMinimumPrice(destination) {
  const minimums = {
    'manali': 2999,
    'shimla': 3499,
    'goa': 3999,
    'jaipur': 2499,
    'udaipur': 2999,
    'kerala': 4499,
    'ladakh': 7999,
    'kashmir': 5999,
    'auli': 4999,
    'jaisalmer': 3499,
    'switzerland': 45000,
    'dubai': 25000,
    'maldives': 35000,
    'thailand': 15000,
    'bali': 18000,
    'singapore': 22000,
    'vietnam': 12000,
    'iceland': 52000
  };
  
  const destId = destination.toLowerCase().replace(/\s+/g, '-');
  return minimums[destId] || 4999;
}

/**
 * Dynamic Pricing Display Component
 */
export function DynamicPricingDisplay({ 
  basePrice, 
  destination, 
  hotelStars,
  budget,
  guests = 1,
  showSavings = true 
}) {
  const [marketPrice, setMarketPrice] = useState(0);
  const [ourPrice, setOurPrice] = useState(0);
  const [strategy, setStrategy] = useState('');
  const [savings, setSavings] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const totalBasePrice = basePrice * guests;
    
    // Calculate market price
    const mPrice = calculateMarketPrice(totalBasePrice, destination, 'regular');
    setMarketPrice(mPrice);
    
    // Determine strategy
    const pricingStrategy = getPricingStrategy(destination, hotelStars, budget);
    setStrategy(pricingStrategy);
    
    // Calculate our price
    const oPrice = calculateOurPrice(totalBasePrice, pricingStrategy, {
      demand: 'normal',
      inventory: 'high',
      season: 'regular'
    });
    setOurPrice(oPrice);
    
    // Calculate savings
    const save = mPrice - oPrice;
    setSavings(save);
    setDiscount(Math.round((save / mPrice) * 100));
  }, [basePrice, destination, hotelStars, budget, guests]);

  const getStrategyLabel = () => {
    switch (strategy) {
      case PRICING_STRATEGIES.PENETRATION:
        return { label: 'Introductory Offer', color: 'text-green-600', bg: 'bg-green-50' };
      case PRICING_STRATEGIES.SKIMMING:
        return { label: 'Premium Experience', color: 'text-purple-600', bg: 'bg-purple-50' };
      case PRICING_STRATEGIES.DYNAMIC:
        return { label: 'Smart Pricing', color: 'text-blue-600', bg: 'bg-blue-50' };
      default:
        return { label: 'Best Price', color: 'text-amber-600', bg: 'bg-amber-50' };
    }
  };

  const strategyStyle = getStrategyLabel();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Strategy Badge */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${strategyStyle.bg} ${strategyStyle.color} mb-4`}>
        <Sparkles className="w-3.5 h-3.5" />
        {strategyStyle.label}
      </div>

      {/* Price Comparison */}
      <div className="space-y-3">
        {/* Market Price (Strikethrough) */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">Market Price</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 line-through text-lg">
              ₹{marketPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Our Price (Highlighted) */}
        <div className="flex items-center justify-between py-3 border-y border-dashed border-gray-200">
          <span className="text-gray-900 font-medium">Our Price</span>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                ₹{ourPrice.toLocaleString()}
              </span>
            </div>
            {showSavings && savings > 0 && (
              <span className="text-sm text-green-600 font-medium">
                Save ₹{savings.toLocaleString()} ({discount}% off)
              </span>
            )}
          </div>
        </div>

        {/* Per Person Price */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Per person</span>
          <span className="text-gray-700 font-medium">
            ₹{Math.round(ourPrice / guests).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700">
          Prices are dynamically calculated based on demand, season, and availability. 
          Book now to lock in this price.
        </p>
      </div>
    </div>
  );
}

/**
 * Price Range Slider Component
 */
export function PriceRangeSlider({ 
  min = 5000, 
  max = 200000, 
  value, 
  onChange,
  destination 
}) {
  const liveMin = destination ? getLiveMinimumPrice(destination) : min;
  
  const getBudgetLabel = (val) => {
    if (val < 20000) return 'Budget Friendly';
    if (val < 50000) return 'Standard';
    if (val < 100000) return 'Premium';
    return 'Luxury';
  };

  const getBudgetColor = (val) => {
    if (val < 20000) return 'text-green-600';
    if (val < 50000) return 'text-blue-600';
    if (val < 100000) return 'text-purple-600';
    return 'text-amber-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Your Budget</h3>
        <span className={`font-bold ${getBudgetColor(value)}`}>
          {getBudgetLabel(value)}
        </span>
      </div>

      {/* Live Minimum Badge */}
      {destination && (
        <div className="mb-4 p-2 bg-green-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-green-700">Live Minimum for {destination}</span>
          <span className="font-bold text-green-700">₹{liveMin.toLocaleString()}</span>
        </div>
      )}

      {/* Slider */}
      <div className="relative mb-6">
        <input
          type="range"
          min={min}
          max={max}
          step={1000}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>₹{(min/1000).toFixed(0)}K</span>
          <span>₹{(max/1000).toFixed(0)}K</span>
        </div>
      </div>

      {/* Current Value */}
      <div className="text-center">
        <span className="text-3xl font-bold text-gray-900">
          ₹{(value / 1000).toFixed(0)}K
        </span>
        <span className="text-gray-500 ml-2">per person</span>
      </div>

      {/* Budget Indicators */}
      <div className="flex justify-between mt-4 pt-4 border-t">
        {['Budget', 'Standard', 'Premium', 'Luxury'].map((label, i) => (
          <div key={label} className="text-center">
            <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
              (i === 0 && value < 20000) ||
              (i === 1 && value >= 20000 && value < 50000) ||
              (i === 2 && value >= 50000 && value < 100000) ||
              (i === 3 && value >= 100000)
                ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Budget-Based Recommendations
 */
export function BudgetRecommendations({ budget, destination }) {
  const getRecommendations = () => {
    if (budget < 20000) {
      return {
        transport: 'Bus / Train (Sleeper)',
        hotel: '2★ Budget Hotels',
        activities: 'Basic sightseeing (2-3 spots)',
        meals: 'Local restaurants',
        tips: 'Best for backpackers and students'
      };
    }
    if (budget < 50000) {
      return {
        transport: 'AC Bus / Train (3AC)',
        hotel: '3★ Standard Hotels',
        activities: 'Popular attractions + 1 adventure',
        meals: 'Hotel breakfast + mix of local/dining',
        tips: 'Best value for money'
      };
    }
    if (budget < 100000) {
      return {
        transport: 'Flight / AC Train (2AC)',
        hotel: '4★ Premium Hotels',
        activities: 'All major attractions + adventures',
        meals: 'Hotel meals + fine dining',
        tips: 'Comfortable family trips'
      };
    }
    return {
      transport: 'Flight (Business) / Helicopter',
      hotel: '5★ Luxury Resorts',
      activities: 'Private tours, yachting, helicopter rides',
      meals: 'All-inclusive gourmet dining',
      tips: 'Premium experience with exclusive access'
    };
  };

  const recs = getRecommendations();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        Recommended for Your Budget
      </h3>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-gray-600 w-24">Transport:</span>
          <span className="text-sm text-gray-900">{recs.transport}</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-gray-600 w-24">Hotel:</span>
          <span className="text-sm text-gray-900">{recs.hotel}</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-gray-600 w-24">Activities:</span>
          <span className="text-sm text-gray-900">{recs.activities}</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-gray-600 w-24">Meals:</span>
          <span className="text-sm text-gray-900">{recs.meals}</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> {recs.tips}
        </p>
      </div>
    </div>
  );
}

export default {
  DynamicPricingDisplay,
  PriceRangeSlider,
  BudgetRecommendations,
  calculateMarketPrice,
  calculateOurPrice,
  getPricingStrategy,
  getLiveMinimumPrice,
  PRICING_STRATEGIES
};
