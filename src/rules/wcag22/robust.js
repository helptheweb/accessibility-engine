/**
 * WCAG 2.2 Principle 4: Robust
 * Content must be robust enough that it can be interpreted by a wide variety of user agents, including assistive technologies.
 */

export const robustRules = {
  // 4.1.1 Parsing (Level A) - Obsolete in WCAG 2.2 but included for completeness
  'parsing': {
    id: 'parsing',
    selector: 'html',
    tags: ['wcag22a', 'wcag411', 'robust'],
    impact: 'serious',
    description: 'Page must have valid markup',
    help: 'Ensure HTML is well-formed',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/parsing.html',
    evaluate: () => {
      const issues = [];
      
      // Check for duplicate IDs
      const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
      const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
      
      if (duplicateIds.length > 0) {
        issues.push(`Duplicate IDs found: ${[...new Set(duplicateIds)].join(', ')}`);
      }
      
      // Check for improperly nested elements
      const invalidNesting = document.querySelectorAll('p p, p div, button button, a a, label label');
      if (invalidNesting.length > 0) {
        issues.push('Invalid element nesting detected');
      }
      
      return {
        passed: issues.length === 0,
        message: issues.length > 0 ? issues.join('; ') : null
      };
    }
  },

  // 4.1.2 Name, Role, Value (Level A)
  'name-role-value': {
    id: 'name-role-value',
    selector: '[role], [aria-label], [aria-labelledby], input, select, textarea, button',
    tags: ['wcag22a', 'wcag412', 'robust'],
    impact: 'critical',
    description: 'UI components must have accessible names and roles',
    help: 'Ensure all UI components have proper name, role, and value',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
    evaluate: (element) => {
      const issues = [];
      const role = element.getAttribute('role');
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledby = element.getAttribute('aria-labelledby');
      
      // Check ARIA references
      if (ariaLabelledby) {
        const ids = ariaLabelledby.split(' ');
        for (const id of ids) {
          if (!document.getElementById(id.trim())) {
            issues.push(`aria-labelledby references non-existent ID: ${id}`);
          }
        }
      }
      
      // Check aria-describedby references
      const ariaDescribedby = element.getAttribute('aria-describedby');
      if (ariaDescribedby) {
        const ids = ariaDescribedby.split(' ');
        for (const id of ids) {
          if (!document.getElementById(id.trim())) {
            issues.push(`aria-describedby references non-existent ID: ${id}`);
          }
        }
      }
      
      // Validate ARIA roles
      if (role) {
        const validRoles = [
          'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
          'checkbox', 'cell', 'columnheader', 'combobox', 'complementary',
          'contentinfo', 'definition', 'dialog', 'directory', 'document',
          'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
          'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
          'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
          'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
          'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
          'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
          'slider', 'spinbutton', 'status', 'switch', 'tab', 'table',
          'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar',
          'tooltip', 'tree', 'treegrid', 'treeitem'
        ];
        
        if (!validRoles.includes(role)) {
          issues.push(`Invalid ARIA role: ${role}`);
        }
      }
      
      // Check form elements have accessible names
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
        const type = element.getAttribute('type');
        const isHidden = type === 'hidden';
        const isButton = type === 'submit' || type === 'button' || type === 'reset';
        
        if (!isHidden && !isButton) {
          const hasAccessibleName = ariaLabel || ariaLabelledby || 
                                   element.getAttribute('title') ||
                                   element.labels?.length > 0;
          
          if (!hasAccessibleName) {
            issues.push('Form control lacks accessible name');
          }
        }
      }
      
      // Check required ARIA properties
      if (role === 'checkbox' || role === 'radio') {
        if (!element.hasAttribute('aria-checked')) {
          issues.push(`${role} missing required aria-checked attribute`);
        }
      }
      
      if (role === 'combobox') {
        if (!element.hasAttribute('aria-expanded')) {
          issues.push('combobox missing required aria-expanded attribute');
        }
      }
      
      return {
        passed: issues.length === 0,
        message: issues.length > 0 ? issues.join('; ') : null
      };
    }
  },

  // 4.1.3 Status Messages (Level AA)
  'status-messages': {
    id: 'status-messages',
    selector: '[role="status"], [role="alert"], [aria-live]',
    tags: ['wcag22aa', 'wcag413', 'robust'],
    impact: 'moderate',
    description: 'Status messages must be programmatically determinable',
    help: 'Use appropriate ARIA live regions for status messages',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html',
    evaluate: (element) => {
      const role = element.getAttribute('role');
      const ariaLive = element.getAttribute('aria-live');
      const ariaAtomic = element.getAttribute('aria-atomic');
      
      // Check for appropriate live region settings
      if (role === 'status' && ariaLive === 'assertive') {
        return {
          passed: false,
          message: 'Status messages should not be assertive'
        };
      }
      
      if (role === 'alert' && ariaLive === 'polite') {
        return {
          passed: false,
          message: 'Alert messages should be assertive'
        };
      }
      
      // Check for improper use of aria-live
      if (ariaLive === 'assertive') {
        const isAlert = role === 'alert' || element.classList.contains('alert');
        if (!isAlert) {
          return {
            passed: false,
            message: 'aria-live="assertive" should only be used for urgent messages'
          };
        }
      }
      
      return { passed: true };
    }
  }
};
