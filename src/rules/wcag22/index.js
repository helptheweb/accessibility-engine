/**
 * WCAG 2.2 Rules Index
 */

import { perceivableRules } from './perceivable.js';
import { operableRules } from './operable.js';
import { understandableRules } from './understandable.js';
import { robustRules } from './robust.js';

// Combine all rules
export const rules = {
  ...perceivableRules,
  ...operableRules,
  ...understandableRules,
  ...robustRules
};

// Get all rule IDs
const allRuleIds = Object.keys(rules);

// Define rulesets for different conformance levels
export const rulesets = {
  // Level A rules
  wcag22a: allRuleIds.filter(id => 
    rules[id].tags.includes('wcag22a')
  ),
  
  // Level A + AA rules
  wcag22aa: allRuleIds.filter(id => 
    rules[id].tags.includes('wcag22a') || 
    rules[id].tags.includes('wcag22aa')
  ),
  
  // All rules (A + AA + AAA)
  wcag22aaa: allRuleIds
};

export const WCAG22 = {
  rules,
  rulesets
};
