import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';

export interface Withdrawal {
  id: string;
  date: string;
  amount: number;
  coin: string;
  status: 'pending' | 'paid' | 'rejected';
  txHash?: string;
}

export interface GameState {
  balance: number;
  cryptoBalances: {
    TON: number;
    SOL: number;
    USDT: number;
    BNB: number;
  };
  availableTaps: number;
  selectedMiningCoin: 'DRP' | 'TON' | 'SOL' | 'USDT' | 'BNB';
  referrals: number;
  weeklyEarnings: number;
  mineClicksToday: number;
  faucetNextClaimTime: number;
  faucetClaimsToday: number;
  faucetStreak: number;
  lastFaucetClaimDate: string;
  watchAdsProgress: number[];
  tasks: {
    tg: 'pending' | 'claim' | 'done';
    twitter: 'pending' | 'watching' | 'claim' | 'done';
    yt: 'pending' | 'watching' | 'claim' | 'done';
  };
  withdrawals: Withdrawal[];
  lastResetDate: string;
  nextWeeklyReset: number;
  tgUser: { id: number; username?: string; first_name?: string } | null;
}

const initialState: GameState = {
  balance: 0,
  cryptoBalances: { TON: 0, SOL: 0, USDT: 0, BNB: 0 },
  availableTaps: 0,
  selectedMiningCoin: 'TON',
  referrals: 0,
  weeklyEarnings: 0,
  mineClicksToday: 0,
  faucetNextClaimTime: 0,
  faucetClaimsToday: 0,
  faucetStreak: 0,
  lastFaucetClaimDate: '',
  watchAdsProgress: Array(10).fill(0),
  tasks: {
    tg: 'pending',
    twitter: 'pending',
    yt: 'pending',
  },
  withdrawals: [],
  lastResetDate: '',
  nextWeeklyReset: 0,
  tgUser: null,
};

interface GameContextType {
  state: GameState;
  showAd: (onSuccess: () => void) => void;
  claimMine: () => number;
  watchAdForTaps: () => void;
  setSelectedMiningCoin: (coin: 'DRP' | 'TON' | 'SOL' | 'USDT' | 'BNB') => void;
  claimFaucet: () => void;
  claimWatchAd: (index: number, reward: number) => void;
  updateTask: (taskId: keyof GameState['tasks'], status: any) => void;
  convertDrpToCrypto: (amount: number, coin: string, rate: number) => boolean;
  requestWithdrawal: (cryptoAmount: number, coin: string, address: string, usdValue: number) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const getUTCDateString = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
};

