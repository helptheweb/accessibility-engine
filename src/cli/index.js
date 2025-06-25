#!/usr/bin/env bun

/**
 * HelpTheWeb Accessibility Engine CLI
 */

import { Command } from 'commander';
import { JSDOM } from 'jsdom';
import chalk from 'chalk';
import ora from 'ora';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import fetch from 'node-fetch';
import createAccessibilityEngine from '../index.js';
import { formatReport } from './formatters.js';

// Suppress JSDOM CSS parsing errors
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out CSS parsing errors and other noisy errors
  const errorString = args.join(' ');
  if (errorString.includes('Could not parse CSS stylesheet') ||
      errorString.includes('Invalid CSS') ||
      errorString.includes('Expected')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const program = new Command();

program
  .name('helptheweb')
  .description('Accessibility testing engine for WCAG compliance')
  .version('1.0.0');

// Test command
program
  .command('test <source>')
  .description('Test a URL or HTML file for accessibility issues')
  .option('-r, --ruleset <ruleset>', 'Ruleset to use (wcag22a, wcag22aa, wcag22aaa)', 'wcag22aa')
  .option('-o, --output <file>', 'Save results to file')
  .option('-f, --format <format>', 'Output format (text, json, html, csv)', 'text')
  .option('-t, --types <types>', 'Result types to include (violations,passes,incomplete)', 'violations')
  .option('-q, --quiet', 'Only show summary')
  .option('-v, --verbose', 'Show detailed information')
  .option('--no-color', 'Disable colored output')
  .option('--max-elements <number>', 'Maximum elements to check per rule', '1000')
  .option('--timeout <seconds>', 'Timeout in seconds', '30')
  .option('-s, --silent', 'Suppress all error messages')
  .option('-d, --delay <milliseconds>', 'Delay before running tests (for animations)', '0')
  .action(async (source, options) => {
    const spinner = ora('Loading...').start();
    
    try {
      // Get HTML content
      let html;
      let url = source;
      
      if (source.startsWith('http://') || source.startsWith('https://')) {
        spinner.text = 'Fetching URL...';
        const response = await fetch(source, {
          timeout: 30000,
          headers: {
            'User-Agent': 'HelpTheWeb Accessibility Engine/1.0'
          }
        });
        html = await response.text();
      } else if (existsSync(source)) {
        spinner.text = 'Reading file...';
        html = await readFile(source, 'utf-8');
        url = `file://${process.cwd()}/${source}`;
      } else {
        throw new Error(`Invalid source: ${source}`);
      }
      
      // Create DOM with proper configuration
      spinner.text = 'Creating DOM...';
      
      // Configure JSDOM to suppress CSS errors
      const virtualConsole = new (await import('jsdom')).VirtualConsole();
      if (options.silent) {
        virtualConsole.on('error', () => {});
        virtualConsole.on('warn', () => {});
        virtualConsole.on('info', () => {});
        virtualConsole.on('dir', () => {});
      }
      
      const dom = new JSDOM(html, { 
        url: url,
        contentType: 'text/html',
        includeNodeLocations: true,
        storageQuota: 10000000,
        pretendToBeVisual: true,
        resources: 'usable',
        virtualConsole
      });
      
      // Set up globals for the engine
      const window = dom.window;
      const document = window.document;
      
      // Make window methods available globally for the duration of the test
      global.window = window;
      global.document = document;
      global.navigator = window.navigator;
      global.getComputedStyle = window.getComputedStyle.bind(window);
      global.Element = window.Element;
      global.Node = window.Node;
      
      // Wait for resources to load
      await new Promise(resolve => {
        if (document.readyState === 'loading') {
          window.addEventListener('DOMContentLoaded', resolve, { once: true });
          // Add timeout to prevent hanging
          setTimeout(resolve, 5000);
        } else {
          resolve();
        }
      });
      
      // Configure engine
      const resultTypes = options.types.split(',').map(t => t.trim());
      const engine = createAccessibilityEngine({
        runOnly: options.ruleset,
        resultTypes,
        maxElements: parseInt(options.maxElements),
        timeout: parseInt(options.timeout) * 1000,
        silent: options.silent,
        delay: parseInt(options.delay)
      });
      
      // Run tests - pass the document directly
      spinner.text = 'Running accessibility tests...';
      const results = await engine.run(document);
      
      spinner.succeed('Tests completed!');
      
      // Format and display results
      const formatted = formatReport(results, {
        format: options.format,
        quiet: options.quiet,
        verbose: options.verbose,
        noColor: options.color === false
      });
      
      // Output results
      if (options.output) {
        await writeFile(options.output, formatted);
        console.log(chalk.green(`✓ Results saved to ${options.output}`));
      } else {
        console.log(formatted);
      }
      
      // Clean up globals
      delete global.window;
      delete global.document;
      delete global.navigator;
      delete global.getComputedStyle;
      delete global.Element;
      delete global.Node;
      
      // Close JSDOM
      window.close();
      
      // Exit with error code if violations found
      if (results.violations && results.violations.length > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      spinner.fail('Test failed');
      if (!options.silent) {
        console.error(chalk.red('Error:'), error.message);
        if (options.verbose) {
          console.error(error.stack);
        }
      }
      process.exit(1);
    }
  });

// Explain command
program
  .command('explain <ruleId>')
  .description('Get detailed explanation of a specific rule')
  .action(async (ruleId) => {
    try {
      // Create a minimal DOM for the engine
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      global.window = dom.window;
      global.document = dom.window.document;
      
      const engine = createAccessibilityEngine();
      const rule = engine.rules.get(ruleId);
      
      // Clean up
      delete global.window;
      delete global.document;
      dom.window.close();
      
      if (!rule) {
        console.error(chalk.red(`Rule '${ruleId}' not found`));
        
        // Suggest similar rules
        const allRules = Array.from(engine.rules.keys());
        const similar = allRules.filter(id => id.includes(ruleId) || ruleId.includes(id));
        
        if (similar.length > 0) {
          console.log(chalk.yellow('\nDid you mean one of these?'));
          similar.forEach(id => console.log(`  - ${id}`));
        }
        
        process.exit(1);
      }
      
      console.log(chalk.bold('\nRule:', rule.id));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.bold('Description:'), rule.description);
      console.log(chalk.bold('Help:'), rule.help);
      console.log(chalk.bold('Impact:'), chalk.yellow(rule.impact));
      console.log(chalk.bold('Tags:'), rule.tags.join(', '));
      console.log(chalk.bold('Learn more:'), chalk.cyan(rule.helpUrl));
      
      if (rule.explanation) {
        console.log(chalk.bold('\nPlain English Explanation:'));
        console.log(chalk.italic(rule.explanation));
      }
      
      console.log('');
      
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List all available rules')
  .option('-r, --ruleset <ruleset>', 'Filter by ruleset')
  .option('-i, --impact <impact>', 'Filter by impact level')
  .option('-s, --search <term>', 'Search rules by keyword')
  .action(async (options) => {
    try {
      // Create a minimal DOM for the engine
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      global.window = dom.window;
      global.document = dom.window.document;
      
      const engine = createAccessibilityEngine();
      let rules = Array.from(engine.rules.values());
      
      // Clean up
      delete global.window;
      delete global.document;
      dom.window.close();
      
      // Apply filters
      if (options.ruleset) {
        rules = rules.filter(rule => rule.tags.includes(options.ruleset));
      }
      
      if (options.impact) {
        rules = rules.filter(rule => rule.impact === options.impact);
      }
      
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        rules = rules.filter(rule => 
          rule.id.toLowerCase().includes(searchTerm) ||
          rule.description.toLowerCase().includes(searchTerm) ||
          rule.help.toLowerCase().includes(searchTerm) ||
          (rule.explanation && rule.explanation.toLowerCase().includes(searchTerm))
        );
      }
      
      // Group by impact
      const grouped = rules.reduce((acc, rule) => {
        if (!acc[rule.impact]) acc[rule.impact] = [];
        acc[rule.impact].push(rule);
        return acc;
      }, {});
      
      // Display rules
      console.log(chalk.bold('\nAvailable Rules:'));
      console.log(chalk.gray('─'.repeat(50)));
      
      const impactColors = {
        critical: 'red',
        serious: 'yellow',
        moderate: 'blue',
        minor: 'gray'
      };
      
      const impactOrder = ['critical', 'serious', 'moderate', 'minor'];
      
      for (const impact of impactOrder) {
        const impactRules = grouped[impact];
        if (!impactRules || impactRules.length === 0) continue;
        
        console.log(chalk.bold[impactColors[impact]](`\n${impact.toUpperCase()} (${impactRules.length})`));
        
        impactRules.forEach(rule => {
          console.log(`  ${chalk.bold(rule.id)} - ${rule.description}`);
          if (rule.explanation) {
            const truncated = rule.explanation.length > 60 
              ? rule.explanation.substring(0, 60) + '...'
              : rule.explanation;
            console.log(`    ${chalk.gray(truncated)}`);
          }
        });
      }
      
      console.log(chalk.gray('\n' + '─'.repeat(50)));
      console.log(`Total: ${rules.length} rules`);
      
      if (options.search && rules.length === 0) {
        console.log(chalk.yellow(`\nNo rules found matching "${options.search}"`));
      }
      
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Server command
program
  .command('server')
  .description('Start accessibility testing API server')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .action(async (options) => {
    console.log(chalk.yellow('API server coming soon!'));
    console.log('This will start an HTTP server for API-based testing');
    console.log(`Planned features:`);
    console.log(`  - REST API endpoint for testing`);
    console.log(`  - WebSocket support for real-time testing`);
    console.log(`  - Dashboard UI`);
    console.log(`  - Webhook integrations`);
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
