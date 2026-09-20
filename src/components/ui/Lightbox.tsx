import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Document Preview',
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20">
        <h4 className="text-white text-sm font-semibold tracking-wide">{title}</h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer ml-2"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        className="w-full h-full flex items-center justify-center overflow-auto p-4 cursor-zoom-out"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="transition-transform duration-150 ease-out flex items-center justify-center max-w-4xl"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl border border-white/20 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
