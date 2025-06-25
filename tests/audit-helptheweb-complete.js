#!/usr/bin/env bun

/**
 * Comprehensive accessibility test for HelpTheWeb website
 * Tests both WCAG 2.2 AA and best practices
 */

import { createAccessibilityEngine } from '../src/index.js';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import chalk from 'chalk';

// Pages to test based on the routes seen in the documents
const pagesToTest = [
    { url: 'https://helptheweb.org', name: 'Home' },
    { url: 'https://helptheweb.org/about', name: 'About' },
    { url: 'https://helptheweb.org/tools', name: 'Tools' },
    { url: 'https://helptheweb.org/contact', name: 'Contact' },
    { url: 'https://helptheweb.org/request', name: 'Request Audit' },
    { url: 'https://helptheweb.org/about/the-badge', name: 'The Badge' },
    { url: 'https://helptheweb.org/tools/color-contrast', name: 'Color Contrast Tool' },
    { url: 'https://helptheweb.org/tools/helper', name: 'Accessibility Helper' },
    { url: 'https://helptheweb.org/privacy-policy', name: 'Privacy Policy' },
    { url: 'https://helptheweb.org/terms-of-service', name: 'Terms of Service' }
];

async function testPage(url, name) {
    console.log(chalk.blue(`\n📄 Testing ${name} (${url})...`));
    
    try {
        // Fetch the page
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HelpTheWeb Accessibility Test'
            }
        });
        
        if (!response.ok) {
            console.log(chalk.yellow(`   ⚠️  Could not fetch page (${response.status})`));
            return null;
        }
        
        const html = await response.text();
        
        // Create DOM
        const dom = new JSDOM(html, { 
            url: url,
            pretendToBeVisual: true,
            resources: 'usable'
        });
        
        // Set up globals
        const window = dom.window;
        global.window = window;
        global.document = window.document;
        global.getComputedStyle = window.getComputedStyle.bind(window);
        global.Element = window.Element;
        global.Node = window.Node;
        
        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create engine with WCAG AA + best practices
        const engine = createAccessibilityEngine({
            runOnly: ['wcag22aa-with-best-practices'],
            resultTypes: ['violations'],
            delay: 3000,  // Wait for dynamic content
            silent: true
        });
        
        // Run tests
        const results = await engine.run(window.document);
        
        // Clean up
        delete global.window;
        delete global.document;
        delete global.getComputedStyle;
        delete global.Element;
        delete global.Node;
        dom.window.close();
        
        return results;
        
    } catch (error) {
        console.log(chalk.red(`   ❌ Error: ${error.message}`));
        return null;
    }
}

