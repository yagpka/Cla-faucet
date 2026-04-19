import React, { useMemo, useState } from 'react';
import { useGame, checkIsActivePlayer } from '../lib/store';
import { Trophy, Medal, Globe, ArrowDownToLine, Coins } from 'lucide-react';
import { motion } from 'motion/react';

export const Leaderboard = () => {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<'top' | 'global'>('top');

  const leaderboardData = useMemo(() => {
    let allUsers = [...state.leaderboard];
    
    // Ensure current user is in the list if they have a TG user
    if (state.tgUser && !allUsers.find(u => u.telegram_id === state.tgUser!.id)) {
      allUsers.push({
        telegram_id: state.tgUser.id,
        username: state.tgUser.username || 'You',
        balance_drp: state.balance
      });
    }

    return allUsers.sort((a, b) => b.balance_drp - a.balance_drp);
  }, [state.leaderboard, state.balance, state.tgUser]);

  const myRank = state.tgUser ? leaderboardData.findIndex(u => u.telegram_id === state.tgUser!.id) + 1 : 0;
  const top20 = leaderboardData.slice(0, 20);

  const getPrize = (rank: number) => {
    if (rank === 1) return '5,000 DRP';
    if (rank === 2) return '3,000 DRP';
    if (rank === 3) return '1,000 DRP';
    return null;
  };

  return (
    <div className="flex flex-col h-full perspective-1000">
      <div className="p-6 pb-2 shrink-0 mt-4 text-center">
        {/* 3D Animated Trophy */}
        <div className="relative w-24 h-24 mx-auto mb-6 preserve-3d flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-spin-3d preserve-3d" style={{ animationDuration: '10s' }}></div>
          <div className="absolute inset-2 rounded-full border border-purple-500/30 animate-spin-3d preserve-3d" style={{ animationDuration: '7s', animationDirection: 'reverse' }}></div>
          
          <motion.div 
            animate={{ rotateY: 360, y: [-5, 5, -5] }} 
            transition={{ 
              rotateY: { duration: 6, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-indigo-100 shadow-[0_10px_20px_rgba(99,102,241,0.2)] preserve-3d relative z-10"
          >
            <Trophy size={32} className="text-indigo-500" style={{ transform: 'translateZ(20px)' }} />
          </motion.div>
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-2">Leaderboard</h2>
        <p className="text-slate-500 text-sm mb-6">Real-time Global Rankings</p>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-full mb-2">
          <button
            onClick={() => setActiveTab('top')}
            className={`flex-1 py-3 rounded-full font-bold text-sm transition-all ${
              activeTab === 'top' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Top Players
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 py-3 rounded-full font-bold text-sm transition-all ${
              activeTab === 'global' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Global
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-40 space-y-3">
        {activeTab === 'top' ? (
          top20.map((user, index) => {
            const rank = index + 1;
            const prize = getPrize(rank);
            const isMe = state.tgUser && user.telegram_id === state.tgUser.id;
            
            return (
              <motion.div 
                key={user.telegram_id} 
                whileHover={{ scale: 1.02, rotateX: 2 }}
                className={`flex items-center p-4 rounded-[24px] border preserve-3d transition-shadow hover:shadow-md ${
                  isMe ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-500 preserve-3d" style={{ transform: 'translateZ(10px)' }}>
                  {rank === 1 ? <Medal className="text-yellow-500" size={20} /> :
                   rank === 2 ? <Medal className="text-slate-400" size={20} /> :
                   rank === 3 ? <Medal className="text-amber-600" size={20} /> :
                   rank}
                </div>
                
                <div className="ml-4 flex-1" style={{ transform: 'translateZ(5px)' }}>
                  <div className={`font-bold text-lg flex items-center gap-2 ${isMe ? 'text-indigo-600' : 'text-slate-900'}`}>
                    {user.username || 'Anonymous'}
                    {/* Active Status Dot */}
                    <div 
                      className={`w-2.5 h-2.5 rounded-full ${isMe ? (checkIsActivePlayer(state) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500') : (user.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500')}`} 
                      title={isMe ? (checkIsActivePlayer(state) ? 'Active Player' : 'Inactive Player') : (user.is_active ? 'Active Player' : 'Inactive Player')} 
                    />
                  </div>
                  {prize && (
                    <div className="text-xs text-yellow-600 font-medium mt-0.5">Prize: {prize}</div>
                  )}
                </div>
                
                <div className="font-bold text-slate-700" style={{ transform: 'translateZ(5px)' }}>
                  {Number(user.balance_drp).toLocaleString()}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.02, rotateX: 2 }}
              className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm preserve-3d"
            >
              <div className="flex items-center gap-4 mb-2" style={{ transform: 'translateZ(10px)' }}>
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <Coins size={24} />
                </div>
                <div>
                  <div className="text-slate-500 text-sm font-medium">Total DRP Claimed</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {Number(state.globalMetrics.total_drp).toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, rotateX: 2 }}
              className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm preserve-3d"
            >
              <div className="flex items-center gap-4 mb-2" style={{ transform: 'translateZ(10px)' }}>
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                  <ArrowDownToLine size={24} />
                </div>
                <div>
                  <div className="text-slate-500 text-sm font-medium">Withdrawals Processed</div>
                  <div className="text-2xl font-bold text-slate-900">
                    ${Number(state.globalMetrics.total_withdrawals_usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {activeTab === 'top' && myRank > 0 && (
        <div className="absolute bottom-24 left-4 right-4 z-30 perspective-1000">
          <motion.div 
            whileHover={{ y: -5, rotateX: 5 }}
            className="flex items-center p-4 rounded-[24px] bg-indigo-600 border border-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,0.4)] preserve-3d"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white preserve-3d" style={{ transform: 'translateZ(15px)' }}>
              {myRank}
            </div>
            <div className="ml-4 flex-1 font-bold text-white text-lg" style={{ transform: 'translateZ(10px)' }}>You</div>
            <div className="font-bold text-white" style={{ transform: 'translateZ(10px)' }}>{state.balance.toLocaleString()} DRP</div>
          </motion.div>
        </div>
      )}
    </div>
  );
};




