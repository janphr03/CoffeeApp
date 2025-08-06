import React, { useEffect, useRef, useCallback } from 'react';

const ScrollBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<{ [key: number]: HTMLImageElement }>({});
  const currentFrameRef = useRef<number>(0);
  const frameCount: number = 331; // Anzahl der kopierten Frames
  const isLoadingRef = useRef<boolean>(false);

  const drawFrame = useCallback((index: number): void => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not found');
      return;
    }
    
    const img = imagesRef.current[index];
    
    if (!img || !img.complete) {
      console.log(`Frame ${index} not loaded yet`);
      return;
    }
    
    console.log(`Canvas size: ${canvas.width}x${canvas.height}, Image size: ${img.width}x${img.height}`);
    
    // Canvas leeren und Bild zeichnen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Einfache Darstellung - Bild über gesamtes Canvas strecken
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    console.log(`Drew frame ${index} at size ${canvas.width}x${canvas.height}`);
  }, []);

  const handleScroll = useCallback((): void => {
    const scrollTop = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    
    if (maxScroll <= 0) {
      drawFrame(1);
      return;
    }
    
    const scrollFraction = Math.min(scrollTop / maxScroll, 1);
    const frameIndex = Math.max(1, Math.min(frameCount, Math.round(scrollFraction * (frameCount - 1)) + 1));
    
    console.log(`Scroll: ${scrollTop}, Max: ${maxScroll}, Fraction: ${scrollFraction}, Frame: ${frameIndex}`);
    
    if (frameIndex !== currentFrameRef.current) {
      drawFrame(frameIndex);
      currentFrameRef.current = frameIndex;
    }
  }, [drawFrame]);

  const handleResize = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(currentFrameRef.current || 1);
  }, [drawFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isLoadingRef.current) return;

    isLoadingRef.current = true;
    
    console.log('Initializing canvas...');
    
    // Canvas-Größe setzen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    console.log(`Canvas initialized with size: ${canvas.width}x${canvas.height}`);
    
    // Test: Canvas mit einer Farbe füllen
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log('Canvas filled with red for testing');
      
      // Nach 5 Sekunden wieder leeren
      setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log('Canvas cleared after test');
      }, 5000);
    }

    // Bilder preloaden mit besserer Performance
    const loadImages = async (): Promise<void> => {
      console.log('Starting to load images...');
      const loadPromises: Promise<void>[] = [];
      
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Falls nötig für CORS
        img.src = `/frames2/frame_${String(i).padStart(3, '0')}.jpg`;
        imagesRef.current[i] = img;
        
        const loadPromise = new Promise<void>((resolve) => {
          img.onload = () => {
            console.log(`Loaded frame ${i}`);
            resolve();
          };
          img.onerror = (error) => {
            console.error(`Failed to load frame ${i}:`, error);
            resolve(); // Auch bei Fehlern weitermachen
          };
        });
        
        loadPromises.push(loadPromise);
        
        // Erstes Bild sofort zeichnen
        if (i === 1) {
          img.onload = () => {
            console.log('Drawing first frame');
            drawFrame(1);
            currentFrameRef.current = 1;
          };
        }
      }
      
      // Warten bis alle Bilder geladen sind
      await Promise.all(loadPromises);
      console.log('Alle Frame-Bilder wurden geladen');
      
      // Erstes Frame nochmals zeichnen, falls es nicht geklappt hat
      if (currentFrameRef.current === 0) {
        drawFrame(1);
        currentFrameRef.current = 1;
      }
    };

    loadImages();

    // Event Listener mit Throttling für bessere Performance
    let ticking = false;
    const throttledScroll = (): void => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScroll, handleResize, drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      id="bg-canvas"
      className="fixed top-0 left-0 w-full h-full"
      style={{ 
        filter: 'brightness(0.6)',
        willChange: 'contents',
        backgroundColor: 'blue', // Temporär zur Sichtbarkeitsprüfung
        zIndex: -1000, // Sehr niedrige z-index Priorität
        pointerEvents: 'none' // Verhindert Mausinteraktionen
      }}
    />
  );
};

export default ScrollBackground;
