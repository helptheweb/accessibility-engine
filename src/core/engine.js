/**
 * Core Accessibility Engine
 */

export class AccessibilityEngine {
  constructor(options = {}) {
    this.options = {
      runOnly: options.runOnly || ['wcag22a', 'wcag22aa'],
      resultTypes: options.resultTypes || ['violations'],
      reporter: options.reporter || 'v2',
      maxElements: options.maxElements || 5000,
      timeout: options.timeout || 30000,
      silent: options.silent || false, // Add silent mode
      ...options
    };
    
    this.rules = new Map();
    this.rulesets = new Map();
    this.results = {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: []
    };
    this.errors = []; // Collect errors instead of logging
  }

  /**
   * Register a rule with the engine
   */
  registerRule(rule) {
    if (!rule.id || !rule.evaluate) {
      throw new Error('Rule must have an id and evaluate function');
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * Register a ruleset (collection of rules)
   */
  registerRuleset(name, ruleIds) {
    this.rulesets.set(name, ruleIds);
  }

  /**
   * Run accessibility checks on the document or specific context
   */
  async run(context, callback) {
    try {
      // Reset results and errors
      this.results = {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: []
      };
      this.errors = [];

      // Determine the document context
      let doc, rootElement;
      
      if (!context) {
        // No context provided, use global document if available
        if (typeof document !== 'undefined') {
          doc = document;
          rootElement = document.documentElement;
        } else {
          throw new Error('No document context available');
        }
      } else if (context.documentElement) {
        // It's a document
        doc = context;
        rootElement = context.documentElement;
      } else if (context.ownerDocument) {
        // It's an element
        doc = context.ownerDocument;
        rootElement = context;
      } else if (context.document) {
        // It's a window
        doc = context.document;
        rootElement = doc.documentElement;
      } else {
        throw new Error('Invalid context provided');
      }

      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const rulesToRun = this._getRulesToRun();
      
      // Set up timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Accessibility test timeout')), this.options.timeout);
      });
      
      // Run rules in parallel for better performance
      const rulePromises = [];
      
      for (const ruleId of rulesToRun) {
        const rule = this.rules.get(ruleId);
        if (rule) {
          rulePromises.push(this._runRule(rule, rootElement, doc));
        }
      }
      
      // Wait for all rules to complete or timeout
      try {
        await Promise.race([
          Promise.all(rulePromises),
          timeoutPromise
        ]);
      } catch (timeoutError) {
        this.errors.push({
          type: 'timeout',
          message: 'Some accessibility tests timed out'
        });
      }
      
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      
      const report = {
        ...this._filterResults(),
        timestamp: new Date().toISOString(),
        url: this._getUrl(doc),
        testEngine: {
          name: '@helptheweb/accessibility-engine',
          version: '1.1.0'
        },
        testEnvironment: this._getTestEnvironment(doc),
        testRunner: {
          name: 'HelpTheWeb Runner'
        },
        toolOptions: this.options,
        time: endTime - startTime
      };

      // Add errors to report if any occurred
      if (this.errors.length > 0 && !this.options.silent) {
        report.errors = this.errors;
      }

      if (callback) {
        callback(null, report);
      }
      
      return report;
    } catch (error) {
      if (callback) {
        callback(error);
      }
      throw error;
    }
  }

  /**
   * Get rules to run based on options
   */
  _getRulesToRun() {
    const rulesToRun = new Set();
    
    if (this.options.runOnly) {
      const rulesets = Array.isArray(this.options.runOnly) 
        ? this.options.runOnly 
        : [this.options.runOnly];
        
      rulesets.forEach(rulesetName => {
        const ruleIds = this.rulesets.get(rulesetName);
        if (ruleIds) {
          ruleIds.forEach(id => rulesToRun.add(id));
        }
      });
    } else {
      // Run all rules if no specific ruleset specified
      this.rules.forEach((rule, id) => rulesToRun.add(id));
    }
    
    return rulesToRun;
  }

