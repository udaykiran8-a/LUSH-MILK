#!/usr/bin/env node

/**
 * LUSH MILK Security Check Script
 * 
 * This script performs a series of security checks on the codebase:
 * 1. Checks for hardcoded secrets
 * 2. Verifies environment variables
 * 3. Performs dependency vulnerability scan
 * 4. Validates security headers
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const PATTERNS_TO_CHECK = [
  /(password|secret|key|token|credential)s?\s*[=:]\s*['"][^'"]*['"]/i,
  /api[_-]?key\s*[=:]\s*['"][^'"]*['"]/i,
  /auth[_-]?token\s*[=:]\s*['"][^'"]*['"]/i,
  /bearer\s+[a-zA-Z0-9_=-]+\.[a-zA-Z0-9_=-]+\.[a-zA-Z0-9_=-]+/i
];

const DIRECTORIES_TO_SKIP = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git'
];

const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.env.example'];

// Keep track of issues found
let issuesFound = 0;

// Helper functions
function logSuccess(message) {
  console.log(chalk.green('✓ ') + message);
}

function logWarning(message) {
  console.log(chalk.yellow('⚠ ') + message);
  issuesFound++;
}

function logError(message) {
  console.log(chalk.red('✗ ') + message);
  issuesFound++;
}

function logInfo(message) {
  console.log(chalk.blue('ℹ ') + message);
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let fileIssues = 0;
  
  // Skip checking for secrets in the security check script itself
  if (filePath.endsWith('security-check.js')) {
    return fileIssues;
  }
  
  PATTERNS_TO_CHECK.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      logWarning(`Potential secret found in ${filePath}:`);
      matches.forEach(match => {
        // Don't show the actual secret in logs
        const sanitized = match.replace(/(['"])[^'"]*(['"])/, '$1[REDACTED]$2');
        console.log(`  - ${sanitized}`);
      });
      fileIssues += matches.length;
    }
  });
  
  return fileIssues;
}

function scanDirectory(dir) {
  let issues = 0;
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!DIRECTORIES_TO_SKIP.includes(file)) {
        issues += scanDirectory(filePath);
      }
    } else {
      const ext = path.extname(file);
      if (FILE_EXTENSIONS.includes(ext) || file === '.env.example') {
        issues += checkFile(filePath);
      }
    }
  });
  
  return issues;
}

function checkEnvVars() {
  logInfo('Checking environment variables...');
  let missingVars = 0;
  
  REQUIRED_ENV_VARS.forEach(envVar => {
    if (!process.env[envVar]) {
      logError(`Missing required environment variable: ${envVar}`);
      missingVars++;
    }
  });
  
  // Check for .env file
  if (!fs.existsSync('.env')) {
    logWarning('.env file not found. Make sure it exists in production environments.');
  } else {
    logSuccess('.env file exists');
  }
  
  if (missingVars === 0) {
    logSuccess('All required environment variables are set');
  }
  
  return missingVars;
}

function checkDependencies() {
  logInfo('Checking for vulnerable dependencies...');
  
  try {
    // Run npm audit
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(auditOutput);
    
    if (auditData.vulnerabilities) {
      const totalVulnerabilities = Object.values(auditData.vulnerabilities)
        .reduce((sum, v) => sum + v.length, 0);
      
      if (totalVulnerabilities > 0) {
        logWarning(`Found ${totalVulnerabilities} vulnerabilities in dependencies`);
        
        // Report high and critical vulnerabilities
        const highCriticalCount = 
          (auditData.vulnerabilities.high?.length || 0) + 
          (auditData.vulnerabilities.critical?.length || 0);
        
        if (highCriticalCount > 0) {
          logError(`${highCriticalCount} high or critical severity vulnerabilities found!`);
          console.log('Run npm audit to see details and npm audit fix to resolve');
        }
        
        return totalVulnerabilities;
      } else {
        logSuccess('No vulnerabilities found in dependencies');
        return 0;
      }
    } else {
      logSuccess('No vulnerabilities found in dependencies');
      return 0;
    }
  } catch (error) {
    logError('Failed to run dependency check: ' + error.message);
    return 1;
  }
}

function checkSecurityHeaders() {
  logInfo('Checking security headers implementation...');
  let issues = 0;
  
  // Check for middleware.ts
  if (!fs.existsSync('src/middleware.ts')) {
    logWarning('middleware.ts not found. Security headers may not be implemented.');
    issues++;
  } else {
    const middlewareContent = fs.readFileSync('src/middleware.ts', 'utf8');
    
    // Check for key security headers
    const requiredHeaders = [
      'Content-Security-Policy',
      'X-XSS-Protection',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Strict-Transport-Security'
    ];
    
    requiredHeaders.forEach(header => {
      if (!middlewareContent.includes(header)) {
        logWarning(`Security header ${header} not found in middleware.ts`);
        issues++;
      }
    });
    
    if (issues === 0) {
      logSuccess('All required security headers are implemented');
    }
  }
  
  return issues;
}

// Main execution
console.log(chalk.bold('🔒 LUSH MILK Security Check'));
console.log('===============================\n');

// Check for hardcoded secrets
logInfo('Scanning for hardcoded secrets...');
const secretIssues = scanDirectory('.');
if (secretIssues === 0) {
  logSuccess('No hardcoded secrets found in scanned files');
} else {
  logError(`Found ${secretIssues} potential secrets in codebase`);
}

// Check environment variables
const envIssues = checkEnvVars();

// Check dependencies
const dependencyIssues = checkDependencies();

// Check security headers
const headerIssues = checkSecurityHeaders();

// Summary
console.log('\n' + chalk.bold('Security Check Summary'));
console.log('=======================');
console.log(`Total issues found: ${issuesFound}`);

if (issuesFound === 0) {
  console.log(chalk.green.bold('\n✓ All security checks passed!'));
  process.exit(0);
} else {
  console.log(chalk.yellow.bold('\n⚠ Security issues found. Please address them before deploying to production.'));
  process.exit(1);
} 