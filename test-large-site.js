#!/usr/bin/env bun

/**
 * Test script for large websites with performance optimizations
 */

console.log('Testing accessibility on large website with optimizations...\n');

// Test with performance-optimized settings
const command = [
  'bun', 'run', 'src/cli/index.js', 'test',
  process.argv[2] || 'https://www.redhat.com',
  '--max-elements', '500',    // Limit elements per rule
  '--timeout', '60',          // 60 second timeout
  '--silent',                 // Suppress error messages
  '--quiet'                   // Only show summary
].join(' ');

console.log(`Running: ${command}\n`);

import { spawn } from 'child_process';

const proc = spawn(command, {
  shell: true,
  stdio: 'inherit'
});

proc.on('error', (err) => {
  console.error('Failed to start test:', err);
  process.exit(1);
});

proc.on('close', (code) => {
  if (code !== 0 && code !== 1) {
    console.error(`\nTest process exited with code ${code}`);
  }
  process.exit(code);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nStopping test...');
  proc.kill('SIGTERM');
  setTimeout(() => {
    proc.kill('SIGKILL');
    process.exit(0);
  }, 1000);
});
