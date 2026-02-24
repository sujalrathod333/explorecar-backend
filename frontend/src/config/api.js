// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://explorecar-backend.onrender.com'
    : 'http://localhost:5000',
  
  FALLBACK_IMAGES: {
    CAR_LARGE: 'https://placehold.co/800x450/e5e7eb/6b7280?text=Car+Image',
    CAR_MEDIUM: 'https://placehold.co/400x250/e5e7eb/6b7280?text=Car+Image',
    NO_IMAGE: 'https://placehold.co/800x450/e5e7eb/6b7280?text=No+Image'
  }
};

const buildImageSrc = (image, baseUrl = API_CONFIG.BASE_URL) => {
  if (!image) return API_CONFIG.FALLBACK_IMAGES.CAR_LARGE;
  if (Array.isArray(image)) image = image[0];
  if (typeof image !== 'string') return API_CONFIG.FALLBACK_IMAGES.CAR_LARGE;
  
  const trimmed = image.trim();
  if (!trimmed) return API_CONFIG.FALLBACK_IMAGES.CAR_LARGE;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return `${baseUrl}${trimmed}`;
  // Remove any leading 'uploads/' to avoid duplication
  const cleanPath = trimmed.replace(/^uploads\//, '');
  return `${baseUrl}/uploads/${cleanPath}`;
};

// Helper function for image error handling
export const handleImageError = (e, fallback = API_CONFIG.FALLBACK_IMAGES.CAR_LARGE) => {
  const img = e?.target;
  if (!img) return;
  img.onerror = null;
  img.src = fallback;
  img.alt = img.alt || 'Image not available';
  img.style.objectFit = img.style.objectFit || 'cover';
};