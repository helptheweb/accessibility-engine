/**
 * WCAG 2.2 Principle 2: Operable - Complete Rules
 * User interface components and navigation must be operable.
 */

export const operableRules = {
  // 2.1.1 Keyboard (Level A)
  'keyboard-accessible': {
    id: 'keyboard-accessible',
    selector: 'a, button, input, select, textarea, [onclick], [onmousedown], [onmouseup]',
    tags: ['wcag22a', 'wcag211', 'operable'],
    impact: 'critical',
    description: 'All functionality must be accessible via keyboard',
    help: 'Ensure all interactive elements are keyboard accessible',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html',
    explanation: 'Everything you can do with a mouse should also work with just a keyboard. Some people cannot use a mouse and navigate entirely with keyboards.',
    evaluate: (element) => {
      const hasClickHandler = element.hasAttribute('onclick') || 
                             element.hasAttribute('onmousedown') || 
                             element.hasAttribute('onmouseup');
      const isNativelyFocusable = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
      const hasTabindex = element.hasAttribute('tabindex');
      const isDisabled = element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
      
      if (isDisabled) {
        return { passed: true };
      }
      
      if (hasClickHandler && !isNativelyFocusable && !hasTabindex) {
        return {
          passed: false,
          message: 'Element with click handler is not keyboard accessible'
        };
      }
      
      return { passed: true };
    }
  },

  // 2.1.2 No Keyboard Trap (Level A)
  'no-keyboard-trap': {
    id: 'no-keyboard-trap',
    selector: '[tabindex]',
    tags: ['wcag22a', 'wcag212', 'operable'],
    impact: 'critical',
    description: 'Keyboard focus must not be trapped',
    help: 'Users must be able to navigate away from any component using only keyboard',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html',
    explanation: 'Users should never get "stuck" in one part of a page when using keyboard navigation. They need to be able to move freely through all content.',
    evaluate: (element) => {
      // This is a basic check - comprehensive testing would require interaction testing
      const tabindex = parseInt(element.getAttribute('tabindex'));
      
      // Elements with tabindex > 0 can create confusing navigation
      if (tabindex > 0) {
        return {
          passed: false,
          message: 'Positive tabindex can create keyboard navigation issues'
        };
      }
      
      return { passed: true };
    }
  },

  // 2.1.4 Character Key Shortcuts (Level A)
  'character-key-shortcuts': {
    id: 'character-key-shortcuts',
    selector: 'body',
    tags: ['wcag22a', 'wcag214', 'operable'],
    impact: 'serious',
    description: 'Single character shortcuts must be configurable',
    help: 'Provide a way to turn off or remap single character shortcuts',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html',
    explanation: 'Single letter keyboard shortcuts can be triggered accidentally by speech recognition users. Users need a way to turn them off or change them.',
    evaluate: () => {
      // Check for single character event listeners
      const scripts = document.querySelectorAll('script');
      let hasSingleCharShortcuts = false;
      
      scripts.forEach(script => {
        const content = script.textContent;
        if (content && /keypress|keydown/.test(content) && /key\s*===?\s*['"][a-z]['"]/.test(content)) {
          hasSingleCharShortcuts = true;
        }
      });
      
      return {
        passed: !hasSingleCharShortcuts,
        message: hasSingleCharShortcuts ? 'Single character shortcuts detected - ensure they can be disabled' : null,
        incomplete: true
      };
    }
  },

  // 2.2.1 Timing Adjustable (Level A)
  'timing-adjustable': {
    id: 'timing-adjustable',
    selector: 'body',
    tags: ['wcag22a', 'wcag221', 'operable'],
    impact: 'critical',
    description: 'Users must be able to control time limits',
    help: 'Provide options to turn off, adjust, or extend time limits',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html',
    explanation: 'If your site has time limits (like forms that expire), users need to be able to extend the time. Some people need more time to read or complete tasks.',
    evaluate: (element) => {
      // Check for meta refresh
      const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
      if (metaRefresh) {
        const content = metaRefresh.getAttribute('content');
        const seconds = parseInt(content);
        
        if (seconds > 0 && seconds < 20) {
          return {
            passed: false,
            message: 'Page has automatic refresh under 20 seconds'
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 2.2.2 Pause, Stop, Hide (Level A)
  'pause-stop-hide': {
    id: 'pause-stop-hide',
    selector: '[class*="carousel"], [class*="slider"], [class*="marquee"], marquee',
    tags: ['wcag22a', 'wcag222', 'operable'],
    impact: 'serious',
    description: 'Moving content must be pausable',
    help: 'Provide controls for moving, blinking, or scrolling content',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html',
    explanation: 'Moving or auto-playing content can be distracting and make it hard to read other parts of the page. Users need a way to pause it.',
    evaluate: (element) => {
      // Check for deprecated marquee element
      if (element.tagName === 'MARQUEE') {
        return {
          passed: false,
          message: 'Marquee element should not be used'
        };
      }
      
      // Check for pause/stop controls
      const controls = element.querySelectorAll('[class*="pause"], [class*="stop"], [aria-label*="pause"], [aria-label*="stop"]');
      
      return {
        passed: controls.length > 0,
        message: controls.length === 0 ? 'Moving content lacks pause/stop controls' : null
      };
    }
  },

  // 2.3.1 Three Flashes or Below Threshold (Level A)
  'three-flashes': {
    id: 'three-flashes',
    selector: 'video, [class*="flash"], [class*="blink"]',
    tags: ['wcag22a', 'wcag231', 'operable'],
    impact: 'critical',
    description: 'Content must not flash more than three times per second',
    help: 'Avoid content that flashes rapidly',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html',
    explanation: 'Flashing content can trigger seizures in people with photosensitive epilepsy. Content should not flash more than 3 times per second.',
    evaluate: (element) => {
      // This requires manual review - automated testing can only flag potential issues
      const classes = element.className || '';
      const hasFlashClass = /flash|blink|strobe/.test(classes);
      
      return {
        passed: !hasFlashClass,
        message: hasFlashClass ? 'Element may contain flashing content - manual review needed' : null,
        incomplete: hasFlashClass
      };
    }
  },

  // 2.4.1 Bypass Blocks (Level A)
  'bypass-blocks': {
    id: 'bypass-blocks',
    selector: 'body',
    tags: ['wcag22a', 'wcag241', 'operable'],
    impact: 'moderate',
    description: 'Page must have a way to bypass repeated blocks',
    help: 'Provide skip links or landmark regions',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html',
    explanation: 'Pages need a way to skip repetitive content like navigation menus. This helps keyboard users get to main content quickly without tabbing through everything.',
    evaluate: (element) => {
      // Check for skip link
      const skipLinks = document.querySelectorAll('a[href^="#"]');
      const hasSkipLink = Array.from(skipLinks).some(link => {
        const text = link.textContent.toLowerCase();
        return text.includes('skip') || text.includes('jump');
      });
      
      // Check for landmark regions
      const landmarks = document.querySelectorAll('main, [role="main"], nav, [role="navigation"], header, [role="banner"]');
      
      return {
        passed: hasSkipLink || landmarks.length >= 2,
        message: !hasSkipLink && landmarks.length < 2 ? 'Page lacks skip mechanism or sufficient landmarks' : null
      };
    }
  },

  // 2.4.2 Page Titled (Level A)
  'page-title': {
    id: 'page-title',
    selector: 'html',
    tags: ['wcag22a', 'wcag242', 'operable'],
    impact: 'serious',
    description: 'Page must have a descriptive title',
    help: 'Provide a descriptive page title',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html',
    explanation: 'Page titles help users understand where they are. They appear in browser tabs and are announced by screen readers when switching between pages.',
    evaluate: () => {
      const title = document.querySelector('title');
      const titleText = title?.textContent?.trim();
      
      if (!title || !titleText) {
        return {
          passed: false,
          message: !title ? 'Page missing title element' : 'Page title is empty'
        };
      }
      
      // Check for generic titles
      const genericTitles = ['untitled', 'page', 'document', 'home'];
      if (genericTitles.includes(titleText.toLowerCase())) {
        return {
          passed: false,
          message: 'Page title is not descriptive'
        };
      }
      
      return { passed: true };
    }
  },

  // 2.4.3 Focus Order (Level A)
  'focus-order': {
    id: 'focus-order',
    selector: '[tabindex]',
    tags: ['wcag22a', 'wcag243', 'operable'],
    impact: 'moderate',
    description: 'Focus order must be logical',
    help: 'Ensure tab order follows visual/logical flow',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html',
    explanation: 'When users press Tab to navigate, the focus should move in a logical order that matches how the page is laid out visually.',
    evaluate: (element) => {
      const tabindex = parseInt(element.getAttribute('tabindex'));
      
      // Positive values can disrupt natural flow
      if (tabindex > 0) {
        return {
          passed: false,
          message: `Tabindex ${tabindex} may disrupt logical focus order`
        };
      }
      
      return { passed: true };
    }
  },

  // 2.4.4 Link Purpose (In Context) (Level A)
  'link-purpose': {
    id: 'link-purpose',
    selector: 'a[href]',
    tags: ['wcag22a', 'wcag244', 'operable'],
    impact: 'moderate',
    description: 'Link purpose must be clear from link text or context',
    help: 'Make link text descriptive or provide context',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html',
    explanation: 'Link text should describe where the link goes. Avoid vague text like "click here" - instead use descriptive text like "download annual report".',
    evaluate: (element) => {
      const linkText = element.textContent.trim();
      const ariaLabel = element.getAttribute('aria-label');
      const title = element.getAttribute('title');
      
      // Check for non-descriptive link text
      const vaguePhrases = ['click here', 'read more', 'more', 'link', 'here'];
      const text = (ariaLabel || linkText || title || '').toLowerCase();
      
      if (vaguePhrases.includes(text)) {
        // Check if context provides clarity
        const parent = element.parentElement;
        const parentText = parent?.textContent || '';
        
        if (parentText.length < 50) {
          return {
            passed: false,
            message: 'Link text is not descriptive'
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 2.4.5 Multiple Ways (Level AA)
  'multiple-ways': {
    id: 'multiple-ways',
    selector: 'body',
    tags: ['wcag22aa', 'wcag245', 'operable'],
    impact: 'moderate',
    description: 'Multiple ways to find pages must be available',
    help: 'Provide site map, search, or navigation',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html',
    explanation: 'Users should have more than one way to find content on your site, like a search box, site map, or navigation menu.',
    evaluate: () => {
      const hasSearch = document.querySelector('[type="search"], [role="search"], [class*="search"]');
      const hasSitemap = document.querySelector('a[href*="sitemap"]');
      const hasNav = document.querySelector('nav, [role="navigation"]');
      const hasBreadcrumb = document.querySelector('[aria-label*="breadcrumb"], .breadcrumb');
      
      const waysCount = [hasSearch, hasSitemap, hasNav, hasBreadcrumb].filter(Boolean).length;
      
      return {
        passed: waysCount >= 2,
        message: waysCount < 2 ? 'Page should provide multiple ways to find content' : null
      };
    }
  },

  // 2.4.6 Headings and Labels (Level AA)
  'headings-and-labels': {
    id: 'headings-and-labels',
    selector: 'h1, h2, h3, h4, h5, h6, label',
    tags: ['wcag22aa', 'wcag246', 'operable'],
    impact: 'moderate',
    description: 'Headings and labels must be descriptive',
    help: 'Use clear and descriptive headings and labels',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html',
    explanation: 'Headings and form labels should clearly describe what follows. Avoid generic text like "Section 1" - use descriptive text like "Contact Information".',
    evaluate: (element) => {
      // Check visible text first
      const text = element.textContent.trim();
      
      // Also check for aria-label as alternative
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      
      // For headings with images (like logos), check if image has alt text
      const img = element.querySelector('img');
      const imgAlt = img ? img.getAttribute('alt') : null;
      
      // Determine the effective label
      let effectiveLabel = text;
      
      if (!text && ariaLabel) {
        effectiveLabel = ariaLabel;
      } else if (!text && ariaLabelledBy) {
        const labelElement = document.getElementById(ariaLabelledBy);
        if (labelElement) {
          effectiveLabel = labelElement.textContent.trim();
        }
      } else if (!text && imgAlt) {
        effectiveLabel = imgAlt;
      }
      
      if (!effectiveLabel) {
        // Special case: heading might contain only decorative image
        if (img && img.getAttribute('alt') === '') {
          return { passed: true }; // Decorative image is OK
        }
        
        return {
          passed: false,
          message: `${element.tagName} is empty and has no accessible label`
        };
      }
      
      // Check for generic text
      const genericText = ['heading', 'label', 'title', 'untitled', 'section'];
      if (genericText.includes(effectiveLabel.toLowerCase())) {
        return {
          passed: false,
          message: `${element.tagName} text is not descriptive`
        };
      }
      
      return { passed: true };
    }
  },

  // 2.4.7 Focus Visible (Level AA)
  'focus-visible': {
    id: 'focus-visible',
    selector: 'a, button, input, select, textarea, [tabindex="0"]',
    tags: ['wcag22aa', 'wcag247', 'operable'],
    impact: 'serious',
    description: 'Keyboard focus indicator must be visible',
    help: 'Ensure focus indicators are visible',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html',
    explanation: 'When users tab through a page, they need to see which element has focus. There should be a visible outline or highlight.',
    evaluate: (element) => {
      // Create a temporary focus state to check styles
      const originalActiveElement = document.activeElement;
      
      try {
        element.focus();
        const focusedStyles = window.getComputedStyle(element);
        
        // Get unfocused styles for comparison
        element.blur();
        const unfocusedStyles = window.getComputedStyle(element);
        
        // Check if any visual properties change on focus
        const hasOutlineChange = focusedStyles.outline !== unfocusedStyles.outline;
        const hasBorderChange = focusedStyles.border !== unfocusedStyles.border;
        const hasBoxShadowChange = focusedStyles.boxShadow !== unfocusedStyles.boxShadow;
        const hasBackgroundChange = focusedStyles.backgroundColor !== unfocusedStyles.backgroundColor;
        
        // Restore original focus
        if (originalActiveElement) {
          originalActiveElement.focus();
        }
        
        const hasVisibleIndicator = hasOutlineChange || hasBorderChange || 
                                   hasBoxShadowChange || hasBackgroundChange;
        
        return {
          passed: hasVisibleIndicator,
          message: !hasVisibleIndicator ? 'Element lacks visible focus indicator' : null
        };
      } catch (e) {
        return { 
          incomplete: true, 
          message: 'Unable to test focus indicator' 
        };
      }
    }
  },

  // 2.4.11 Focus Not Obscured (Minimum) (Level AA) - New in WCAG 2.2
  'focus-not-obscured': {
    id: 'focus-not-obscured',
    selector: 'a, button, input, select, textarea, [tabindex="0"]',
    tags: ['wcag22aa', 'wcag2411', 'operable'],
    impact: 'serious',
    description: 'Focused elements must not be completely hidden',
    help: 'Ensure focused elements are at least partially visible',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html',
    explanation: 'When an element receives keyboard focus, it should not be completely hidden by other content like sticky headers or popups.',
    evaluate: (element) => {
      // Check for fixed/sticky elements that might obscure focus
      const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position: sticky"]');
      
      if (fixedElements.length > 0) {
        return {
          passed: true,
          incomplete: true,
          message: 'Fixed/sticky elements detected - manual check needed for focus obscuration'
        };
      }
      
      return { passed: true };
    }
  },

  // 2.5.1 Pointer Gestures (Level A)
  'pointer-gestures': {
    id: 'pointer-gestures',
    selector: '[class*="swipe"], [class*="pinch"], [class*="drag"]',
    tags: ['wcag22a', 'wcag251', 'operable'],
    impact: 'serious',
    description: 'Functionality must not rely on complex gestures',
    help: 'Provide alternatives to multi-point or path-based gestures',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html',
    explanation: 'Features that use gestures like pinch-to-zoom or swipe should also work with simple clicks or taps. Not everyone can perform complex gestures.',
    evaluate: (element) => {
      const classes = element.className || '';
      const hasGestureClass = /swipe|pinch|drag|gesture/.test(classes);
      
      return {
        passed: !hasGestureClass,
        message: hasGestureClass ? 'Element may use complex gestures - ensure alternatives exist' : null,
        incomplete: hasGestureClass
      };
    }
  },

  // 2.5.2 Pointer Cancellation (Level A)
  'pointer-cancellation': {
    id: 'pointer-cancellation',
    selector: 'button, a, [role="button"], [onclick]',
    tags: ['wcag22a', 'wcag252', 'operable'],
    impact: 'moderate',
    description: 'Actions must not trigger on down-event alone',
    help: 'Use click events instead of mousedown for triggering actions',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html',
    explanation: 'Actions should happen when users release the mouse button (click), not when they press it down. This lets users cancel by moving away before releasing.',
    evaluate: (element) => {
      const hasMousedown = element.hasAttribute('onmousedown');
      const hasPointerdown = element.hasAttribute('onpointerdown');
      const hasTouchstart = element.hasAttribute('ontouchstart');
      
      if (hasMousedown || hasPointerdown || hasTouchstart) {
        return {
          passed: false,
          message: 'Action triggers on down event - use click/pointerup instead'
        };
      }
      
      return { passed: true };
    }
  },

  // 2.5.3 Label in Name (Level A)
  'label-in-name': {
    id: 'label-in-name',
    selector: 'button, a, [role="button"], [role="link"]',
    tags: ['wcag22a', 'wcag253', 'operable'],
    impact: 'serious',
    description: 'Accessible name must contain visible label text',
    help: 'Ensure aria-label includes the visible text',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html',
    explanation: 'If a button shows "Submit" but has a different aria-label like "Send form", voice control users cannot activate it by saying "click submit".',
    evaluate: (element) => {
      const visibleText = element.textContent.trim().toLowerCase();
      const ariaLabel = element.getAttribute('aria-label');
      
      if (ariaLabel && visibleText) {
        const ariaLabelLower = ariaLabel.toLowerCase();
        if (!ariaLabelLower.includes(visibleText)) {
          return {
            passed: false,
            message: 'Accessible name does not contain visible label text'
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 2.5.4 Motion Actuation (Level A)
  'motion-actuation': {
    id: 'motion-actuation',
    selector: 'body',
    tags: ['wcag22a', 'wcag254', 'operable'],
    impact: 'serious',
    description: 'Functionality triggered by motion must have alternatives',
    help: 'Provide conventional controls for motion-activated features',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html',
    explanation: 'Features that work by shaking or tilting the device need button alternatives. Some people cannot move their devices or have them mounted.',
    evaluate: () => {
      // Check for device motion listeners
      const scripts = document.querySelectorAll('script');
      let hasMotionListeners = false;
      
      scripts.forEach(script => {
        const content = script.textContent;
        if (content && /devicemotion|deviceorientation|accelerometer/.test(content)) {
          hasMotionListeners = true;
        }
      });
      
      return {
        passed: !hasMotionListeners,
        message: hasMotionListeners ? 'Motion sensors detected - ensure UI alternatives exist' : null,
        incomplete: hasMotionListeners
      };
    }
  },

  // 2.5.7 Dragging Movements (Level AA) - New in WCAG 2.2
  'dragging-movements': {
    id: 'dragging-movements',
    selector: '[draggable="true"], [class*="drag"], [class*="sortable"]',
    tags: ['wcag22aa', 'wcag257', 'operable'],
    impact: 'serious',
    description: 'Dragging actions must have alternatives',
    help: 'Provide click alternatives to drag-and-drop',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html',
    explanation: 'Drag-and-drop features need alternatives like arrow buttons or menus. Some people cannot perform dragging motions accurately.',
    evaluate: (element) => {
      const isDraggable = element.getAttribute('draggable') === 'true';
      const classes = element.className || '';
      const hasDragClass = /drag|sortable|reorder/.test(classes);
      
      if (isDraggable || hasDragClass) {
        return {
          passed: false,
          message: 'Draggable element detected - ensure non-dragging alternatives exist',
          incomplete: true
        };
      }
      
      return { passed: true };
    }
  },

  // 2.5.8 Target Size (Minimum) (Level AA) - New in WCAG 2.2
  'target-size': {
    id: 'target-size',
    selector: 'a, button, input[type="checkbox"], input[type="radio"], [role="button"]',
    tags: ['wcag22aa', 'wcag258', 'operable'],
    impact: 'serious',
    description: 'Interactive targets must be at least 24x24 pixels',
    help: 'Ensure clickable elements are large enough',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html',
    explanation: 'Buttons and links need to be at least 24x24 pixels so people with motor difficulties can click them easily. Think of it like making buttons finger-friendly.',
    evaluate: (element) => {
      // Skip hidden elements
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return null;
      }
      
      // Skip elements that are likely not visible or not rendered
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // If element has no dimensions, it's likely not visible or not yet rendered
      if (width === 0 && height === 0) {
        // Check if it's actually meant to be invisible
        const opacity = parseFloat(style.opacity);
        if (opacity === 0) {
          return null;
        }
        
        // Check if parent is hidden
        let parent = element.parentElement;
        while (parent) {
          const parentStyle = window.getComputedStyle(parent);
          if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
            return null;
          }
          parent = parent.parentElement;
        }
        
        // Element might not be rendered yet, mark as incomplete
        return {
          passed: true,
          incomplete: true,
          message: 'Element dimensions could not be determined'
        };
      }
      
      // Check if element is inline (exception)
      if (style.display === 'inline') {
        return { passed: true };
      }
      
      // Check for exceptions in WCAG 2.2
      // Exception 1: Inline targets in text
      if (element.parentElement && window.getComputedStyle(element.parentElement).display === 'inline') {
        const siblingText = element.previousSibling?.nodeType === 3 || element.nextSibling?.nodeType === 3;
        if (siblingText) {
          return { passed: true };
        }
      }
      
      // Exception 2: User agent default styling (unstyled controls)
      const hasCustomStyling = element.className || element.getAttribute('style');
      if (!hasCustomStyling && ['INPUT', 'SELECT'].includes(element.tagName)) {
        return { passed: true };
      }
      
      if (width < 24 || height < 24) {
        return {
          passed: false,
          message: `Target size ${Math.round(width)}x${Math.round(height)}px is below 24x24px minimum`
        };
      }
      
      return { passed: true };
    }
  }
};
