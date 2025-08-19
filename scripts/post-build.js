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