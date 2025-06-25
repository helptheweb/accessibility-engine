/**
 * Animation detection utilities
 */

/**
 * Check if element is currently animating or transitioning
 * @param {Element} element - DOM element to check
 * @returns {boolean} True if element is animating
 */
export function isAnimating(element) {
  if (!element || !window.getComputedStyle) {
    return false;
  }
  
  const style = window.getComputedStyle(element);
  
  // Check for CSS animations
  const animation = style.animation || style.webkitAnimation || '';
  const animationName = style.animationName || style.webkitAnimationName || '';
  
  if (animation !== 'none' && animation !== '' && animationName !== 'none') {
    // Check if animation is still running
    const duration = parseFloat(style.animationDuration || '0');
    const delay = parseFloat(style.animationDelay || '0');
    const iterationCount = style.animationIterationCount || '1';
    
    // If infinite animation, it's always animating
    if (iterationCount === 'infinite') {
      return true;
    }
    
    // For finite animations, we can't easily tell if they're done
    // So we'll assume they're animating if they have an animation defined
    return duration > 0;
  }
  
  // Check for CSS transitions
  const transition = style.transition || style.webkitTransition || '';
  if (transition && transition !== 'none' && transition !== 'all 0s ease 0s') {
    // Transitions are harder to detect if active
    // We'll be conservative and assume it might be transitioning
    return true;
  }
  
  return false;
}

/**
 * Check if element has fade-in or similar entrance animations
 * @param {Element} element - DOM element to check
 * @returns {boolean} True if element has entrance animation
 */
export function hasEntranceAnimation(element) {
  if (!element || !window.getComputedStyle) {
    return false;
  }
  
  const style = window.getComputedStyle(element);
  const classes = element.className || '';
  
  // Check for common animation class patterns
  const animationPatterns = [
    'fade-in', 'fadein', 'fade_in',
    'slide-in', 'slidein', 'slide_in',
    'zoom-in', 'zoomin', 'zoom_in',
    'appear', 'animate', 'animated',
    'aos-', 'wow', 'reveal'
  ];
  
  const hasAnimationClass = animationPatterns.some(pattern => 
    classes.toLowerCase().includes(pattern)
  );
  
  // Check animation name
  const animationName = (style.animationName || '').toLowerCase();
  const hasAnimationName = animationPatterns.some(pattern => 
    animationName.includes(pattern)
  );
  
  // Check for opacity-based animations
  const hasOpacityAnimation = animationName.includes('opacity') || 
                             animationName.includes('fade');
  
  return hasAnimationClass || hasAnimationName || hasOpacityAnimation;
}

/**
 * Wait for element animations to complete
 * @param {Element} element - DOM element
 * @param {number} maxWait - Maximum time to wait in ms
 * @returns {Promise} Resolves when animations complete or timeout
 */
export function waitForAnimations(element, maxWait = 5000) {
  return new Promise((resolve) => {
    if (!isAnimating(element)) {
      resolve();
      return;
    }
    
    const startTime = Date.now();
    
    const checkAnimation = () => {
      if (!isAnimating(element) || Date.now() - startTime > maxWait) {
        resolve();
      } else {
        requestAnimationFrame(checkAnimation);
      }
    };
    
    requestAnimationFrame(checkAnimation);
  });
}

/**
 * Check if element is in viewport (for lazy loading/animations)
 * @param {Element} element - DOM element
 * @returns {boolean} True if element is in viewport
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top < windowHeight &&
    rect.bottom > 0 &&
    rect.left < windowWidth &&
    rect.right > 0
  );
}
