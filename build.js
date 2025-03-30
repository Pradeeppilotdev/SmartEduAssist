// Custom build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Create server directory in dist if it doesn't exist
if (!fs.existsSync('dist/server')) {
  fs.mkdirSync('dist/server', { recursive: true });
}

console.log('Building client with Vite...');
execSync('vite build', { stdio: 'inherit' });

console.log('Building server with esbuild...');
execSync('esbuild "server/**/*.ts" --platform=node --packages=external --bundle --format=cjs --outdir=dist/server', { stdio: 'inherit' });

console.log('Copying shared directory to dist...');
execSync('cp -r shared dist/', { stdio: 'inherit' });

console.log('Build completed successfully!');