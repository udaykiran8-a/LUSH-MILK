#!/usr/bin/env node

/**
 * LUSH MILK Application Security Audit Script
 * 
 * This script performs security checks on the application to identify potential
 * security issues and vulnerabilities.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const ENV_FILE_PATH = path.join(process.cwd(), '.env');
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const CRITICAL_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_KEY',
  'PAYMENT_SECRET_KEY',
  'FRONTEND_URL',
  'NEXT_PUBLIC_APP_URL',
];

// Initialize results
const results = {
  pass: [],
  warn: [],
  fail: [],
};

console.log(chalk.blue.bold('🔒 LUSH MILK Security Audit'));
console.log(chalk.blue('Running comprehensive security checks...\n'));

// ----------------------
// Environment Variables
// ----------------------
console.log(chalk.cyan('Checking environment variables...'));

try {
  if (!fs.existsSync(ENV_FILE_PATH)) {
    results.fail.push('.env file is missing');
  } else {
    const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    const envLines = envContent.split('\n');
    const envVars = {};

    envLines.forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1]] = match[2];
      }
    });

    // Check for critical env vars
    CRITICAL_ENV_VARS.forEach(envVar => {
      if (!envVars[envVar]) {
        results.fail.push(`Missing critical environment variable: ${envVar}`);
      } else if (envVars[envVar].length < 10 && !['FRONTEND_URL', 'NEXT_PUBLIC_APP_URL'].includes(envVar)) {
        results.warn.push(`Environment variable ${envVar} may be too short`);
      }
    });

    if (envVars['NODE_ENV'] !== 'production') {
      results.warn.push('NODE_ENV is not set to production');
    }

    results.pass.push('Environment variables file exists');
  }
} catch (error) {
  results.fail.push(`Error checking environment variables: ${error.message}`);
}

// ----------------------
// Dependency Checks
// ----------------------
console.log(chalk.cyan('Checking dependencies...'));

try {
  // Run npm audit
  try {
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(auditOutput);
    
    if (auditData.metadata.vulnerabilities.high > 0 || auditData.metadata.vulnerabilities.critical > 0) {
      results.fail.push(`Found ${auditData.metadata.vulnerabilities.high} high and ${auditData.metadata.vulnerabilities.critical} critical vulnerabilities`);
    } else if (auditData.metadata.vulnerabilities.moderate > 0) {
      results.warn.push(`Found ${auditData.metadata.vulnerabilities.moderate} moderate vulnerabilities`);
    } else {
      results.pass.push('No high or critical vulnerabilities found');
    }
  } catch (auditError) {
    results.warn.push(`Unable to run npm audit: ${auditError.message}`);
  }

  // Check for outdated packages
  try {
    const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
    if (outdatedOutput.trim() !== '') {
      const outdatedData = JSON.parse(outdatedOutput);
      const outdatedCount = Object.keys(outdatedData).length;
      if (outdatedCount > 10) {
        results.fail.push(`${outdatedCount} outdated packages found`);
      } else if (outdatedCount > 0) {
        results.warn.push(`${outdatedCount} outdated packages found`);
      } else {
        results.pass.push('All packages are up to date');
      }
    } else {
      results.pass.push('All packages are up to date');
    }
  } catch (outdatedError) {
    results.warn.push(`Unable to check for outdated packages: ${outdatedError.message}`);
  }
} catch (error) {
  results.fail.push(`Error checking dependencies: ${error.message}`);
}

// ----------------------
// Code Security Checks
// ----------------------
console.log(chalk.cyan('Checking code security...'));

try {
  // Check for hardcoded secrets in JavaScript/TypeScript files
  const secretPatterns = [
    /const\s+(\w+key|secret|password|token)\s*=\s*["']([^"']*?)["']/gi,
    /let\s+(\w+key|secret|password|token)\s*=\s*["']([^"']*?)["']/gi,
    /var\s+(\w+key|secret|password|token)\s*=\s*["']([^"']*?)["']/gi,
    /apiKey\s*:\s*["']([^"']*?)["']/gi,
    /secret\s*:\s*["']([^"']*?)["']/gi,
    /password\s*:\s*["']([^"']*?)["']/gi,
  ];

  // Directories to ignore
  const ignoreDirs = ['node_modules', '.next', 'out', 'build', 'dist', '.git'];
  
  // Find all JS/TS files in the project
  function findJsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      if (ignoreDirs.includes(file)) {
        return;
      }
      
      if (fs.statSync(filePath).isDirectory()) {
        findJsFiles(filePath, fileList);
      } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  const jsFiles = findJsFiles(process.cwd());
  let hardcodedSecrets = 0;
  
  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    secretPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        // Ignoring empty strings and "placeholder"/"your-secret-here" type values
        if (match[1] && match[1].length > 5 && 
            !match[1].includes('placeholder') && 
            !match[1].includes('your') &&
            !match[1].includes('example')) {
          hardcodedSecrets++;
          const relativePath = path.relative(process.cwd(), file);
          results.fail.push(`Possible hardcoded secret in ${relativePath}`);
          break; // Only report each file once
        }
      }
    });
  });
  
  if (hardcodedSecrets === 0) {
    results.pass.push('No hardcoded secrets found in code');
  }

  // Check for insecure dependencies in package.json
  const insecurePackages = [
    'eval', 'crypto-js', 'md5', 'sha1'
  ];
  
  if (fs.existsSync(PACKAGE_JSON_PATH)) {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    const dependencies = { 
      ...(packageJson.dependencies || {}), 
      ...(packageJson.devDependencies || {}) 
    };
    
    const foundInsecurePackages = insecurePackages.filter(pkg => dependencies[pkg]);
    
    if (foundInsecurePackages.length > 0) {
      foundInsecurePackages.forEach(pkg => {
        results.warn.push(`Potentially insecure package found: ${pkg}`);
      });
    } else {
      results.pass.push('No known insecure packages found');
    }
  }
} catch (error) {
  results.fail.push(`Error checking code security: ${error.message}`);
}

// ----------------------
// Database Security Checks
// ----------------------
console.log(chalk.cyan('Checking database security...'));

// Check for migrations folder
try {
  if (fs.existsSync(path.join(process.cwd(), 'supabase', 'migrations'))) {
    results.pass.push('Database migrations folder exists');
    
    // Check for RLS in migration files
    const migrationFiles = fs.readdirSync(path.join(process.cwd(), 'supabase', 'migrations'));
    let rlsFound = false;
    
    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        const content = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', file), 'utf8');
        if (content.includes('enable_row_level_security') || content.includes('RLS')) {
          rlsFound = true;
          break;
        }
      }
    }
    
    if (rlsFound) {
      results.pass.push('Row Level Security (RLS) is configured');
    } else {
      results.warn.push('Row Level Security (RLS) may not be configured');
    }
  } else {
    results.warn.push('Database migrations folder not found');
  }
} catch (error) {
  results.fail.push(`Error checking database security: ${error.message}`);
}

// ----------------------
// Authentication Security Checks
// ----------------------
console.log(chalk.cyan('Checking authentication security...'));

// Look for auth hooks or components
try {
  const authFiles = [
    'src/hooks/useAuth.tsx',
    'src/hooks/useAuth.ts',
    'src/hooks/useAuth.js',
    'src/components/Auth',
    'src/auth',
    'src/lib/auth'
  ];
  
  let authImplementationFound = false;
  
  for (const file of authFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      authImplementationFound = true;
      results.pass.push('Authentication implementation found');
      break;
    }
  }
  
  if (!authImplementationFound) {
    results.warn.push('Could not locate authentication implementation');
  }
} catch (error) {
  results.fail.push(`Error checking authentication security: ${error.message}`);
}

// ----------------------
// Output Results
// ----------------------
console.log('\n' + chalk.blue.bold('Security Audit Results'));

console.log(chalk.green('\n✅ Passed Checks:'));
results.pass.forEach(item => console.log(chalk.green(`  - ${item}`)));

if (results.warn.length > 0) {
  console.log(chalk.yellow('\n⚠️ Warnings:'));
  results.warn.forEach(item => console.log(chalk.yellow(`  - ${item}`)));
}

if (results.fail.length > 0) {
  console.log(chalk.red('\n❌ Failed Checks:'));
  results.fail.forEach(item => console.log(chalk.red(`  - ${item}`)));
  
  console.log(chalk.red.bold('\nSecurity audit found issues that need to be addressed!'));
  process.exit(1);
} else if (results.warn.length > 0) {
  console.log(chalk.yellow.bold('\nSecurity audit completed with warnings.'));
  process.exit(0);
} else {
  console.log(chalk.green.bold('\nSecurity audit completed successfully.'));
  process.exit(0);
} 