async function generateReport() {
    console.log(chalk.bold.cyan('\n🔍 HelpTheWeb.org Comprehensive Accessibility Audit'));
    console.log(chalk.gray('=' .repeat(60)));
    console.log(chalk.gray('Testing WCAG 2.2 AA + Best Practices'));
    console.log(chalk.gray('Date: ' + new Date().toISOString()));
    console.log(chalk.gray('=' .repeat(60)));
    
    const allViolations = {
        'duplicate-main': [],
        'wcag-critical': [],
        'wcag-serious': [],
        'wcag-moderate': [],
        'best-practice': [],
        'other': []
    };
    
    let totalViolations = 0;
    let pagesWithErrors = 0;
    
    // Test each page
    for (const page of pagesToTest) {
        const results = await testPage(page.url, page.name);
        
        if (!results) continue;
        
        if (results.violations.length > 0) {
            pagesWithErrors++;
            totalViolations += results.violations.length;
            
            // Categorize violations
            results.violations.forEach(violation => {
                const violationInfo = {
                    page: page.name,
                    url: page.url,
                    ...violation
                };
                
                // Check for duplicate main
                if (violation.id === 'landmark-unique-main') {
                    allViolations['duplicate-main'].push(violationInfo);
                }
                // Categorize by impact and type
                else if (violation.tags.includes('best-practice')) {
                    allViolations['best-practice'].push(violationInfo);
                }
                else if (violation.impact === 'critical') {
                    allViolations['wcag-critical'].push(violationInfo);
                }
                else if (violation.impact === 'serious') {
                    allViolations['wcag-serious'].push(violationInfo);
                }
                else if (violation.impact === 'moderate') {
                    allViolations['wcag-moderate'].push(violationInfo);
                }
                else {
                    allViolations['other'].push(violationInfo);
                }
            });
            
            console.log(chalk.red(`   ❌ ${results.violations.length} violations found`));
        } else {
            console.log(chalk.green(`   ✅ No violations found`));
        }
    }
    
    // Generate summary report
    console.log(chalk.bold.cyan('\n📊 Summary Report'));
    console.log(chalk.gray('=' .repeat(60)));
    console.log(`Total pages tested: ${pagesToTest.length}`);
    console.log(`Pages with violations: ${pagesWithErrors}`);
    console.log(`Total violations found: ${totalViolations}`);
    
    // Report duplicate main issues
    if (allViolations['duplicate-main'].length > 0) {
        console.log(chalk.bold.red('\n🚨 DUPLICATE MAIN ELEMENTS FOUND!'));
        console.log(chalk.red('This is the issue you were looking for:'));
        
        const uniquePages = [...new Set(allViolations['duplicate-main'].map(v => v.page))];
        uniquePages.forEach(pageName => {
            const pageViolations = allViolations['duplicate-main'].filter(v => v.page === pageName);
            const violation = pageViolations[0];
            
            console.log(chalk.yellow(`\n   Page: ${pageName}`));
            console.log(`   URL: ${violation.url}`);
            console.log(`   Problem: ${violation.description}`);
            violation.nodes.forEach((node, i) => {
                console.log(`   Element ${i + 1}: ${node.html}`);
                if (node.message) {
                    console.log(chalk.gray(`   ${node.message}`));
                }
            });
        });
    }
    
    // Report critical WCAG violations
    if (allViolations['wcag-critical'].length > 0) {
        console.log(chalk.bold.red('\n⛔ Critical WCAG Violations (Must Fix)'));
        reportViolationGroup(allViolations['wcag-critical']);
    }
    
    // Report serious WCAG violations
    if (allViolations['wcag-serious'].length > 0) {
        console.log(chalk.bold.yellow('\n⚠️  Serious WCAG Violations'));
        reportViolationGroup(allViolations['wcag-serious']);
    }
    
    // Report moderate WCAG violations
    if (allViolations['wcag-moderate'].length > 0) {
        console.log(chalk.bold.blue('\nℹ️  Moderate WCAG Violations'));
        reportViolationGroup(allViolations['wcag-moderate']);
    }
    
    // Report best practice violations
    if (allViolations['best-practice'].length > 0) {
        console.log(chalk.bold.magenta('\n💡 Best Practice Violations'));
        reportViolationGroup(allViolations['best-practice']);
    }
    
    // Exit code based on violations
    if (allViolations['duplicate-main'].length > 0 || allViolations['wcag-critical'].length > 0) {
        console.log(chalk.bold.red('\n❌ Accessibility audit FAILED with critical issues'));
        process.exit(1);
    } else if (totalViolations > 0) {
        console.log(chalk.bold.yellow('\n⚠️  Accessibility audit completed with issues'));
        process.exit(0);
    } else {
        console.log(chalk.bold.green('\n✅ Accessibility audit PASSED'));
        process.exit(0);
    }
}

function reportViolationGroup(violations) {
    // Group by rule ID
    const byRule = {};
    violations.forEach(v => {
        if (!byRule[v.id]) {
            byRule[v.id] = {
                description: v.description,
                help: v.help,
                impact: v.impact,
                pages: []
            };
        }
        byRule[v.id].pages.push({
            name: v.page,
            url: v.url,
            elements: v.nodes.length
        });
    });
    
    // Report each rule
    Object.entries(byRule).forEach(([ruleId, data]) => {
        console.log(chalk.gray(`\n   ${ruleId}: ${data.description}`));
        console.log(chalk.gray(`   Impact: ${data.impact}`));
        console.log(chalk.gray(`   Help: ${data.help}`));
        console.log(chalk.gray(`   Found on:`));
        data.pages.forEach(page => {
            console.log(chalk.gray(`     - ${page.name} (${page.elements} elements)`));
        });
    });
}

// Run the audit
generateReport().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
});
