import React, { useState } from 'react';
import { useGame } from '../lib/store';
import { MessageCircle, Twitter, Youtube, Check, Users, Copy, Gift } from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_REFERRALS = [
  { id: 1, username: 'CryptoKing99', reward: 100, date: '2026-04-08' },
  { id: 2, username: 'MoonWalker', reward: 100, date: '2026-04-07' },
  { id: 3, username: 'DogeLover', reward: 100, date: '2026-04-05' },
];

export const Tasks = () => {
  const { state, updateTask } = useGame();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'referrals'>('tasks');

  const refLink = state.tgUser 
    ? `https://t.me/Cla_faucet_bot/earn?startapp=ref_${state.tgUser.id}`
    : `https://t.me/Cla_faucet_bot/earn?startapp=ref_test123`;

  const handleTgClick = () => {
    if (state.tasks.tg === 'pending') {
      window.open('https://t.me/Cla_faucet', '_blank');
      updateTask('tg', 'claim');
    } else if (state.tasks.tg === 'claim') {
      updateTask('tg', 'done');
    }
  };

  const handleTwitterClick = () => {
    if (state.tasks.twitter === 'pending') {
      window.open('https://x.com/yashikact', '_blank');
      updateTask('twitter', 'watching');
      setTimeout(() => {
        updateTask('twitter', 'claim');
      }, 30000);
    } else if (state.tasks.twitter === 'claim') {
      updateTask('twitter', 'done');
    }
  };

  const handleYtClick = () => {
    if (state.tasks.yt === 'pending') {
      window.open('https://www.youtube.com/@hub_of_growth', '_blank');
      updateTask('yt', 'watching');
      setTimeout(() => {
        updateTask('yt', 'claim');
      }, 30000);
    } else if (state.tasks.yt === 'claim') {
      updateTask('yt', 'done');
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TaskCard = ({ icon: Icon, title, reward, status, onClick, children, colorClass }: any) => (
    <motion.div 
      whileHover={status !== 'done' ? { scale: 1.02, rotateX: 2 } : {}}
      className="bg-white border border-slate-200 rounded-[24px] p-5 mb-4 shadow-sm preserve-3d transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-4 mb-4 relative z-10" style={{ transform: 'translateZ(10px)' }}>
        <div className={`w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 ${colorClass}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
          <div className="text-indigo-600 font-medium text-sm">+{reward} DRP</div>
        </div>
      </div>
      
      <div style={{ transform: 'translateZ(5px)' }}>
        {children || (
          <motion.button
            whileTap={status !== 'done' && status !== 'watching' ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={status === 'done' || status === 'watching'}
            className={`w-full py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 preserve-3d ${
              status === 'done' ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' :
              status === 'watching' ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200' :
              status === 'claim' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_5px_15px_rgba(79,70,229,0.3)]' :
              'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span style={{ transform: 'translateZ(5px)' }}>
              {status === 'done' ? <><Check size={18} className="inline mr-1"/> Completed</> : 
               status === 'watching' ? 'Watching... (Wait 30s)' : 
               status === 'claim' ? 'Claim Reward' : 'Start Task'}
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 pb-32 h-full overflow-y-auto perspective-1000">
      <div className="mb-6 mt-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Earn</h2>
        <p className="text-slate-500 text-sm mb-6">Complete tasks or invite friends to earn DRP.</p>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-full mb-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 rounded-full font-bold text-sm transition-all ${
              activeTab === 'tasks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex-1 py-3 rounded-full font-bold text-sm transition-all ${
              activeTab === 'referrals' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Referrals
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <div className="space-y-2">
          <TaskCard 
            icon={MessageCircle} 
            title="Join Telegram Channel" 
            reward={100} 
            status={state.tasks.tg} 
            onClick={handleTgClick}
            colorClass="text-blue-500"
          />

          <TaskCard 
            icon={Twitter} 
            title="Follow on X (Twitter)" 
            reward={50} 
            status={state.tasks.twitter}
            onClick={handleTwitterClick}
            colorClass="text-sky-500"
          />

          <TaskCard 
            icon={Youtube} 
            title="Subscribe to YouTube" 
            reward={50} 
            status={state.tasks.yt} 
            onClick={handleYtClick}
            colorClass="text-red-600"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div 
            whileHover={{ scale: 1.02, rotateX: 2 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-500 rounded-[24px] p-6 shadow-xl preserve-3d"
          >
            <div className="flex items-center gap-4 mb-6 relative z-10" style={{ transform: 'translateZ(10px)' }}>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-white">
                <Users size={24} />
              </div>
              <div className="flex-1 text-white">
                <h3 className="font-bold text-lg">Invite Friends</h3>
                <div className="text-indigo-200 font-medium text-sm">You have {state.referrals} referrals</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 flex items-center justify-between border border-white/20 relative z-10" style={{ transform: 'translateZ(5px)' }}>
              <div className="text-white font-mono text-sm truncate mr-4">
                {refLink}
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={copyReferralLink}
                className="w-10 h-10 bg-white text-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-md"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </motion.button>
            </div>
            {!state.tgUser && (
              <div className="mt-4 text-xs text-indigo-200 text-center bg-black/20 p-2 rounded-lg">
                Testing Mode: Open in Telegram to see your real referral link.
              </div>
            )}
          </motion.div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Gift size={20} className="text-indigo-500" /> Your Referrals
            </h3>
            
            <div className="space-y-3">
              {MOCK_REFERRALS.map(ref => (
                <motion.div 
                  whileHover={{ x: 5 }}
                  key={ref.id} 
                  className="bg-white border border-slate-200 p-4 rounded-[20px] flex justify-between items-center shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold">
                      {ref.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{ref.username}</div>
                      <div className="text-xs text-slate-500">{ref.date}</div>
                    </div>
                  </div>
                  <div className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                    +{ref.reward} DRP
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




