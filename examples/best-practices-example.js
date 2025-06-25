/**
 * Example: Using best practice rules
 */

import { createAccessibilityEngine } from '../src/index.js';

// Example 1: Check only for best practices
async function checkBestPractices(document) {
    const engine = createAccessibilityEngine({
        runOnly: ['best-practice'],
        resultTypes: ['violations']
    });
    
    const results = await engine.run(document);
    
    console.log('Best Practice Violations:');
    results.violations.forEach(violation => {
        console.log(`\n❌ ${violation.description}`);
        console.log(`   Rule: ${violation.id}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Affected elements: ${violation.nodes.length}`);
        
        violation.nodes.forEach((node, i) => {
            console.log(`   ${i + 1}. ${node.html}`);
            if (node.message) {
                console.log(`      ${node.message}`);
            }
        });
    });
    
    return results;
}

// Example 2: Check WCAG AA + Best Practices
async function checkAccessibilityWithBestPractices(document) {
    const engine = createAccessibilityEngine({
        runOnly: ['wcag22aa-with-best-practices'],
        resultTypes: ['violations', 'passes']
    });
    
    const results = await engine.run(document);
    
    console.log('Accessibility Report:');
    console.log(`✅ Passed: ${results.passes.length} rules`);
    console.log(`❌ Failed: ${results.violations.length} rules`);
    
    // Group violations by type
    const wcagViolations = results.violations.filter(v => 
        v.tags.some(tag => tag.startsWith('wcag'))
    );
    const bestPracticeViolations = results.violations.filter(v => 
        v.tags.includes('best-practice')
    );
    
    if (wcagViolations.length > 0) {
        console.log('\nWCAG Violations:');
        wcagViolations.forEach(v => {
            console.log(`- ${v.description} (${v.id})`);
        });
    }
    
    if (bestPracticeViolations.length > 0) {
        console.log('\nBest Practice Violations:');
        bestPracticeViolations.forEach(v => {
            console.log(`- ${v.description} (${v.id})`);
        });
    }
    
    return results;
}

// Example 3: Check specifically for landmark issues
async function checkLandmarks(document) {
    const engine = createAccessibilityEngine({
        runOnly: ['best-practice']
    });
    
    const results = await engine.run(document);
    
    // Filter for landmark-related violations
    const landmarkViolations = results.violations.filter(v => 
        v.tags.includes('landmarks')
    );
    
    if (landmarkViolations.length > 0) {
        console.log('Landmark Issues Found:');
        
        landmarkViolations.forEach(violation => {
            console.log(`\n${violation.description}`);
            console.log(`Why this matters: ${violation.explanation}`);
            
            violation.nodes.forEach(node => {
                console.log(`Problem: ${node.message}`);
            });
        });
    } else {
        console.log('✅ No landmark issues found!');
    }
    
    return landmarkViolations;
}

// Example usage in a browser
if (typeof document !== 'undefined') {
    // Check current page
    checkBestPractices(document).then(results => {
        console.log(`\nFound ${results.violations.length} best practice violations`);
    });
}

export {
    checkBestPractices,
    checkAccessibilityWithBestPractices,
    checkLandmarks
};
