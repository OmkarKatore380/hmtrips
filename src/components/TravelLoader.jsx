import React from 'react';

export default function TravelLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white z-[50]">
      <div className="relative w-48 h-24 flex items-center justify-center">
        
        {/* Floating Clouds */}
        <div className="absolute top-0 left-4 animate-pulse opacity-40 text-xl">☁️</div>
        <div className="absolute top-4 right-8 animate-pulse delay-75 opacity-40 text-xl">☁️</div>

        {/* 3D-Style Plane with wave motion */}
        <div className="absolute z-20 animate-bounce" style={{ animationDuration: '2s' }}>
          <div className="text-5xl transform -rotate-12 drop-shadow-lg">✈️</div>
        </div>

        {/* Moving Road Line */}
        <div className="absolute bottom-4 w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-1/2 animate-road-slide"></div>
        </div>

        {/* Moving Car */}
        <div className="absolute bottom-1 animate-pulse text-3xl">🚗</div>
      </div>
      
      <div className="text-center mt-6">
        <h3 className="text-neutral-800 font-bold text-xl tracking-tight">
          Starting Your Journey
        </h3>
        <p className="text-neutral-400 text-sm mt-1">Fetching the best deals for you...</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes road-slide {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        .animate-road-slide {
          animation: road-slide 1.2s linear infinite;
        }
      `}} />
    </div>
  );
}