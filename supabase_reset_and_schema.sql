-- =====================================================================================
-- SUPABASE SQL SCHEMA FOR COINDROP (Cla_faucet) - V2 (REALTIME & RLS ENABLED)
-- =====================================================================================

-- 1. DROP EXISTING TABLES & VIEWS TO START FRESH
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS conversions CASCADE;
DROP TABLE IF EXISTS user_tasks CASCADE;
DROP TABLE IF EXISTS faucet_claims CASCADE;
DROP TABLE IF EXISTS ad_views CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS global_stats CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP VIEW IF EXISTS global_metrics CASCADE;

-- 2. CREATE TABLES
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
    last_faucet_claim TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    referred_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE UNIQUE,
    reward_amount NUMERIC DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    coin TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    usd_value NUMERIC NOT NULL,
    wallet_address TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'canceled'
    tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    from_coin TEXT DEFAULT 'DRP',
    to_coin TEXT NOT NULL,
    amount_in NUMERIC NOT NULL,
    amount_out NUMERIC NOT NULL,
    conversion_rate NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ad_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    reward_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE faucet_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    reward_amount NUMERIC NOT NULL,
    streak_day INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'watching', 'claim', 'done'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

-- 3. CREATE VIEW FOR GLOBAL STATS (Real-time aggregation)
CREATE VIEW global_metrics AS
SELECT 
    (SELECT COALESCE(SUM(balance_drp), 0) FROM users) as total_drp,
    (SELECT COALESCE(SUM(usd_value), 0) FROM withdrawals WHERE status = 'completed') as total_withdrawals_usd;

-- 4. ENABLE RLS AND CREATE POLICIES
-- Since Telegram Mini Apps authenticate via Telegram initData (not Supabase Auth directly),
-- we must allow the anon key to read/write for the client-side app to function.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to users" ON users FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to referrals" ON referrals FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to withdrawals" ON withdrawals FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to conversions" ON conversions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to ad_views" ON ad_views FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE faucet_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to faucet_claims" ON faucet_claims FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to user_tasks" ON user_tasks FOR ALL USING (true) WITH CHECK (true);
