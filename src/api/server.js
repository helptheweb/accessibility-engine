import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { JSDOM, VirtualConsole } from 'jsdom';
import fetch from 'node-fetch';
import createAccessibilityEngine from '../index.js';
import { getAllRules, getRuleById } from '../rules/index.js';

// Create a testUrl function that mimics the CLI behavior
async function testUrl(url, options = {}) {
  console.log(`testUrl: Starting scan for ${url}`);
  
  try {
    // Fetch the HTML with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
    
    console.log(`testUrl: Fetching ${url}...`);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HelpTheWeb Accessibility Engine API/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    console.log(`testUrl: Got response, reading HTML...`);
    const html = await response.text();
    console.log(`testUrl: HTML length: ${html.length} characters`);
    
    // Create DOM
    const virtualConsole = new VirtualConsole();
    if (options.silent) {
      virtualConsole.on('error', () => {});
      virtualConsole.on('warn', () => {});
      virtualConsole.on('info', () => {});
      virtualConsole.on('jsdomError', () => {});
    }
    
    console.log(`testUrl: Creating JSDOM...`);
    const dom = new JSDOM(html, {
      url: url,
      contentType: 'text/html',
      includeNodeLocations: true,
      storageQuota: 10000000,
      pretendToBeVisual: true,
      resources: undefined, // Don't load external resources
      runScripts: undefined, // Don't run any scripts
      virtualConsole
    });
    
    // Set up globals
    const window = dom.window;
    const document = window.document;
    
    global.window = window;
    global.document = document;
    global.navigator = window.navigator;
    global.getComputedStyle = window.getComputedStyle.bind(window);
    global.Element = window.Element;
    global.Node = window.Node;
    
    try {
      console.log(`testUrl: Waiting for DOM ready...`);
      // Wait for DOM to be ready with timeout
      await Promise.race([
        new Promise(resolve => {
          if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', resolve, { once: true });
          } else {
            resolve();
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('DOM ready timeout')), 5000)
        )
      ]);
      
      console.log(`testUrl: Creating accessibility engine...`);
      
      // For large sites, use more conservative settings
      const isLargeSite = html.length > 100000;
      const quickScan = options.quickScan || isLargeSite;
      const maxElements = quickScan ? 50 : (options.maxElements || 1000);
      
      console.log(`testUrl: Site size: ${isLargeSite ? 'LARGE' : 'normal'}, quickScan: ${quickScan}, maxElements: ${maxElements}`);
      
      // Create and configure engine
      const engine = createAccessibilityEngine({
        runOnly: options.rules || (quickScan ? 'wcag22a' : 'wcag22aa'),
        resultTypes: ['violations'],
        maxElements: maxElements,
        timeout: 10000, // Shorter timeout for the engine itself
        silent: options.silent !== false
      });
      
      console.log(`testUrl: Running accessibility tests...`);
      // Run tests with timeout
      const results = await Promise.race([
        engine.run(document),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Accessibility test timeout')), 10000)
        )
      ]);
      
      console.log(`testUrl: Tests complete, found ${results.violations?.length || 0} violations`);
      return results;
    } finally {
      // Clean up globals
      delete global.window;
      delete global.document;
      delete global.navigator;
      delete global.getComputedStyle;
      delete global.Element;
      delete global.Node;
      
      // Close JSDOM
      window.close();
    }
  } catch (error) {
    console.error(`testUrl: Error during scan:`, error.message);
    // For timeout errors, return partial results
    if (error.message.includes('timeout')) {
      console.log('testUrl: Returning empty results due to timeout');
      return {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: []
      };
    }
    throw error;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = 'v1';

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for trusted sources
  skip: (req) => {
    // Skip rate limiting for localhost
    if (req.ip === '127.0.0.1' || req.ip === '::1') {
      return true;
    }
    
    // Skip rate limiting for specific IPs (add your server IPs here)
    const trustedIPs = process.env.TRUSTED_IPS ? process.env.TRUSTED_IPS.split(',') : [];
    if (trustedIPs.includes(req.ip)) {
      return true;
    }
    
    // Skip rate limiting for internal API keys
    const apiKey = req.headers['x-api-key'];
    const internalApiKey = process.env.INTERNAL_API_KEY;
    if (internalApiKey && apiKey === internalApiKey) {
      return true;
    }
    
    // Skip rate limiting based on origin (for your own websites)
    const origin = req.headers.origin || req.headers.referer;
    const defaultTrustedOrigins = [
      'https://helptheweb.org',
      'https://www.helptheweb.org',
      'https://app.helptheweb.org',
      'http://localhost:3000',
      'http://localhost:5173' // Vite dev server
    ];
    
    // Add any additional trusted origins from environment variable
    const additionalOrigins = process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',') : [];
    const trustedOrigins = [...defaultTrustedOrigins, ...additionalOrigins];
    
    if (origin && trustedOrigins.some(trusted => origin.startsWith(trusted))) {
      return true;
    }
    
    return false;
  }
});

