#!/usr/bin/env bun

/**
 * Example script showing how to use the accessibility engine
 */

import createAccessibilityEngine from './src/index.js';
import { JSDOM } from 'jsdom';

// Example HTML to test
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Example Page</title>
</head>
<body>
  <h1>Welcome</h1>
  <img src="logo.png">
  <form>
    <input type="text" placeholder="Name">
    <button type="submit">Submit</button>
  </form>
  <p style="color: #777; background: #888;">Low contrast text</p>
</body>
</html>
`;

async function runExample() {
  console.log('Creating accessibility engine...\n');
  
  // Create a DOM from the HTML string
  const dom = new JSDOM(html, {
    url: 'http://example.com',
    pretendToBeVisual: true
  });
  
  // Set up globals
  const window = dom.window;
  const document = window.document;
  
  // Make window methods available globally
  global.window = window;
  global.document = document;
  global.getComputedStyle = window.getComputedStyle.bind(window);
  
  // Create engine with options
  const engine = createAccessibilityEngine({
    runOnly: ['wcag22a', 'wcag22aa'],
    resultTypes: ['violations', 'incomplete']
  });
  
  console.log('Running accessibility tests...\n');
  
  // Run the tests on the document
  const results = await engine.run(document);
  
  // Display results
  console.log(`Execution time: ${results.time.toFixed(2)}ms\n`);
  
  if (results.violations.length === 0) {
    console.log('✅ No accessibility violations found!\n');
  } else {
    console.log(`❌ Found ${results.violations.length} accessibility violations:\n`);
    
    results.violations.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.help}`);
      console.log(`   Rule: ${violation.id}`);
      console.log(`   Impact: ${violation.impact}`);
      console.log(`   Elements affected: ${violation.nodes.length}`);
      
      if (violation.explanation) {
        console.log(`   Why it matters: ${violation.explanation}`);
      }
      
      violation.nodes.forEach((node, nodeIndex) => {
        console.log(`   ${nodeIndex + 1}) ${node.target}`);
        if (node.message) {
          console.log(`      ${node.message}`);
        }
      });
      
      console.log(`   Learn more: ${violation.helpUrl}\n`);
    });
  }
  
  if (results.incomplete && results.incomplete.length > 0) {
    console.log(`⚠️  ${results.incomplete.length} tests need manual review:\n`);
    
    results.incomplete.forEach((incomplete) => {
      console.log(`- ${incomplete.help} (${incomplete.id})`);
      if (incomplete.explanation) {
        console.log(`  ${incomplete.explanation}`);
      }
    });
  }
  
  // Clean up globals
  delete global.window;
  delete global.document;
  delete global.getComputedStyle;
  
  // Close JSDOM
  dom.window.close();
}

// Run the example
runExample().catch(console.error);
