#!/usr/bin/env bun

/**
 * Quick test to find duplicate main elements on HelpTheWeb.org
 */

import { createAccessibilityEngine } from '../src/index.js';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import chalk from 'chalk';

async function findDuplicateMains() {
    console.log(chalk.bold.cyan('🔍 Searching for duplicate <main> elements on HelpTheWeb.org\n'));
    
    const url = 'https://helptheweb.org';
    
    try {
        // Fetch the page
        console.log('Fetching page...');
        const response = await fetch(url);
        const html = await response.text();
        
        // Create DOM
        const dom = new JSDOM(html, { 
            url: url,
            pretendToBeVisual: true,
            resources: 'usable'
        });
        
        // Set up globals
        global.window = dom.window;
        global.document = dom.window.document;
        global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
        
        // Quick check: count main elements
        const mainElements = dom.window.document.querySelectorAll('main, [role="main"]');
        console.log(`\nDirect DOM check: Found ${mainElements.length} main element(s)`);
        if (mainElements.length > 1) {
            console.log(chalk.red('Multiple main elements detected!'));
            mainElements.forEach((el, i) => {
                console.log(`  ${i + 1}. ${el.outerHTML.substring(0, 100)}...`);
            });
        }
        
        // Wait for any dynamic content
        console.log('\nWaiting for dynamic content to load...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check again after delay
        const mainElementsAfter = dom.window.document.querySelectorAll('main, [role="main"]');
        console.log(`After delay: Found ${mainElementsAfter.length} main element(s)`);
        
        // Run engine test
        console.log('\nRunning accessibility engine test...');
        const engine = createAccessibilityEngine({
            runOnly: ['best-practice'],
            resultTypes: ['violations']
        });
        
        const results = await engine.run(dom.window.document);
        
        // Check for duplicate main violation
        const duplicateMainViolation = results.violations.find(v => v.id === 'landmark-unique-main');
        
        if (duplicateMainViolation) {
            console.log(chalk.green('\n✅ SUCCESS! The engine detected duplicate main elements:'));
            console.log(chalk.yellow(`\nViolation: ${duplicateMainViolation.description}`));
            console.log(`Impact: ${duplicateMainViolation.impact}`);
            console.log(`\nAffected elements:`);
            
            duplicateMainViolation.nodes.forEach((node, i) => {
                console.log(`\n${i + 1}. Element HTML:`);
                console.log(chalk.gray(node.html));
                if (node.message) {
                    console.log(chalk.red(`   ${node.message}`));
                }
            });
        } else {
            console.log(chalk.red('\n❌ The engine did NOT detect duplicate main elements'));
            
            // Show what violations were found
            if (results.violations.length > 0) {
                console.log('\nOther violations found:');
                results.violations.forEach(v => {
                    console.log(`- ${v.id}: ${v.description}`);
                });
            }
        }
        
        // Clean up
        delete global.window;
        delete global.document;
        delete global.getComputedStyle;
        dom.window.close();
        
    } catch (error) {
        console.error(chalk.red('Error:'), error.message);
    }
}

// Run the test
findDuplicateMains();
