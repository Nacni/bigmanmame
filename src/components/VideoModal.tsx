import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoPlayer from '@/components/VideoPlayer';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

const VideoModal = ({ isOpen, onClose, videoSrc, title, description, thumbnail }: VideoModalProps) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        <VideoPlayer
          src={videoSrc}
          title={title}
          thumbnail={thumbnail}
          className="aspect-video"
        />
        {(title || description) && (
          <div className="mt-4 text-center">
            {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
            {description && (
              <p className="text-white/80 mt-2">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoModal;