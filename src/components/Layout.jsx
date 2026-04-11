import React from 'react';
import Sidebar from './Sidebar';
import { usePlayer } from '../context/PlayerContext';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const { loading, showLevelUp, showFullDayCleared } = usePlayer();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex bg-[#F5F4F0] min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[260px] py-[28px] px-[32px]">
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-8 right-8 bg-success text-white px-6 py-3 rounded-lg shadow-lg z-[100] font-bold"
            >
              LEVEL UP! 🚀
            </motion.div>
          )}

          {showFullDayCleared && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
            >
              <div className="bg-accent/90 backdrop-blur-md text-white px-12 py-6 rounded-2xl shadow-2xl border border-white/20 text-4xl font-black italic tracking-tighter">
                FULL DAY CLEARED
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </main>
    </div>
  );
};

export default Layout;
