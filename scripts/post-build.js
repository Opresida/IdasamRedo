#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyRecursiveSync(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy files from dist/public to dist
const sourceDir = path.join(__dirname, '..', 'dist', 'public');
const targetDir = path.join(__dirname, '..', 'dist');

if (fs.existsSync(sourceDir)) {
  console.log('Copying built files to correct deployment directory...');
  
  // Copy all files from dist/public to dist
  fs.readdirSync(sourceDir).forEach(item => {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);
    
    if (fs.existsSync(targetPath)) {
      // If it's a directory, remove it first
      if (fs.statSync(targetPath).isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(targetPath);
      }
    }
    
    copyRecursiveSync(sourcePath, targetPath);
  });
  
  console.log('Files copied successfully for deployment!');
} else {
  console.log('Source directory dist/public not found. Build may not have completed successfully.');
}
#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import path from 'path';

try {
  console.log('Running post-build script...');
  
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  // Copy _redirects file to the build output
  const redirectsSource = 'client/public/_redirects';
  const redirectsTarget = 'dist/public/_redirects';
  
  if (existsSync(redirectsSource)) {
    copyFileSync(redirectsSource, redirectsTarget);
    console.log('✓ _redirects file copied to build output');
  }
  
  console.log('✓ Post-build completed successfully');
} catch (error) {
  console.error('Post-build failed:', error.message);
  process.exit(1);
}
