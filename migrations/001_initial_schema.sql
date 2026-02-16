-- SafeLayer BNB - Initial Database Schema
-- Run this migration to set up the database structure

-- Create analyzed_addresses table
CREATE TABLE analyzed_addresses (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  risk_score INT NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  wallet_risk INT,
  contract_risk INT,
  liquidity_risk INT,
  components JSONB,
  explanation JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_analyzed_addresses_address ON analyzed_addresses(address);
CREATE INDEX idx_analyzed_addresses_created_at ON analyzed_addresses(created_at DESC);
CREATE INDEX idx_analyzed_addresses_risk_score ON analyzed_addresses(risk_score DESC);
CREATE INDEX idx_analyzed_addresses_risk_level ON analyzed_addresses(risk_level);

-- Create analysis_logs table for tracking API calls
CREATE TABLE analysis_logs (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  response_time_ms INT,
  status_code INT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for logs
CREATE INDEX idx_analysis_logs_address ON analysis_logs(address);
CREATE INDEX idx_analysis_logs_created_at ON analysis_logs(created_at DESC);

-- Create risk_cache table for frequently accessed addresses
CREATE TABLE risk_cache (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  cached_data JSONB NOT NULL,
  cache_expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for cache
CREATE INDEX idx_risk_cache_address ON risk_cache(address);
CREATE INDEX idx_risk_cache_expires_at ON risk_cache(cache_expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_analyzed_addresses_updated_at
BEFORE UPDATE ON analyzed_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_risk_cache_updated_at
BEFORE UPDATE ON risk_cache
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
