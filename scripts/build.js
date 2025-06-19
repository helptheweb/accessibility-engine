#!/usr/bin/env bun

/**
 * Build script for the accessibility engine
 * Creates optimized bundles for distribution
 */

import { build } from 'bun';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

async function cleanDist() {
  console.log('🧹 Cleaning dist directory...');
  try {
    await fs.rm(distDir, { recursive: true, force: true });
  } catch (e) {
    // Directory might not exist
  }
  await fs.mkdir(distDir, { recursive: true });
  await fs.mkdir(join(distDir, 'cli'), { recursive: true });
}

async function buildLibrary() {
  console.log('📦 Building library...');
  
  // Build main library
  const result = await build({
    entrypoints: [join(rootDir, 'src/index.js')],
    outdir: distDir,
    target: 'node',
    format: 'esm',
    splitting: false,
    sourcemap: 'external',
    minify: {
      whitespace: true,
      identifiers: false,
      syntax: true
    },
    external: ['chalk', 'commander', 'ora', 'jsdom', 'node-fetch']
  });
  
  console.log('✅ Library built successfully');
}

async function buildCLI() {
  console.log('🖥️  Building CLI...');
  
  // Build CLI
  await build({
    entrypoints: [join(rootDir, 'src/cli/index.js')],
    outdir: join(distDir, 'cli'),
    target: 'node',
    format: 'esm',
    splitting: false,
    sourcemap: 'external',
    minify: {
      whitespace: true,
      identifiers: false,
      syntax: true
    },
    external: ['chalk', 'commander', 'ora', 'jsdom', 'node-fetch']
  });
  
  // Add shebang to CLI file
  const cliPath = join(distDir, 'cli/index.js');
  const cliContent = await fs.readFile(cliPath, 'utf-8');
  await fs.writeFile(cliPath, `#!/usr/bin/env node\n${cliContent}`);
  await fs.chmod(cliPath, 0o755);
  
  console.log('✅ CLI built successfully');
}

async function copyTypes() {
  console.log('📝 Copying TypeScript definitions...');
  
  // Copy type definitions
  await fs.copyFile(
    join(rootDir, 'src/index.d.ts'),
    join(distDir, 'index.d.ts')
  );
  
  console.log('✅ Types copied successfully');
}

async function generatePackageJson() {
  console.log('📋 Generating dist package.json...');
  
  // Read main package.json
  const pkg = JSON.parse(
    await fs.readFile(join(rootDir, 'package.json'), 'utf-8')
  );
  
  // Create minimal package.json for dist
  const distPkg = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    main: 'index.js',
    module: 'index.js',
    types: 'index.d.ts',
    type: 'module',
    bin: {
      helptheweb: './cli/index.js'
    },
    keywords: pkg.keywords,
    author: pkg.author,
    license: pkg.license,
    repository: pkg.repository,
    bugs: pkg.bugs,
    homepage: pkg.homepage,
    engines: pkg.engines,
    dependencies: pkg.dependencies,
    peerDependencies: pkg.peerDependencies,
    peerDependenciesMeta: pkg.peerDependenciesMeta
  };
  
  await fs.writeFile(
    join(distDir, 'package.json'),
    JSON.stringify(distPkg, null, 2)
  );
  
  console.log('✅ Dist package.json created');
}

async function copyFiles() {
  console.log('📄 Copying additional files...');
  
  // Copy README and LICENSE
  await fs.copyFile(
    join(rootDir, 'README.md'),
    join(distDir, 'README.md')
  );
  
  await fs.copyFile(
    join(rootDir, 'LICENSE'),
    join(distDir, 'LICENSE')
  );
  
  console.log('✅ Files copied successfully');
}

async function checkSize() {
  console.log('📊 Checking bundle size...');
  
  const getSize = async (dir) => {
    let totalSize = 0;
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const path = join(dir, file.name);
      if (file.isDirectory()) {
        totalSize += await getSize(path);
      } else {
        const stats = await fs.stat(path);
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  };
  
  const size = await getSize(distDir);
  const sizeMB = (size / 1024 / 1024).toFixed(2);
  
  console.log(`📦 Total bundle size: ${sizeMB} MB`);
  
  if (size > 10 * 1024 * 1024) {
    console.warn('⚠️  Warning: Bundle size exceeds 10MB');
  }
}

async function main() {
  console.log('🚀 Building @helptheweb/accessibility-engine...\n');
  
  try {
    await cleanDist();
    await buildLibrary();
    await buildCLI();
    await copyTypes();
    await generatePackageJson();
    await copyFiles();
    await checkSize();
    
    console.log('\n✨ Build completed successfully!');
    console.log(`📦 Package ready in: ${distDir}`);
    console.log('\nTo publish: npm publish dist/');
  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
main();
