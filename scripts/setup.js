#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const DatabaseService = require('../src/services/DatabaseService');
const RedisService = require('../src/services/RedisService');

console.log('🚀 Setting up automation test project...\n');

// Check Node.js version
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  console.log(`📋 Node.js version: ${nodeVersion}`);
  
  if (majorVersion < 12) {
    console.error('❌ Node.js version 12 or higher is required');
    process.exit(1);
  }
  
  console.log('✅ Node.js version check passed\n');
}

// Create necessary directories
function createDirectories() {
  console.log('📁 Creating necessary directories...');
  
  const directories = [
    'logs',
    'screenshots',
    'tests/reports',
    'tests/coverage'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`   Created: ${dir}`);
    } else {
      console.log(`   Exists: ${dir}`);
    }
  });
  
  console.log('✅ Directories created\n');
}

// Copy environment file
function setupEnvironment() {
  console.log('🔧 Setting up environment configuration...');
  
  const envExamplePath = path.join(process.cwd(), 'env.example');
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('   Created .env file from env.example');
      console.log('   Please update .env file with your actual configuration');
    } else {
      console.warn('   ⚠️  env.example not found');
    }
  } else {
    console.log('   .env file already exists');
  }
  
  console.log('✅ Environment setup completed\n');
}

// Test database connection
async function testDatabaseConnection() {
  console.log('🗄️  Testing database connection...');
  
  try {
    const isConnected = await DatabaseService.testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection successful');
    } else {
      console.log('❌ Database connection failed');
      console.log('   Please check your database configuration in .env file');
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    console.log('   Please ensure PostgreSQL is running and configured correctly');
  }
  
  console.log('');
}

// Test Redis connection
async function testRedisConnection() {
  console.log('📦 Testing Redis connection...');
  
  try {
    const isConnected = await RedisService.testConnection();
    
    if (isConnected) {
      console.log('✅ Redis connection successful');
      await RedisService.disconnect();
    } else {
      console.log('❌ Redis connection failed');
      console.log('   Please check your Redis configuration in .env file');
    }
  } catch (error) {
    console.log('❌ Redis connection error:', error.message);
    console.log('   Please ensure Redis is running and configured correctly');
  }
  
  console.log('');
}

// Install dependencies
function installDependencies() {
  console.log('📦 Installing dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Create sample database schema
function createSampleSchema() {
  console.log('🗄️  Sample database schema (PostgreSQL):');
  
  const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
`;

  fs.writeFileSync('database_schema.sql', schema);
  console.log('   📝 Database schema saved to database_schema.sql');
  console.log('   Run this script in your PostgreSQL database to create the required tables\n');
}

// Main setup function
async function main() {
  try {
    checkNodeVersion();
    createDirectories();
    setupEnvironment();
    
    // Only install dependencies if package.json exists and node_modules doesn't
    if (fs.existsSync('package.json') && !fs.existsSync('node_modules')) {
      installDependencies();
    }
    
    await testDatabaseConnection();
    await testRedisConnection();
    createSampleSchema();
    
    console.log('🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update .env file with your actual configuration');
    console.log('   2. Run database_schema.sql in your PostgreSQL database');
    console.log('   3. Ensure Redis is running');
    console.log('   4. Run tests with: npm test');
    console.log('   5. Check README.md for detailed usage instructions\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkNodeVersion,
  createDirectories,
  setupEnvironment,
  testDatabaseConnection,
  testRedisConnection,
  installDependencies,
  createSampleSchema
};
