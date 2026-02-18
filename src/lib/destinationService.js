/**
 * Destination Service
 * Handles CRUD operations for destinations via Firestore
 * This allows dynamic destination management without code changes
 */

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from './firebase';

const DESTINATIONS_COLLECTION = 'destinations';
const TOURS_COLLECTION = 'tours';

/**
 * Destination Schema (for reference):
 * {
 *   id: string,
 *   name: string,
 *   state: string,
 *   country: string,
 *   type: 'hill-station' | 'beach-destination' | 'heritage-city' | 'desert-city' | etc.,
 *   description: string,
 *   climate: {
 *     type: string,
 *     summer: { temp: string, months: string },
 *     winter: { temp: string, months: string },
 *     monsoon: { temp: string, months: string }
 *   },
 *   bestMonths: string[],
 *   peakSeason: { months: string[], multiplier: number },
 *   offSeason: { months: string[], multiplier: number },
 *   images: {
 *     hero: string,
 *     gallery: string[]
 *   },
 *   attractions: string[],
 *   activities: string[],
 *   logistics: {
 *     nearestAirport: string,
 *     nearestRailway: string,
 *     roadConnectivity: string,
 *     passportRequired: boolean,
 *     visaRequired: boolean,
 *     visaType: string
 *   },
 *   pricing: {
 *     basePrice: number,
 *     marketPrice: number,
 *     minPrice: number
 *   },
 *   itinerary: {
 *     day: number,
 *     title: string,
 *     activities: string[],
 *     meals: string[]
 *   }[],
 *   createdAt: timestamp,
 *   updatedAt: timestamp,
 *   isActive: boolean
 * }
 */

// ==================== DESTINATION CRUD ====================

/**
 * Create a new destination
 */
export async function createDestination(destinationData) {
  const docRef = await addDoc(collection(db, DESTINATIONS_COLLECTION), {
    ...destinationData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true
  });
  return docRef.id;
}

/**
 * Get all destinations with pagination
 */
export async function getDestinations(options = {}) {
  const { 
    limit: queryLimit = 50, 
    lastDoc = null,
    filters = {}
  } = options;

  let q = query(
    collection(db, DESTINATIONS_COLLECTION),
    orderBy('name'),
    limit(queryLimit)
  );

  // Apply filters
  if (filters.country) {
    q = query(q, where('country', '==', filters.country));
  }
  if (filters.state) {
    q = query(q, where('state', '==', filters.state));
  }
  if (filters.type) {
    q = query(q, where('type', '==', filters.type));
  }
  if (filters.isActive !== undefined) {
    q = query(q, where('isActive', '==', filters.isActive));
  }

  // Pagination
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  
  return {
    destinations: snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
  };
}

/**
 * Get a single destination by ID
 */
