/**
 * Best Practice Rules for HTML Semantics and Accessibility
 * These rules go beyond WCAG requirements to ensure proper HTML structure
 */

export const bestPracticeRules = {
  // Landmark uniqueness rules
  'landmark-unique-main': {
    id: 'landmark-unique-main',
    selector: 'main, [role="main"]',
    tags: ['best-practice', 'landmarks', 'html5'],
    impact: 'moderate',
    description: 'Page must have only one main landmark',
    help: 'Ensure only one main landmark exists on the page',
    helpUrl: 'https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/',
    explanation: 'Pages should have exactly one <main> element or element with role="main". Multiple main landmarks confuse screen reader users about where the primary content is located.',
    evaluate: (element) => {
      // This runs once per matching element, so we need to check globally
      const allMains = document.querySelectorAll('main, [role="main"]');
      
      if (allMains.length > 1) {
        // Only report on the second and subsequent main elements
        const elementIndex = Array.from(allMains).indexOf(element);
        if (elementIndex > 0) {
          return {
            passed: false,
            message: `Found ${allMains.length} main landmarks on the page. There should be only one.`
          };
        }
      }
      
      return { passed: true };
    }
  },

  // Banner landmark uniqueness
  'landmark-unique-banner': {
    id: 'landmark-unique-banner',
    selector: 'header:not([role]), [role="banner"]',
    tags: ['best-practice', 'landmarks', 'html5'],
    impact: 'moderate',
    description: 'Page must have only one banner landmark',
    help: 'Ensure only one banner landmark exists at the top level',
    helpUrl: 'https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/',
    explanation: 'There should be only one banner landmark (header or role="banner") that is a direct child of body. Multiple banners confuse the page structure.',
    evaluate: (element) => {
      // Check if this is a top-level banner (direct child of body or main)
      let parent = element.parentElement;
      let isTopLevel = false;
      
      while (parent) {
        if (parent.tagName === 'BODY') {
          isTopLevel = true;
          break;
        }
        // Banner inside main/article/section is OK
        if (['MAIN', 'ARTICLE', 'SECTION'].includes(parent.tagName)) {
          return { passed: true };
        }
        parent = parent.parentElement;
      }
      
      if (isTopLevel) {
        const allBanners = document.querySelectorAll('body > header:not([role]), body > [role="banner"]');
        if (allBanners.length > 1) {
          const elementIndex = Array.from(allBanners).indexOf(element);
          if (elementIndex > 0) {
            return {
              passed: false,
              message: `Found ${allBanners.length} banner landmarks at the top level. There should be only one.`
            };
          }
        }
      }
      
      return { passed: true };
    }
  },

  // Contentinfo landmark uniqueness
  'landmark-unique-contentinfo': {
    id: 'landmark-unique-contentinfo',
    selector: 'footer:not([role]), [role="contentinfo"]',
    tags: ['best-practice', 'landmarks', 'html5'],
    impact: 'moderate',
    description: 'Page must have only one contentinfo landmark',
    help: 'Ensure only one contentinfo landmark exists at the top level',
    helpUrl: 'https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/',
    explanation: 'There should be only one contentinfo landmark (footer or role="contentinfo") that is a direct child of body. Multiple footers confuse the page structure.',
    evaluate: (element) => {
      // Similar logic to banner
      let parent = element.parentElement;
      let isTopLevel = false;
      
      while (parent) {
        if (parent.tagName === 'BODY') {
          isTopLevel = true;
          break;
        }
        if (['MAIN', 'ARTICLE', 'SECTION'].includes(parent.tagName)) {
          return { passed: true };
        }
        parent = parent.parentElement;
      }
      
      if (isTopLevel) {
        const allFooters = document.querySelectorAll('body > footer:not([role]), body > [role="contentinfo"]');
        if (allFooters.length > 1) {
          const elementIndex = Array.from(allFooters).indexOf(element);
          if (elementIndex > 0) {
            return {
              passed: false,
              message: `Found ${allFooters.length} contentinfo landmarks at the top level. There should be only one.`
            };
          }
        }
      }
      
      return { passed: true };
    }
  },

  // Heading hierarchy
  'heading-order': {
    id: 'heading-order',
    selector: 'h1, h2, h3, h4, h5, h6',
    tags: ['best-practice', 'headings', 'structure'],
    impact: 'moderate',
    description: 'Heading levels should not skip',
    help: 'Ensure heading levels increase by one',
    helpUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/',
    explanation: 'Heading levels should not skip (e.g., from h1 to h3). This helps screen reader users understand the document structure.',
    evaluate: (element) => {
      const level = parseInt(element.tagName.charAt(1));
      
      // Find the previous heading
      const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const currentIndex = allHeadings.indexOf(element);
      
      if (currentIndex > 0) {
        const previousHeading = allHeadings[currentIndex - 1];
        const previousLevel = parseInt(previousHeading.tagName.charAt(1));
        
        // Check if we skipped a level
        if (level > previousLevel + 1) {
          return {
            passed: false,
            message: `Heading level ${level} follows level ${previousLevel}. Heading levels should not skip.`
          };
        }
      }
      
      return { passed: true };
    }
  },

  // Single h1
  'single-h1': {
    id: 'single-h1',
    selector: 'h1',
    tags: ['best-practice', 'headings', 'structure'],
    impact: 'moderate',
    description: 'Page should have only one h1',
    help: 'Use only one h1 per page',
    helpUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/',
    explanation: 'While multiple h1 elements are technically valid in HTML5 with sectioning elements, it\'s best practice to have only one h1 that represents the main topic of the page.',
    evaluate: (element) => {
      const allH1s = document.querySelectorAll('h1');
      
      if (allH1s.length > 1) {
        const elementIndex = Array.from(allH1s).indexOf(element);
        if (elementIndex > 0) {
          return {
            passed: false,
            message: `Found ${allH1s.length} h1 elements on the page. Best practice is to use only one h1.`
          };
        }
      }
      
      return { passed: true };
    }
  },

  // Empty heading detection
  'empty-heading': {
    id: 'empty-heading',
    selector: 'h1, h2, h3, h4, h5, h6',
    tags: ['best-practice', 'headings', 'content'],
    impact: 'serious',
    description: 'Headings must contain text',
    help: 'Ensure headings are not empty',
    helpUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/',
    explanation: 'Empty headings confuse screen reader users and provide no navigational benefit. Headings should always contain meaningful text.',
    evaluate: (element) => {
      const text = element.textContent.trim();
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledby = element.getAttribute('aria-labelledby');
      
      // Check for images with alt text
      const img = element.querySelector('img[alt]');
      const hasImageAlt = img && img.getAttribute('alt').trim();
      
      if (!text && !ariaLabel && !ariaLabelledby && !hasImageAlt) {
        return {
          passed: false,
          message: 'Heading is empty and provides no text content'
        };
      }
      
      return { passed: true };
    }
  },

  // Form structure
  'form-field-multiple-labels': {
    id: 'form-field-multiple-labels',
    selector: 'input, select, textarea',
    tags: ['best-practice', 'forms'],
    impact: 'moderate',
    description: 'Form fields should not have multiple labels',
    help: 'Use only one label per form field',
    helpUrl: 'https://www.w3.org/WAI/tutorials/forms/labels/',
    explanation: 'Multiple labels for one form field can confuse screen readers. Use one clear label per field.',
    evaluate: (element) => {
      const id = element.id;
      if (!id) return { passed: true };
      
      const labels = document.querySelectorAll(`label[for="${id}"]`);
      
      if (labels.length > 1) {
        return {
          passed: false,
          message: `Form field has ${labels.length} labels. Use only one label per field.`
        };
      }
      
      return { passed: true };
    }
  },

  // List structure
  'list-structure': {
    id: 'list-structure',
    selector: 'ul > :not(li, script, template), ol > :not(li, script, template)',
    tags: ['best-practice', 'lists', 'structure'],
    impact: 'serious',
    description: 'Lists must contain only li elements',
    help: 'Ensure ul and ol elements only contain li elements',
    helpUrl: 'https://www.w3.org/TR/html52/grouping-content.html#the-ul-element',
    explanation: 'List elements (ul, ol) should only contain list items (li) as direct children. Other content breaks the semantic structure.',
    evaluate: (element) => {
      return {
        passed: false,
        message: `${element.parentElement.tagName} contains non-li element: ${element.tagName}`
      };
    }
  },

  // Definition list structure
  'dl-structure': {
    id: 'dl-structure',
    selector: 'dl',
    tags: ['best-practice', 'lists', 'structure'],
    impact: 'serious',
    description: 'Definition lists must have proper structure',
    help: 'Ensure dl elements contain dt/dd pairs',
    helpUrl: 'https://www.w3.org/TR/html52/grouping-content.html#the-dl-element',
    explanation: 'Definition lists should contain dt (term) and dd (definition) elements in a logical structure.',
    evaluate: (element) => {
      const children = Array.from(element.children).filter(child => 
        !['SCRIPT', 'TEMPLATE'].includes(child.tagName)
      );
      
      let lastWasDt = false;
      let hasProperStructure = true;
      
      for (const child of children) {
        if (!['DT', 'DD', 'DIV'].includes(child.tagName)) {
          return {
            passed: false,
            message: `dl contains invalid element: ${child.tagName}`
          };
        }
        
        if (child.tagName === 'DT') {
          lastWasDt = true;
        } else if (child.tagName === 'DD') {
          if (!lastWasDt && children.indexOf(child) === 0) {
            hasProperStructure = false;
          }
          lastWasDt = false;
        }
      }
      
      if (!hasProperStructure) {
        return {
          passed: false,
          message: 'dl has dd element without preceding dt element'
        };
      }
      
      return { passed: true };
    }
  },

  // Deprecated elements
  'no-deprecated-elements': {
    id: 'no-deprecated-elements',
    selector: 'marquee, blink, center, font, big, strike, tt',
    tags: ['best-practice', 'html5', 'deprecated'],
    impact: 'serious',
    description: 'Deprecated HTML elements should not be used',
    help: 'Replace deprecated elements with modern alternatives',
    helpUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element#obsolete_and_deprecated_elements',
    explanation: 'Deprecated HTML elements may not work in modern browsers and often have accessibility issues. Use CSS for styling instead.',
    evaluate: (element) => {
      const alternatives = {
        'MARQUEE': 'CSS animations',
        'BLINK': 'CSS animations',
        'CENTER': 'CSS text-align',
        'FONT': 'CSS font properties',
        'BIG': 'CSS font-size',
        'STRIKE': '<del> or CSS text-decoration',
        'TT': '<code> or CSS font-family'
      };
      
      return {
        passed: false,
        message: `<${element.tagName.toLowerCase()}> is deprecated. Use ${alternatives[element.tagName]} instead.`
      };
    }
  },

  // Table headers
  'table-headers': {
    id: 'table-headers',
    selector: 'table',
    tags: ['best-practice', 'tables', 'structure'],
    impact: 'serious',
    description: 'Data tables should have headers',
    help: 'Use th elements for table headers',
    helpUrl: 'https://www.w3.org/WAI/tutorials/tables/',
    explanation: 'Data tables need header cells (th) to help screen reader users understand the table structure and relationships.',
    evaluate: (element) => {
      // Skip layout tables (those with role="presentation" or role="none")
      const role = element.getAttribute('role');
      if (role === 'presentation' || role === 'none') {
        return { passed: true };
      }
      
      // Check for th elements
      const headers = element.querySelectorAll('th');
      const cells = element.querySelectorAll('td');
      
      // If table has data cells but no headers, it's likely missing headers
      if (cells.length > 0 && headers.length === 0) {
        // Check if first row might be headers using td
        const firstRow = element.querySelector('tr');
        if (firstRow) {
          const firstRowCells = firstRow.querySelectorAll('td');
          if (firstRowCells.length > 0) {
            return {
              passed: false,
              message: 'Table appears to contain data but has no header cells (th elements)'
            };
          }
        }
      }
      
      return { passed: true };
    }
  }
};

// Helper function to register all best practice rules
export function registerBestPracticeRules(engine) {
  Object.values(bestPracticeRules).forEach(rule => {
    engine.registerRule(rule);
  });
  
  // Register best-practice ruleset
  const bestPracticeRuleIds = Object.keys(bestPracticeRules);
  engine.registerRuleset('best-practice', bestPracticeRuleIds);
}
