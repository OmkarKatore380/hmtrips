/**
 * Unsplash Image Service
 * Fetches 4K high-quality images for destinations, transport, and hotels
 */

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// 4K Image quality settings
const IMAGE_QUALITY = {
  thumbnail: 'w=400&q=80',
  regular: 'w=1200&q=85',
  high: 'w=1920&q=90',
  ultra4K: 'w=3840&q=95' // 4K quality
};

// Fallback images for common destinations (4K quality)
const fallbackImages = {
  shimla: `https://images.unsplash.com/photo-1581791534721-e599df4417f7?${IMAGE_QUALITY.ultra4K}`,
  manali: `https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?${IMAGE_QUALITY.ultra4K}`,
  ladakh: `https://images.unsplash.com/photo-1536295243470-d7cba4efab7b?${IMAGE_QUALITY.ultra4K}`,
  kashmir: `https://images.unsplash.com/photo-1595815771614-ade9d652a65d?${IMAGE_QUALITY.ultra4K}`,
  auli: `https://images.unsplash.com/photo-1464243875140-f8f83262bd1a?${IMAGE_QUALITY.ultra4K}`,
  goa: `https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?${IMAGE_QUALITY.ultra4K}`,
  switzerland: `https://images.unsplash.com/photo-1521292270410-a8c4d716d518?${IMAGE_QUALITY.ultra4K}`,
  iceland: `https://images.unsplash.com/photo-1476610182048-b716b8518aae?${IMAGE_QUALITY.ultra4K}`,
  jaipur: `https://images.unsplash.com/photo-1477587458883-47145ed94245?${IMAGE_QUALITY.ultra4K}`,
  udaipur: `https://images.unsplash.com/photo-1561361058-4fccb267b17d?${IMAGE_QUALITY.ultra4K}`,
  jaisalmer: `https://images.unsplash.com/photo-1595658658481-d53d3f999875?${IMAGE_QUALITY.ultra4K}`,
  kerala: `https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?${IMAGE_QUALITY.ultra4K}`,
  dubai: `https://images.unsplash.com/photo-1512453979798-5ea266f8880c?${IMAGE_QUALITY.ultra4K}`,
  maldives: `https://images.unsplash.com/photo-1514282401047-d79a71a590e8?${IMAGE_QUALITY.ultra4K}`,
  thailand: `https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?${IMAGE_QUALITY.ultra4K}`,
  bali: `https://images.unsplash.com/photo-1537996194471-e657df975ab4?${IMAGE_QUALITY.ultra4K}`,
  singapore: `https://images.unsplash.com/photo-1525625293386-3f8f99389edd?${IMAGE_QUALITY.ultra4K}`,
  vietnam: `https://images.unsplash.com/photo-1528127220108-612460f947ac?${IMAGE_QUALITY.ultra4K}`
};

// Cache for fetched images
const imageCache = new Map();

/**
 * Search for images on Unsplash
 */
export async function searchImages(query, options = {}) {
  const { 
    perPage = 5, 
    orientation = 'landscape',
    cacheKey = null 
  } = options;

  // Check cache first
  if (cacheKey && imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  // If no API key, return fallback
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not configured, using fallback images');
    return getFallbackImages(query);
  }

  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=${orientation}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    const images = data.results.map(photo => ({
      id: photo.id,
      url: `${photo.urls.raw}&${IMAGE_QUALITY.ultra4K}`, // 4K quality
      thumb: `${photo.urls.raw}&${IMAGE_QUALITY.thumbnail}`,
      regular: `${photo.urls.raw}&${IMAGE_QUALITY.regular}`,
      high: `${photo.urls.raw}&${IMAGE_QUALITY.high}`,
      full: photo.urls.full,
      alt: photo.alt_description || query,
      credit: {
        name: photo.user.name,
        link: photo.user.links.html
      }
    }));

    // Cache the results
    if (cacheKey) {
      imageCache.set(cacheKey, images);
    }

    return images;
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    return getFallbackImages(query);
  }
}

/**
 * Get a single image for a destination
 */
