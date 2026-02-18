/**
 * UnsplashImage Component
 * Premium image component with lazy loading, skeleton blur, and attribution
 * MMT-style professional look
 */

import { useState, useEffect, useRef } from 'react';

export default function UnsplashImage({
  src,
  alt,
  credit,
  attribution,
  className = '',
  containerClassName = '',
  showAttribution = true,
  aspectRatio = '16/9',
  objectFit = 'cover',
  priority = false,
  onLoad,
  onError
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before it comes into view
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate blur hash placeholder (simplified - using CSS blur)
  const blurStyle = !isLoaded ? {
    filter: 'blur(20px)',
    transform: 'scale(1.1)'
  } : {
    filter: 'blur(0px)',
    transform: 'scale(1)',
    transition: 'filter 0.5s ease-out, transform 0.5s ease-out'
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ aspectRatio }}
    >
      {/* Skeleton Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Image unavailable</span>
          </div>
        </div>
      )}

      {/* Main Image */}
      {isInView && src && (
        <img
          ref={imgRef}
          src={src}
          alt={alt || 'Destination image'}
          className={`w-full h-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`}
          style={blurStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Unsplash Attribution Overlay */}
      {showAttribution && (credit || attribution) && isLoaded && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <p className="text-white/80 text-xs truncate">
            {attribution || `Photo by ${credit?.name || 'Unsplash'} on Unsplash`}
          </p>
        </div>
      )}

      {/* Hover Overlay for Premium Feel */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}

/**
 * Photo Grid Component for Highlights Section
 * MMT-style photo grid with 4 images showing destination vibes
 */
export function PhotoGrid({ images, destination, onImageClick }) {
  if (!images || images.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {images.slice(0, 4).map((image, index) => (
        <div
          key={index}
          className={`relative rounded-xl overflow-hidden cursor-pointer group ${
            index === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square'
          }`}
          onClick={() => onImageClick?.(image, index)}
        >
          <UnsplashImage
            src={image.thumb || image.url}
            alt={image.alt || `${destination} view ${index + 1}`}
            credit={image.credit}
            attribution={image.attribution}
            containerClassName="w-full h-full"
            aspectRatio={index === 0 ? '1/1' : '1/1'}
            showAttribution={index === 0} // Only show attribution on main image
            priority={index === 0}
          />
          
          {/* Hover Zoom Icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Hero Banner Image Component
 * Full-width hero with skeleton loading and attribution
 */
export function HeroBannerImage({ image, destination, className = '' }) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      {image ? (
        <>
          <UnsplashImage
            src={image.url}
            alt={image.alt || `${destination} hero image`}
            credit={image.credit}
            attribution={image.attribution}
            containerClassName="w-full h-full"
            aspectRatio="auto"
            objectFit="cover"
            showAttribution={true}
            priority={true}
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}
    </div>
  );
}

/**
 * Day Itinerary Image Component
 * Small square image for day-wise itinerary
 */
export function DayItineraryImage({ activity, className = '' }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (!activity) return;
      
      try {
        const { fetchActivityImage } = await import('../lib/unsplash.js');
        const img = await fetchActivityImage(activity);
        setImage(img);
      } catch (error) {
        console.error('Failed to fetch activity image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [activity]);

  if (loading) {
    return (
      <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`} />
    );
  }

  if (!image) {
    return (
      <div className={`bg-gray-50 flex items-center justify-center rounded-lg ${className}`}>
        <MapPin className="w-6 h-6 text-gray-300" />
      </div>
    );
  }

  return (
    <UnsplashImage
      src={image.thumb || image.url}
      alt={image.alt || activity}
      credit={image.credit}
      containerClassName={`rounded-lg overflow-hidden ${className}`}
      aspectRatio="1/1"
      showAttribution={false}
    />
  );
}

// Import for DayItineraryImage
import { MapPin } from 'lucide-react';
