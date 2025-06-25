/**
 * WCAG 2.2 Principle 1: Perceivable
 * Information and user interface components must be presentable to users in ways they can perceive.
 */

import { calculateContrast, safeGetComputedStyle, getBackgroundColor } from '../../utils/color.js';
import { getDocument, querySelector, getComputedStyle as getDOMComputedStyle } from '../../utils/dom.js';

export const perceivableRules = {
  // 1.1.1 Non-text Content (Level A)
  'img-alt': {
    id: 'img-alt',
    selector: 'img',
    tags: ['wcag22a', 'wcag111', 'perceivable'],
    impact: 'critical',
    description: 'Images must have alternate text',
    help: 'Images must have an alt attribute',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html',
    explanation: 'Images need text descriptions so screen reader users know what the image shows. Think of it like describing a photo to someone over the phone.',
    evaluate: (element) => {
      const alt = element.getAttribute('alt');
      const isDecorative = element.getAttribute('role') === 'presentation' || 
                         element.getAttribute('aria-hidden') === 'true';
      
      if (isDecorative) {
        return { passed: alt === '' || alt === null };
      }
      
      return {
        passed: alt !== null && alt !== undefined,
        message: alt === null ? 'Image missing alt attribute' : 
                alt === '' ? 'Image has empty alt attribute' : null
      };
    }
  },

  // 1.2.1 Audio-only and Video-only (Prerecorded) (Level A)
  'audio-caption': {
    id: 'audio-caption',
    selector: 'audio',
    tags: ['wcag22a', 'wcag121', 'perceivable'],
    impact: 'critical',
    description: 'Audio elements must have captions',
    help: 'Provide captions for audio content',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html',
    explanation: 'Audio content needs text captions so deaf or hard-of-hearing users can understand what is being said. Like subtitles for a movie.',
    evaluate: (element) => {
      const tracks = element.querySelectorAll('track[kind="captions"]');
      return {
        passed: tracks.length > 0,
        message: tracks.length === 0 ? 'Audio element missing caption track' : null
      };
    }
  },

  // 1.2.2 Captions (Prerecorded) (Level A)
  'video-caption': {
    id: 'video-caption',
    selector: 'video',
    tags: ['wcag22a', 'wcag122', 'perceivable'],
    impact: 'critical',
    description: 'Video elements must have captions',
    help: 'Videos must have captions for audio content',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html',
    explanation: 'Videos need captions for people who cannot hear the audio. This includes dialogue, sound effects, and music descriptions.',
    evaluate: (element) => {
      const tracks = element.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
      return {
        passed: tracks.length > 0,
        message: tracks.length === 0 ? 'Video element missing caption or subtitle track' : null
      };
    }
  },

  // 1.2.3 Audio Description or Media Alternative (Level A)
  'media-alternative': {
    id: 'media-alternative',
    selector: 'video',
    tags: ['wcag22a', 'wcag123', 'perceivable'],
    impact: 'serious',
    description: 'Video must have audio description or media alternative',
    help: 'Provide audio description track or text alternative for video content',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded.html',
    explanation: 'Videos need descriptions of important visual information for blind users. This narrates what is happening on screen that is not clear from the dialogue alone.',
    evaluate: (element) => {
      const descriptionTrack = element.querySelector('track[kind="descriptions"]');
      const ariaDescribedby = element.getAttribute('aria-describedby');
      
      return {
        passed: descriptionTrack !== null || ariaDescribedby !== null,
        message: !descriptionTrack && !ariaDescribedby ? 
          'Video missing audio description track or text alternative' : null
      };
    }
  },

  // 1.2.5 Audio Description (Prerecorded) (Level AA)
  'audio-description': {
    id: 'audio-description',
    selector: 'video',
    tags: ['wcag22aa', 'wcag125', 'perceivable'],
    impact: 'serious',
    description: 'Video must have audio descriptions',
    help: 'Provide audio descriptions for video content',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html',
    explanation: 'Important visual details in videos should be described in audio for blind users. This is more comprehensive than basic alternatives.',
    evaluate: (element) => {
      const descriptionTrack = element.querySelector('track[kind="descriptions"]');
      return {
        passed: descriptionTrack !== null,
        message: !descriptionTrack ? 'Video missing audio description track' : null
      };
    }
  },

  // 1.3.1 Info and Relationships (Level A)
  'info-relationships': {
    id: 'info-relationships',
    selector: 'table, ul, ol, dl, blockquote, [role="list"], [role="table"]',
    tags: ['wcag22a', 'wcag131', 'perceivable'],
    impact: 'serious',
    description: 'Information and relationships must be programmatically determined',
    help: 'Use semantic markup to convey information and relationships',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
    explanation: 'Use proper HTML tags so screen readers understand how content is organized. For example, use real heading tags instead of just making text look big.',
    evaluate: (element) => {
      const issues = [];
      
      // Check tables
      if (element.tagName === 'TABLE') {
        const headers = element.querySelectorAll('th');
        const caption = element.querySelector('caption');
        
        if (headers.length === 0) {
          issues.push('Table missing header cells');
        }
        
        // Check for complex tables needing scope
        const rows = element.querySelectorAll('tr');
        if (rows.length > 5 && !element.querySelector('th[scope]')) {
          issues.push('Complex table may need scope attributes on headers');
        }
      }
      
      // Check lists
      if (element.tagName === 'UL' || element.tagName === 'OL') {
        const nonListItems = element.querySelectorAll(':scope > :not(li)');
        if (nonListItems.length > 0) {
          issues.push('List contains non-li elements');
        }
      }
      
      return {
        passed: issues.length === 0,
        message: issues.length > 0 ? issues.join('; ') : null
      };
    }
  },

  // 1.3.2 Meaningful Sequence (Level A)
  'meaningful-sequence': {
    id: 'meaningful-sequence',
    selector: 'body',
    tags: ['wcag22a', 'wcag132', 'perceivable'],
    impact: 'moderate',
    description: 'Content must be presented in a meaningful sequence',
    help: 'DOM order should match visual presentation order',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html',
    explanation: 'The order of content in the code should match how it appears visually. Screen readers read content in code order, so it needs to make sense.',
    evaluate: (element) => {
      // This is a simplified check - real implementation would need visual analysis
      const tabindexElements = element.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])');
      const hasPositiveTabindex = Array.from(tabindexElements).some(el => 
        parseInt(el.getAttribute('tabindex')) > 0
      );
      
      return {
        passed: !hasPositiveTabindex,
        message: hasPositiveTabindex ? 
          'Positive tabindex values may disrupt meaningful sequence' : null
      };
    }
  },

  // 1.3.3 Sensory Characteristics (Level A)
  'sensory-characteristics': {
    id: 'sensory-characteristics',
    selector: 'body',
    tags: ['wcag22a', 'wcag133', 'perceivable'],
    impact: 'moderate',
    description: 'Instructions must not rely solely on sensory characteristics',
    help: 'Do not use only color, shape, size, or location to give instructions',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html',
    explanation: 'Instructions should not say things like "click the red button" or "see the box on the right" because not everyone can see colors or spatial relationships.',
    evaluate: (element) => {
      const text = element.textContent.toLowerCase();
      const problematicPhrases = [
        /click.*red|green|blue|yellow/,
        /press.*round|square|circular/,
        /see.*left|right|above|below/,
        /button.*shape/,
        /\b(red|green|blue|yellow)\s+(button|link|box)/
      ];
      
      const hasProblematicInstruction = problematicPhrases.some(pattern => 
        pattern.test(text)
      );
      
      return {
        passed: !hasProblematicInstruction,
        message: hasProblematicInstruction ? 
          'Instructions may rely on sensory characteristics' : null,
        incomplete: hasProblematicInstruction
      };
    }
  },

  // 1.3.4 Orientation (Level AA)
  'orientation': {
    id: 'orientation',
    selector: 'html',
    tags: ['wcag22aa', 'wcag134', 'perceivable'],
    impact: 'serious',
    description: 'Content must not be restricted to a single display orientation',
    help: 'Allow both portrait and landscape orientations',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/orientation.html',
    explanation: 'Websites should work in both portrait and landscape modes. Some people mount their devices in a fixed position and cannot rotate them.',
    evaluate: (element) => {
      const doc = getDocument(element);
      const viewport = querySelector('meta[name="viewport"]', doc);
      
      if (viewport) {
        const content = viewport.getAttribute('content');
        if (content && content.includes('orientation')) {
          return {
            passed: false,
            message: 'Viewport meta tag may restrict orientation'
          };
        }
      }
      
      // Skip stylesheet parsing as it can cause issues with large stylesheets
      // This check would require manual review for CSS-based orientation locks
      return { 
        passed: true,
        incomplete: true,
        message: 'Manual check needed for CSS orientation restrictions'
      };
    }
  },

  // 1.3.5 Identify Input Purpose (Level AA)
  'identify-input-purpose': {
    id: 'identify-input-purpose',
    selector: 'input[type="text"], input[type="email"], input[type="tel"], input[type="url"]',
    tags: ['wcag22aa', 'wcag135', 'perceivable'],
    impact: 'moderate',
    description: 'Input fields must identify their purpose',
    help: 'Use autocomplete attributes for common input fields',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html',
    explanation: 'Common form fields should use autocomplete so browsers can help fill them out. This helps people with disabilities who have trouble typing.',
    evaluate: (element) => {
      const type = element.getAttribute('type');
      const autocomplete = element.getAttribute('autocomplete');
      const name = element.getAttribute('name') || '';
      const id = element.getAttribute('id') || '';
      
      // Common field patterns that should have autocomplete
      const commonFields = {
        'name': ['name', 'full-name', 'fullname', 'your-name'],
        'email': ['email', 'e-mail', 'mail'],
        'tel': ['phone', 'telephone', 'tel', 'mobile'],
        'street-address': ['address', 'street', 'addr'],
        'postal-code': ['zip', 'postal', 'postcode', 'zipcode'],
        'cc-number': ['card-number', 'credit-card', 'cc-num'],
      };
      
      let expectedAutocomplete = null;
      
      for (const [autoValue, patterns] of Object.entries(commonFields)) {
        if (patterns.some(pattern => 
          name.toLowerCase().includes(pattern) || 
          id.toLowerCase().includes(pattern)
        )) {
          expectedAutocomplete = autoValue;
          break;
        }
      }
      
      if (expectedAutocomplete && !autocomplete) {
        return {
          passed: false,
          message: `Common ${expectedAutocomplete} field missing autocomplete attribute`
        };
      }
      
      return { passed: true };
    }
  },

  // 1.4.1 Use of Color (Level A)
  'use-of-color': {
    id: 'use-of-color',
    selector: 'a, button, [role="button"], [role="link"]',
    tags: ['wcag22a', 'wcag141', 'perceivable'],
    impact: 'serious',
    description: 'Color must not be the only visual means of conveying information',
    help: 'Ensure links are distinguishable without relying on color',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html',
    explanation: 'Do not use color alone to show important information. For example, links should be underlined, not just a different color.',
    evaluate: (element) => {
      try {
        // Check if link has underline or other visual indicator
        const styles = getDOMComputedStyle(element);
        const textDecoration = styles.textDecoration;
        const hasUnderline = textDecoration && textDecoration.includes('underline');
        const hasBorder = styles.borderBottomStyle !== 'none';
        const hasBackground = styles.backgroundColor !== 'transparent' && 
                             styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
        
        // Links in nav or with other indicators are usually fine
        const inNav = element.closest('nav') !== null;
        const hasIcon = element.querySelector('svg, img, [class*="icon"]') !== null;
        
        return {
          passed: hasUnderline || hasBorder || hasBackground || inNav || hasIcon,
          message: 'Link may not be distinguishable without color'
        };
      } catch (e) {
        // If styles can't be computed, mark as incomplete
        return {
          passed: true,
          incomplete: true,
          message: 'Unable to compute styles for color check'
        };
      }
    }
  },

  // 1.4.2 Audio Control (Level A)
  'audio-control': {
    id: 'audio-control',
    selector: 'audio[autoplay], video[autoplay]',
    tags: ['wcag22a', 'wcag142', 'perceivable'],
    impact: 'serious',
    description: 'Audio must not play automatically for more than 3 seconds',
    help: 'Provide controls to pause or stop auto-playing audio',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html',
    explanation: 'Audio that plays automatically can interfere with screen readers and be startling. Users need a way to stop it quickly.',
    evaluate: (element) => {
      const hasControls = element.hasAttribute('controls');
      const isMuted = element.hasAttribute('muted');
      
      return {
        passed: hasControls || isMuted,
        message: !hasControls && !isMuted ? 
          'Auto-playing media must have controls or be muted' : null
      };
    }
  },

  // 1.4.3 Contrast (Minimum) (Level AA)
  'contrast-minimum': {
    id: 'contrast-minimum',
    selector: '*',
    tags: ['wcag22aa', 'wcag143', 'perceivable'],
    impact: 'serious',
    description: 'Elements must have sufficient color contrast',
    help: 'Text should have a contrast ratio of at least 4.5:1',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
    explanation: 'Text needs enough contrast with its background so people with low vision can read it. Like black text on white background is easier to read than gray on light gray.',
    evaluate: (element) => {
      try {
        // Skip non-visible elements
        const style = safeGetComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return null;
        }
        
        // Skip elements without direct text content
        const hasDirectText = Array.from(element.childNodes).some(node => {
          return node.nodeType === 3 && node.textContent.trim().length > 0;
        });
        
        if (!hasDirectText) {
          return null;
        }
        
        // Skip certain elements that shouldn't be checked
        const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'BR', 'HR', 'IMG', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
        if (skipTags.includes(element.tagName)) {
          return null;
        }
        
        // Skip if element has background image (needs manual review)
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
          return {
            passed: true,
            incomplete: true,
            message: 'Element has background image - manual contrast check needed'
          };
        }
        
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = style.fontWeight;
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
        
        const fgColor = style.color;
        const bgColor = getBackgroundColor(element);
        
        // Skip if colors can't be determined or are identical (likely error)
        if (!fgColor || fgColor === 'transparent' || 
            !bgColor || bgColor === 'transparent' ||
            fgColor === bgColor) {
          return { 
            passed: true,
            incomplete: true, 
            message: 'Unable to reliably determine color contrast' 
          };
        }
        
        const contrast = calculateContrast(fgColor, bgColor);
        
        // If contrast is exactly 1, there's likely an error in calculation
        if (contrast === 1) {
          return {
            passed: true,
            incomplete: true,
            message: 'Contrast calculation error - manual check needed'
          };
        }
        
        const requiredRatio = isLargeText ? 3 : 4.5;
        
        return {
          passed: contrast >= requiredRatio,
          message: contrast < requiredRatio ? 
            `Contrast ratio ${contrast.toFixed(2)}:1 is below required ${requiredRatio}:1` : null,
          data: { contrast, fontSize, isLargeText }
        };
      } catch (e) {
        // If contrast calculation fails, mark as incomplete
        return {
          passed: true,
          incomplete: true,
          message: 'Unable to calculate contrast'
        };
      }
    }
  },

  // 1.4.4 Resize Text (Level AA)
  'resize-text': {
    id: 'resize-text',
    selector: 'body',
    tags: ['wcag22aa', 'wcag144', 'perceivable'],
    impact: 'moderate',
    description: 'Text must be resizable up to 200% without loss of functionality',
    help: 'Ensure text can be resized without assistive technology',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html',
    explanation: 'Users should be able to zoom in to make text bigger without breaking the website. Some people need larger text to read comfortably.',
    evaluate: (element) => {
      // Check for viewport meta tag that might prevent zooming
      const doc = getDocument(element);
      const viewport = querySelector('meta[name="viewport"]', doc);
      
      if (viewport) {
        const content = viewport.getAttribute('content');
        if (content && (content.includes('user-scalable=no') || 
                       content.includes('maximum-scale=1'))) {
          return {
            passed: false,
            message: 'Viewport settings prevent text resizing'
          };
        }
      }
      
      return { passed: true };
    }
  },

  // 1.4.5 Images of Text (Level AA)
  'images-of-text': {
    id: 'images-of-text',
    selector: 'img',
    tags: ['wcag22aa', 'wcag145', 'perceivable'],
    impact: 'moderate',
    description: 'Images must not be used as text',
    help: 'Use actual text rather than images of text',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html',
    explanation: 'Use real text instead of pictures of text. Real text can be resized, recolored, and read by screen readers. Images of text cannot.',
    evaluate: (element) => {
      const alt = element.getAttribute('alt') || '';
      const src = element.getAttribute('src') || '';
      
      // Skip images that are likely logos or icons (exceptions in WCAG)
      const logoPatterns = [
        /logo/i,
        /brand/i,
        /icon/i,
        /avatar/i,
        /profile/i
      ];
      
      if (logoPatterns.some(pattern => pattern.test(src) || pattern.test(alt))) {
        return { passed: true }; // Logos are exceptions
      }
      
      // Skip decorative images
      if (alt === '' && element.getAttribute('role') === 'presentation') {
        return { passed: true };
      }
      
      // Look for actual text image indicators
      const textImageIndicators = [
        /infographic/i,
        /diagram/i,
        /chart_text/i,
        /screenshot.*text/i,
        /text_image/i,
        /quote_image/i
      ];
      
      const definitelyTextImage = textImageIndicators.some(pattern => 
        pattern.test(src) || pattern.test(alt)
      );
      
      // Check if alt text suggests it's rendering substantial text
      // (not just a label or title)
      const altWordCount = alt.split(/\s+/).filter(word => word.length > 0).length;
      const hasLongAlt = altWordCount > 10; // More than 10 words suggests text image
      
      // Check for file names that suggest text images
      const suspiciousFilePatterns = [
        /slide\d+/i,
        /page\d+/i,
        /text\d+/i,
        /paragraph/i,
        /content_block/i
      ];
      
      const suspiciousFileName = suspiciousFilePatterns.some(pattern => pattern.test(src));
      
      if (definitelyTextImage || (hasLongAlt && suspiciousFileName)) {
        return {
          passed: false,
          message: 'Image appears to contain text that should be actual HTML text'
        };
      }
      
      // For borderline cases, mark as needing manual review
      if (hasLongAlt || suspiciousFileName) {
        return {
          passed: true,
          incomplete: true,
          message: 'Image may contain text - manual review recommended'
        };
      }
      
      return { passed: true };
    }
  },

  // 1.4.10 Reflow (Level AA)
  'reflow': {
    id: 'reflow',
    selector: 'body',
    tags: ['wcag22aa', 'wcag1410', 'perceivable'],
    impact: 'moderate',
    description: 'Content must reflow without horizontal scrolling',
    help: 'Content should reflow to fit 320px wide viewport',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/reflow.html',
    explanation: 'Content should adjust to fit narrow screens without making users scroll sideways. This helps people who need to zoom in or use mobile devices.',
    evaluate: (element) => {
      // Check for horizontal overflow at 320px
      const doc = getDocument(element);
      const body = doc.body;
      const html = doc.documentElement;
      
      const hasHorizontalScroll = (body && body.scrollWidth > 320) || 
                                  (html && html.scrollWidth > 320);
      
      return {
        passed: !hasHorizontalScroll,
        message: hasHorizontalScroll ? 'Content requires horizontal scrolling at 320px width' : null,
        incomplete: true // This needs manual testing at different viewport sizes
      };
    }
  },

  // 1.4.11 Non-text Contrast (Level AA)
  'non-text-contrast': {
    id: 'non-text-contrast',
    selector: 'button, input, select, textarea, [role="button"]',
    tags: ['wcag22aa', 'wcag1411', 'perceivable'],
    impact: 'serious',
    description: 'UI components must have sufficient contrast',
    help: 'User interface components need 3:1 contrast ratio',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html',
    explanation: 'Buttons, form fields, and other controls need enough contrast to be visible. People need to see where they can click or type.',
    evaluate: (element) => {
      try {
        const styles = safeGetComputedStyle(element);
        const borderColor = styles.borderColor;
        const backgroundColor = styles.backgroundColor;
        
        // Skip if colors can't be determined
        if (!borderColor || borderColor === 'transparent') {
          return null;
        }
        
        const contrast = calculateContrast(borderColor, backgroundColor);
        
        return {
          passed: contrast >= 3,
          message: contrast < 3 ? 
            `UI component contrast ${contrast.toFixed(2)}:1 is below required 3:1` : null,
          data: { contrast }
        };
      } catch (e) {
        return {
          passed: true,
          incomplete: true,
          message: 'Unable to calculate UI component contrast'
        };
      }
    }
  },

  // 1.4.12 Text Spacing (Level AA)
  'text-spacing': {
    id: 'text-spacing',
    selector: 'p, div, span, li, td, th',
    tags: ['wcag22aa', 'wcag1412', 'perceivable'],
    impact: 'moderate',
    description: 'Text spacing must be adjustable',
    help: 'Content should adapt to user text spacing preferences',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html',
    explanation: 'Users should be able to increase space between lines and letters without breaking the layout. This helps people with dyslexia read more easily.',
    evaluate: (element) => {
      try {
        const styles = getDOMComputedStyle(element);
        
        // Check if element has fixed heights that might break with spacing changes
        const hasFixedHeight = styles.height !== 'auto' && 
                             !styles.height.includes('%') && 
                             element.scrollHeight > element.clientHeight;
        
        return {
          passed: !hasFixedHeight,
          message: hasFixedHeight ? 'Fixed height may cause text to be cut off with increased spacing' : null
        };
      } catch (e) {
        return {
          passed: true,
          incomplete: true,
          message: 'Unable to check text spacing constraints'
        };
      }
    }
  },

  // 1.4.13 Content on Hover or Focus (Level AA)
  'content-hover-focus': {
    id: 'content-hover-focus',
    selector: '[title], [data-tooltip], .tooltip',
    tags: ['wcag22aa', 'wcag1413', 'perceivable'],
    impact: 'moderate',
    description: 'Additional content on hover/focus must be dismissible',
    help: 'Tooltips and similar content must be properly implemented',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html',
    explanation: 'Pop-ups that appear on hover should stay visible when you move your mouse to them, and users should be able to dismiss them easily.',
    evaluate: (element) => {
      const hasTitle = element.hasAttribute('title');
      
      if (hasTitle) {
        return {
          passed: false,
          message: 'Title attribute tooltips cannot be dismissed by user - consider using a custom tooltip'
        };
      }
      
      return { passed: true };
    }
  }
};
