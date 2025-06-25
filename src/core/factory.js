/**
 * Factory function to create and configure engine
 */

import { AccessibilityEngine } from './engine.js';
import { WCAG22 } from '../rules/wcag22/index.js';
import { bestPracticeRules } from '../rules/best-practices/index.js';

export function createAccessibilityEngine(options = {}) {
  const engine = new AccessibilityEngine(options);
  
  // Register all WCAG 2.2 rules by default
  Object.values(WCAG22.rules).forEach(rule => {
    engine.registerRule(rule);
  });
  
  // Register best practice rules
  Object.values(bestPracticeRules).forEach(rule => {
    engine.registerRule(rule);
  });
  
  // Register WCAG rulesets
  Object.entries(WCAG22.rulesets).forEach(([name, ruleIds]) => {
    engine.registerRuleset(name, ruleIds);
  });
  
  // Register best practice ruleset
  const bestPracticeRuleIds = Object.keys(bestPracticeRules);
  engine.registerRuleset('best-practice', bestPracticeRuleIds);
  
  // Create combined rulesets
  engine.registerRuleset('wcag22aa-with-best-practices', [
    ...WCAG22.rulesets.wcag22aa,
    ...bestPracticeRuleIds
  ]);
  
  engine.registerRuleset('all', [
    ...WCAG22.rulesets.wcag22aaa,
    ...bestPracticeRuleIds
  ]);
  
  return engine;
}
