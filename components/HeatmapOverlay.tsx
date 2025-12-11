import React, { useEffect, useRef, useState } from 'react';
import { Hotspot, VisualizationMode } from '../types';

interface HeatmapOverlayProps {
  imageSrc: string;
  hotspots: Hotspot[];
  mode: VisualizationMode;
}

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ imageSrc, hotspots, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | null>(null);

  // Handle image load
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
        setDimensions({ width: naturalWidth, height: naturalHeight });
    }
  };

  // Robust check for cached images that might have loaded before React hydration
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
       setDimensions({
         width: imgRef.current.naturalWidth,
         height: imgRef.current.naturalHeight
       });
    }
  }, [imageSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas internal resolution to match image natural resolution
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!hotspots || hotspots.length === 0) return;

    // Sort hotspots by ID for sequence
    const sortedHotspots = [...hotspots].sort((a, b) => a.id - b.id);

    // -------------------------
    // RENDER: HEATMAP
    // -------------------------
    if (mode === 'heatmap') {
      sortedHotspots.forEach(spot => {
          const x = (spot.x / 100) * canvas.width;
          const y = (spot.y / 100) * canvas.height;
          // Dynamic radius based on image size
          const radius = Math.min(canvas.width, canvas.height) * 0.12; 
          
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          const alpha = Math.max(0.3, Math.min(0.9, spot.intensity));
          
          gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`); 
          gradient.addColorStop(0.4, `rgba(255, 165, 0, ${alpha * 0.8})`); 
          gradient.addColorStop(0.7, `rgba(255, 255, 0, ${alpha * 0.5})`); 
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.globalCompositeOperation = 'screen'; 
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    }

    // -------------------------
    // RENDER: FOG MAP (Reverse Heatmap)
    // -------------------------
    if (mode === 'fogmap') {
      // 1. Fill entire screen with dark fog
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)'; // Slate 900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Cut out holes for hotspots
      ctx.globalCompositeOperation = 'destination-out';
      
      sortedHotspots.forEach(spot => {
          const x = (spot.x / 100) * canvas.width;
          const y = (spot.y / 100) * canvas.height;
          const radius = Math.min(canvas.width, canvas.height) * 0.14; 

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');     // Fully transparent hole
          gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)'); // Semi-transparent edge
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');     // Solid fog

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    }

    // -------------------------
    // RENDER: PATH
    // -------------------------
    if (mode === 'path') {
       // Draw Lines
       ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)'; // Pink-500
       ctx.lineWidth = Math.max(2, canvas.width * 0.003); // Responsive line width
       ctx.setLineDash([15, 10]);
       
       ctx.beginPath();
       sortedHotspots.forEach((spot, idx) => {
         const x = (spot.x / 100) * canvas.width;
         const y = (spot.y / 100) * canvas.height;
         if (idx === 0) ctx.moveTo(x, y);
         else ctx.lineTo(x, y);
       });
       ctx.stroke();
       ctx.setLineDash([]); // Reset dash

       // Draw Points and Numbers
       sortedHotspots.forEach((spot) => {
         const x = (spot.x / 100) * canvas.width;
         const y = (spot.y / 100) * canvas.height;
         const circleRadius = Math.max(12, canvas.width * 0.015);

         // Outer glow
         ctx.shadowColor = "rgba(0,0,0,0.5)";
         ctx.shadowBlur = 10;
         
         // Circle
         ctx.fillStyle = spot.id === 1 ? '#ec4899' : '#ffffff'; 
         ctx.beginPath();
         ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
         ctx.fill();
         ctx.shadowBlur = 0; // Reset shadow

         // Border
         ctx.strokeStyle = '#ec4899';
         ctx.lineWidth = 3;
         ctx.stroke();

         // Number
         ctx.fillStyle = spot.id === 1 ? '#ffffff' : '#ec4899';
         ctx.font = `bold ${Math.max(12, circleRadius)}px Inter, sans-serif`;
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';
         ctx.fillText(spot.id.toString(), x, y + 2);
       });
    }

  }, [dimensions, hotspots, mode]);

  return (
    // Outer container: Flex center to manage the available space
    <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
      
      {/* 
        Aspect Ratio Wrapper
        - Fits within parent width/height (max-w/h-full).
        - Maintains the image's natural aspect ratio.
        - This forces the img and canvas to be exactly the same size.
      */}
      <div 
        className="relative shadow-2xl bg-gray-900 border border-gray-700 select-none rounded-xl overflow-hidden"
        style={{
             maxWidth: '100%',
             maxHeight: '100%',
             aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : 'auto',
             display: 'flex', // Ensures image child behaves block-like
        }}
      >
          {/* Image */}
          <img 
              ref={imgRef}
              src={imageSrc} 
              alt="Analyzed Asset" 
              className="w-full h-full object-contain"
              onLoad={onImageLoad}
          />

          {/* Canvas Overlay */}
          <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 10 }}
          />
      </div>
    </div>
  );
};