export async function getDestinationImage(destinationId, type = 'hero') {
  const cacheKey = `dest-${destinationId}-${type}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)[0];
  }

  // Check fallback
  if (fallbackImages[destinationId]) {
    return {
      url: fallbackImages[destinationId],
      thumb: fallbackImages[destinationId],
      alt: destinationId,
      isFallback: true
    };
  }

  // Search for image
  const searchQuery = getSearchQuery(destinationId, type);
  const images = await searchImages(searchQuery, { perPage: 1, cacheKey });
  
  return images[0] || getFallbackImages(destinationId)[0];
}

/**
 * Get multiple images for a destination
 */
export async function getDestinationGallery(destinationId, count = 4) {
  const cacheKey = `gallery-${destinationId}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey).slice(0, count);
  }

  const searchQuery = `${destinationId} tourism travel landscape`;
  const images = await searchImages(searchQuery, { perPage: count, cacheKey });
  
  return images;
}

/**
 * Get transport type image
 */
export async function getTransportImage(transportType) {
  const queries = {
    flight: 'airplane travel sky flying',
    train: 'train railway travel journey',
    bus: 'bus travel road trip',
    car: 'car road trip travel driving',
    bike: 'motorcycle bike road travel adventure'
  };

  const query = queries[transportType] || 'travel transport';
  const images = await searchImages(query, { perPage: 1 });
  
  return images[0] || { url: '', alt: transportType };
}

/**
 * Get hotel category image
 */
export async function getHotelImage(starRating) {
  const queries = {
    '2': 'budget hotel room simple clean',
    '3': 'standard hotel room comfortable',
    '4': 'luxury hotel room modern elegant',
    '5': 'five star hotel suite luxury premium'
  };

  const query = queries[starRating] || 'hotel room';
  const images = await searchImages(query, { perPage: 1 });
  
  return images[0] || { url: '', alt: `${starRating} star hotel` };
}

/**
 * Generate search query based on destination and type
 */
function getSearchQuery(destinationId, type) {
  const baseQueries = {
    shimla: { hero: 'shimla mountains colonial architecture india', activities: 'shimla mall road toy train kufri' },
    manali: { hero: 'manali snow mountains river beas himachal', activities: 'manali paragliding solang valley' },
    ladakh: { hero: 'ladakh pangong lake mountains buddhist', activities: 'ladakh bike trip nubra valley' },
    kashmir: { hero: 'kashmir dal lake shikara houseboat', activities: 'kashmir gulmarg skiing pahalgam' },
    auli: { hero: 'auli skiing snow mountains uttarakhand', activities: 'auli ski resort winter sports' },
    jaipur: { hero: 'jaipur hawa mahal pink city palace', activities: 'jaipur amer fort heritage rajasthan' },
    udaipur: { hero: 'udaipur lake palace city palace pichola', activities: 'udaipur boat ride heritage' },
    jaisalmer: { hero: 'jaisalmer golden fort desert rajasthan', activities: 'jaisalmer camel safari desert' },
    goa: { hero: 'goa beach sunset palm trees ocean', activities: 'goa water sports party cruise' },
    kerala: { hero: 'kerala backwaters houseboat alleppey', activities: 'kerala ayurveda tea plantation' },
    switzerland: { hero: 'switzerland alps mountains lake zurich', activities: 'switzerland train scenic skiing' },
    iceland: { hero: 'iceland northern lights aurora landscape', activities: 'iceland blue lagoon geothermal' },
    dubai: { hero: 'dubai skyline burj khalifa modern', activities: 'dubai desert safari luxury' },
    maldives: { hero: 'maldives overwater bungalow turquoise', activities: 'maldives snorkeling diving' },
    thailand: { hero: 'thailand bangkok temple beach', activities: 'thailand phi phi island floating market' },
    bali: { hero: 'bali rice terraces temple ubud', activities: 'bali swing yoga retreat' },
    singapore: { hero: 'singapore marina bay sands gardens', activities: 'singapore sentosa universal studios' },
    vietnam: { hero: 'vietnam ha long bay limestone karst', activities: 'vietnam hoi an lanterns street food' }
  };

  return baseQueries[destinationId]?.[type] || `${destinationId} travel tourism`;
}

/**
 * Get fallback images when API fails
 */
function getFallbackImages(query) {
  // Try to match query to a destination
  const destination = Object.keys(fallbackImages).find(key => 
    query.toLowerCase().includes(key.toLowerCase())
  );

  if (destination) {
    return [{
      url: fallbackImages[destination],
      thumb: fallbackImages[destination],
      alt: destination,
      isFallback: true
    }];
  }

  // Generic travel fallback
  return [{
    url: `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?${IMAGE_QUALITY.ultra4K}`,
    thumb: `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?${IMAGE_QUALITY.thumbnail}`,
    alt: 'travel destination',
    isFallback: true
  }];
}

