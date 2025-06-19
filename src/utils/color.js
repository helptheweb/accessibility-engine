/**
 * Color contrast calculation utilities
 */

/**
 * Calculate contrast ratio between two colors
 * @param {string} fgColor - Foreground color
 * @param {string} bgColor - Background color
 * @returns {number} Contrast ratio
 */
export function calculateContrast(fgColor, bgColor) {
  const rgb1 = parseColor(fgColor);
  const rgb2 = parseColor(bgColor);
  
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse color string to RGB values
 * @param {string} color - Color string (rgb, rgba, or hex)
 * @returns {object} RGB values
 */
export function parseColor(color) {
  if (!color || typeof color !== 'string') {
    return { r: 0, g: 0, b: 0 };
  }
  
  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }
  
  // Handle hex colors
  const hexMatch = color.match(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  }
  
  // Default to black if unable to parse
  return { r: 0, g: 0, b: 0 };
}

/**
 * Calculate relative luminance
 * @param {object} rgb - RGB color values
 * @returns {number} Relative luminance
 */
export function relativeLuminance(rgb) {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Get background color considering transparency and inheritance
 * @param {Element} element - DOM element
 * @returns {string} Computed background color
 */
export function getBackgroundColor(element) {
  // Get window from element's document
  const elementWindow = element.ownerDocument.defaultView || element.ownerDocument.parentWindow;
  if (!elementWindow) {
    return 'rgb(255, 255, 255)';
  }
  
  let bgColor = elementWindow.getComputedStyle(element).backgroundColor;
  let currentElement = element;
  
  // Traverse up the DOM tree to find non-transparent background
  while (bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
    currentElement = currentElement.parentElement;
    if (!currentElement || currentElement === element.ownerDocument.body) {
      // Assume white background if we reach body
      return 'rgb(255, 255, 255)';
    }
    bgColor = elementWindow.getComputedStyle(currentElement).backgroundColor;
  }
  
  return bgColor;
}

/**
 * Check if element has sufficient contrast
 * @param {Element} element - DOM element
 * @param {number} minRatio - Minimum contrast ratio required
 * @returns {object} Result with passed status and contrast value
 */
export function checkElementContrast(element, minRatio = 4.5) {
  const elementWindow = element.ownerDocument.defaultView || element.ownerDocument.parentWindow;
  if (!elementWindow) {
    return {
      passed: true,
      incomplete: true,
      message: 'Unable to compute styles in this environment'
    };
  }
  
  const style = elementWindow.getComputedStyle(element);
  const fgColor = style.color;
  const bgColor = getBackgroundColor(element);
  
  const contrast = calculateContrast(fgColor, bgColor);
  
  return {
    passed: contrast >= minRatio,
    contrast,
    foreground: fgColor,
    background: bgColor,
    requiredRatio: minRatio
  };
}

/**
 * Safe getComputedStyle that works in Node/JSDOM
 */
export function safeGetComputedStyle(element) {
  const elementWindow = element.ownerDocument.defaultView || element.ownerDocument.parentWindow;
  if (!elementWindow || !elementWindow.getComputedStyle) {
    // Return a mock object with default values
    return {
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(255, 255, 255)',
      display: 'block',
      visibility: 'visible',
      fontSize: '16px',
      fontWeight: 'normal',
      getPropertyValue: () => ''
    };
  }
  
  return elementWindow.getComputedStyle(element);
}
