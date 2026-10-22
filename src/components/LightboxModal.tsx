import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndexChange((currentIndex + 1) % images.length);
      if (e.key === 'ArrowLeft') onIndexChange((currentIndex - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors"
        aria-label="Tutup"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
          className="absolute left-4 z-20 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image display */}
      <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
        <img
          src={images[currentIndex]}
          alt={`Foto ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain animate-fade-in"
        />
        <p className="text-white/60 text-xs mt-3 tracking-widest font-sans">
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={() => onIndexChange((currentIndex + 1) % images.length)}
          className="absolute right-4 z-20 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
          aria-label="Selanjutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