const getNextMondayUTC = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + ((1 + 7 - d.getUTCDay()) % 7 || 7));
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GameState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [adCallback, setAdCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Initialize Telegram Web App
    const tg = (window as any).Telegram?.WebApp;
    let tgUser = null;
    if (tg && tg.initDataUnsafe?.user) {
      tgUser = tg.initDataUnsafe.user;
      tg.expand(); // Expand the mini app to full height
    }

    const loadState = async () => {
      let parsed = { ...initialState };
      const saved = localStorage.getItem('coindrop_state');
      if (saved) {
        try {
          parsed = { ...initialState, ...JSON.parse(saved) };
        } catch (e) {
          console.error("Failed to parse local state", e);
        }
      }

      // If we have a TG user, try to load from Supabase
      if (tgUser) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', tgUser.id)
            .single();

          if (data) {
            parsed.balance = Number(data.balance_drp) || parsed.balance;
            parsed.cryptoBalances.TON = Number(data.balance_ton) || parsed.cryptoBalances.TON;
            parsed.cryptoBalances.SOL = Number(data.balance_sol) || parsed.cryptoBalances.SOL;
            parsed.cryptoBalances.USDT = Number(data.balance_usdt) || parsed.cryptoBalances.USDT;
            parsed.cryptoBalances.BNB = Number(data.balance_bnb) || parsed.cryptoBalances.BNB;
            parsed.availableTaps = data.available_taps || parsed.availableTaps;
            parsed.faucetStreak = data.faucet_streak || parsed.faucetStreak;
            if (data.last_faucet_claim) {
              const d = new Date(data.last_faucet_claim);
              parsed.lastFaucetClaimDate = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
            }
          } else if (error && error.code === 'PGRST116') {
            // User not found, create them
            await supabase.from('users').insert({
              telegram_id: tgUser.id,
              username: tgUser.username || '',
              first_name: tgUser.first_name || '',
              balance_drp: parsed.balance,
              balance_ton: parsed.cryptoBalances.TON,
              balance_sol: parsed.cryptoBalances.SOL,
              balance_usdt: parsed.cryptoBalances.USDT,
              balance_bnb: parsed.cryptoBalances.BNB,
              available_taps: parsed.availableTaps,
              faucet_streak: parsed.faucetStreak
            });
          }
        } catch (e) {
          console.error("Supabase load error:", e);
        }
      }

      const today = getUTCDateString();
      const now = Date.now();

      if (parsed.lastResetDate !== today) {
        parsed.mineClicksToday = 0;
        parsed.faucetClaimsToday = 0;
        parsed.watchAdsProgress = Array(10).fill(0);
        parsed.lastResetDate = today;
        
        if (parsed.lastFaucetClaimDate) {
          const lastClaim = new Date(parsed.lastFaucetClaimDate);
          const yesterday = new Date();
          yesterday.setUTCDate(yesterday.getUTCDate() - 1);
          const yesterdayStr = `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth() + 1}-${yesterday.getUTCDate()}`;
          
          if (parsed.lastFaucetClaimDate !== yesterdayStr && parsed.lastFaucetClaimDate !== today) {
            parsed.faucetStreak = 0;
          }
        }
      }

      if (now > (parsed.nextWeeklyReset || 0)) {
        parsed.weeklyEarnings = 0;
        parsed.nextWeeklyReset = getNextMondayUTC();
      }

      setState({ ...parsed, tgUser });
      setIsLoaded(true);
    };

    loadState();
  }, []);

  // Sync state to Supabase (debounced)
  useEffect(() => {
    if (!isLoaded) return;
    
    localStorage.setItem('coindrop_state', JSON.stringify(state));

    if (state.tgUser) {
      const syncDb = async () => {
        try {
          await supabase.from('users').upsert({
            telegram_id: state.tgUser!.id,
            username: state.tgUser!.username || '',
            first_name: state.tgUser!.first_name || '',
            balance_drp: state.balance,
            balance_ton: state.cryptoBalances.TON,
            balance_sol: state.cryptoBalances.SOL,
            balance_usdt: state.cryptoBalances.USDT,
            balance_bnb: state.cryptoBalances.BNB,
            available_taps: state.availableTaps,
            faucet_streak: state.faucetStreak,
            last_faucet_claim: state.lastFaucetClaimDate ? new Date(state.lastFaucetClaimDate).toISOString() : null,
          });
        } catch (e) {
          console.error('Failed to sync to Supabase', e);
        }
      };
      
      const timeoutId = setTimeout(syncDb, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [state, isLoaded]);

  const showAd = (onSuccess: () => void) => {
    setAdCallback(() => onSuccess);
  };

  const closeAd = () => {
    if (adCallback) {
      adCallback();
      setAdCallback(null);
    }
  };

  const claimMine = () => {
    let reward = 0;
    
    if (state.selectedMiningCoin === 'DRP') {
      reward = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
      setState(prev => ({
        ...prev,
        balance: prev.balance + reward,
        weeklyEarnings: prev.weeklyEarnings + reward,
        mineClicksToday: prev.mineClicksToday + 1,
      }));
      
      if (state.tgUser) {
        supabase.from('ad_views').insert({ user_id: state.tgUser.id, type: 'mine_drp', reward_amount: reward }).then();
      }
      return reward;
    }

    if (state.availableTaps <= 0) return 0;
    
    if (state.selectedMiningCoin === 'BNB') reward = 0.0000001;
    else reward = 0.000001;

    setState(prev => ({
      ...prev,
      availableTaps: prev.availableTaps - 1,
      cryptoBalances: {
        ...prev.cryptoBalances,
        [prev.selectedMiningCoin]: prev.cryptoBalances[prev.selectedMiningCoin as keyof typeof prev.cryptoBalances] + reward
      },
      mineClicksToday: prev.mineClicksToday + 1,
    }));
    return reward;
  };

  const watchAdForTaps = () => {
    setState(prev => ({
      ...prev,
      availableTaps: prev.availableTaps + 100
    }));
    if (state.tgUser) {
      supabase.from('ad_views').insert({ user_id: state.tgUser.id, type: 'extra_taps', reward_amount: 100 }).then();
    }
  };

  const setSelectedMiningCoin = (coin: 'DRP' | 'TON' | 'SOL' | 'USDT' | 'BNB') => {
    setState(prev => ({ ...prev, selectedMiningCoin: coin }));
  };

  const claimFaucet = () => {
    const now = Date.now();
    if (now < state.faucetNextClaimTime || state.faucetClaimsToday >= 96) return;

    const today = getUTCDateString();
    let newStreak = state.faucetStreak;
    
    if (state.lastFaucetClaimDate !== today) {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayStr = `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth() + 1}-${yesterday.getUTCDate()}`;
      
      if (state.lastFaucetClaimDate === yesterdayStr) {
        newStreak += 1;
      } else if (state.lastFaucetClaimDate !== '') {
        newStreak = 1;
      } else {
        newStreak = 1;
      }
    }

    const isStreakActive = newStreak >= 7;
    const reward = isStreakActive ? 30 : 15;

    setState(prev => ({
      ...prev,
      balance: prev.balance + reward,
      weeklyEarnings: prev.weeklyEarnings + reward,
      faucetNextClaimTime: now + 15 * 60 * 1000,
      faucetClaimsToday: prev.faucetClaimsToday + 1,
      faucetStreak: newStreak,
      lastFaucetClaimDate: today,
    }));

    if (state.tgUser) {
      supabase.from('faucet_claims').insert({ user_id: state.tgUser.id, reward_amount: reward, streak_day: newStreak }).then();
    }
  };

  const claimWatchAd = (index: number, reward: number) => {
    setState(prev => {
      const newProgress = [...prev.watchAdsProgress];
      newProgress[index] += 1;
      return {
        ...prev,
        balance: prev.balance + reward,
        weeklyEarnings: prev.weeklyEarnings + reward,
        watchAdsProgress: newProgress,
      };
    });
    if (state.tgUser) {
      supabase.from('ad_views').insert({ user_id: state.tgUser.id, type: `ad_type_${index + 1}` as any, reward_amount: reward }).then();
    }
  };

  const updateTask = (taskId: keyof GameState['tasks'], status: any) => {
    setState(prev => {
      const newState = { ...prev, tasks: { ...prev.tasks, [taskId]: status } };
      if (status === 'done' && prev.tasks[taskId] !== 'done') {
        let reward = 0;
        if (taskId === 'tg') reward = 100;
        if (taskId === 'twitter') reward = 50;
        if (taskId === 'yt') reward = 50;
        newState.balance += reward;
        newState.weeklyEarnings += reward;
      }
      return newState;
    });

    if (state.tgUser) {
      supabase.from('user_tasks').upsert({ user_id: state.tgUser.id, task_id: taskId, status }).then();
    }
  };

  const convertDrpToCrypto = (amount: number, coin: string, rate: number) => {
    if (state.balance < amount || amount < 10000) return false;
    const cryptoAmount = amount * 0.0001 * rate;
    setState(prev => ({
      ...prev,
      balance: prev.balance - amount,
      cryptoBalances: {
        ...prev.cryptoBalances,
        [coin as keyof typeof prev.cryptoBalances]: prev.cryptoBalances[coin as keyof typeof prev.cryptoBalances] + cryptoAmount
      }
    }));

    if (state.tgUser) {
      supabase.from('conversions').insert({
        user_id: state.tgUser.id,
        from_coin: 'DRP',
        to_coin: coin,
        amount_in: amount,
        amount_out: cryptoAmount,
        conversion_rate: rate
      }).then();
    }

    return true;
  };

  const requestWithdrawal = (cryptoAmount: number, coin: string, address: string, usdValue: number) => {
    if (state.cryptoBalances[coin as keyof typeof state.cryptoBalances] < cryptoAmount) return false;

    const newWithdrawal: Withdrawal = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      amount: cryptoAmount,
      coin,
      status: 'pending',
    };

    setState(prev => ({
      ...prev,
      cryptoBalances: {
        ...prev.cryptoBalances,
        [coin as keyof typeof prev.cryptoBalances]: prev.cryptoBalances[coin as keyof typeof prev.cryptoBalances] - cryptoAmount
      },
      withdrawals: [newWithdrawal, ...prev.withdrawals],
    }));

    if (state.tgUser) {
      supabase.from('withdrawals').insert({
        user_id: state.tgUser.id,
        coin,
        amount: cryptoAmount,
        usd_value: usdValue,
        wallet_address: address,
        status: 'pending'
      }).then();
    }

    return true;
  };

  if (!isLoaded) return null;

  return (
    <GameContext.Provider value={{ 
      state, 
      showAd, 
      claimMine, 
      watchAdForTaps,
      setSelectedMiningCoin,
      claimFaucet, 
      claimWatchAd, 
      updateTask, 
      convertDrpToCrypto,
      requestWithdrawal 
    }}>
      {children}
      {adCallback && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white p-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Watching Advertisement...</h2>
          <p className="text-gray-400 mb-8">Please wait while the ad completes.</p>
          <button 
            onClick={closeAd}
            className="px-6 py-3 bg-indigo-600 rounded-xl font-bold animate-pulse"
          >
            Simulate Ad Finish
          </button>
        </div>
      )}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};

