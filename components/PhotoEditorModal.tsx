import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PhotoConfig } from '../types';

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: PhotoConfig) => void;
  photoConfig: PhotoConfig;
}

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({ isOpen, onClose, onSave, photoConfig }) => {
  const [zoom, setZoom] = useState(photoConfig.zoom);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Pixel offset of the image
  const [imageSize, setImageSize] = useState<{ width: number, height: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, offsetX: 0, offsetY: 0 });

  // Load image dimensions and initialize state when modal opens
  useEffect(() => {
    if (isOpen && photoConfig.src) {
      const img = new Image();
      img.src = photoConfig.src;
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        setZoom(photoConfig.zoom);
        
        const container = containerRef.current;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const imgAspectRatio = img.naturalWidth / img.naturalHeight;
        const containerAspectRatio = containerRect.width / containerRect.height;
        
        let coveredImgWidth, coveredImgHeight;
        if (imgAspectRatio > containerAspectRatio) {
            coveredImgHeight = containerRect.height;
            coveredImgWidth = coveredImgHeight * imgAspectRatio;
        } else {
            coveredImgWidth = containerRect.width;
            coveredImgHeight = coveredImgWidth / imgAspectRatio;
        }

        const zoomedWidth = coveredImgWidth * (photoConfig.zoom / 100);
        const zoomedHeight = coveredImgHeight * (photoConfig.zoom / 100);

        const minX = containerRect.width - zoomedWidth;
        const minY = containerRect.height - zoomedHeight;
        
        const [xPercent, yPercent] = photoConfig.position.split(' ').map(p => parseFloat(p) / 100);

        setOffset({
          x: isNaN(xPercent) ? minX / 2 : minX * xPercent,
          y: isNaN(yPercent) ? minY / 2 : minY * yPercent,
        });
      };
    } else {
      setImageSize(null);
    }
  }, [isOpen, photoConfig.src]);


  const getBoundaries = useCallback((currentZoom: number) => {
    const container = containerRef.current;
    if (!container || !imageSize) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };

    const containerRect = container.getBoundingClientRect();
    const imgAspectRatio = imageSize.width / imageSize.height;
    const containerAspectRatio = containerRect.width / containerRect.height;
    
    let coveredImgWidth, coveredImgHeight;
    if (imgAspectRatio > containerAspectRatio) {
        coveredImgHeight = containerRect.height;
        coveredImgWidth = coveredImgHeight * imgAspectRatio;
    } else {
        coveredImgWidth = containerRect.width;
        coveredImgHeight = coveredImgWidth / imgAspectRatio;
    }
    
    const zoomedWidth = coveredImgWidth * (currentZoom / 100);
    const zoomedHeight = coveredImgHeight * (currentZoom / 100);

    return {
      minX: containerRect.width - zoomedWidth,
      minY: containerRect.height - zoomedHeight,
      maxX: 0,
      maxY: 0,
      width: zoomedWidth,
      height: zoomedHeight,
    };
  }, [imageSize]);


  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.mouseX;
    const dy = e.clientY - dragStart.current.mouseY;
    
    const { minX, minY, maxX, maxY } = getBoundaries(zoom);
    
    const newX = dragStart.current.offsetX + dx;
    const newY = dragStart.current.offsetY + dy;

    setOffset({
      x: Math.max(minX, Math.min(newX, maxX)),
      y: Math.max(minY, Math.min(newY, maxY)),
    });
  }, [getBoundaries, zoom]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    if (isOpen) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
    }
  }, [isOpen, handleMouseMove, handleMouseUp]);
  
  const handleZoomChange = (newZoom: number) => {
    const container = containerRef.current;
    if (!container) return;

    const oldBoundaries = getBoundaries(zoom);
    const newBoundaries = getBoundaries(newZoom);
    const containerRect = container.getBoundingClientRect();

    // Get the position of the center of the container relative to the image
    const centerX = (containerRect.width / 2) - offset.x;
    const centerY = (containerRect.height / 2) - offset.y;
    
    // Find the ratio of that center point to the image size
    const ratioX = oldBoundaries.width > 0 ? centerX / oldBoundaries.width : 0;
    const ratioY = oldBoundaries.height > 0 ? centerY / oldBoundaries.height : 0;

    // Calculate the new offset to keep the center point in the same place
    const newOffsetX = (containerRect.width / 2) - (newBoundaries.width * ratioX);
    const newOffsetY = (containerRect.height / 2) - (newBoundaries.height * ratioY);

    setZoom(newZoom);
    setOffset({
      x: Math.max(newBoundaries.minX, Math.min(newOffsetX, newBoundaries.maxX)),
      y: Math.max(newBoundaries.minY, Math.min(newOffsetY, newBoundaries.maxY)),
    });
  }

  const handleSave = () => {
    const { minX, minY } = getBoundaries(zoom);
    
    // Avoid division by zero
    const xPercent = minX < 0 ? (offset.x / minX) * 100 : 50;
    const yPercent = minY < 0 ? (offset.y / minY) * 100 : 50;

    onSave({
      ...photoConfig,
      zoom,
      position: `${xPercent.toFixed(2)}% ${yPercent.toFixed(2)}%`,
    });
  };
  
  const getComputedImageStyle = (): React.CSSProperties => {
    const boundaries = getBoundaries(zoom);
    return {
      position: 'absolute',
      top: `${offset.y}px`,
      left: `${offset.x}px`,
      width: `${boundaries.width}px`,
      height: `${boundaries.height}px`,
      maxWidth: 'none',
      cursor: isDragging.current ? 'grabbing' : 'grab',
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onMouseUp={handleMouseUp}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">Editar Foto</h3>
           <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
             <span className="sr-only">Fechar</span>
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        <div className="p-6">
          <div 
            ref={containerRef}
            className="relative w-full aspect-square bg-gray-200 dark:bg-gray-900/50 overflow-hidden shadow-inner"
            style={{ borderRadius: photoConfig.style === 'rounded-full' ? '50%' : '0.5rem' }}
          >
            {imageSize && (
              <img
                src={photoConfig.src}
                alt="Editor preview"
                style={getComputedImageStyle()}
                onMouseDown={handleMouseDown}
                draggable="false"
              />
            )}
          </div>
          <div className="mt-6">
            <label htmlFor="zoom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zoom</label>
            <input
              id="zoom"
              type="range"
              min="100"
              max="300"
              step="1"
              value={zoom}
              onChange={(e) => handleZoomChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
