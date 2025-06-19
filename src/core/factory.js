/**
 * Factory function to create and configure engine
 */

import { AccessibilityEngine } from './engine.js';
import { WCAG22 } from '../rules/wcag22/index.js';

export function createAccessibilityEngine(options = {}) {
  const engine = new AccessibilityEngine(options);
  
  // Register all WCAG 2.2 rules by default
  Object.values(WCAG22.rules).forEach(rule => {
    engine.registerRule(rule);
  });
  
  // Register rulesets
  Object.entries(WCAG22.rulesets).forEach(([name, ruleIds]) => {
    engine.registerRuleset(name, ruleIds);
  });
  
  return engine;
}
