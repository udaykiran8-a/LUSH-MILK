#!/usr/bin/env node

/**
 * LUSH MILK Database Backup Script
 * 
 * This script creates a backup of the Supabase database.
 * It can be scheduled to run automatically using cron jobs or similar.
 * 
 * Usage:
 *   node scripts/database-backup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Load environment variables
dotenv.config();

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const BACKUP_ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY;

// Check required environment variables
const missingVars = [];
if (!SUPABASE_PROJECT_ID) missingVars.push('SUPABASE_PROJECT_ID');
if (!SUPABASE_DB_PASSWORD) missingVars.push('SUPABASE_DB_PASSWORD');

if (missingVars.length > 0) {
  console.error(chalk.red('Missing required environment variables:'));
  missingVars.forEach(variable => console.error(chalk.red(`- ${variable}`)));
  process.exit(1);
}

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  console.log(chalk.blue(`Creating backup directory: ${BACKUP_DIR}`));
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Generate timestamp for the backup file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFilename = `lush-milk-backup-${timestamp}.sql`;
const backupPath = path.join(BACKUP_DIR, backupFilename);
const encryptedBackupPath = `${backupPath}.enc`;

console.log(chalk.blue('Starting database backup...'));

try {
  // For Supabase hosted database
  console.log(chalk.blue('Dumping Supabase database...'));
  
  // Construct pg_dump command
  // We're using the Supabase connection string format
  const connectionString = `postgres://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`;
  
  // Execute pg_dump command to create backup
  execSync(`pg_dump "${connectionString}" > "${backupPath}"`, {
    stdio: 'inherit'
  });
  
  // Encrypt backup if encryption key is provided
  if (BACKUP_ENCRYPTION_KEY) {
    console.log(chalk.blue('Encrypting backup...'));
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    
    // Generate initialization vector
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(BACKUP_ENCRYPTION_KEY, 'salt', 32);
    
    // Create cipher
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    // Read input file
    const input = fs.readFileSync(backupPath);
    
    // Encrypt data
    const encrypted = Buffer.concat([iv, cipher.update(input), cipher.final()]);
    
    // Write to output file
    fs.writeFileSync(encryptedBackupPath, encrypted);
    
    // Remove unencrypted backup
    fs.unlinkSync(backupPath);
    
    console.log(chalk.green(`Backup encrypted and saved to ${encryptedBackupPath}`));
  } else {
    console.log(chalk.green(`Backup saved to ${backupPath}`));
  }
  
  // Clean up old backups
  console.log(chalk.blue(`Cleaning up backups older than ${RETENTION_DAYS} days...`));
  
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();
  
  let cleanedCount = 0;
  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const fileAge = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24); // in days
    
    if (fileAge > RETENTION_DAYS) {
      fs.unlinkSync(filePath);
      cleanedCount++;
    }
  });
  
  console.log(chalk.green(`Cleaned up ${cleanedCount} old backup files`));
  console.log(chalk.green('Backup process completed successfully'));
  
} catch (error) {
  console.error(chalk.red('Error during backup:'));
  console.error(chalk.red(error.message));
  process.exit(1);
} 