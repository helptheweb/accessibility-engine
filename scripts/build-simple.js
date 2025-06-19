#!/usr/bin/env bun

/**
 * Simple build script that bundles all source files into dist
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const srcDir = 'src';
const distDir = 'dist';

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.d.ts')) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function build() {
  console.log('Building package...');
  
  // Clean dist
  await fs.rm(distDir, { recursive: true, force: true });
  
  // Copy all source files
  await copyDirectory(srcDir, distDir);
  
  // Make CLI executable
  const cliPath = join(distDir, 'cli/index.js');
  try {
    await fs.chmod(cliPath, 0o755);
  } catch (e) {
    // File might not exist yet
  }
  
  // Copy README and LICENSE
  await fs.copyFile('README.md', join(distDir, 'README.md'));
  await fs.copyFile('LICENSE', join(distDir, 'LICENSE'));
  
  console.log('✅ Build complete!');
}

build().catch(console.error);
