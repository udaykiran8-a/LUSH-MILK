#!/usr/bin/env node

/**
 * Production build script for LUSH MILK application
 * This script performs pre-build checks and optimizations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_KEY',
  'VITE_PAYMENT_SECRET_KEY',
  'VITE_PAYMENT_SALT'
];

// Check if .env file exists
function checkEnvFile() {
  console.log(chalk.blue('Checking environment configuration...'));
  
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error(chalk.red('❌ Error: .env file not found!'));
    console.log(chalk.yellow('Please create a .env file with required variables. You can copy from .env.example'));
    process.exit(1);
  }
  
  // Read .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  const envVars = {};
  
  // Parse env vars
  envLines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && match.length >= 3) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  });
  
  // Check required vars
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === 'your-value-here') {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error(chalk.red(`❌ Error: Missing required environment variables: ${missingVars.join(', ')}`));
    console.log(chalk.yellow('Please update your .env file with valid values'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ Environment configuration validated'));
}

// Check for hardcoded credentials
function checkHardcodedCredentials() {
  console.log(chalk.blue('Checking for hardcoded credentials...'));
  
  const filesToCheck = [
    'src/integrations/supabase/client.ts',
    'src/utils/paymentEncryption.ts'
  ];
  
  let hasHardcodedCredentials = false;
  
  filesToCheck.forEach(filePath => {
    const fullPath = path.resolve(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for potential hardcoded credentials (basic check)
      if ((filePath.includes('supabase') && content.match(/key\s*=\s*["'][\w\-\.]{20,}["']/i)) ||
          (filePath.includes('payment') && content.match(/key\s*=\s*["'][^"']*["']/i))) {
        console.warn(chalk.yellow(`⚠️ Warning: Possible hardcoded credentials in ${filePath}`));
        hasHardcodedCredentials = true;
      }
    }
  });
  
  if (hasHardcodedCredentials) {
    console.warn(chalk.yellow('Some files may contain hardcoded credentials. Please check and use environment variables.'));
  } else {
    console.log(chalk.green('✅ No obvious hardcoded credentials found'));
  }
}

// Run lint and type check
function runLintAndTypeCheck() {
  console.log(chalk.blue('Running linter and type check...'));
  
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log(chalk.green('✅ Lint check passed'));
  } catch (error) {
    console.error(chalk.red('❌ Lint check failed!'));
    process.exit(1);
  }
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log(chalk.green('✅ Type check passed'));
  } catch (error) {
    console.error(chalk.red('❌ Type check failed!'));
    process.exit(1);
  }
}

// Run build
function runBuild() {
  console.log(chalk.blue('Building for production...'));
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(chalk.green('✅ Build completed successfully'));
  } catch (error) {
    console.error(chalk.red('❌ Build failed!'));
    process.exit(1);
  }
}

// Main execution
console.log(chalk.bold.cyan('🥛 LUSH MILK Production Build'));
console.log(chalk.cyan('============================'));

try {
  checkEnvFile();
  checkHardcodedCredentials();
  runLintAndTypeCheck();
  runBuild();
  
  console.log(chalk.bold.green('\n🎉 Production build completed successfully!'));
  console.log(chalk.green('The build is ready for deployment.'));
} catch (error) {
  console.error(chalk.red('\n❌ Build process failed:'), error);
  process.exit(1);
}