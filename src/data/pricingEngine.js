/**
 * Dynamic Pricing Engine
 * Calculates tour prices based on transport, hotels, budget, and seasonal factors
 */

import { destinations, getSeasonalMultiplier } from './destinations';

// Transport pricing per km (in INR)
export const transportRates = {
  flight: { baseRate: 2500, perKm: 4.5, minCost: 3500, timePerKm: 0.012 }, // Domestic flights
  train: { 
    sleeper: { baseRate: 500, perKm: 0.8, minCost: 800, timePerKm: 0.025 },
    ac3: { baseRate: 800, perKm: 1.2, minCost: 1200, timePerKm: 0.025 },
    ac2: { baseRate: 1200, perKm: 1.8, minCost: 1800, timePerKm: 0.025 },
    ac1: { baseRate: 2000, perKm: 3, minCost: 3000, timePerKm: 0.025 }
  },
  bus: {
    ordinary: { baseRate: 300, perKm: 0.5, minCost: 500, timePerKm: 0.035 },
    ac: { baseRate: 500, perKm: 0.9, minCost: 800, timePerKm: 0.035 },
    volvo: { baseRate: 700, perKm: 1.3, minCost: 1000, timePerKm: 0.035 },
    luxury: { baseRate: 1000, perKm: 2, minCost: 1500, timePerKm: 0.035 }
  },
  car: {
    hatchback: { baseRate: 1500, perKm: 8, minCost: 2000, timePerKm: 0.02 },
    sedan: { baseRate: 2000, perKm: 12, minCost: 3000, timePerKm: 0.02 },
    suv: { baseRate: 3000, perKm: 18, minCost: 4500, timePerKm: 0.02 },
    luxury: { baseRate: 5000, perKm: 30, minCost: 8000, timePerKm: 0.02 }
  },
  bike: {
    scooter: { baseRate: 400, perKm: 3, minCost: 600, timePerKm: 0.03 },
    motorcycle: { baseRate: 600, perKm: 4, minCost: 800, timePerKm: 0.025 },
    premium: { baseRate: 1000, perKm: 6, minCost: 1500, timePerKm: 0.025 }
  }
};

// Hotel pricing per night (in INR) - per room
export const hotelRates = {
  '2': {
    name: 'Budget (2★)',
    baseRate: 1200,
    amenities: ['Basic Room', 'TV', 'Attached Bath'],
    mealCost: { breakfast: 150, lunch: 250, dinner: 300 }
  },
  '3': {
    name: 'Standard (3★)',
    baseRate: 2500,
    amenities: ['AC Room', 'TV', 'WiFi', 'Restaurant'],
    mealCost: { breakfast: 300, lunch: 500, dinner: 600 }
  },
  '4': {
    name: 'Premium (4★)',
    baseRate: 5000,
    amenities: ['Luxury Room', 'Pool', 'Gym', 'Spa', 'Fine Dining'],
    mealCost: { breakfast: 500, lunch: 800, dinner: 1000 }
  },
  '5': {
    name: 'Luxury (5★)',
    baseRate: 10000,
    amenities: ['Suite', 'Pool', 'Spa', 'Butler Service', 'Multiple Restaurants'],
    mealCost: { breakfast: 800, lunch: 1200, dinner: 1500 }
  }
};

// Activity pricing (in INR per person)
export const activityRates = {
  sightseeing: { min: 500, max: 2000 },
  adventure: { min: 1500, max: 5000 },
  waterSports: { min: 1000, max: 4000 },
  cultural: { min: 300, max: 1500 },
  wildlife: { min: 1000, max: 3000 },
  luxury: { min: 3000, max: 10000 }
};

