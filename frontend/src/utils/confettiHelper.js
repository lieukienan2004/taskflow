import confetti from 'canvas-confetti'

const checkIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || !!(window.Capacitor || window.location.protocol === 'capacitor:');
}

export const fireConfetti = (options = {}) => {
  const isMobile = checkIsMobile();
  const defaultCount = options.particleCount || 150;
  
  const optimizedOptions = {
    ...options,
    particleCount: isMobile ? Math.min(defaultCount, 40) : defaultCount,
    spread: isMobile ? Math.min(options.spread || 70, 45) : (options.spread || 70)
  };
  
  confetti(optimizedOptions);
}

export default fireConfetti;
