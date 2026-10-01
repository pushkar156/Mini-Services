
import React, { useEffect, useRef, useState, WheelEvent, MouseEvent } from 'react';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { ResetZoomIcon } from './icons/ResetZoomIcon';


// Make window object extensible for mermaid
declare global {
  interface Window {
    mermaid?: any;
  }
}

interface MermaidPreviewProps {
  code: string;
}

export const MermaidPreview: React.FC<MermaidPreviewProps> = ({ code }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderedSvg, setRenderedSvg] = useState<string | null>(null);

  // State for zoom and pan
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });


  useEffect(() => {
    if (!mermaidRef.current) return;

    // Clear previous render
    mermaidRef.current.innerHTML = '';
    setError(null);
    setRenderedSvg(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });

    if (code && window.mermaid) {
      try {
        const mermaidId = `mermaid-graph-${Math.random().toString(36).substring(2, 9)}`;

        const renderMermaid = async () => {
          try {
            window.mermaid.initialize({
              startOnLoad: false,
              theme: 'dark',
              flowchart: {
                useMaxWidth: true,
              }
            });
            const { svg } = await window.mermaid.render(mermaidId, code);
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = svg;
              setRenderedSvg(svg);
            }
          } catch (e: any) {
            console.error("Mermaid rendering failed:", e.message);
            setError(`Mermaid Syntax Error: ${e.message}`);
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = '';
            }
          }
        };

        renderMermaid();

      } catch (e: any) {
        console.error("Error setting up mermaid render:", e.message);
        setError(`An unexpected error occurred: ${e.message}`);
      }
    }

  }, [code]);

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newScale = e.deltaY > 0 ? scale / zoomFactor : scale * zoomFactor;
    const clampedScale = Math.max(0.2, Math.min(newScale, 5));

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - position.x) * (clampedScale / scale);
    const newY = mouseY - (mouseY - position.y) * (clampedScale / scale);

    setScale(clampedScale);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Allow clicks on buttons
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    setIsPanning(true);
    setStartPanPosition({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPanPosition.x,
      y: e.clientY - startPanPosition.y
    });
  };

  const handleMouseUpOrLeave = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPanning(false);
  };

  const zoomIn = () => setScale(prev => Math.min(prev * 1.25, 5));
  const zoomOut = () => setScale(prev => Math.max(prev * 0.8, 0.2));
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };


  const renderContent = () => {
    if (error) {
      return (
        <div className="text-red-400 p-4 border border-red-500 rounded-md bg-red-900/20">
          <p className="font-bold">Diagram Error</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (!code) {
      return (
        <div className="text-gray-500 text-center p-8">
          The flowchart preview will be displayed here once generated.
        </div>
      );
    }

    if (code && !renderedSvg && !error) {
      return <div className="text-gray-500 text-center p-8">Rendering diagram...</div>
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-grow bg-gray-800 border-2 border-gray-700 rounded-lg p-4 overflow-hidden flex items-center justify-center"
      style={{ cursor: renderedSvg ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
      onWheel={renderedSvg && !error ? handleWheel : undefined}
      onMouseDown={renderedSvg && !error ? handleMouseDown : undefined}
      onMouseMove={isPanning ? handleMouseMove : undefined}
      onMouseUp={isPanning ? handleMouseUpOrLeave : undefined}
      onMouseLeave={isPanning ? handleMouseUpOrLeave : undefined}
    >
      {renderedSvg && !error && (
        <>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 z-10 bg-gray-700/50 rounded-lg backdrop-blur-sm">
            <button onClick={zoomOut} className="p-2 text-gray-300 hover:text-white transition-colors" title="Zoom Out"><ZoomOutIcon /></button>
            <button onClick={resetView} className="p-2 text-gray-300 hover:text-white transition-colors" title="Reset View"><ResetZoomIcon /></button>
            <button onClick={zoomIn} className="p-2 text-gray-300 hover:text-white transition-colors" title="Zoom In"><ZoomInIcon /></button>
          </div>
        </>
      )}
      {renderContent()}
      <div
        ref={contentRef}
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: isPanning ? 'none' : 'transform 0.1s ease-out' }}
      >
        <div ref={mermaidRef} className="w-full h-full [&>svg]:max-w-full [&>svg]:h-auto"></div>
      </div>
    </div>
  );
};
