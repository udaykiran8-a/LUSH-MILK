#!/usr/bin/env node

/**
 * LUSH MILK Production Deployment Script
 * 
 * This script automates the process of deploying the application to production.
 * It runs pre-deployment checks, builds the application, creates a backup,
 * and deploys the application.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const PRODUCTION_ENV_FILE = '.env.production';
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

// Helper function to run a command and log output
function runCommand(command, options = {}) {
  console.log(chalk.blue(`Running: ${command}`));
  try {
    execSync(command, {
      stdio: 'inherit',
      ...options,
    });
    return true;
  } catch (error) {
    console.error(chalk.red(`Command failed: ${command}`));
    console.error(chalk.red(error.message));
    return false;
  }
}

// Main deployment process
async function deploy() {
  console.log(chalk.bold.blue('🚀 Starting LUSH MILK production deployment'));
  console.log(chalk.blue('================================================'));
  
  // 1. Check if production env file exists
  if (!fs.existsSync(PRODUCTION_ENV_FILE)) {
    console.error(chalk.red(`Error: ${PRODUCTION_ENV_FILE} file not found`));
    console.error(chalk.yellow(`Please create ${PRODUCTION_ENV_FILE} based on .env.production.example`));
    process.exit(1);
  }
  
  // 2. Read and validate production environment variables
  console.log(chalk.blue('Validating production environment variables...'));
  try {
    const envContent = fs.readFileSync(PRODUCTION_ENV_FILE, 'utf8');
    const envLines = envContent.split('\n');
    const envVars = {};
    
    envLines.forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !line.startsWith('#')) {
        envVars[match[1]] = match[2];
      }
    });
    
    const missingVars = REQUIRED_ENV_VARS.filter(varName => !envVars[varName]);
    if (missingVars.length > 0) {
      console.error(chalk.red('Missing required environment variables in production config:'));
      missingVars.forEach(varName => {
        console.error(chalk.red(`- ${varName}`));
      });
      process.exit(1);
    }
    
    console.log(chalk.green('✓ Production environment variables validated'));
  } catch (error) {
    console.error(chalk.red(`Error validating environment variables: ${error.message}`));
    process.exit(1);
  }
  
  // 3. Run security checks
  console.log(chalk.blue('Running security checks...'));
  if (!runCommand('npm run security-check')) {
    console.error(chalk.red('Security checks failed. Deployment aborted.'));
    process.exit(1);
  }
  console.log(chalk.green('✓ Security checks passed'));
  
  // 4. Run linting
  console.log(chalk.blue('Running code linting...'));
  if (!runCommand('npm run lint')) {
    console.error(chalk.red('Linting failed. Deployment aborted.'));
    process.exit(1);
  }
  console.log(chalk.green('✓ Linting passed'));
  
  // 5. Create database backup before deployment
  console.log(chalk.blue('Creating database backup...'));
  if (!runCommand('npm run db:backup')) {
    console.warn(chalk.yellow('⚠️ Database backup failed. Proceeding with deployment.'));
  } else {
    console.log(chalk.green('✓ Database backup completed'));
  }
  
  // 6. Build the application with production settings
  console.log(chalk.blue('Building production application...'));
  if (!runCommand(`cp ${PRODUCTION_ENV_FILE} .env && npm run build`)) {
    console.error(chalk.red('Build failed. Deployment aborted.'));
    process.exit(1);
  }
  console.log(chalk.green('✓ Production build completed'));
  
  // 7. Run database migrations if needed
  console.log(chalk.blue('Running database migrations...'));
  if (!runCommand('npm run db:migrate')) {
    console.warn(chalk.yellow('⚠️ Database migrations failed. Proceeding with deployment.'));
  } else {
    console.log(chalk.green('✓ Database migrations completed'));
  }
  
  // 8. Deploy to hosting service (e.g., Vercel, AWS, etc.)
  // Replace this with your actual deployment command
  console.log(chalk.blue('Deploying to production...'));
  if (!runCommand('echo "Replace this with your actual deployment command"')) {
    console.error(chalk.red('Deployment failed.'));
    process.exit(1);
  }
  console.log(chalk.green('✓ Deployment completed'));
  
  // 9. Run post-deployment verification
  console.log(chalk.blue('Running post-deployment verification...'));
  console.log(chalk.yellow('Post-deployment verification not implemented yet.'));
  
  // Deployment completed successfully
  console.log(chalk.bold.green('\n✅ LUSH MILK successfully deployed to production!'));
  console.log(chalk.blue('================================================='));
}

// Run the deployment
deploy().catch(error => {
  console.error(chalk.red('Deployment failed with error:'));
  console.error(chalk.red(error.message));
  process.exit(1); 