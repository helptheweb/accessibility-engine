#!/usr/bin/env node

// Test script for the API endpoints
import chalk from 'chalk';

const API_BASE = 'http://localhost:3000/api/v1';

async function testEndpoint(name, endpoint, options = {}) {
  console.log(chalk.blue(`\nTesting ${name}...`));
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(chalk.green('✓ Success'));
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    } else {
      console.log(chalk.red('✗ Failed'));
      console.log(chalk.red(JSON.stringify(data, null, 2)));
    }
  } catch (error) {
    console.log(chalk.red('✗ Error:', error.message));
  }
}

async function runTests() {
  console.log(chalk.yellow('HelpTheWeb API Test Suite'));
  console.log(chalk.gray('Make sure the API server is running on port 3000\n'));

  // Test health endpoint
  await testEndpoint('Health Check', '../../health');

  // Test API info
  await testEndpoint('API Info', '');

  // Test rules listing
  await testEndpoint('List Rules', '/rules');

  // Test specific rule
  await testEndpoint('Get Rule Details', '/rules/img-alt');

  // Test single URL scan
  await testEndpoint('Single URL Scan', '/scan', {
    method: 'POST',
    body: {
      url: 'https://example.com',
      options: {
        maxElements: 100
      }
    }
  });

  // Test batch scan
  await testEndpoint('Batch URL Scan', '/scan/batch', {
    method: 'POST',
    body: {
      urls: [
        'https://example.com',
        'https://example.com/404'
      ],
      options: {
        maxElements: 100
      }
    }
  });

  // Test sitemap scan
  await testEndpoint('Sitemap Scan', '/scan/sitemap', {
    method: 'POST',
    body: {
      sitemapUrl: 'https://example.com/sitemap.xml',
      options: {
        maxUrls: 5
      }
    }
  });

  // Test error handling
  await testEndpoint('Error Handling - No URL', '/scan', {
    method: 'POST',
    body: {}
  });

  console.log(chalk.yellow('\n✨ Test suite complete!'));
}

// Run tests
runTests().catch(console.error);