  /**
   * Run a single rule with error handling
   */
  async _runRule(rule, context, doc) {
    try {
      // Add timeout for individual rules
      const ruleTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Rule ${rule.id} timed out`)), 5000);
      });
      
      const ruleExecution = this._executeRule(rule, context, doc);
      
      await Promise.race([ruleExecution, ruleTimeout]);
    } catch (error) {
      this.errors.push({
        type: 'rule_error',
        rule: rule.id,
        message: error.message
      });
      
      // Add rule to incomplete if it errors
      this.results.incomplete.push({
        id: rule.id,
        description: rule.description,
        help: rule.help,
        helpUrl: rule.helpUrl,
        impact: rule.impact,
        tags: rule.tags,
        explanation: rule.explanation,
        nodes: []
      });
    }
  }

  /**
   * Execute a single rule
   */
  async _executeRule(rule, context, doc) {
    const elements = this._getElements(rule.selector, context, doc);
    
    if (elements.length === 0) {
      this.results.inapplicable.push({
        id: rule.id,
        description: rule.description,
        help: rule.help,
        helpUrl: rule.helpUrl,
        impact: rule.impact,
        tags: rule.tags,
        explanation: rule.explanation,
        nodes: []
      });
      return;
    }

    const ruleResult = {
      id: rule.id,
      description: rule.description,
      help: rule.help,
      helpUrl: rule.helpUrl,
      impact: rule.impact,
      tags: rule.tags,
      explanation: rule.explanation,
      nodes: []
    };

    // Limit number of elements to check
    const elementsToCheck = elements.slice(0, this.options.maxElements);
    
    if (elements.length > this.options.maxElements) {
      this.errors.push({
        type: 'element_limit',
        rule: rule.id,
        message: `Checking only first ${this.options.maxElements} of ${elements.length} elements`
      });
    }

    for (const element of elementsToCheck) {
      try {
        const result = await rule.evaluate(element, this.options);
        
        if (result) {
          const nodeResult = {
            html: this._getOuterHTML(element),
            target: this._getSelector(element),
            ...result
          };
          
          ruleResult.nodes.push(nodeResult);
        }
      } catch (elementError) {
        // Silently skip elements that cause errors
        this.errors.push({
          type: 'element_error',
          rule: rule.id,
          message: elementError.message
        });
      }
    }

    if (ruleResult.nodes.length > 0) {
      const allPassed = ruleResult.nodes.every(n => n.passed);
      const anyIncomplete = ruleResult.nodes.some(n => n.incomplete);
      
      if (anyIncomplete) {
        this.results.incomplete.push(ruleResult);
      } else if (allPassed) {
        this.results.passes.push(ruleResult);
      } else {
        this.results.violations.push(ruleResult);
      }
    }
  }

  /**
   * Get elements matching selector with performance optimization
   */
  _getElements(selector, context, doc) {
    if (!selector) return [context];
    
    try {
      // Special handling for selectors that need document context
      if (selector === 'html' || selector === 'body') {
        const element = doc.querySelector(selector);
        return element ? [element] : [];
      }
      
      // For wildcard selector, limit scope
      if (selector === '*') {
        // Only check visible text elements for performance
        const textSelectors = 'p, span, div, h1, h2, h3, h4, h5, h6, li, td, th, a, button';
        return Array.from(context.querySelectorAll(textSelectors));
      }
      
      return Array.from(context.querySelectorAll(selector));
    } catch (e) {
      this.errors.push({
        type: 'selector_error',
        selector: selector,
        message: e.message
      });
      return [];
    }
  }

  /**
   * Get clean outer HTML
   */
  _getOuterHTML(element) {
    try {
      const clone = element.cloneNode(false);
      // Limit HTML length for performance
      const html = clone.outerHTML || `<${element.nodeName.toLowerCase()}>`;
      return html.length > 200 ? html.substring(0, 200) + '...' : html;
    } catch (e) {
      return `<${element.nodeName.toLowerCase()}>`;
    }
  }

  /**
   * Generate CSS selector for element
   */
  _getSelector(element) {
    const path = [];
    let current = element;
    
    // Use nodeType constant safely
    const ELEMENT_NODE = 1;
    
    // Limit depth for performance
    let depth = 0;
    const maxDepth = 10;
    
    while (current && current.nodeType === ELEMENT_NODE && depth < maxDepth) {
      let selector = current.nodeName.toLowerCase();
      
      if (current.id) {
        selector = `#${current.id}`;
        path.unshift(selector);
        break;
      } else {
        let sibling = current;
        let nth = 1;
        
        while (sibling.previousElementSibling) {
          sibling = sibling.previousElementSibling;
          if (sibling.nodeName === current.nodeName) {
            nth++;
          }
        }
        
        if (nth > 1) {
          selector += `:nth-of-type(${nth})`;
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
      depth++;
    }
    
    return path.join(' > ');
  }

  /**
   * Filter results based on options
   */
  _filterResults() {
    const filtered = {};
    
    if (this.options.resultTypes) {
      this.options.resultTypes.forEach(type => {
        if (this.results[type]) {
          filtered[type] = this.results[type];
        }
      });
    } else {
      return this.results;
    }
    
    return filtered;
  }

  /**
   * Get test environment details
   */
  _getTestEnvironment(doc) {
    try {
      const win = doc?.defaultView || global.window;
      
      if (win) {
        return {
          userAgent: win.navigator?.userAgent || 'Unknown',
          windowWidth: win.innerWidth || null,
          windowHeight: win.innerHeight || null
        };
      }
    } catch (e) {
      // Fallback silently
    }
    
    return {
      userAgent: 'Bun.js/Node.js',
      windowWidth: null,
      windowHeight: null
    };
  }

  /**
   * Get URL from document
   */
  _getUrl(doc) {
    try {
      if (doc?.location?.href) {
        return doc.location.href;
      }
      
      if (doc?.defaultView?.location?.href) {
        return doc.defaultView.location.href;
      }
      
      if (doc?.URL) {
        return doc.URL;
      }
    } catch (e) {
      // Fallback silently
    }
    
    return '';
  }
}
