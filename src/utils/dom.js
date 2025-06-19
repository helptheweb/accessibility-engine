/**
 * Cross-environment utilities for browser and Node.js compatibility
 */

/**
 * Get the window object from an element
 * @param {Element} element - DOM element
 * @returns {Window|null} Window object or null
 */
export function getWindow(element) {
  if (typeof window !== 'undefined') {
    return window;
  }
  
  if (element && element.ownerDocument) {
    return element.ownerDocument.defaultView || element.ownerDocument.parentWindow;
  }
  
  return null;
}

/**
 * Get computed styles safely
 * @param {Element} element - DOM element
 * @returns {CSSStyleDeclaration|Object} Computed styles or mock object
 */
export function getComputedStyle(element) {
  const win = getWindow(element);
  
  if (win && win.getComputedStyle) {
    return win.getComputedStyle(element);
  }
  
  // Return a mock object with common properties
  return {
    display: 'block',
    visibility: 'visible',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'transparent',
    fontSize: '16px',
    fontWeight: 'normal',
    textDecoration: 'none',
    borderStyle: 'none',
    borderColor: 'transparent',
    outline: 'none',
    boxShadow: 'none',
    position: 'static',
    width: 'auto',
    height: 'auto',
    padding: '0px',
    margin: '0px',
    getPropertyValue: function(prop) {
      return this[prop] || '';
    }
  };
}

/**
 * Get document from element
 * @param {Element|Document} context - Element or document
 * @returns {Document} Document object
 */
export function getDocument(context) {
  if (context && context.ownerDocument) {
    return context.ownerDocument;
  }
  
  if (context && context.documentElement) {
    return context;
  }
  
  if (typeof document !== 'undefined') {
    return document;
  }
  
  return null;
}

/**
 * Query selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element|Document} context - Context to search within
 * @returns {Element|null} Found element or null
 */
export function querySelector(selector, context) {
  try {
    const doc = getDocument(context) || context;
    return doc.querySelector(selector);
  } catch (e) {
    return null;
  }
}

/**
 * Query selector all with error handling
 * @param {string} selector - CSS selector
 * @param {Element|Document} context - Context to search within
 * @returns {Element[]} Array of found elements
 */
export function querySelectorAll(selector, context) {
  try {
    const doc = getDocument(context) || context;
    return Array.from(doc.querySelectorAll(selector));
  } catch (e) {
    return [];
  }
}

/**
 * Check if element is visible
 * @param {Element} element - DOM element
 * @returns {boolean} Whether element is visible
 */
export function isVisible(element) {
  const styles = getComputedStyle(element);
  
  if (styles.display === 'none' || styles.visibility === 'hidden') {
    return false;
  }
  
  // Check if element has dimensions
  const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : { width: 1, height: 1 };
  
  return rect.width > 0 && rect.height > 0;
}

/**
 * Get element's window safely
 * @param {Element} element - DOM element
 * @returns {object} Window-like object with common properties
 */
export function getElementWindow(element) {
  const win = getWindow(element);
  
  if (win) {
    return win;
  }
  
  // Return a mock window object for Node.js environment
  return {
    getComputedStyle: (el) => getComputedStyle(el),
    document: getDocument(element),
    location: { href: '' },
    navigator: { userAgent: 'Node.js' },
    innerWidth: 1024,
    innerHeight: 768
  };
}
