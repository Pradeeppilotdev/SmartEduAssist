// Enhanced build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Utility function to execute commands safely
function runCommand(command, errorMessage) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`ERROR: ${errorMessage}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Create needed directories
console.log('Setting up build directories...');
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

if (!fs.existsSync('dist/server')) {
  fs.mkdirSync('dist/server', { recursive: true });
}

if (!fs.existsSync('client/dist')) {
  fs.mkdirSync('client/dist', { recursive: true });
}

// Build client
console.log('Building client with Vite...');
runCommand('vite build', 'Failed to build client with Vite');

// Copy API serverless function to the output directory
console.log('Copying API serverless function...');
runCommand('cp -r api client/dist/', 'Failed to copy API serverless function');

// Make sure the serverless function has the required dependencies
console.log('Preparing dependencies for serverless function...');
const apiPackageJson = {
  "dependencies": {
    "@google/generative-ai": "*",
    "express": "*",
    "compression": "*",
    "cookie-parser": "*",
    "cors": "*",
    "dotenv": "*",
    "openai": "*"
  }
};

// Write package.json for the API folder
fs.writeFileSync(
  'client/dist/api/package.json',
  JSON.stringify(apiPackageJson, null, 2)
);

console.log('Build completed successfully!');