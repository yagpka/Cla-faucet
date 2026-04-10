import React, { useState } from 'react';
import { useGame } from '../lib/store';
import { Wallet as WalletIcon, ArrowRightLeft, History, Send } from 'lucide-react';
import { motion } from 'motion/react';

const COINS = [
  { id: 'TON', name: 'TON', rate: 0.74, minWithdrawal: 0.5 },
  { id: 'USDT', name: 'USDT (TRC-20)', rate: 1.00, minWithdrawal: 2.0 },
  { id: 'SOL', name: 'SOL', rate: 0.007, minWithdrawal: 0.02 },
  { id: 'BNB', name: 'BNB (BEP-20)', rate: 0.0033, minWithdrawal: 0.005 },
];

const WITHDRAWAL_OPTIONS: Record<string, number[]> = {
  'TON': [2, 5, 10, 20],
  'USDT': [2, 5, 10, 50],
  'SOL': [0.02, 0.05, 0.1, 0.5],
  'BNB': [0.005, 0.01, 0.05, 0.1],
};

export const Wallet = () => {
  const { state, requestWithdrawal, convertDrpToCrypto } = useGame();
  
  // Conversion state
  const [convertAmount, setConvertAmount] = useState('');
  const [convertCoin, setConvertCoin] = useState(COINS[0].id);
  const [convertError, setConvertError] = useState('');

  // Withdrawal state
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawCoin, setWithdrawCoin] = useState(COINS[0].id);
  const [withdrawAmount, setWithdrawAmount] = useState(WITHDRAWAL_OPTIONS[COINS[0].id][0]);
  const [withdrawError, setWithdrawError] = useState('');

  const usdValue = (state.balance * 0.0001).toFixed(4);
  
  // Conversion calculations
  const parsedConvertAmount = parseInt(convertAmount) || 0;
  const selectedConvertCoin = COINS.find(c => c.id === convertCoin)!;
  const expectedCrypto = (parsedConvertAmount * 0.0001 * selectedConvertCoin.rate).toFixed(8);

  // Withdrawal calculations
  const selectedWithdrawCoin = COINS.find(c => c.id === withdrawCoin)!;
  const withdrawUsdValue = (withdrawAmount / selectedWithdrawCoin.rate).toFixed(4);

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    setConvertError('');

    if (parsedConvertAmount < 10000) {
      setConvertError('Minimum conversion is 10,000 DRP');
      return;
    }
    if (parsedConvertAmount > state.balance) {
      setConvertError('Insufficient DRP balance');
      return;
    }

    const success = convertDrpToCrypto(parsedConvertAmount, convertCoin, selectedConvertCoin.rate);
    if (success) {
      setConvertAmount('');
    }
  };

  const handleCoinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCoin = e.target.value;
    setWithdrawCoin(newCoin);
    setWithdrawAmount(WITHDRAWAL_OPTIONS[newCoin][0]);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');

    if (withdrawAmount > state.cryptoBalances[withdrawCoin as keyof typeof state.cryptoBalances]) {
      setWithdrawError('Insufficient crypto balance');
      return;
    }
    if (!withdrawAddress.trim()) {
      setWithdrawError('Please enter a wallet address');
      return;
    }

    const success = requestWithdrawal(withdrawAmount, withdrawCoin, withdrawAddress, parseFloat(withdrawUsdValue));
    if (success) {
      setWithdrawAddress('');
    }
  };

  return (
    <div className="p-6 pb-32 h-full overflow-y-auto perspective-1000">
      <div className="mt-4 mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Wallet</h2>
      </div>

      <motion.div 
        whileHover={{ rotateX: 5, rotateY: -5 }}
        className="bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-500 rounded-[32px] p-8 mb-8 relative overflow-hidden shadow-xl preserve-3d"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-[40px]"></div>
        
        {/* 3D Floating Wallet Icon */}
        <motion.div 
          animate={{ rotateY: 360, rotateX: [0, 10, 0] }} 
          transition={{ 
            rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
            rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }} 
          className="absolute -right-4 -top-4 w-32 h-32 opacity-20 preserve-3d"
        >
          <WalletIcon size={128} className="text-white" style={{ transform: 'translateZ(30px)' }} />
        </motion.div>

        <div className="flex items-center gap-2 text-indigo-100 mb-4 relative z-10" style={{ transform: 'translateZ(20px)' }}>
          <WalletIcon size={20} />
          <span className="font-medium">DRP Balance</span>
        </div>
        <div className="text-5xl font-bold text-white mb-2 relative z-10 tracking-tight" style={{ transform: 'translateZ(30px)' }}>
          {state.balance.toLocaleString()} <span className="text-2xl text-indigo-200 font-medium">DRP</span>
        </div>
        <div className="text-indigo-200 font-medium relative z-10 mb-6" style={{ transform: 'translateZ(20px)' }}>≈ ${usdValue} USD</div>

        <div className="grid grid-cols-2 gap-3 relative z-10" style={{ transform: 'translateZ(15px)' }}>
          {COINS.map(c => {
            const bal = state.cryptoBalances[c.id as keyof typeof state.cryptoBalances];
            return (
              <div key={c.id} className="bg-white/10 rounded-xl p-3 border border-white/20 backdrop-blur-sm">
                <div className="text-indigo-200 text-xs font-bold mb-1">{c.id}</div>
                <div className="text-white font-mono text-sm">{bal.toFixed(8)}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Convert DRP to Crypto */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 mb-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <ArrowRightLeft size={20} className="text-indigo-500" /> Convert DRP
        </h3>
        
        <form onSubmit={handleConvert} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">Amount (DRP)</label>
            <input 
              type="number" 
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              placeholder="Min 10,000"
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-6 py-4 text-slate-900 outline-none focus:border-indigo-500 transition-colors focus:shadow-[0_0_15px_rgba(79,70,229,0.1)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">To Crypto</label>
            <select 
              value={convertCoin}
              onChange={(e) => setConvertCoin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-6 py-4 text-slate-900 outline-none focus:border-indigo-500 appearance-none transition-colors focus:shadow-[0_0_15px_rgba(79,70,229,0.1)]"
            >
              {COINS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {parsedConvertAmount >= 10000 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 p-5 rounded-[24px] border border-slate-200 text-sm space-y-3"
            >
              <div className="flex justify-between font-bold text-base">
                <span className="text-slate-700">You will receive:</span>
                <span className="text-green-600">~{expectedCrypto} {convertCoin}</span>
              </div>
            </motion.div>
          )}

          {convertError && <div className="text-red-500 text-sm font-medium ml-2">{convertError}</div>}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-colors shadow-[0_5px_20px_rgba(79,70,229,0.3)] mt-2"
          >
            Convert to Crypto
          </motion.button>
        </form>
      </div>

      {/* Withdraw Crypto */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 mb-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Send size={20} className="text-indigo-500" /> Withdraw Crypto
        </h3>
        
        <form onSubmit={handleWithdraw} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">Select Crypto</label>
            <select 
              value={withdrawCoin}
              onChange={handleCoinChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-6 py-4 text-slate-900 outline-none focus:border-indigo-500 appearance-none transition-colors focus:shadow-[0_0_15px_rgba(79,70,229,0.1)]"
            >
              {COINS.map(c => (
                <option key={c.id} value={c.id}>{c.name} (Bal: {state.cryptoBalances[c.id as keyof typeof state.cryptoBalances].toFixed(4)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">Amount</label>
            <div className="grid grid-cols-2 gap-2">
              {WITHDRAWAL_OPTIONS[withdrawCoin].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setWithdrawAmount(amt)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                    withdrawAmount === amt 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {amt} {withdrawCoin}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">Wallet Address</label>
            <input 
              type="text" 
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              placeholder="Enter your address"
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-6 py-4 text-slate-900 outline-none focus:border-indigo-500 transition-colors focus:shadow-[0_0_15px_rgba(79,70,229,0.1)]"
            />
          </div>

          {withdrawAmount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 p-5 rounded-[24px] border border-slate-200 text-sm space-y-3"
            >
              <div className="flex justify-between font-bold text-base">
                <span className="text-slate-700">Value:</span>
                <span className="text-indigo-600">~${withdrawUsdValue} USD</span>
              </div>
            </motion.div>
          )}

          {withdrawError && <div className="text-red-500 text-sm font-medium ml-2">{withdrawError}</div>}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold transition-colors shadow-[0_5px_20px_rgba(15,23,42,0.3)] mt-2"
          >
            Request Withdrawal
          </motion.button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <History size={20} className="text-indigo-500" /> History
        </h3>
        
        {state.withdrawals.length === 0 ? (
          <div className="text-center text-slate-400 py-8 bg-white rounded-[24px] border border-slate-200 shadow-sm">No withdrawals yet</div>
        ) : (
          <div className="space-y-3">
            {state.withdrawals.map(w => (
              <motion.div 
                whileHover={{ x: 5 }}
                key={w.id} 
                className="bg-white border border-slate-200 p-5 rounded-[24px] flex justify-between items-center shadow-sm"
              >
                <div>
                  <div className="font-bold text-slate-900 text-lg">{w.amount.toFixed(6)} {w.coin}</div>
                  <div className="text-sm text-slate-500 mt-1">{new Date(w.date).toLocaleDateString()}</div>
                </div>
                <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                  w.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                  w.status === 'paid' ? 'bg-green-50 text-green-600 border border-green-200' :
                  'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {w.status}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

