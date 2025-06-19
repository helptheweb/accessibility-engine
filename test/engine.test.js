import { test, expect } from 'bun:test';
import { createAccessibilityEngine } from '../src/index.js';

test('Engine creation', () => {
  const engine = createAccessibilityEngine();
  expect(engine).toBeDefined();
  expect(engine.run).toBeDefined();
  expect(engine.registerRule).toBeDefined();
  expect(engine.registerRuleset).toBeDefined();
});

test('Engine with custom options', () => {
  const engine = createAccessibilityEngine({
    runOnly: 'wcag22a',
    resultTypes: ['violations']
  });
  
  expect(engine.options.runOnly).toBe('wcag22a');
  expect(engine.options.resultTypes).toEqual(['violations']);
});

test('Rule registration', () => {
  const engine = createAccessibilityEngine();
  
  const customRule = {
    id: 'test-rule',
    selector: '.test',
    evaluate: () => ({ passed: true })
  };
  
  engine.registerRule(customRule);
  expect(engine.rules.has('test-rule')).toBe(true);
});

test('Ruleset registration', () => {
  const engine = createAccessibilityEngine();
  
  engine.registerRuleset('test-ruleset', ['rule-1', 'rule-2']);
  expect(engine.rulesets.has('test-ruleset')).toBe(true);
  expect(engine.rulesets.get('test-ruleset')).toEqual(['rule-1', 'rule-2']);
});
