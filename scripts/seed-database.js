#!/usr/bin/env node

/**
 * Database seeding script for LUSH MILK application
 * This script populates the Supabase database with initial test data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if environment variables are set
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(chalk.red('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in .env file.'));
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Sample data for seeding
const productData = [
  {
    id: '1',
    milk_type: 'Farm Fresh',
    fat_percentage: 3.5,
    snf_range: '8.5-9.0',
    price_250ml: 25,
    price_500ml: 45,
    price_1l: 85,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    popular: true
  },
  {
    id: '2',
    milk_type: 'Low Fat',
    fat_percentage: 1.5,
    snf_range: '9.0-9.5',
    price_250ml: 20,
    price_500ml: 38,
    price_1l: 70,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    popular: false
  },
  {
    id: '3',
    milk_type: 'Full Cream',
    fat_percentage: 6.0,
    snf_range: '9.0-9.5',
    price_250ml: 30,
    price_500ml: 55,
    price_1l: 105,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    popular: true
  },
  {
    id: '4',
    milk_type: 'A2',
    fat_percentage: 4.2,
    snf_range: '8.7-9.2',
    price_250ml: 35,
    price_500ml: 65,
    price_1l: 120,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    popular: true
  },
  {
    id: '5',
    milk_type: 'Buffalo',
    fat_percentage: 7.5,
    snf_range: '9.3-9.8',
    price_250ml: 32,
    price_500ml: 60,
    price_1l: 110,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    popular: false
  },
];

// Seed functions
async function seedProducts() {
  console.log(chalk.blue('Seeding products...'));
  
  try {
    // Clean up existing products (be careful with this in production!)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .gte('id', '0'); // Delete all products
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Insert new products
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(chalk.green(`✅ ${data.length} products seeded successfully`));
    return data;
  } catch (error) {
    console.error(chalk.red('❌ Error seeding products:'), error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log(chalk.bold.cyan('🥛 LUSH MILK Database Seeding'));
  console.log(chalk.cyan('============================'));
  
  try {
    // Seed products
    await seedProducts();
    
    // Add more seed functions as needed:
    // await seedCustomers();
    // await seedOrders();
    
    console.log(chalk.bold.green('\n🎉 Database seeded successfully!'));
  } catch (error) {
    console.error(chalk.red('\n❌ Database seeding failed:'), error);
    process.exit(1);
  }
}

// Run the script
main(); 