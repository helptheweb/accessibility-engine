/**
 * @helptheweb/accessibility-engine
 * Main entry point
 */

export { AccessibilityEngine } from './core/engine.js';
export { createAccessibilityEngine } from './core/factory.js';
export { WCAG22 } from './rules/wcag22/index.js';
export * from './types/index.js';

// Default export for convenience
import { createAccessibilityEngine } from './core/factory.js';
export default createAccessibilityEngine;
