/**
 * Environment configuration with validation
 * This file centralizes environment variable handling and provides type safety
 */

interface EnvConfig {
  // Google Analytics Configuration
  GA_PROPERTY_ID: string;
  GA_CLIENT_EMAIL: string;
  GA_PRIVATE_KEY: string;
  
  // Application Configuration
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Optional configurations
  ANALYZE?: string | undefined;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = [
    'GA_CLIENT_EMAIL',
    'GA_PRIVATE_KEY',
  ] as const;

  const missingVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  const config: EnvConfig = {
    GA_PROPERTY_ID: process.env.GA_PROPERTY_ID ?? '',
    GA_CLIENT_EMAIL: process.env.GA_CLIENT_EMAIL!,
    GA_PRIVATE_KEY: process.env.GA_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  };

  // Only add ANALYZE if it exists
  if (process.env.ANALYZE) {
    config.ANALYZE = process.env.ANALYZE;
  }

  return config;
}

export const env = validateEnv();

// Helper functions for environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test'; 