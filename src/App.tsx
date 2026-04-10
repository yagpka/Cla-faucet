import React, { useState } from 'react';
import { GameProvider } from './lib/store';
import { Home } from './screens/Home';
import { Faucet } from './screens/Faucet';
import { WatchAds } from './screens/WatchAds';
import { Tasks } from './screens/Tasks';
import { Leaderboard } from './screens/Leaderboard';
import { Wallet } from './screens/Wallet';
import { Home as HomeIcon, Droplets, PlaySquare, CheckSquare, Trophy, Wallet as WalletIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TABS = [
  { id: 'home', label: 'Mine', icon: HomeIcon },
  { id: 'faucet', label: 'Faucet', icon: Droplets },
  { id: 'ads', label: 'Ads', icon: PlaySquare },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'leaderboard', label: 'Top', icon: Trophy },
  { id: 'wallet', label: 'Wallet', icon: WalletIcon },
];

const cubeVariants = {
  initial: (direction: number) => ({
    rotateY: direction > 0 ? 90 : -90,
    opacity: 0,
    z: -300,
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
    z: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -90 : 90,
    opacity: 0,
    z: -300,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  })
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [direction, setDirection] = useState(0);

  const handleTabChange = (newTabId: string) => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    const newIndex = TABS.findIndex(t => t.id === newTabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTabId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans overflow-hidden max-w-md mx-auto relative shadow-2xl perspective-1000">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
      
      <main className="flex-1 overflow-hidden relative z-10 preserve-3d">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={cubeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 w-full h-full origin-center preserve-3d bg-slate-50"
          >
            {activeTab === 'home' && <Home />}
            {activeTab === 'faucet' && <Faucet />}
            {activeTab === 'ads' && <WatchAds />}
            {activeTab === 'tasks' && <Tasks />}
            {activeTab === 'leaderboard' && <Leaderboard />}
            {activeTab === 'wallet' && <Wallet />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full px-4 py-3 z-40 shadow-xl">
        <div className="flex justify-between items-center">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={isActive ? 20 : 24} className={isActive ? 'fill-white/20' : ''} />
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
