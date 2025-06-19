/**
 * WCAG 2.2 Principle 3: Understandable - Complete Rules
 * Information and the operation of user interface must be understandable.
 */

export const understandableRules = {
  // 3.1.1 Language of Page (Level A)
  'language-of-page': {
    id: 'language-of-page',
    selector: 'html',
    tags: ['wcag22a', 'wcag311', 'understandable'],
    impact: 'serious',
    description: 'Page must have a language specified',
    help: 'The html element should have a valid lang attribute',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html',
    explanation: 'Screen readers need to know what language the page is in so they can pronounce words correctly. Like knowing whether to say "Paris" in English or French.',
    evaluate: (element) => {
      const lang = element.getAttribute('lang');
      
      if (!lang) {
        return {
          passed: false,
          message: 'Page missing lang attribute'
        };
      }
      
      // Basic validation of language code
      const langPattern = /^[a-z]{2,3}(-[A-Z]{2})?$/;
      if (!langPattern.test(lang)) {
        return {
          passed: false,
          message: `Invalid language code: ${lang}`
        };
      }
      
      return { passed: true };
    }
  },

  // 3.1.2 Language of Parts (Level AA)
  'language-of-parts': {
    id: 'language-of-parts',
    selector: '[lang]',
    tags: ['wcag22aa', 'wcag312', 'understandable'],
    impact: 'moderate',
    description: 'Language changes must be identified',
    help: 'Use lang attribute for content in different languages',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html',
    explanation: 'If part of your page is in a different language, mark it so screen readers switch pronunciation. Like a Spanish quote in an English article.',
    evaluate: (element) => {
      const lang = element.getAttribute('lang');
      
      // Skip html element (covered by language-of-page)
      if (element.tagName === 'HTML') {
        return null;
      }
      
      // Basic validation of language code
      const langPattern = /^[a-z]{2,3}(-[A-Z]{2})?$/;
      if (!langPattern.test(lang)) {
        return {
          passed: false,
          message: `Invalid language code: ${lang}`
        };
      }
      
      return { passed: true };
    }
  },

  // 3.1.3 Unusual Words (Level AAA)
  'unusual-words': {
    id: 'unusual-words',
    selector: 'abbr, acronym, [class*="glossary"], [class*="definition"]',
    tags: ['wcag22aaa', 'wcag313', 'understandable'],
    impact: 'minor',
    description: 'Unusual words should be defined',
    help: 'Provide definitions for jargon, idioms, and technical terms',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html',
    explanation: 'Technical terms, jargon, or unusual phrases should be explained. Not everyone knows specialized vocabulary or idioms.',
    evaluate: (element) => {
      if (element.tagName === 'ABBR' || element.tagName === 'ACRONYM') {
        const title = element.getAttribute('title');
        if (!title) {
          return {
            passed: false,
            message: 'Abbreviation missing title attribute with definition'
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 3.1.4 Abbreviations (Level AAA)
  'abbreviations': {
    id: 'abbreviations',
    selector: 'body',
    tags: ['wcag22aaa', 'wcag314', 'understandable'],
    impact: 'minor',
    description: 'Abbreviations should be expanded',
    help: 'Provide expanded forms of abbreviations',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html',
    explanation: 'The first time you use an abbreviation like "HTML", explain what it means: "HyperText Markup Language (HTML)".',
    evaluate: (element) => {
      // Look for potential abbreviations (all caps, 2-5 characters)
      const text = element.textContent;
      const abbrevPattern = /\b[A-Z]{2,5}\b/g;
      const matches = text.match(abbrevPattern) || [];
      
      if (matches.length > 0) {
        // Check if any are wrapped in abbr tags
        const abbrElements = element.querySelectorAll('abbr');
        if (abbrElements.length === 0 && matches.length > 3) {
          return {
            passed: false,
            message: 'Page contains abbreviations that may need expansion',
            incomplete: true
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 3.1.5 Reading Level (Level AAA)
  'reading-level': {
    id: 'reading-level',
    selector: 'main, article, [role="main"]',
    tags: ['wcag22aaa', 'wcag315', 'understandable'],
    impact: 'minor',
    description: 'Content should be readable at lower secondary education level',
    help: 'Write content at an appropriate reading level',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html',
    explanation: 'Content should be written simply enough for most people to understand, roughly at a 9th grade reading level.',
    evaluate: (element) => {
      // This would require text analysis algorithms
      // Marking as incomplete for manual review
      return {
        passed: true,
        incomplete: true,
        message: 'Reading level requires manual review'
      };
    }
  },

  // 3.2.1 On Focus (Level A)
  'on-focus': {
    id: 'on-focus',
    selector: 'a, button, input, select, textarea, [tabindex]',
    tags: ['wcag22a', 'wcag321', 'understandable'],
    impact: 'serious',
    description: 'Focus must not trigger unexpected context changes',
    help: 'Receiving focus should not cause unexpected changes',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html',
    explanation: 'When users tab to an element, it should not automatically submit forms or navigate to new pages. That would be surprising and confusing.',
    evaluate: (element) => {
      // Check for focus handlers that might cause context changes
      const hasFocusHandler = element.hasAttribute('onfocus');
      const focusHandler = element.getAttribute('onfocus');
      
      if (hasFocusHandler && focusHandler) {
        // Look for problematic patterns
        const problematicPatterns = [
          /window\.location/,
          /\.submit\(/,
          /\.href/,
          /navigate/i,
          /redirect/i
        ];
        
        const hasProblematicCode = problematicPatterns.some(pattern => 
          pattern.test(focusHandler)
        );
        
        if (hasProblematicCode) {
          return {
            passed: false,
            message: 'Focus handler may cause unexpected context change'
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 3.2.2 On Input (Level A)
  'on-input': {
    id: 'on-input',
    selector: 'input, select, textarea',
    tags: ['wcag22a', 'wcag322', 'understandable'],
    impact: 'serious',
    description: 'Changing input values must not cause unexpected context changes',
    help: 'Form inputs should not automatically submit or navigate',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/on-input.html',
    explanation: 'Changing a form field should not automatically submit the form or go to a new page unless users are warned first.',
    evaluate: (element) => {
      // Check for change handlers that might cause context changes
      const hasChangeHandler = element.hasAttribute('onchange') || 
                              element.hasAttribute('oninput');
      const handler = element.getAttribute('onchange') || 
                     element.getAttribute('oninput');
      
      if (hasChangeHandler && handler) {
        // Look for problematic patterns
        const problematicPatterns = [
          /\.submit\(/,
          /window\.location/,
          /\.href/,
          /navigate/i,
          /redirect/i
        ];
        
        const hasProblematicCode = problematicPatterns.some(pattern => 
          pattern.test(handler)
        );
        
        if (hasProblematicCode) {
          return {
            passed: false,
            message: 'Input handler may cause unexpected context change'
          };
        }
      }
      
      // Check for auto-submitting forms
      if (element.tagName === 'SELECT' && element.hasAttribute('onchange')) {
        const form = element.closest('form');
        if (form && !form.querySelector('[type="submit"]')) {
          return {
            passed: false,
            message: 'Select element may auto-submit form'
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 3.2.3 Consistent Navigation (Level AA)
  'consistent-navigation': {
    id: 'consistent-navigation',
    selector: 'nav, [role="navigation"]',
    tags: ['wcag22aa', 'wcag323', 'understandable'],
    impact: 'moderate',
    description: 'Navigation must be consistent across pages',
    help: 'Keep navigation mechanisms consistent',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html',
    explanation: 'Navigation menus should be in the same place and order on every page. Users learn where things are and expect them to stay there.',
    evaluate: (element) => {
      // This is a simplified check - full implementation would need multi-page analysis
      const navItems = element.querySelectorAll('a, button');
      
      if (navItems.length === 0) {
        return {
          passed: false,
          message: 'Navigation region has no interactive elements'
        };
      }
      
      return { passed: true };
    }
  },

  // 3.2.4 Consistent Identification (Level AA)
  'consistent-identification': {
    id: 'consistent-identification',
    selector: '[class*="icon"], [class*="button"], [class*="btn"]',
    tags: ['wcag22aa', 'wcag324', 'understandable'],
    impact: 'moderate',
    description: 'Components with same functionality must be identified consistently',
    help: 'Use consistent labels for components with same function',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html',
    explanation: 'If you have multiple "Download" buttons on your site, they should all say "Download", not "Download" on one page and "Get File" on another.',
    evaluate: (element) => {
      // This is a heuristic check
      const text = element.textContent.trim();
      const ariaLabel = element.getAttribute('aria-label');
      const title = element.getAttribute('title');
      
      const label = text || ariaLabel || title;
      
      if (!label) {
        return {
          passed: false,
          message: 'Component lacks identifying text or label'
        };
      }
      
      return { passed: true };
    }
  },

  // 3.2.6 Consistent Help (Level A) - New in WCAG 2.2
  'consistent-help': {
    id: 'consistent-help',
    selector: '[class*="help"], [class*="support"], [class*="contact"]',
    tags: ['wcag22a', 'wcag326', 'understandable'],
    impact: 'moderate',
    description: 'Help mechanisms must be consistently located',
    help: 'Keep help options in the same place across pages',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html',
    explanation: 'If you have a help button or contact link, it should be in the same spot on every page so users can find it when they need it.',
    evaluate: (element) => {
      // This requires cross-page analysis
      return {
        passed: true,
        incomplete: true,
        message: 'Consistent help location requires manual verification across pages'
      };
    }
  },

  // 3.3.1 Error Identification (Level A)
  'error-identification': {
    id: 'error-identification',
    selector: 'input[aria-invalid="true"], .error, .invalid, [class*="error"]',
    tags: ['wcag22a', 'wcag331', 'understandable'],
    impact: 'serious',
    description: 'Input errors must be identified',
    help: 'Clearly identify input errors in text',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html',
    explanation: 'When users make a mistake filling out a form, tell them clearly what went wrong. Do not just use color - add text explaining the error.',
    evaluate: (element) => {
      const isInvalid = element.getAttribute('aria-invalid') === 'true' ||
                       element.classList.contains('error') ||
                       element.classList.contains('invalid');
      
      if (isInvalid) {
        // Check for error message
        const describedby = element.getAttribute('aria-describedby');
        const errorMessage = describedby ? document.getElementById(describedby) : null;
        
        // Check for adjacent error text
        const nextElement = element.nextElementSibling;
        const hasAdjacentError = nextElement && 
          (nextElement.classList.contains('error') || 
           nextElement.textContent.toLowerCase().includes('error'));
        
        if (!errorMessage && !hasAdjacentError) {
          return {
            passed: false,
            message: 'Error is indicated but not described in text'
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 3.3.2 Labels or Instructions (Level A)
  'labels-or-instructions': {
    id: 'labels-or-instructions',
    selector: 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
    tags: ['wcag22a', 'wcag332', 'understandable'],
    impact: 'serious',
    description: 'Input fields must have labels or instructions',
    help: 'Provide labels or instructions for user input',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html',
    explanation: 'Every form field needs a label telling users what to enter. Do not rely on placeholder text alone - it disappears when users start typing.',
    evaluate: (element) => {
      const id = element.id;
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledby = element.getAttribute('aria-labelledby');
      const placeholder = element.getAttribute('placeholder');
      const title = element.getAttribute('title');
      
      // Check for explicit label
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label && label.textContent.trim()) {
          return { passed: true };
        }
      }
      
      // Check for implicit label
      const parent = element.parentElement;
      if (parent && parent.tagName === 'LABEL') {
        return { passed: true };
      }
      
      // Check for ARIA labeling
      if (ariaLabel || ariaLabelledby) {
        return { passed: true };
      }
      
      // Check if placeholder or title provide sufficient context
      if (placeholder && placeholder.length > 5) {
        return { passed: true };
      }
      
      if (title && title.length > 5) {
        return { passed: true };
      }
      
      return {
        passed: false,
        message: 'Form element lacks label or instructions'
      };
    }
  },

  // 3.3.3 Error Suggestion (Level AA)
  'error-suggestion': {
    id: 'error-suggestion',
    selector: 'input[aria-invalid="true"], .error, .invalid',
    tags: ['wcag22aa', 'wcag333', 'understandable'],
    impact: 'moderate',
    description: 'Error messages should suggest corrections',
    help: 'Provide suggestions for fixing input errors',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html',
    explanation: 'Do not just say "Invalid email" - explain how to fix it: "Email must include an @ symbol, like name@example.com".',
    evaluate: (element) => {
      const isInvalid = element.getAttribute('aria-invalid') === 'true' ||
                       element.classList.contains('error') ||
                       element.classList.contains('invalid');
      
      if (isInvalid) {
        // Check for error message with suggestions
        const describedby = element.getAttribute('aria-describedby');
        const errorElement = describedby ? document.getElementById(describedby) : 
                           element.nextElementSibling;
        
        if (errorElement) {
          const errorText = errorElement.textContent.toLowerCase();
          const hasSuggestion = errorText.includes('must') ||
                               errorText.includes('should') ||
                               errorText.includes('example') ||
                               errorText.includes('format') ||
                               errorText.includes('like') ||
                               errorText.includes('such as') ||
                               errorText.includes('try');
          
          if (!hasSuggestion) {
            return {
              passed: false,
              message: 'Error message lacks helpful suggestions'
            };
          }
        }
      }
      
      return { passed: true };
    }
  },

  // 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)
  'error-prevention': {
    id: 'error-prevention',
    selector: 'form',
    tags: ['wcag22aa', 'wcag334', 'understandable'],
    impact: 'serious',
    description: 'Forms must prevent or allow correction of user errors',
    help: 'Provide review, confirmation, or reversal for important actions',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html',
    explanation: 'For important actions like purchases or deleting data, let users review and confirm before finalizing, or provide a way to undo.',
    evaluate: (element) => {
      // Check if form might involve legal, financial, or data transactions
      const formText = element.textContent.toLowerCase();
      const importantKeywords = [
        'payment', 'purchase', 'buy', 'order', 'checkout', 'delete', 
        'remove', 'confirm', 'agreement', 'contract', 'subscribe',
        'cancel', 'terminate', 'close account'
      ];
      
      const mightBeImportant = importantKeywords.some(keyword => 
        formText.includes(keyword)
      );
      
      if (mightBeImportant) {
        // Check for confirmation step
        const hasConfirmation = element.querySelector(
          '[type="checkbox"][required], [name*="confirm"], [name*="agree"], [class*="review"]'
        );
        
        // Check for review possibility
        const hasReview = formText.includes('review') || 
                         formText.includes('check') ||
                         formText.includes('verify');
        
        if (!hasConfirmation && !hasReview) {
          return {
            passed: false,
            message: 'Important form lacks confirmation or review step'
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 3.3.7 Redundant Entry (Level A) - New in WCAG 2.2
  'redundant-entry': {
    id: 'redundant-entry',
    selector: 'form',
    tags: ['wcag22a', 'wcag337', 'understandable'],
    impact: 'moderate',
    description: 'Previously entered information should be auto-populated',
    help: 'Do not ask users to re-enter the same information',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html',
    explanation: 'If users already entered their shipping address, do not make them type it again for billing. Offer to copy it or auto-fill.',
    evaluate: (element) => {
      // Check for multiple similar fields
      const emailFields = element.querySelectorAll('input[type="email"]');
      const telFields = element.querySelectorAll('input[type="tel"]');
      
      if (emailFields.length > 1) {
        // Check if fields have different purposes
        const purposes = Array.from(emailFields).map(field => 
          field.name || field.id || ''
        );
        
        const hasDuplicatePurpose = purposes.some((purpose, index) => 
          purposes.indexOf(purpose) !== index
        );
        
        if (hasDuplicatePurpose) {
          return {
            passed: false,
            message: 'Form asks for same information multiple times'
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 3.3.8 Accessible Authentication (Minimum) (Level AA) - New in WCAG 2.2
  'accessible-authentication': {
    id: 'accessible-authentication',
    selector: 'input[type="password"], [class*="captcha"], [class*="puzzle"]',
    tags: ['wcag22aa', 'wcag338', 'understandable'],
    impact: 'critical',
    description: 'Authentication must not rely on cognitive function tests',
    help: 'Avoid puzzles, calculations, or memory tests for login',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html',
    explanation: 'Do not use puzzles or memory tests for login. Allow password managers, email links, or biometrics instead. Some people cannot solve CAPTCHAs.',
    evaluate: (element) => {
      // Check for CAPTCHA or puzzle elements
      const classes = element.className || '';
      const hasCaptcha = /captcha|puzzle|challenge/.test(classes.toLowerCase());
      
      if (hasCaptcha) {
        return {
          passed: false,
          message: 'Authentication uses cognitive function test - provide alternatives'
        };
      }
      
      // Check password fields for paste prevention
      if (element.type === 'password') {
        const onpaste = element.getAttribute('onpaste');
        if (onpaste && onpaste.includes('return false')) {
          return {
            passed: false,
            message: 'Password field prevents pasting - this blocks password managers'
          };
        }
      }
      
      return { passed: true };
    }
  }
};
