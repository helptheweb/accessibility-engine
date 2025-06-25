/**
 * Test for duplicate main elements detection
 */

import { createAccessibilityEngine } from '../src/core/factory.js';
import { JSDOM } from 'jsdom';

// Test HTML with duplicate main elements
const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Test Page with Duplicate Main Elements</title>
</head>
<body>
    <header>
        <h1>Website Header</h1>
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <h2>First Main Content Area</h2>
        <p>This is the first main element.</p>
    </main>
    
    <main>
        <h2>Second Main Content Area</h2>
        <p>This is the second main element - this should be flagged!</p>
    </main>
    
    <footer>
        <p>Website Footer</p>
    </footer>
</body>
</html>
`;

async function testDuplicateMainDetection() {
    console.log('Testing duplicate main element detection...\n');
    
    // Create a DOM from the test HTML
    const dom = new JSDOM(testHTML);
    const document = dom.window.document;
    
    // Create engine with best practices enabled
    const engine = createAccessibilityEngine({
        runOnly: ['best-practice'],
        resultTypes: ['violations']
    });
    
    try {
        // Run the engine
        const results = await engine.run(document);
        
        console.log('Test Results:');
        console.log('=============');
        
        // Check for duplicate main violation
        const duplicateMainViolation = results.violations.find(
            v => v.id === 'landmark-unique-main'
        );
        
        if (duplicateMainViolation) {
            console.log('✅ SUCCESS: Duplicate main elements detected!');
            console.log(`\nViolation details:`);
            console.log(`- Description: ${duplicateMainViolation.description}`);
            console.log(`- Impact: ${duplicateMainViolation.impact}`);
            console.log(`- Help: ${duplicateMainViolation.help}`);
            console.log(`\nAffected elements:`);
            
            duplicateMainViolation.nodes.forEach((node, index) => {
                console.log(`  ${index + 1}. ${node.html}`);
                console.log(`     ${node.message}`);
            });
        } else {
            console.log('❌ FAIL: Duplicate main elements were NOT detected');
            console.log('\nAll violations found:');
            results.violations.forEach(v => {
                console.log(`- ${v.id}: ${v.description}`);
            });
        }
        
        // Show summary
        console.log(`\nTotal violations found: ${results.violations.length}`);
        
    } catch (error) {
        console.error('Error running test:', error);
    }
}

// Run the test
testDuplicateMainDetection();
