/**
 * TypeScript definitions for @helptheweb/accessibility-engine
 */

export interface Rule {
  /** Unique identifier for the rule */
  id: string;
  
  /** CSS selector to find elements to test */
  selector: string;
  
  /** Tags for categorization (e.g., 'wcag22a', 'wcag22aa') */
  tags: string[];
  
  /** Impact level of violations */
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  
  /** Brief description of what the rule checks */
  description: string;
  
  /** Help text for fixing violations */
  help: string;
  
  /** URL to detailed documentation */
  helpUrl: string;
  
  /** Plain English explanation for non-technical users */
  explanation?: string;
  
  /** Function to evaluate an element against the rule */
  evaluate: (element: Element, options: EngineOptions) => RuleResult | null;
}

export interface RuleResult {
  /** Whether the element passed the rule */
  passed?: boolean;
  
  /** Whether the test was incomplete and needs manual review */
  incomplete?: boolean;
  
  /** Error or warning message */
  message?: string;
  
  /** Additional data about the result */
  data?: Record<string, any>;
}

export interface NodeResult {
  /** HTML snippet of the element */
  html: string;
  
  /** CSS selector path to the element */
  target: string;
  
  /** Whether the element passed */
  passed?: boolean;
  
  /** Whether the test was incomplete */
  incomplete?: boolean;
  
  /** Error or warning message */
  message?: string;
  
  /** Additional data */
  data?: Record<string, any>;
}

export interface RuleReport {
  /** Rule ID */
  id: string;
  
  /** Rule description */
  description: string;
  
  /** Help text */
  help: string;
  
  /** Documentation URL */
  helpUrl: string;
  
  /** Impact level */
  impact: string;
  
  /** Rule tags */
  tags: string[];
  
  /** Plain English explanation */
  explanation?: string;
  
  /** Results for each tested element */
  nodes: NodeResult[];
}

export interface EngineOptions {
  /** Rulesets to run (e.g., ['wcag22a', 'wcag22aa']) */
  runOnly?: string[] | string;
  
  /** Result types to include (e.g., ['violations', 'passes']) */
  resultTypes?: string[];
  
  /** Reporter version */
  reporter?: string;
  
  /** Rule-specific options */
  rules?: Record<string, any>;
}

export interface TestEnvironment {
  /** Browser user agent */
  userAgent: string;
  
  /** Window width */
  windowWidth: number | null;
  
  /** Window height */
  windowHeight: number | null;
}

export interface TestEngine {
  /** Engine name */
  name: string;
  
  /** Engine version */
  version: string;
}

export interface Report {
  /** Failed rules */
  violations?: RuleReport[];
  
  /** Passed rules */
  passes?: RuleReport[];
  
  /** Incomplete rules needing manual review */
  incomplete?: RuleReport[];
  
  /** Inapplicable rules */
  inapplicable?: RuleReport[];
  
  /** ISO timestamp */
  timestamp: string;
  
  /** Page URL */
  url: string;
  
  /** Engine information */
  testEngine: TestEngine;
  
  /** Environment information */
  testEnvironment: TestEnvironment;
  
  /** Runner information */
  testRunner: {
    name: string;
  };
  
  /** Options used */
  toolOptions: EngineOptions;
  
  /** Execution time in milliseconds */
  time: number;
}

export interface AccessibilityEngine {
  /** Engine options */
  options: EngineOptions;
  
  /** Registered rules */
  rules: Map<string, Rule>;
  
  /** Registered rulesets */
  rulesets: Map<string, string[]>;
  
  /** Register a new rule */
  registerRule(rule: Rule): void;
  
  /** Register a ruleset */
  registerRuleset(name: string, ruleIds: string[]): void;
  
  /** Run accessibility tests */
  run(context?: Document | Element): Promise<Report>;
  run(context: Document | Element, callback: (error: Error | null, report: Report) => void): void;
}

export interface WCAG22Namespace {
  /** All WCAG 2.2 rules */
  rules: Record<string, Rule>;
  
  /** WCAG 2.2 rulesets */
  rulesets: {
    wcag22a: string[];
    wcag22aa: string[];
    wcag22aaa: string[];
  };
}

/** Factory function to create an accessibility engine */
export function createAccessibilityEngine(options?: EngineOptions): AccessibilityEngine;

/** Main engine class */
export class AccessibilityEngine implements AccessibilityEngine {
  constructor(options?: EngineOptions);
}

/** WCAG 2.2 rules and rulesets */
export const WCAG22: WCAG22Namespace;

/** Default export */
export default createAccessibilityEngine;
