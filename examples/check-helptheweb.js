#!/usr/bin/env bun

/**
 * Example: Detecting duplicate main elements on helptheweb.org
 */

import { createAccessibilityEngine } from '../src/index.js';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

async function checkHelpTheWeb() {
    console.log('Checking helptheweb.org for duplicate main elements...\n');
    
    try {
        // Fetch the page
        const response = await fetch('https://helptheweb.org');
        const html = await response.text();
        
        // Create DOM
        const dom = new JSDOM(html, { 
            url: 'https://helptheweb.org',
            pretendToBeVisual: true
        });
        
        // Set up globals
        global.window = dom.window;
        global.document = dom.window.document;
        global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
        
        // Create engine with best practices
        const engine = createAccessibilityEngine({
            runOnly: ['best-practice'],
            resultTypes: ['violations'],
            delay: 3000  // Wait 3 seconds for dynamic content
        });
        
        // Run tests
        console.log('Running accessibility tests (with 3 second delay)...');
        const results = await engine.run(dom.window.document);
        
        // Check for duplicate main
        const duplicateMain = results.violations.find(v => v.id === 'landmark-unique-main');
        
        if (duplicateMain) {
            console.log('✅ FOUND IT! Duplicate main elements detected:\n');
            console.log(`Rule: ${duplicateMain.id}`);
            console.log(`Description: ${duplicateMain.description}`);
            console.log(`Impact: ${duplicateMain.impact}`);
            console.log(`\nElements found:`);
            
            duplicateMain.nodes.forEach((node, i) => {
                console.log(`${i + 1}. ${node.html}`);
                console.log(`   ${node.message}`);
            });
        } else {
            console.log('❌ No duplicate main elements found');
            
            if (results.violations.length > 0) {
                console.log('\nOther best practice violations found:');
                results.violations.forEach(v => {
                    console.log(`- ${v.description} (${v.id})`);
                });
            }
        }
        
        console.log(`\nTotal best practice violations: ${results.violations.length}`);
        
        // Clean up
        delete global.window;
        delete global.document;
        delete global.getComputedStyle;
        dom.window.close();
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkHelpTheWeb();
