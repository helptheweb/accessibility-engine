# @helptheweb/accessibility-engine

A modular, extensible accessibility testing engine for WCAG compliance. Built as a modern alternative to axe-core with first-class support for Bun.js.

## Features

- 🚀 **Fast Performance** - Optimized for Bun.js with parallel rule execution
- 📦 **Modular Architecture** - Easy to extend with custom rules and rulesets
- 🎯 **WCAG 2.2 Complete** - Full coverage of A, AA, and AAA standards (50+ rules)
- 🔧 **Flexible Configuration** - Run specific rulesets or individual rules
- 📊 **Detailed Reporting** - Comprehensive results with actionable feedback
- 💬 **Plain English Explanations** - Every rule includes non-technical explanations
- 🌐 **Browser & Node Compatible** - Works in any JavaScript environment
- 📝 **TypeScript Support** - Full type definitions included
- 🖥️ **CLI Tool** - Command-line interface for easy testing

## Installation

```bash
bun add @helptheweb/accessibility-engine
```

Or with npm:

```bash
npm install @helptheweb/accessibility-engine
```

## Quick Start

### JavaScript API

```javascript
import createAccessibilityEngine from '@helptheweb/accessibility-engine';

// Create engine instance
const engine = createAccessibilityEngine();

// Run accessibility tests
const results = await engine.run();

// Check for violations
if (results.violations.length > 0) {
  console.log('Accessibility violations found:', results.violations);
}
```

### Command Line Interface

```bash
# Test a URL
helptheweb test https://example.com

# Test a local HTML file
helptheweb test index.html

# Output results to a file
helptheweb test https://example.com --output report.html --format html

# Run only Level A tests
helptheweb test https://example.com --ruleset wcag22a

# Show detailed results
helptheweb test https://example.com --verbose

# List all available rules
helptheweb list

# Explain a specific rule
helptheweb explain img-alt
```

## Configuration Options

```javascript
const engine = createAccessibilityEngine({
  // Run only specific WCAG levels
  runOnly: ['wcag22a', 'wcag22aa'],
  
  // Choose result types to include
  resultTypes: ['violations', 'incomplete'],
  
  // Custom reporter version
  reporter: 'v2'
});
```

## Running Tests on Specific Elements

```javascript
// Test a specific form
const form = document.querySelector('#signup-form');
const results = await engine.run(form);

// Test with callback
engine.run(document, (error, results) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Results:', results);
  }
});
```

## Understanding the Results

Every rule includes a plain English explanation to help non-technical users understand accessibility issues:

```javascript
{
  id: 'img-alt',
  help: 'Images must have an alt attribute',
  explanation: 'Images need text descriptions so screen reader users know what the image shows. Think of it like describing a photo to someone over the phone.',
  // ... rest of the violation details
}
```

## Available Rulesets

- `wcag22a` - WCAG 2.2 Level A rules (essential accessibility)
- `wcag22aa` - WCAG 2.2 Level A and AA rules (recommended standard)
- `wcag22aaa` - All WCAG 2.2 rules (highest standard)

## WCAG 2.2 Rules Coverage

### Perceivable (Principle 1)
- ✅ Non-text Content (1.1.1)
- ✅ Audio & Video Captions (1.2.x)
- ✅ Info and Relationships (1.3.1)
- ✅ Meaningful Sequence (1.3.2)
- ✅ Sensory Characteristics (1.3.3)
- ✅ Orientation (1.3.4)
- ✅ Identify Input Purpose (1.3.5)
- ✅ Use of Color (1.4.1)
- ✅ Audio Control (1.4.2)
- ✅ Contrast (1.4.3)
- ✅ Resize Text (1.4.4)
- ✅ Images of Text (1.4.5)
- ✅ Reflow (1.4.10)
- ✅ Non-text Contrast (1.4.11)
- ✅ Text Spacing (1.4.12)
- ✅ Content on Hover/Focus (1.4.13)

