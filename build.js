#!/usr/bin/env node

import { execSync } from 'child_process';

try {
  console.log('Starting build process...');
  
  // Run the original build command
  console.log('Building frontend and backend...');
  execSync('vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // Run the post-build script to fix deployment structure
  console.log('Fixing deployment directory structure...');
  execSync('node scripts/post-build.js', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}