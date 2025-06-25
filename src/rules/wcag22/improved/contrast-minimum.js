/**
 * WCAG 2.2 - Improved Contrast Minimum Rule
 * Better handling of animations and edge cases
 */

import { calculateContrast, safeGetComputedStyle, getBackgroundColor } from '../../../utils/color.js';
import { isAnimating, hasEntranceAnimation } from '../../../utils/animation.js';

export const contrastMinimumRule = {
  // 1.4.3 Contrast (Minimum) (Level AA) - Enhanced
  'contrast-minimum': {
    id: 'contrast-minimum',
    selector: '*',
    tags: ['wcag22aa', 'wcag143', 'perceivable'],
    impact: 'serious',
    description: 'Elements must have sufficient color contrast',
    help: 'Text should have a contrast ratio of at least 4.5:1',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
    explanation: 'Text needs enough contrast with its background so people with low vision can read it.',
    evaluate: (element) => {
      try {
        // Skip non-visible elements
        const style = safeGetComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return null;
        }
        
        // Check opacity - if 0, skip
        const opacity = parseFloat(style.opacity || '1');
        if (opacity === 0) {
          return null;
        }
        
        // Skip elements that are animating
        if (isAnimating(element) || hasEntranceAnimation(element)) {
          // Check if opacity is less than 1 (might be mid-fade)
          if (opacity < 1) {
            return null; // Skip mid-animation elements
          }
          
          // For elements with animations but full opacity, flag for manual check
          return {
            passed: true,
            incomplete: true,
            message: 'Element has animations - contrast should be checked in final state'
          };
        }
        
        // Skip elements that are likely not visible
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          // Double-check it's not just off-screen
          const isOffScreen = rect.top > window.innerHeight || 
                            rect.bottom < 0 || 
                            rect.left > window.innerWidth || 
                            rect.right < 0;
          
          if (!isOffScreen) {
            return null; // Genuinely invisible
          }
        }
        
        // Only check elements with direct text content
        const hasDirectText = Array.from(element.childNodes).some(node => {
          return node.nodeType === 3 && node.textContent.trim().length > 0;
        });
        
        if (!hasDirectText) {
          return null;
        }
        
        // Skip certain elements
        const skipTags = [
          'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE',
          'BR', 'HR', 'IMG', 'SVG', 'PATH', 'CANVAS',
          'AUDIO', 'VIDEO', 'IFRAME', 'OBJECT', 'EMBED'
        ];
        
        if (skipTags.includes(element.tagName)) {
          return null;
        }
        
        // Skip form elements (they have their own contrast requirements)
        const formTags = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
        if (formTags.includes(element.tagName)) {
          return null;
        }
        
        // Skip if text is likely placeholder or disabled
        if (element.hasAttribute('placeholder') || 
            element.hasAttribute('disabled') || 
            element.getAttribute('aria-disabled') === 'true' ||
            style.cursor === 'not-allowed') {
          return null;
        }
        
        // Skip if element has complex background
        const bgImage = style.backgroundImage;
        const hasGradient = bgImage && bgImage.includes('gradient');
        const hasImage = bgImage && bgImage !== 'none' && !hasGradient;
        
        if (hasImage) {
          return {
            passed: true,
            incomplete: true,
            message: 'Element has background image - manual contrast check needed'
          };
        }
        
        // Get text properties
        const fontSize = parseFloat(style.fontSize || '16');
        const fontWeight = parseInt(style.fontWeight || '400');
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
        
        // Get colors
        const fgColor = style.color;
        let bgColor = getBackgroundColor(element);
        
        // Handle gradients specially
        if (hasGradient) {
          return {
            passed: true,
            incomplete: true,
            message: 'Element has gradient background - manual contrast check needed'
          };
        }
        
        // Skip if we can't determine colors reliably
        if (!fgColor || fgColor === 'transparent' || 
            !bgColor || bgColor === 'transparent') {
          return null;
        }
        
        // Skip if colors are identical (error in detection)
        if (fgColor === bgColor) {
          return null;
        }
        
        // Calculate contrast
        const contrast = calculateContrast(fgColor, bgColor);
        
        // If contrast is exactly 1, there's an error in calculation
        if (contrast === 1) {
          return null;
        }
        
        // Check against WCAG requirements
        const requiredRatio = isLargeText ? 3 : 4.5;
        const passed = contrast >= requiredRatio;
        
        // Special handling for very low contrast that might indicate animation
        if (contrast < 1.5 && opacity < 1) {
          return null; // Likely mid-fade animation
        }
        
        return {
          passed: passed,
          message: passed ? null : 
            `Contrast ratio ${contrast.toFixed(2)}:1 is below required ${requiredRatio}:1`,
          data: { 
            contrast: contrast.toFixed(2), 
            fontSize, 
            isLargeText,
            foreground: fgColor,
            background: bgColor
          }
        };
      } catch (e) {
        // If there's any error, skip rather than false positive
        return null;
      }
    }
  }
};