export async function getDestinationById(id) {
  const docRef = doc(db, DESTINATIONS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}

/**
 * Update a destination
 */
export async function updateDestination(id, updates) {
  const docRef = doc(db, DESTINATIONS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

/**
 * Soft delete a destination (mark as inactive)
 */
export async function deactivateDestination(id) {
  const docRef = doc(db, DESTINATIONS_COLLECTION, id);
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: serverTimestamp()
  });
}

/**
 * Hard delete a destination (use with caution)
 */
export async function deleteDestination(id) {
  const docRef = doc(db, DESTINATIONS_COLLECTION, id);
  await deleteDoc(docRef);
}

// ==================== TOUR PACKAGES CRUD ====================

/**
 * Create a tour package linked to a destination
 */
export async function createTourPackage(tourData) {
  const docRef = await addDoc(collection(db, TOURS_COLLECTION), {
    ...tourData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
    bookings: 0,
    views: 0
  });
  return docRef.id;
}

/**
 * Get tour packages for a destination
 */
export async function getToursByDestination(destinationId) {
  const q = query(
    collection(db, TOURS_COLLECTION),
    where('destinationId', '==', destinationId),
    where('isActive', '==', true),
    orderBy('pricePerGuest')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Get all active tours
 */
export async function getAllTours(options = {}) {
  const { limit: queryLimit = 100 } = options;
  
  const q = query(
    collection(db, TOURS_COLLECTION),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
    limit(queryLimit)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// ==================== DYNAMIC ITINERARY GENERATOR ====================

/**
 * Generate itinerary based on budget and preferences
 */
export function generateItinerary(destination, config) {
  const { 
    nights, 
    budget, 
    transportType, 
    hotelStars,
    activities = []
  } = config;

  const itinerary = [];
  
  // Day 1: Arrival
  itinerary.push({
    day: 1,
    title: `Arrival in ${destination.name}`,
    activities: [
      `Arrive at ${destination.logistics.nearestAirport || 'destination'}`,
      `Transfer to ${hotelStars}★ hotel`,
      'Check-in and relaxation',
      'Welcome dinner'
    ],
    meals: ['Dinner'],
    transport: transportType
  });

  // Middle days: Activities based on budget
  const attractionCount = budget < 20000 ? 2 : budget < 50000 ? 4 : 6;
  const selectedAttractions = destination.attractions?.slice(0, attractionCount) || [];
  
  for (let i = 2; i <= nights; i++) {
    const dayActivities = [];
    
    // Add sightseeing
    if (selectedAttractions[i - 2]) {
      dayActivities.push(`Visit ${selectedAttractions[i - 2]}`);
    }
    
    // Add activity based on budget
    if (budget >= 50000 && activities.length > 0) {
      dayActivities.push(activities[0]);
    }
    
    // Add rest time for luxury
    if (budget >= 100000) {
      dayActivities.push('Spa and relaxation time');
    }
    
    itinerary.push({
      day: i,
      title: `Explore ${destination.name}`,
      activities: dayActivities.length > 0 ? dayActivities : ['Local sightseeing', 'Shopping'],
      meals: budget >= 50000 ? ['Breakfast', 'Lunch', 'Dinner'] : ['Breakfast', 'Dinner'],
      transport: i === nights ? transportType : 'local'
    });
  }

  // Last day: Departure
  itinerary.push({
    day: nights + 1,
    title: 'Departure',
    activities: [
      'Breakfast at hotel',
      'Check-out',
      `Transfer to ${destination.logistics.nearestAirport || 'airport/station'}`,
      'Departure'
    ],
    meals: ['Breakfast'],
    transport: transportType
  });

  return itinerary;
}

// ==================== AUTOMATED CONTENT FETCHING ====================

/**
 * Auto-fetch destination images from Unsplash
 */
export async function fetchDestinationImages(destinationName, count = 5) {
  try {
    const { searchImages } = await import('./unsplash.js');
    const images = await searchImages(
      `${destinationName} tourism travel landscape`,
      { perPage: count }
    );
    return images.map(img => img.url);
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

/**
 * Auto-generate destination description using template
 */
export function generateDestinationDescription(name, type, state, country) {
  const templates = {
    'hill-station': `${name} is a picturesque hill station in ${state}, ${country}, known for its breathtaking mountain views, pleasant climate, and serene atmosphere. Perfect for nature lovers and adventure enthusiasts.`,
    'beach-destination': `${name} is a stunning beach destination in ${state}, ${country}, famous for its pristine beaches, water sports, and vibrant nightlife. Ideal for relaxation and coastal adventures.`,
    'heritage-city': `${name} is a historic city in ${state}, ${country}, renowned for its magnificent architecture, rich cultural heritage, and royal legacy. A must-visit for history buffs and culture enthusiasts.`,
    'desert-city': `${name} is a golden desert city in ${state}, ${country}, offering unique desert experiences, camel safaris, and mesmerizing sand dunes. Experience the magic of the desert.`,
    'lake-city': `${name} is the beautiful lake city of ${state}, ${country}, surrounded by serene lakes and majestic palaces. Perfect for romantic getaways and peaceful retreats.`,
    'default': `${name} is a wonderful destination in ${state}, ${country}, offering unique experiences and memorable adventures for travelers of all kinds.`
  };
  
  return templates[type] || templates.default;
}

/**
 * Auto-suggest best months based on climate type
 */
export function suggestBestMonths(climateType) {
  const suggestions = {
    'temperate': ['March', 'April', 'May', 'September', 'October', 'November'],
    'alpine': ['April', 'May', 'June', 'September', 'October'],
    'tropical': ['November', 'December', 'January', 'February', 'March'],
    'desert': ['October', 'November', 'December', 'January', 'February', 'March'],
    'cold-desert': ['June', 'July', 'August', 'September'],
    'default': ['October', 'November', 'March', 'April']
  };
  
  return suggestions[climateType] || suggestions.default;
}

// ==================== BULK OPERATIONS ====================

/**
 * Bulk import destinations from JSON
 */
export async function bulkImportDestinations(destinationsArray) {
  const results = {
    success: [],
    failed: []
  };

  for (const dest of destinationsArray) {
    try {
      const id = await createDestination(dest);
      results.success.push({ id, name: dest.name });
    } catch (error) {
      results.failed.push({ name: dest.name, error: error.message });
    }
  }

  return results;
}

/**
 * Get destination statistics
 */
export async function getDestinationStats(destinationId) {
  const tours = await getToursByDestination(destinationId);
  
  return {
    totalTours: tours.length,
    averagePrice: tours.reduce((sum, t) => sum + (t.pricePerGuest || 0), 0) / tours.length || 0,
    lowestPrice: Math.min(...tours.map(t => t.pricePerGuest || Infinity)),
    highestPrice: Math.max(...tours.map(t => t.pricePerGuest || 0)),
    totalBookings: tours.reduce((sum, t) => sum + (t.bookings || 0), 0),
    totalViews: tours.reduce((sum, t) => sum + (t.views || 0), 0)
  };
}

// ==================== SEARCH & FILTER ====================

/**
 * Search destinations by name or state
 */
export async function searchDestinations(searchTerm) {
  const q = query(
    collection(db, DESTINATIONS_COLLECTION),
    where('isActive', '==', true),
    orderBy('name'),
    limit(20)
  );
  
  const snapshot = await getDocs(q);
  const destinations = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Client-side filtering for partial matches
  const term = searchTerm.toLowerCase();
  return destinations.filter(d => 
    d.name?.toLowerCase().includes(term) ||
    d.state?.toLowerCase().includes(term) ||
    d.country?.toLowerCase().includes(term)
  );
}

/**
 * Get destinations by type
 */
export async function getDestinationsByType(type) {
  const q = query(
    collection(db, DESTINATIONS_COLLECTION),
    where('type', '==', type),
    where('isActive', '==', true),
    orderBy('name')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Get all unique states
 */
export async function getAllStates() {
  const snapshot = await getDocs(collection(db, DESTINATIONS_COLLECTION));
  const states = new Set();
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.state) states.add(data.state);
  });
  
  return Array.from(states).sort();
}

export default {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deactivateDestination,
  deleteDestination,
  createTourPackage,
  getToursByDestination,
  getAllTours,
  generateItinerary,
  fetchDestinationImages,
  generateDestinationDescription,
  suggestBestMonths,
  bulkImportDestinations,
  getDestinationStats,
  searchDestinations,
  getDestinationsByType,
  getAllStates
};
