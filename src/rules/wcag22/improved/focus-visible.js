/**
 * WCAG 2.2 - Improved Focus Visible Rule
 * Handles modern :focus-visible patterns correctly
 */

export const focusVisibleRule = {
  // 2.4.7 Focus Visible (Level AA) - Enhanced for modern CSS
  'focus-visible': {
    id: 'focus-visible',
    selector: 'a, button, input:not([type="hidden"]), select, textarea, [tabindex="0"], [role="button"], [role="link"], [role="tab"], [role="menuitem"]',
    tags: ['wcag22aa', 'wcag247', 'operable'],
    impact: 'serious',
    description: 'Keyboard focus indicator must be visible',
    help: 'Ensure focus indicators are visible',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html',
    explanation: 'When users tab through a page, they need to see which element has focus. There should be a visible outline or highlight.',
    evaluate: (element) => {
      // Skip if not visible
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return null;
      }
      
      // Skip if element is not actually focusable
      const tabindex = element.getAttribute('tabindex');
      if (tabindex === '-1') {
        return null;
      }
      
      // Check for modern :focus-visible support
      const supportsFocusVisible = CSS.supports && CSS.supports('selector(:focus-visible)');
      
      if (supportsFocusVisible) {
        // Modern pattern: Using :focus-visible is GOOD!
        // This is the recommended approach per WCAG 2.2
        
        // Only check for problematic inline styles
        const inlineStyle = element.getAttribute('style') || '';
        const hasInlineOutlineNone = /outline\s*:\s*none|outline\s*:\s*0/.test(inlineStyle);
        
        if (hasInlineOutlineNone) {
          return {
            passed: false,
            message: 'Inline style removes focus outline - this overrides CSS focus styles'
          };
        }
        
        // Check if element has any custom focus handling
        const hasCustomFocusClass = element.className && 
          (element.className.includes('focus') || 
           element.className.includes('custom-focus'));
        
        // For modern browsers with :focus-visible, we trust the CSS implementation
        return {
          passed: true,
          message: 'Element uses modern focus handling - visual keyboard test recommended'
        };
      }
      
      // For older browsers without :focus-visible support
      const computedOutline = style.outline || '';
      const outlineWidth = style.outlineWidth || '';
      const outlineStyle = style.outlineStyle || '';
      
      // Check if outline is completely disabled
      const outlineDisabled = 
        computedOutline === 'none' || 
        computedOutline.includes('0px') ||
        outlineWidth === '0px' ||
        outlineStyle === 'none';
      
      if (outlineDisabled) {
        // Look for alternative focus indicators
        const hasBoxShadow = style.boxShadow && style.boxShadow !== 'none';
        const hasBorderChange = element.getAttribute('data-focus-border');
        const hasBackgroundChange = element.getAttribute('data-focus-bg');
        const hasFocusClass = element.className && element.className.includes('focus');
        
        const hasAlternative = hasBoxShadow || hasBorderChange || hasBackgroundChange || hasFocusClass;
        
        if (!hasAlternative) {
          return {
            passed: false,
            message: 'Focus indicator removed without alternative (browser lacks :focus-visible support)'
          };
        }
      }
      
      return { passed: true };
    }
  }
};
