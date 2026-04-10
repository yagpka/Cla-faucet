import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  selectedMiningCoin: 'TON' | 'SOL' | 'USDT' | 'BNB';
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
};

interface GameContextType {
  state: GameState;
  showAd: (onSuccess: () => void) => void;
  claimMine: () => number;
  watchAdForTaps: () => void;
  setSelectedMiningCoin: (coin: 'TON' | 'SOL' | 'USDT' | 'BNB') => void;
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
    const saved = localStorage.getItem('coindrop_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = getUTCDateString();
        const now = Date.now();

        // Ensure new fields exist
        if (!parsed.cryptoBalances) parsed.cryptoBalances = { TON: 0, SOL: 0, USDT: 0, BNB: 0 };
        if (parsed.availableTaps === undefined) parsed.availableTaps = 0;
        if (!parsed.selectedMiningCoin) parsed.selectedMiningCoin = 'TON';
        if (parsed.referrals === undefined) parsed.referrals = 0;

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

        setState({ ...initialState, ...parsed });
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    } else {
      setState({
        ...initialState,
        lastResetDate: getUTCDateString(),
        nextWeeklyReset: getNextMondayUTC(),
      });
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('coindrop_state', JSON.stringify(state));
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
    if (state.availableTaps <= 0) return 0;
    
    let reward = 0;
    if (state.selectedMiningCoin === 'BNB') reward = 0.0000001;
    else reward = 0.000001;

    setState(prev => ({
      ...prev,
      availableTaps: prev.availableTaps - 1,
      cryptoBalances: {
        ...prev.cryptoBalances,
        [prev.selectedMiningCoin]: prev.cryptoBalances[prev.selectedMiningCoin] + reward
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
  };

  const setSelectedMiningCoin = (coin: 'TON' | 'SOL' | 'USDT' | 'BNB') => {
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
    return true;
  };

  const requestWithdrawal = (cryptoAmount: number, coin: string, address: string, usdValue: number) => {
    if (state.cryptoBalances[coin as keyof typeof state.cryptoBalances] < cryptoAmount) return false;
    if (usdValue < 2.0) return false; // 20k DRP = $2.00

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