// Distance matrix (approximate km between major cities)
export const distanceMatrix = {
  'Delhi': { 'Shimla': 350, 'Manali': 550, 'Jaipur': 280, 'Agra': 230, 'Chandigarh': 250, 'Dehradun': 250 },
  'Mumbai': { 'Goa': 590, 'Pune': 150, 'Ahmedabad': 530, 'Udaipur': 760, 'Indore': 590 },
  'Bangalore': { 'Goa': 560, 'Chennai': 350, 'Hyderabad': 570, 'Kochi': 550, 'Mysore': 145 },
  'Chennai': { 'Bangalore': 350, 'Hyderabad': 630, 'Kochi': 690, 'Pondicherry': 170 },
  'Kolkata': { 'Bhubaneswar': 440, 'Ranchi': 330, 'Patna': 580, 'Guwahati': 1020 },
  'Hyderabad': { 'Bangalore': 570, 'Chennai': 630, 'Pune': 560, 'Nagpur': 500 },
  'Jaipur': { 'Delhi': 280, 'Udaipur': 400, 'Jaisalmer': 570, 'Jodhpur': 350, 'Agra': 240 },
  'Chandigarh': { 'Delhi': 250, 'Shimla': 115, 'Manali': 310, 'Amritsar': 230 },
  'Srinagar': { 'Jammu': 300, 'Leh': 420, 'Gulmarg': 50, 'Pahalgam': 95 },
  'Leh': { 'Srinagar': 420, 'Manali': 470, 'Nubra': 150, 'Pangong': 160 }
};

// Budget ranges (in INR)
export const budgetRanges = {
  low: { min: 5000, max: 20000, label: 'Budget Friendly' },
  medium: { min: 20000, max: 50000, label: 'Standard' },
  high: { min: 50000, max: 100000, label: 'Premium' },
  luxury: { min: 100000, max: 500000, label: 'Luxury' }
};

/**
 * Calculate transport cost
 */
export function calculateTransportCost(from, to, transportType, transportClass = null, passengers = 1) {
  // Get distance
  let distance = 0;
  if (distanceMatrix[from] && distanceMatrix[from][to]) {
    distance = distanceMatrix[from][to];
  } else if (distanceMatrix[to] && distanceMatrix[to][from]) {
    distance = distanceMatrix[to][from];
  } else {
    // Estimate based on city types
    distance = estimateDistance(from, to);
  }

  let rateConfig;
  if (transportType === 'flight') {
    rateConfig = transportRates.flight;
  } else if (transportType === 'train') {
    rateConfig = transportRates.train[transportClass] || transportRates.train.ac3;
  } else if (transportType === 'bus') {
    rateConfig = transportRates.bus[transportClass] || transportRates.bus.ac;
  } else if (transportType === 'car') {
    rateConfig = transportRates.car[transportClass] || transportRates.car.sedan;
  } else if (transportType === 'bike') {
    rateConfig = transportRates.bike[transportClass] || transportRates.bike.motorcycle;
  } else {
    rateConfig = transportRates.bus.ac;
  }

  const cost = Math.max(rateConfig.minCost, rateConfig.baseRate + (distance * rateConfig.perKm));
  const travelTime = distance * rateConfig.timePerKm; // in hours

  return {
    cost: Math.round(cost * passengers),
    distance,
    travelTime: Math.round(travelTime * 10) / 10,
    perPerson: Math.round(cost)
  };
}

/**
 * Estimate distance when not in matrix
 */
function estimateDistance(from, to) {
  // Check if international
  const internationalCities = ['Switzerland', 'Iceland', 'Dubai', 'Maldives', 'Thailand', 'Bali', 'Singapore', 'Vietnam'];
  if (internationalCities.includes(from) || internationalCities.includes(to)) {
    return 3000; // Assume international flight
  }
  return 500; // Default domestic distance
}

/**
 * Calculate hotel cost
 */
export function calculateHotelCost(starRating, nights, rooms = 1, mealPlan = 'cp') {
  const hotel = hotelRates[starRating] || hotelRates['3'];
  let roomCost = hotel.baseRate * nights * rooms;
  
  // Meal plan adjustments
  let mealCost = 0;
  if (mealPlan === 'cp') { // Continental Plan - Breakfast included
    mealCost = hotel.mealCost.breakfast * nights * rooms * 2; // 2 people per room
  } else if (mealPlan === 'map') { // Modified American Plan - Breakfast + Dinner
    mealCost = (hotel.mealCost.breakfast + hotel.mealCost.dinner) * nights * rooms * 2;
  } else if (mealPlan === 'ap') { // American Plan - All meals
    mealCost = (hotel.mealCost.breakfast + hotel.mealCost.lunch + hotel.mealCost.dinner) * nights * rooms * 2;
  }

  return {
    roomCost: Math.round(roomCost),
    mealCost: Math.round(mealCost),
    total: Math.round(roomCost + mealCost),
    perNight: Math.round(hotel.baseRate),
    amenities: hotel.amenities
  };
}

