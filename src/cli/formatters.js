/**
 * Output formatters for CLI results
 */

import chalk from 'chalk';

/**
 * Format report based on options
 */
export function formatReport(results, options) {
  switch (options.format) {
    case 'json':
      return JSON.stringify(results, null, 2);
    
    case 'html':
      return formatHTML(results, options);
    
    case 'csv':
      return formatCSV(results, options);
    
    case 'text':
    default:
      return formatText(results, options);
  }
}

/**
 * Format as colored text for terminal
 */
function formatText(results, options) {
  const output = [];
  const useColor = !options.noColor;
  
  // Header
  if (!options.quiet) {
    output.push(useColor ? chalk.bold('\n🔍 Accessibility Test Results') : '\n🔍 Accessibility Test Results');
    output.push(useColor ? chalk.gray('─'.repeat(50)) : '─'.repeat(50));
    output.push(`URL: ${results.url || 'N/A'}`);
    output.push(`Time: ${results.time?.toFixed(2)}ms`);
    output.push(`Timestamp: ${new Date(results.timestamp).toLocaleString()}`);
    output.push('');
  }
  
  // Summary
  const summary = {
    violations: results.violations?.length || 0,
    passes: results.passes?.length || 0,
    incomplete: results.incomplete?.length || 0,
    inapplicable: results.inapplicable?.length || 0
  };
  
  if (options.quiet) {
    // Quiet mode - just summary
    const status = summary.violations === 0 ? '✓ PASS' : '✗ FAIL';
    const statusColor = summary.violations === 0 ? 'green' : 'red';
    
    output.push(useColor ? chalk[statusColor](status) : status);
    output.push(`Violations: ${summary.violations}`);
    
    // Add a brief celebration for perfect score in quiet mode
    if (summary.violations === 0) {
      output.push(useColor ? chalk.green('🎉 Perfect accessibility score!') : '🎉 Perfect accessibility score!');
    }
    
    return output.join('\n');
  }
  
  // Summary section
  output.push(useColor ? chalk.bold('Summary:') : 'Summary:');
  output.push(`  ${useColor ? chalk.red(`Violations: ${summary.violations}`) : `Violations: ${summary.violations}`}`);
  output.push(`  ${useColor ? chalk.green(`Passes: ${summary.passes}`) : `Passes: ${summary.passes}`}`);
  output.push(`  ${useColor ? chalk.yellow(`Incomplete: ${summary.incomplete}`) : `Incomplete: ${summary.incomplete}`}`);
  output.push(`  ${useColor ? chalk.gray(`Inapplicable: ${summary.inapplicable}`) : `Inapplicable: ${summary.inapplicable}`}`);
  output.push('');
  
  // Celebration for perfect score!
  if (summary.violations === 0) {
    output.push('');
    if (useColor) {
      output.push(chalk.bold.green('🎉 Congratulations! Your site is accessibility superstar! 🌟'));
      output.push(chalk.green('✨ No violations found - you\'re making the web better for everyone!'));
      
      // Add some fun ASCII art
      output.push('');
      output.push(chalk.yellow('      ⭐️ ⭐️ ⭐️'));
      output.push(chalk.yellow('     ⭐️  ') + chalk.green('A+') + chalk.yellow('  ⭐️'));
      output.push(chalk.yellow('      ⭐️ ⭐️ ⭐️'));
      output.push('');
      
      if (summary.incomplete > 0) {
        output.push(chalk.yellow(`⚠️  Just ${summary.incomplete} things to double-check manually.`));
      } else if (summary.passes > 0) {
        output.push(chalk.green(`💪 Passed all ${summary.passes} accessibility checks!`));
      }
    } else {
      output.push('🎉 Congratulations! Your site is accessibility superstar! 🌟');
      output.push('✨ No violations found - you\'re making the web better for everyone!');
      output.push('');
      output.push('      ⭐️ ⭐️ ⭐️');
      output.push('     ⭐️  A+  ⭐️');
      output.push('      ⭐️ ⭐️ ⭐️');
      output.push('');
      
      if (summary.incomplete > 0) {
        output.push(`⚠️  Just ${summary.incomplete} things to double-check manually.`);
      } else if (summary.passes > 0) {
        output.push(`💪 Passed all ${summary.passes} accessibility checks!`);
      }
    }
    
    // Add a motivational quote
    const quotes = [
      '"The power of the Web is in its universality." - Tim Berners-Lee',
      '"Accessibility is not a feature, it\'s a social trend." - Antonio Santos',
      '"When we prioritize accessibility, we make the web better for everyone."',
      '"Good design is inclusive design."',
      '"Accessibility is the right thing to do. And it\'s good for business too!"'
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    output.push('');
    output.push(useColor ? chalk.italic.gray(randomQuote) : randomQuote);
    
    return output.join('\n');
  }
  
  // Violations
  if (results.violations && results.violations.length > 0) {
    output.push(useColor ? chalk.bold.red('\n❌ Violations:') : '\n❌ Violations:');
    output.push(useColor ? chalk.gray('─'.repeat(50)) : '─'.repeat(50));
    
    results.violations.forEach((violation, index) => {
      output.push('');
      output.push(useColor ? chalk.bold(`${index + 1}. ${violation.help}`) : `${index + 1}. ${violation.help}`);
      output.push(`   Rule: ${useColor ? chalk.magenta(violation.id) : violation.id}`);
      output.push(`   Impact: ${useColor ? getImpactColor(violation.impact) : violation.impact}`);
      
      if (violation.explanation && options.verbose) {
        output.push(`   ${useColor ? chalk.italic('Explanation:') : 'Explanation:'} ${violation.explanation}`);
      }
      
      output.push(`   Elements: ${violation.nodes.length}`);
      
      if (options.verbose) {
        violation.nodes.forEach((node, nodeIndex) => {
          output.push(`     ${nodeIndex + 1}) ${node.target}`);
          if (node.message) {
            output.push(`        ${useColor ? chalk.yellow(node.message) : node.message}`);
          }
          output.push(`        ${useColor ? chalk.gray(node.html) : node.html}`);
        });
      } else {
        // Just show first few in non-verbose mode
        violation.nodes.slice(0, 3).forEach((node, nodeIndex) => {
          output.push(`     ${nodeIndex + 1}) ${node.target}`);
          if (node.message) {
            output.push(`        ${useColor ? chalk.yellow(node.message) : node.message}`);
          }
        });
        
        if (violation.nodes.length > 3) {
          output.push(`     ... and ${violation.nodes.length - 3} more`);
        }
      }
      
      output.push(`   Learn more: ${useColor ? chalk.cyan.underline(violation.helpUrl) : violation.helpUrl}`);
    });
  }
  
  // Incomplete
  if (results.incomplete && results.incomplete.length > 0 && !options.quiet) {
    output.push(useColor ? chalk.bold.yellow('\n⚠️  Incomplete (need review):') : '\n⚠️  Incomplete (need review):');
    output.push(useColor ? chalk.gray('─'.repeat(50)) : '─'.repeat(50));
    
    results.incomplete.forEach((incomplete) => {
      output.push(`  • ${incomplete.help} (${incomplete.id})`);
      if (options.verbose && incomplete.explanation) {
        output.push(`    ${useColor ? chalk.italic(incomplete.explanation) : incomplete.explanation}`);
      }
    });
  }
  
  // Passes (only in verbose mode)
  if (results.passes && results.passes.length > 0 && options.verbose) {
    output.push(useColor ? chalk.bold.green('\n✅ Passes:') : '\n✅ Passes:');
    output.push(useColor ? chalk.gray('─'.repeat(50)) : '─'.repeat(50));
    
    results.passes.forEach((pass) => {
      output.push(`  ✓ ${pass.help} (${pass.id})`);
    });
  }
  
  output.push('');
  return output.join('\n');
}

/**
 * Get color for impact level
 */
function getImpactColor(impact) {
  const colors = {
    critical: chalk.red(impact),
    serious: chalk.yellow(impact),
    moderate: chalk.blue(impact),
    minor: chalk.gray(impact)
  };
  return colors[impact] || impact;
}

/**
 * Format as HTML report
 */
function formatHTML(results, options) {
  const summary = {
    violations: results.violations?.length || 0,
    passes: results.passes?.length || 0,
    incomplete: results.incomplete?.length || 0
  };
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - ${results.url || 'Test Results'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #2c3e50; }
    h2 { color: #34495e; margin-top: 30px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .summary-card {
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      color: white;
    }
    .violations { background: #e74c3c; }
    .passes { background: #27ae60; }
    .incomplete { background: #f39c12; }
    .summary-card h3 { margin: 0; font-size: 36px; }
    .summary-card p { margin: 5px 0 0 0; }
    .violation {
      background: #fee;
      border-left: 4px solid #e74c3c;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .violation h3 { margin: 0 0 10px 0; color: #c0392b; }
    .impact {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 10px;
    }
    .impact-critical { background: #c0392b; color: white; }
    .impact-serious { background: #e67e22; color: white; }
    .impact-moderate { background: #3498db; color: white; }
    .impact-minor { background: #95a5a6; color: white; }
    .node {
      background: #f8f8f8;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }
    .explanation {
      background: #e8f4f8;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
      font-style: italic;
    }
    .metadata {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
    a { color: #3498db; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Accessibility Test Report</h1>
    
    <div class="metadata">
      <p><strong>URL:</strong> ${results.url || 'N/A'}</p>
      <p><strong>Tested:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
      <p><strong>Duration:</strong> ${results.time?.toFixed(2)}ms</p>
      <p><strong>Engine:</strong> ${results.testEngine.name} v${results.testEngine.version}</p>
    </div>
    
    <div class="summary">
      <div class="summary-card violations">
        <h3>${summary.violations}</h3>
        <p>Violations</p>
      </div>
      <div class="summary-card passes">
        <h3>${summary.passes}</h3>
        <p>Passes</p>
      </div>
      <div class="summary-card incomplete">
        <h3>${summary.incomplete}</h3>
        <p>Incomplete</p>
      </div>
    </div>
    
    ${summary.violations > 0 ? `
      <h2>❌ Violations</h2>
      ${results.violations.map((violation, index) => `
        <div class="violation">
          <h3>${index + 1}. ${violation.help}
            <span class="impact impact-${violation.impact}">${violation.impact.toUpperCase()}</span>
          </h3>
          <p><strong>Rule:</strong> <code>${violation.id}</code></p>
          ${violation.explanation ? `<div class="explanation">${violation.explanation}</div>` : ''}
          <p><strong>Elements affected:</strong> ${violation.nodes.length}</p>
          ${violation.nodes.slice(0, options.verbose ? 100 : 3).map((node, nodeIndex) => `
            <div class="node">
              <strong>${nodeIndex + 1}.</strong> ${node.target}<br>
              ${node.message ? `<em>${node.message}</em><br>` : ''}
              <code>${escapeHtml(node.html)}</code>
            </div>
          `).join('')}
          ${!options.verbose && violation.nodes.length > 3 ? 
            `<p><em>... and ${violation.nodes.length - 3} more elements</em></p>` : ''}
          <p><a href="${violation.helpUrl}" target="_blank">Learn more →</a></p>
        </div>
      `).join('')}
    ` : '<p>✅ No accessibility violations found!</p>'}
    
    ${summary.incomplete > 0 ? `
      <h2>⚠️ Needs Review</h2>
      <ul>
        ${results.incomplete.map(item => 
          `<li><strong>${item.help}</strong> (${item.id})
           ${item.explanation ? `<br><em>${item.explanation}</em>` : ''}</li>`
        ).join('')}
      </ul>
    ` : ''}
  </div>
</body>
</html>`;
}

/**
 * Format as CSV
 */
function formatCSV(results, options) {
  const rows = [
    ['Type', 'Rule ID', 'Impact', 'Help', 'Element', 'Message', 'URL']
  ];
  
  // Add violations
  if (results.violations) {
    results.violations.forEach(violation => {
      violation.nodes.forEach(node => {
        rows.push([
          'violation',
          violation.id,
          violation.impact,
          violation.help,
          node.target,
          node.message || '',
          violation.helpUrl
        ]);
      });
    });
  }
  
  // Add passes if requested
  if (options.verbose && results.passes) {
    results.passes.forEach(pass => {
      rows.push([
        'pass',
        pass.id,
        pass.impact,
        pass.help,
        '',
        '',
        pass.helpUrl
      ]);
    });
  }
  
  // Convert to CSV
  return rows.map(row => 
    row.map(cell => {
      const escaped = String(cell).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
        ? `"${escaped}"` 
        : escaped;
    }).join(',')
  ).join('\n');
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
