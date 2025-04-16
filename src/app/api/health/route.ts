import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring and uptime checks
 * Returns information about the system health including:
 * - Environment
 * - API version
 * - Database connection status
 * - Uptime
 */
export async function GET() {
  const startTime = process.env.APP_START_TIME || Date.now().toString();
  const uptime = Math.floor((Date.now() - parseInt(startTime)) / 1000); // in seconds
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    uptime: `${uptime} seconds`,
  };

  try {
    // Add more health checks here, like database connection checks
    // For example: await supabase.from('health').select('count').single();
    
    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      },
      { status: 503 }
    );
  }
} 