/**
 * Calculate activity cost
 */
export function calculateActivityCost(activityTypes, days, passengers = 1) {
  let totalCost = 0;
  const breakdown = [];

  activityTypes.forEach(type => {
    const rate = activityRates[type] || activityRates.sightseeing;
    const dailyCost = (rate.min + rate.max) / 2;
    const cost = dailyCost * days * passengers;
    totalCost += cost;
    breakdown.push({ type, cost: Math.round(cost) });
  });

  return {
    total: Math.round(totalCost),
    breakdown,
    perPerson: Math.round(totalCost / passengers)
  };
}

/**
 * Get budget-based recommendations
 */
export function getBudgetRecommendations(budget, passengers = 1, nights = 3) {
  const perPersonBudget = budget / passengers;
  const perNightBudget = perPersonBudget / nights;

  let recommendations = {
    transport: { type: 'bus', class: 'ac' },
    hotel: { stars: '3' },
    activities: ['sightseeing', 'cultural'],
    mealPlan: 'cp'
  };

  if (perPersonBudget <= 20000) {
    // Low Budget
    recommendations = {
      transport: { type: 'bus', class: 'ordinary' },
      hotel: { stars: '2' },
      activities: ['sightseeing'],
      mealPlan: 'cp'
    };
  } else if (perPersonBudget <= 50000) {
    // Medium Budget
    recommendations = {
      transport: { type: 'train', class: 'ac3' },
      hotel: { stars: '3' },
      activities: ['sightseeing', 'cultural', 'adventure'],
      mealPlan: 'cp'
    };
  } else if (perPersonBudget <= 100000) {
    // High Budget
    recommendations = {
      transport: { type: 'flight' },
      hotel: { stars: '4' },
      activities: ['sightseeing', 'adventure', 'waterSports'],
      mealPlan: 'map'
    };
  } else {
    // Luxury
    recommendations = {
      transport: { type: 'flight' },
      hotel: { stars: '5' },
      activities: ['sightseeing', 'adventure', 'luxury'],
      mealPlan: 'ap'
    };
  }

  return recommendations;
}

/**
 * Main pricing calculation function
 */
export function calculateTourPrice(config) {
  const {
    origin,
    destination,
    destinations = [], // For multi-destination
    transportType,
    transportClass,
    hotelStars,
    nights,
    passengers = 1,
    rooms = 1,
    mealPlan = 'cp',
    activityTypes = ['sightseeing'],
    travelMonth = new Date().getMonth() + 1,
    isInternational = false
  } = config;

  let totalTransportCost = 0;
  let totalDistance = 0;
  let totalTravelTime = 0;

  // Calculate transport for all legs
  if (destinations.length > 0) {
    // Multi-destination tour
    let currentOrigin = origin;
    destinations.forEach(dest => {
      const destData = destinations[dest.id] || { name: dest.name };
      const destName = destData.name || dest.name;
      const transport = calculateTransportCost(currentOrigin, destName, transportType, transportClass, passengers);
      totalTransportCost += transport.cost;
      totalDistance += transport.distance;
      totalTravelTime += transport.travelTime;
      currentOrigin = destName;
    });
  } else {
    // Single destination
    const destData = destinations[destination] || { name: destination };
    const destName = destData.name || destination;
    const transport = calculateTransportCost(origin, destName, transportType, transportClass, passengers);
    totalTransportCost = transport.cost;
    totalDistance = transport.distance;
    totalTravelTime = transport.travelTime;
  }

  // Calculate hotel cost
  const hotel = calculateHotelCost(hotelStars, nights, rooms, mealPlan);

  // Calculate activity cost
  const activities = calculateActivityCost(activityTypes, nights, passengers);

  // Get seasonal multiplier
  const seasonalMultiplier = getSeasonalMultiplier(destination, travelMonth);

  // Calculate subtotal
  const subtotal = totalTransportCost + hotel.total + activities.total;
  
  // Apply seasonal adjustment
  const seasonalAdjustment = Math.round(subtotal * (seasonalMultiplier - 1));
  
  // Calculate GST (5% for tourism)
  const gstRate = 0.05;
  const gstAmount = Math.round((subtotal + seasonalAdjustment) * gstRate);
  
  // Total
  const total = subtotal + seasonalAdjustment + gstAmount;

  // Calculate down payment (50%)
  const downPayment = Math.round(total * 0.5);
  const remainingAmount = total - downPayment;

  return {
    breakdown: {
      transport: {
        cost: totalTransportCost,
        distance: totalDistance,
        travelTime: totalTravelTime,
        type: transportType,
        class: transportClass
      },
      hotel: {
        cost: hotel.total,
        roomCost: hotel.roomCost,
        mealCost: hotel.mealCost,
        stars: hotelStars,
        amenities: hotel.amenities
      },
      activities: {
        cost: activities.total,
        breakdown: activities.breakdown
      },
      seasonal: {
        multiplier: seasonalMultiplier,
        adjustment: seasonalAdjustment
      },
      gst: {
        rate: '5%',
        amount: gstAmount
      }
    },
    subtotal,
    total,
    downPayment,
    remainingAmount,
    perPerson: Math.round(total / passengers)
  };
}