// Apply rate limiting to all API routes
app.use(`/api/${API_VERSION}/`, limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    version: API_VERSION,
    timestamp: new Date().toISOString()
  });
});

// API version info
app.get(`/api/${API_VERSION}`, (req, res) => {
  res.json({
    version: API_VERSION,
    endpoints: {
      scan: `POST /api/${API_VERSION}/scan`,
      scanBatch: `POST /api/${API_VERSION}/scan/batch`,
      scanSitemap: `POST /api/${API_VERSION}/scan/sitemap`,
      rules: `GET /api/${API_VERSION}/rules`,
      ruleDetails: `GET /api/${API_VERSION}/rules/:ruleId`,
      health: 'GET /health'
    }
  });
});

// Test endpoint for debugging
app.post(`/api/${API_VERSION}/test`, (req, res) => {
  console.log('Test endpoint hit');
  console.log('Request body:', req.body);
  res.json({ 
    message: 'Test successful',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// Single URL scan
app.post(`/api/${API_VERSION}/scan`, async (req, res) => {
  const { url, options = {} } = req.body;

  if (!url) {
    return res.status(400).json({ 
      error: 'URL is required',
      example: { url: 'https://example.com', options: { maxElements: 1000 } }
    });
  }

  try {
    console.log(`Scanning ${url}...`);
    const startTime = Date.now();
    
    const results = await testUrl(url, {
      maxElements: options.maxElements || 1000,
      timeout: options.timeout || 30000,
      silent: true,
      rules: options.rules, // optional rule filtering
      quickScan: options.quickScan // NEW: option for faster scans on large sites
    });

    const endTime = Date.now();
    const scanDuration = endTime - startTime;

    // Generate summary
    const summary = {
      totalIssues: results.violations.length,
      critical: results.violations.filter(v => v.impact === 'critical').length,
      serious: results.violations.filter(v => v.impact === 'serious').length,
      moderate: results.violations.filter(v => v.impact === 'moderate').length,
      minor: results.violations.filter(v => v.impact === 'minor').length
    };

    res.json({
      url,
      timestamp: new Date().toISOString(),
      scanDuration: `${scanDuration}ms`,
      summary,
      violations: results.violations.map(v => ({
        rule: v.id,
        impact: v.impact,
        message: v.help,
        explanation: v.description,
        selector: v.nodes?.[0]?.target?.[0] || 'N/A',
        html: v.nodes?.[0]?.html || 'N/A',
        howToFix: v.nodes?.[0]?.failureSummary || v.help
      }))
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      error: 'Failed to scan URL',
      message: error.message 
    });
  }
});

// Batch URL scan
app.post(`/api/${API_VERSION}/scan/batch`, async (req, res) => {
  const { urls, options = {} } = req.body;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ 
      error: 'URLs array is required',
      example: { urls: ['https://example.com', 'https://example.com/about'] }
    });
  }

  if (urls.length > 10) {
    return res.status(400).json({ 
      error: 'Maximum 10 URLs allowed per batch request' 
    });
  }

  try {
    const results = [];
    
    for (const url of urls) {
      console.log(`Batch scanning ${url}...`);
      try {
        const scanResult = await testUrl(url, {
          maxElements: options.maxElements || 1000,
          timeout: options.timeout || 30000,
          silent: true
        });

        results.push({
          url,
          status: 'success',
          summary: {
            totalIssues: scanResult.violations.length,
            critical: scanResult.violations.filter(v => v.impact === 'critical').length,
            serious: scanResult.violations.filter(v => v.impact === 'serious').length,
            moderate: scanResult.violations.filter(v => v.impact === 'moderate').length,
            minor: scanResult.violations.filter(v => v.impact === 'minor').length
          },
          violations: scanResult.violations.map(v => ({
            rule: v.id,
            impact: v.impact,
            message: v.help,
            selector: v.nodes?.[0]?.target?.[0] || 'N/A'
          }))
        });
      } catch (error) {
        results.push({
          url,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({
      timestamp: new Date().toISOString(),
      totalUrls: urls.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results
    });
  } catch (error) {
    console.error('Batch scan error:', error);
    res.status(500).json({ 
      error: 'Failed to complete batch scan',
      message: error.message 
    });
  }
});

// Sitemap scan
app.post(`/api/${API_VERSION}/scan/sitemap`, async (req, res) => {
  const { sitemapUrl, options = {} } = req.body;

  if (!sitemapUrl) {
    return res.status(400).json({ 
      error: 'Sitemap URL is required',
      example: { sitemapUrl: 'https://example.com/sitemap.xml' }
    });
  }

  try {
    // Import the sitemap parser
    const { getUrlsFromSitemap } = await import('../utils/sitemap-parser.js');
    
    console.log(`Fetching sitemap from ${sitemapUrl}...`);
    const urls = await getUrlsFromSitemap(sitemapUrl);
    
    const maxUrls = options.maxUrls || 10;
    const urlsToScan = urls.slice(0, maxUrls);

    res.json({
      message: `Found ${urls.length} URLs in sitemap. Scanning first ${urlsToScan.length} URLs...`,
      totalUrlsFound: urls.length,
      urlsToScan: urlsToScan.length,
      status: 'processing',
      note: 'Use the batch endpoint with these URLs for actual scanning',
      urls: urlsToScan
    });
  } catch (error) {
    console.error('Sitemap scan error:', error);
    res.status(500).json({ 
      error: 'Failed to process sitemap',
      message: error.message 
    });
  }
});

// Get all rules
app.get(`/api/${API_VERSION}/rules`, (req, res) => {
  const rules = getAllRules();
  const { tag, impact } = req.query;

  let filteredRules = rules;

  if (tag) {
    filteredRules = filteredRules.filter(rule => 
      rule.tags.includes(tag)
    );
  }

  if (impact) {
    filteredRules = filteredRules.filter(rule => 
      rule.impact === impact
    );
  }

  res.json({
    total: filteredRules.length,
    filters: { tag, impact },
    rules: filteredRules.map(rule => ({
      id: rule.id,
      tags: rule.tags,
      impact: rule.impact,
      explanation: rule.explanation
    }))
  });
});

// Get specific rule
app.get(`/api/${API_VERSION}/rules/:ruleId`, (req, res) => {
  const { ruleId } = req.params;
  const rule = getRuleById(ruleId);

  if (!rule) {
    return res.status(404).json({ 
      error: `Rule '${ruleId}' not found` 
    });
  }

  res.json({
    id: rule.id,
    selector: rule.selector,
    tags: rule.tags,
    impact: rule.impact,
    explanation: rule.explanation,
    evaluate: rule.evaluate.toString() // Show the evaluation logic
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableVersions: [API_VERSION],
    documentation: `/api/${API_VERSION}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
export function startServer() {
  app.listen(PORT, () => {
    console.log(`HelpTheWeb Accessibility API Server`);
    console.log(`Version: ${API_VERSION}`);
    console.log(`Listening on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API endpoints: http://localhost:${PORT}/api/${API_VERSION}`);
  });
}

// Export app for testing
export { app };
