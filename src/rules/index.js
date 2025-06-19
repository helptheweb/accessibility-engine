// Helper functions for rules management
import { rules } from './wcag22/index.js';

export function getAllRules() {
  // Convert rules object to array format
  return Object.entries(rules).map(([id, rule]) => ({
    id,
    ...rule
  }));
}

export function getRuleById(ruleId) {
  const rule = rules[ruleId];
  return rule ? { id: ruleId, ...rule } : null;
}

export function getRulesByTag(tag) {
  return getAllRules().filter(rule => rule.tags.includes(tag));
}

export function getRulesByImpact(impact) {
  return getAllRules().filter(rule => rule.impact === impact);
}