/**
 * Get smart suggestions based on budget
 */
export function getSmartSuggestions(budget, preferences = {}) {
  const { passengers = 2, nights = 3 } = preferences;
  const recommendations = getBudgetRecommendations(budget, passengers, nights);
  
  const suggestions = [];

  // Transport suggestions
  if (recommendations.transport.type === 'flight') {
    suggestions.push({
      type: 'transport',
      title: 'Fly to Save Time',
      description: 'With your budget, flights are recommended for destinations over 500km',
      savings: 'Save 8-12 hours of travel time'
    });
  } else if (recommendations.transport.type === 'train') {
    suggestions.push({
      type: 'transport',
      title: 'Comfortable Train Journey',
      description: 'AC trains offer great value with comfortable overnight travel',
      savings: 'Save on one night hotel cost'
    });
  }

  // Hotel suggestions
  const hotelStar = recommendations.hotel.stars;
  suggestions.push({
    type: 'hotel',
    title: `${hotelRates[hotelStar].name} Hotels`,
    description: `Best value hotels with ${hotelRates[hotelStar].amenities.slice(0, 3).join(', ')}`,
    savings: hotelStar === '2' ? 'Most economical option' : hotelStar === '5' ? 'Premium luxury experience' : 'Great balance of comfort and price'
  });

  // Activity suggestions
  if (recommendations.activities.includes('adventure')) {
    suggestions.push({
      type: 'activity',
      title: 'Adventure Activities Included',
      description: 'Your budget allows for exciting adventure sports',
      savings: 'Bundle activities for 15% savings'
    });
  }

  return suggestions;
}

/**
 * Compare budget vs premium options
 */
export function compareTourOptions(config) {
  const budgetConfig = { ...config, hotelStars: '2', transportType: 'bus', transportClass: 'ordinary' };
  const standardConfig = { ...config, hotelStars: '3', transportType: 'train', transportClass: 'ac3' };
  const premiumConfig = { ...config, hotelStars: '4', transportType: 'flight' };
  const luxuryConfig = { ...config, hotelStars: '5', transportType: 'flight' };

  return {
    budget: calculateTourPrice(budgetConfig),
    standard: calculateTourPrice(standardConfig),
    premium: calculateTourPrice(premiumConfig),
    luxury: calculateTourPrice(luxuryConfig)
  };
}

export default {
  calculateTourPrice,
  calculateTransportCost,
  calculateHotelCost,
  calculateActivityCost,
  getBudgetRecommendations,
  getSmartSuggestions,
  compareTourOptions,
  transportRates,
  hotelRates,
  activityRates,
  budgetRanges
};