/**
 * Get multiple 4K images for destination highlights grid
 * Returns array of high-res images for masonry/grid layout
 */
export async function getDestinationImages(destinationId, count = 6) {
  const cacheKey = `highlights-${destinationId}-${count}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  const searchQueries = [
    `${destinationId} travel landscape 4k`,
    `${destinationId} tourism scenic`,
    `${destinationId} famous places`,
    `${destinationId} nature mountains`,
    `${destinationId} city architecture`,
    `${destinationId} sunset sunrise`
  ];

  // Get diverse images by using different queries
  const images = [];
  for (let i = 0; i < Math.min(count, searchQueries.length); i++) {
    try {
      const results = await searchImages(searchQueries[i], { perPage: 1 });
      if (results[0]) {
        images.push(results[0]);
      }
    } catch (error) {
      console.warn(`Failed to fetch image for query: ${searchQueries[i]}`);
    }
  }

  // Cache results
  imageCache.set(cacheKey, images);
  
  return images.length > 0 ? images : getFallbackImages(destinationId);
}

/**
 * Fetch destination images with Unsplash attribution
 * Main utility function for fetching 4K HD images of any city/destination
 * Searches for famous spots, landmarks, and tourist attractions
 * @param {string} cityName - Name of the city/destination
 * @param {number} count - Number of images to fetch (default: 4)
 * @returns {Promise<Array>} - Array of image objects with url, thumb, credit, and attribution
 */
export async function fetchDestinationImages(cityName, count = 4) {
  if (!cityName) return [];
  
  const normalizedCity = cityName.toLowerCase().trim();
  const cacheKey = `fetch-${normalizedCity}-${count}`;
  
  // Check cache
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  // Build search queries for famous spots and landmarks
  const searchQueries = [
    `${normalizedCity} famous landmarks tourist attractions`,
    `${normalizedCity} popular places must visit`,
    `${normalizedCity} iconic spots heritage`,
    `${normalizedCity} tourist spots scenic views`,
    `${normalizedCity} cityscape landmark`,
    `${normalizedCity} best places photography`
  ].slice(0, count);

  try {
    const images = [];
    
    for (const query of searchQueries) {
      const results = await searchImages(query, { perPage: 1 });
      if (results && results[0]) {
        images.push({
          ...results[0],
          // Add attribution text as per Unsplash requirements
          attribution: `Photo by ${results[0].credit.name} on Unsplash`
        });
      }
    }

    // Cache results
    imageCache.set(cacheKey, images);
    return images;
  } catch (error) {
    console.error(`Error fetching images for ${cityName}:`, error);
    // Return fallback images with generic attribution
    return getFallbackImages(normalizedCity).map(img => ({
      ...img,
      attribution: 'Photo by Unsplash'
    }));
  }
}

/**
 * Fetch single image for a specific activity/location
 * Used for day-wise itinerary images
 * @param {string} activity - Activity or location name
 * @returns {Promise<Object>} - Image object with attribution
 */
export async function fetchActivityImage(activity) {
  if (!activity) return null;
  
  const normalizedActivity = activity.toLowerCase().trim();
  const cacheKey = `activity-${normalizedActivity}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  try {
    const results = await searchImages(`${normalizedActivity} travel tourism`, { perPage: 1 });
    if (results && results[0]) {
      const image = {
        ...results[0],
        attribution: `Photo by ${results[0].credit.name} on Unsplash`
      };
      imageCache.set(cacheKey, image);
      return image;
    }
  } catch (error) {
    console.error(`Error fetching image for activity ${activity}:`, error);
  }
  
  return null;
}

/**
 * Preload images for better performance
 */
export function preloadImages(urls) {
  urls.forEach(url => {
    if (url) {
      const img = new Image();
      img.src = url;
    }
  });
}

/**
 * Clear image cache
 */
export function clearImageCache() {
  imageCache.clear();
}

export default {
  searchImages,
  getDestinationImage,
  getDestinationImages,
  getDestinationGallery,
  fetchDestinationImages,
  fetchActivityImage,
  getTransportImage,
  getHotelImage,
  preloadImages,
  clearImageCache,
  IMAGE_QUALITY
};
