/**
 * Type definitions for the accessibility engine
 * These can be used with JSDoc or converted to TypeScript
 */

/**
 * @typedef {Object} Rule
 * @property {string} id - Unique identifier for the rule
 * @property {string} selector - CSS selector to find elements to test
 * @property {string[]} tags - Tags for categorization (e.g., 'wcag22a')
 * @property {'critical'|'serious'|'moderate'|'minor'} impact - Impact level
 * @property {string} description - Brief description of what the rule checks
 * @property {string} help - Help text for fixing violations
 * @property {string} helpUrl - URL to detailed documentation
 * @property {function(Element, Options): RuleResult} evaluate - Function to test an element
 */

/**
 * @typedef {Object} RuleResult
 * @property {boolean} [passed] - Whether the element passed the rule
 * @property {boolean} [incomplete] - Whether the test was incomplete
 * @property {string} [message] - Error or warning message
 * @property {Object} [data] - Additional data about the result
 */

/**
 * @typedef {Object} NodeResult
 * @property {string} html - HTML snippet of the element
 * @property {string} target - CSS selector path to the element
 * @property {boolean} [passed] - Whether the element passed
 * @property {boolean} [incomplete] - Whether the test was incomplete
 * @property {string} [message] - Error or warning message
 * @property {Object} [data] - Additional data
 */

/**
 * @typedef {Object} RuleReport
 * @property {string} id - Rule ID
 * @property {string} description - Rule description
 * @property {string} help - Help text
 * @property {string} helpUrl - Documentation URL
 * @property {string} impact - Impact level
 * @property {string[]} tags - Rule tags
 * @property {NodeResult[]} nodes - Results for each tested element
 */

/**
 * @typedef {Object} EngineOptions
 * @property {string[]|string} [runOnly] - Rulesets to run (e.g., ['wcag22a', 'wcag22aa'])
 * @property {string[]} [resultTypes] - Result types to include (e.g., ['violations', 'passes'])
 * @property {string} [reporter] - Reporter version
 * @property {Object} [rules] - Rule-specific options
 */

/**
 * @typedef {Object} TestEnvironment
 * @property {string} userAgent - Browser user agent
 * @property {number} windowWidth - Window width
 * @property {number} windowHeight - Window height
 */

/**
 * @typedef {Object} TestEngine
 * @property {string} name - Engine name
 * @property {string} version - Engine version
 */

/**
 * @typedef {Object} Report
 * @property {RuleReport[]} [violations] - Failed rules
 * @property {RuleReport[]} [passes] - Passed rules
 * @property {RuleReport[]} [incomplete] - Incomplete rules
 * @property {RuleReport[]} [inapplicable] - Inapplicable rules
 * @property {string} timestamp - ISO timestamp
 * @property {string} url - Page URL
 * @property {TestEngine} testEngine - Engine information
 * @property {TestEnvironment} testEnvironment - Environment information
 * @property {Object} testRunner - Runner information
 * @property {EngineOptions} toolOptions - Options used
 * @property {number} time - Execution time in milliseconds
 */

export const Types = {
  // Export for documentation purposes
};
