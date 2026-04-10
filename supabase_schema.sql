-- =====================================================================================
-- SUPABASE SQL SCHEMA FOR COINDROP (Cla_faucet)
-- =====================================================================================
-- This schema defines the database structure for the Telegram Mini App.
-- It includes tables for users, referrals, withdrawals, conversions, ads, and tasks.
-- =====================================================================================

-- 1. ENUMS
-- Define custom types for statuses and categories
CREATE TYPE withdrawal_status AS ENUM ('pending', 'completed', 'canceled');
CREATE TYPE task_status AS ENUM ('pending', 'watching', 'claim', 'done');
CREATE TYPE ad_type AS ENUM (
    'mine_drp', 
    'faucet_claim', 
    'extra_taps', 
    'task_tg', 
    'task_x', 
    'task_yt', 
    'ad_type_7', 
    'ad_type_8', 
    'ad_type_9', 
    'ad_type_10'
);

-- 2. USERS TABLE
-- Stores core user data, balances, and streaks. 
-- Uses Telegram ID as the primary key.
CREATE TABLE users (
    telegram_id BIGINT PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    balance_drp NUMERIC DEFAULT 0,
    balance_ton NUMERIC DEFAULT 0,
    balance_sol NUMERIC DEFAULT 0,
    balance_usdt NUMERIC DEFAULT 0,
    balance_bnb NUMERIC DEFAULT 0,
    available_taps INTEGER DEFAULT 0,
    faucet_streak INTEGER DEFAULT 0,
    last_faucet_claim TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REFERRALS TABLE
-- Tracks who referred whom and the reward given.
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    referred_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE UNIQUE,
    reward_amount NUMERIC DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WITHDRAWALS TABLE
-- Tracks user requests to withdraw crypto to their external wallets.
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    coin TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    usd_value NUMERIC NOT NULL,
    wallet_address TEXT NOT NULL,
    status withdrawal_status DEFAULT 'pending',
    tx_hash TEXT, -- To store the blockchain transaction hash once completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONVERSIONS TABLE
-- Tracks when a user converts DRP to a cryptocurrency.
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    from_coin TEXT DEFAULT 'DRP',
    to_coin TEXT NOT NULL,
    amount_in NUMERIC NOT NULL,
    amount_out NUMERIC NOT NULL,
    conversion_rate NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AD VIEWS TABLE
-- Tracks every ad watched by a user, categorized into 10 types.
CREATE TABLE ad_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    type ad_type NOT NULL,
    reward_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FAUCET CLAIMS TABLE
-- Tracks individual faucet claims and the streak at the time of claim.
CREATE TABLE faucet_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    reward_amount NUMERIC NOT NULL,
    streak_day INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. USER TASKS TABLE
-- Tracks the progress of social tasks (Telegram, Twitter, YouTube).
CREATE TABLE user_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    task_id TEXT NOT NULL, -- e.g., 'tg', 'twitter', 'yt'
    status task_status DEFAULT 'pending',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, task_id) -- A user can only have one status per task
);

-- 9. GLOBAL STATS TABLE
-- A single-row table to store platform-wide statistics.
CREATE TABLE global_stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total_drp_claimed NUMERIC DEFAULT 0,
    platform_revenue_usd NUMERIC DEFAULT 0,
    total_withdrawals_usd NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1) -- Ensures only one row exists
);

-- Insert the initial row for global stats
INSERT INTO global_stats (id, total_drp_claimed, platform_revenue_usd, total_withdrawals_usd) 
VALUES (1, 0, 0, 0);

-- =====================================================================================
-- TRIGGERS & FUNCTIONS (Optional but recommended for auto-updating `updated_at`)
-- =====================================================================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_withdrawals_modtime
    BEFORE UPDATE ON withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_tasks_modtime
    BEFORE UPDATE ON user_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_global_stats_modtime
    BEFORE UPDATE ON global_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