### Operable (Principle 2)
- ✅ Keyboard Accessible (2.1.1)
- ✅ No Keyboard Trap (2.1.2)
- ✅ Character Key Shortcuts (2.1.4)
- ✅ Timing Adjustable (2.2.1)
- ✅ Pause, Stop, Hide (2.2.2)
- ✅ Three Flashes (2.3.1)
- ✅ Bypass Blocks (2.4.1)
- ✅ Page Titled (2.4.2)
- ✅ Focus Order (2.4.3)
- ✅ Link Purpose (2.4.4)
- ✅ Multiple Ways (2.4.5)
- ✅ Headings and Labels (2.4.6)
- ✅ Focus Visible (2.4.7)
- ✅ Focus Not Obscured (2.4.11) *New in 2.2*
- ✅ Pointer Gestures (2.5.1)
- ✅ Pointer Cancellation (2.5.2)
- ✅ Label in Name (2.5.3)
- ✅ Motion Actuation (2.5.4)
- ✅ Dragging Movements (2.5.7) *New in 2.2*
- ✅ Target Size (2.5.8) *New in 2.2*

### Understandable (Principle 3)
- ✅ Language of Page (3.1.1)
- ✅ Language of Parts (3.1.2)
- ✅ On Focus (3.2.1)
- ✅ On Input (3.2.2)
- ✅ Consistent Navigation (3.2.3)
- ✅ Consistent Identification (3.2.4)
- ✅ Consistent Help (3.2.6) *New in 2.2*
- ✅ Error Identification (3.3.1)
- ✅ Labels or Instructions (3.3.2)
- ✅ Error Suggestion (3.3.3)
- ✅ Error Prevention (3.3.4)
- ✅ Redundant Entry (3.3.7) *New in 2.2*
- ✅ Accessible Authentication (3.3.8) *New in 2.2*

### Robust (Principle 4)
- ✅ Parsing (4.1.1)
- ✅ Name, Role, Value (4.1.2)
- ✅ Status Messages (4.1.3)

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import createAccessibilityEngine, { 
  AccessibilityEngine, 
  Report, 
  Rule, 
  EngineOptions 
} from '@helptheweb/accessibility-engine';

const engine: AccessibilityEngine = createAccessibilityEngine({
  runOnly: ['wcag22a']
});

const results: Report = await engine.run();
```

## Extending the Engine

### Adding Custom Rules

```javascript
const customRule = {
  id: 'custom-rule',
  selector: '.my-component',
  tags: ['custom'],
  impact: 'moderate',
  description: 'Custom components must follow guidelines',
  help: 'Ensure custom components are accessible',
  explanation: 'Your custom widgets need to work for everyone, including people using screen readers or keyboards.',
  helpUrl: 'https://example.com/docs/custom-rule',
  evaluate: (element) => {
    // Your test logic here
    return {
      passed: true,
      message: null
    };
  }
};

engine.registerRule(customRule);
```

### Creating Custom Rulesets

```javascript
engine.registerRuleset('custom-rules', ['custom-rule', 'another-rule']);

// Run only custom rules
const results = await engine.run(document, {
  runOnly: 'custom-rules'
});
```

## CLI Output Formats

### Text (default)
Colored terminal output with summaries and details

### JSON
Machine-readable format for CI/CD pipelines

### HTML
Beautiful report with charts and detailed findings

### CSV
Spreadsheet-compatible format for tracking

## API Endpoint Integration

The engine is designed to work seamlessly with API endpoints:

```javascript
// Example API endpoint
app.post('/api/accessibility/test', async (req, res) => {
  const { html, options } = req.body;
  
  // Create DOM from HTML string
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const engine = createAccessibilityEngine(options);
  const results = await engine.run(document);
  
  res.json(results);
});
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build for production
bun run build

# Lint code
bun run lint

# Test CLI locally
bun run cli test https://example.com
```

## Performance

The engine is optimized for speed:
- Parallel rule execution
- Efficient DOM traversal
- Minimal dependencies
- Bun.js optimizations

Typical performance:
- Small page (<100 elements): ~50ms
- Medium page (~1000 elements): ~200ms
- Large page (>5000 elements): ~1s

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details.

## Roadmap

- [x] WCAG 2.2 complete ruleset
- [x] CLI tool
- [x] TypeScript support
- [x] Plain English explanations
- [ ] WCAG 2.1 rules support
- [ ] WCAG 3.0 (Silver) preparation
- [ ] Browser extension
- [ ] API server mode
- [ ] Vue/React/Angular integrations
- [ ] Visual regression testing
- [ ] AI-powered fix suggestions
- [ ] Multi-language support

## Credits

Built with ❤️ for the HelpTheWeb.org project.

## Support

- 📧 Email: support@helptheweb.org
- 💬 Discord: [Join our community](https://discord.gg/helptheweb)
- 📚 Docs: [Full documentation](https://docs.helptheweb.org)
- 🐛 Issues: [GitHub Issues](https://github.com/helptheweb/engine/issues)
