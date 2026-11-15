import { useState } from 'react';
import { Shirt } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'Studio Preview',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#F4F4F0] text-[#6E757C] border border-[#E4E4DE] p-6 text-center ${className}`}
      >
        <Shirt className="w-7 h-7 mb-2 stroke-[1.5]" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide uppercase">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`transition-opacity duration-200 ${className}`}
    />
  );
}
