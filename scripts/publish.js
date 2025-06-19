#!/usr/bin/env bun

/**
 * Publish script for the accessibility engine
 * Handles building and publishing to npm
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function runCommand(command, args = [], cwd = rootDir) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

async function checkGitStatus() {
  console.log('🔍 Checking git status...');
  
  try {
    await runCommand('git', ['diff-index', '--quiet', 'HEAD']);
    console.log('✅ Working directory is clean');
  } catch (e) {
    throw new Error('Working directory has uncommitted changes. Please commit or stash them.');
  }
}

async function checkNpmAuth() {
  console.log('🔐 Checking npm authentication...');
  
  try {
    await runCommand('npm', ['whoami']);
    console.log('✅ Authenticated with npm');
  } catch (e) {
    throw new Error('Not authenticated with npm. Please run: npm login');
  }
}

async function runTests() {
  console.log('🧪 Running tests...');
  
  try {
    await runCommand('bun', ['test']);
    console.log('✅ All tests passed');
  } catch (e) {
    throw new Error('Tests failed. Please fix failing tests before publishing.');
  }
}

async function buildPackage() {
  console.log('🏗️  Building package...');
  
  await runCommand('bun', ['run', 'scripts/build.js']);
  console.log('✅ Package built successfully');
}

async function publishPackage(versionType = 'patch') {
  console.log(`📦 Publishing ${versionType} version...`);
  
  // Read current version
  const pkgPath = join(rootDir, 'package.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
  const currentVersion = pkg.version;
  
  console.log(`Current version: ${currentVersion}`);
  
  // Bump version
  await runCommand('npm', ['version', versionType, '--no-git-tag-version']);
  
  // Read new version
  const newPkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
  const newVersion = newPkg.version;
  
  console.log(`New version: ${newVersion}`);
  
  // Build with new version
  await buildPackage();
  
  // Publish to npm
  console.log('🚀 Publishing to npm...');
  await runCommand('npm', ['publish', 'dist/', '--access', 'public']);
  
  // Commit and tag
  console.log('📝 Committing version bump...');
  await runCommand('git', ['add', '-A']);
  await runCommand('git', ['commit', '-m', `v${newVersion}`]);
  await runCommand('git', ['tag', `v${newVersion}`]);
  
  // Push
  console.log('📤 Pushing to git...');
  await runCommand('git', ['push']);
  await runCommand('git', ['push', '--tags']);
  
  console.log(`\n✨ Successfully published v${newVersion}!`);
  console.log(`📦 View on npm: https://www.npmjs.com/package/@helptheweb/accessibility-engine`);
}

async function main() {
  const args = process.argv.slice(2);
  const versionType = args[0] || 'patch'; // patch, minor, or major
  
  console.log('🚀 Publishing @helptheweb/accessibility-engine\n');
  
  try {
    await checkGitStatus();
    await checkNpmAuth();
    await runTests();
    await publishPackage(versionType);
  } catch (error) {
    console.error('\n❌ Publishing failed:', error.message);
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: bun run scripts/publish.js [version-type]

Version types:
  patch   - Increment patch version (1.0.0 -> 1.0.1) [default]
  minor   - Increment minor version (1.0.0 -> 1.1.0)
  major   - Increment major version (1.0.0 -> 2.0.0)

Example:
  bun run scripts/publish.js minor
`);
  process.exit(0);
}

// Run the publish script
main();
