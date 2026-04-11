import React, { useState, useEffect, useMemo } from 'react';
import { useQuestStore } from '../store/questStore';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { 
  Plus, 
  Sword, 
  CheckCircle2, 
  Clock, 
  Dna, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  Trophy,
  Filter,
  ArrowUpDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isBefore, addDays } from 'date-fns';
import { clsx } from 'clsx';

const DOMAINS = ['SDE', 'Trading', 'Health', 'Exams', 'Finance', 'Discipline', 'Learning'];

const QuestLog = () => {
  const { 
    activeQuests, 
    completedQuests, 
    boss, 
    bossTasks, 
    hpPercent, 
    penalties,
    loadQuests, 
    loadBoss, 
    loadPenalties,
    completeQuest, 
    completeBossTask 
  } = useQuestStore();

  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [filterDomain, setFilterDomain] = useState('All');
  const [sortBy, setSortBy] = useState('XP');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  // New Quest Form State
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    domain: 'SDE',
    xp_reward: 100,
    rupee_value: 50,
    due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    phase: 1
  });

  useEffect(() => {
    loadQuests();
    loadBoss();
    loadPenalties();
  }, []);

  const filteredQuests = useMemo(() => {
    let list = activeTab === 'ACTIVE' ? activeQuests : completedQuests;
    
    if (filterDomain !== 'All') {
      list = list.filter(q => q.domain?.toLowerCase() === filterDomain.toLowerCase());
    }

    return list.sort((a, b) => {
      if (sortBy === 'XP') return b.xp_reward - a.xp_reward;
      if (sortBy === 'Rupees') return b.rupee_value - a.rupee_value;
      if (sortBy === 'Due Date') return new Date(a.due_date || 0) - new Date(b.due_date || 0);
      return 0;
    });
  }, [activeQuests, completedQuests, activeTab, filterDomain, sortBy]);

  const handleComplete = async (questId) => {
    setCompletingId(questId);
    try {
      await completeQuest(questId);
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingId(null);
    }
  };

  const handleAddQuest = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('quests').insert([{
      ...newQuest,
      rupee_value: newQuest.rupee_value * 100 // Convert to paise
    }]);

    if (!error) {
      setIsModalOpen(false);
      loadQuests();
      setNewQuest({
        title: '',
        description: '',
        domain: 'SDE',
        xp_reward: 100,
        rupee_value: 50,
        due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        phase: 1
      });
    }
  };

  const getDomainColor = (domain) => {
    switch(domain?.toLowerCase()) {
      case 'sde': return 'bg-blue-500';
      case 'trading': return 'bg-emerald-500';
      case 'health': return 'bg-rose-500';
      case 'exams': return 'bg-amber-500';
      case 'finance': return 'bg-violet-500';
      case 'learning': return 'bg-indigo-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1">QUEST LOG</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your empire roadmaps and active objectives.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-lg shadow-navy-100"
        >
          <Plus className="w-4 h-4 mr-2" /> ADD QUEST
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {['ACTIVE', 'COMPLETED', 'PENALTIES'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-6 py-2 rounded-lg text-xs font-bold tracking-widest transition-all",
              activeTab === tab 
                ? "bg-white text-navy-900 shadow-sm" 
                : "text-slate-500 hover:text-navy-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'ACTIVE' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* World Boss Section */}
            {boss && (
              <Card className="p-0 overflow-hidden border-rose-200 bg-rose-50/10">
                <div className="flex">
                  <div className="w-1 bg-rose-500" />
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold tracking-widest uppercase mb-3">
                          <Sword className="w-3 h-3 mr-1" /> Active World Boss
                        </div>
                        <h2 className="text-2xl font-display font-bold text-slate-900">{boss.name}</h2>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex py-1 px-3 bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider uppercase">
                          <Clock className="w-3 h-3 mr-1.5" /> {format(new Date(boss.deadline), 'MMM d')} Deadline
                        </span>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-rose-600">BOSS HEALTH</span>
                        <span className="font-mono">{hpPercent}%</span>
                      </div>
                      <ProgressBar value={hpPercent} color="danger" height="12px" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bossTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => !task.completed && completeBossTask(task.id)}
                              className={clsx(
                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                task.completed ? "bg-rose-500 border-rose-500 text-white" : "border-slate-200 hover:border-rose-400"
                              )}
                            >
                              {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <span className={clsx("text-sm font-medium", task.completed ? "text-slate-400 line-through" : "text-slate-700")}>
                              {task.task_text}
                            </span>
                          </div>
                          <Badge text={`-${task.hp_damage}HP`} color="danger" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-rose-100">
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">Victory Rewards</p>
                      <div className="flex gap-4">
                        <span className="text-xs font-bold text-slate-700">⚡ {boss.xp_reward}P</span>
                        <span className="text-xs font-bold text-slate-700">💰 {boss.gold_reward} GOLD</span>
                        <span className="text-xs font-bold text-slate-700">🏆 EXAM SLAYER BADGE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <Filter className="w-4 h-4 text-slate-400 mr-2" />
                <button 
                  onClick={() => setFilterDomain('All')}
                  className={clsx(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap",
                    filterDomain === 'All' ? "bg-navy-900 text-white shadow-md shadow-navy-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  All
                </button>
                {DOMAINS.map(domain => (
                  <button 
                    key={domain}
                    onClick={() => setFilterDomain(domain)}
                    className={clsx(
                      "px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap",
                      filterDomain === domain ? "bg-navy-900 text-white shadow-md shadow-navy-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {domain}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[11px] font-bold uppercase tracking-widest text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="XP">Sort by XP</option>
                  <option value="Rupees">Sort by Rupees</option>
                  <option value="Due Date">Sort by Due Date</option>
                </select>
              </div>
            </div>

            {/* Quests List */}
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {filteredQuests.map(quest => {
                  const isNearlyDue = quest.due_date && isBefore(new Date(quest.due_date), addDays(new Date(), 3));
                  return (
                    <motion.div
                      key={quest.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="group"
                    >
                      <Card className="p-0 overflow-hidden border-slate-200 hover:border-navy-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex min-h-[100px]">
                          <div className={clsx("w-1.5", getDomainColor(quest.domain))} />
                          <div className="flex-1 p-5">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Badge text={quest.domain || 'General'} color={quest.domain?.toLowerCase() === 'sde' ? 'navy' : 'success'} />
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">
                                  Phase {quest.phase}
                                </span>
                              </div>
                              {quest.due_date && (
                                <span className={clsx(
                                  "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md",
                                  isNearlyDue ? "bg-amber-100 text-amber-600" : "text-slate-400"
                                )}>
                                  Due: {format(new Date(quest.due_date), 'MMM d')}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-end">
                              <div className="flex-1 mr-8">
                                <h3 className="text-[15px] font-bold text-slate-900 mb-1 group-hover:text-navy-900 transition-colors">
                                  {quest.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{quest.description}</p>
                              </div>
                              
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <div className="flex gap-4 mb-2">
                                    <div className="text-center">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">XP</p>
                                      <p className="text-xs font-mono font-bold text-xp">+{quest.xp_reward}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Rupees</p>
                                      <p className="text-xs font-mono font-bold text-success">+₹{quest.rupee_value / 100}</p>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleComplete(quest.id)}
                                    disabled={completingId === quest.id}
                                    className="h-9 px-6 text-[11px] font-bold uppercase tracking-widest group-hover:bg-success group-hover:text-white group-hover:border-success transition-all"
                                  >
                                    {completingId === quest.id ? "Working..." : "Complete"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filteredQuests.length === 0 && (
                <Card className="p-20 text-center border-dashed border-slate-200">
                  <Dna className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active quests in this phase.</p>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'COMPLETED' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-navy-900 text-white border-none shadow-xl">
                <p className="text-[10px] font-bold text-navy-300 uppercase tracking-widest mb-2">Total Quests</p>
                <h3 className="text-3xl font-display font-bold">{completedQuests.length}</h3>
              </Card>
              <Card className="p-6 border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total XP Gained</p>
                <h3 className="text-3xl font-display font-bold text-xp">
                  {completedQuests.reduce((sum, q) => sum + q.xp_reward, 0).toLocaleString()}P
                </h3>
              </Card>
              <Card className="p-6 border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Rupees Earned</p>
                <h3 className="text-3xl font-display font-bold text-success">
                  ₹{(completedQuests.reduce((sum, q) => sum + q.rupee_value, 0) / 100).toLocaleString()}
                </h3>
              </Card>
            </div>

            <div className="space-y-4">
              {completedQuests.map(quest => (
                <Card key={quest.id} className="p-5 border-slate-200 bg-slate-50/50 grayscale opacity-75">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-success/20 text-success flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 line-through">{quest.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Completed on {format(new Date(quest.completed_at || quest.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Badge text={`+${quest.xp_reward}XP`} color="xp" />
                      <Badge text={`+₹${quest.rupee_value / 100}`} color="success" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'PENALTIES' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-0 overflow-hidden border-rose-200">
              <div className="bg-rose-50/50 p-6 border-b border-rose-100 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-rose-900 uppercase tracking-widest">Penalty Log</h3>
                  <p className="text-rosy-700 text-xs mt-1">Consequences of broken discipline.</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-rose-400 uppercase mb-1">Total Loss</p>
                  <p className="text-xl font-display font-bold text-rose-600">
                    -₹{(penalties.reduce((sum, p) => sum + (p.gold_penalty || 0), 0)).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Reason</th>
                      <th className="px-6 py-3 text-right">XP Lost</th>
                      <th className="px-6 py-3 text-right">Rupees Lost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {penalties.map(penalty => (
                      <tr key={penalty.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-xs text-slate-500">{format(new Date(penalty.created_at), 'MMM d, HH:mm')}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{penalty.reason}</td>
                        <td className="px-6 py-4 text-xs font-mono font-bold text-rose-500 text-right">-{penalty.xp_penalty}P</td>
                        <td className="px-6 py-4 text-xs font-mono font-bold text-rose-500 text-right">-₹{penalty.gold_penalty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {penalties.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No penalties recorded. Immaculate discipline.</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Quest Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-display font-bold text-slate-900">NEW OBJECTIVE</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddQuest} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quest Title</label>
                  <input 
                    required
                    value={newQuest.title}
                    onChange={(e) => setNewQuest({...newQuest, title: e.target.value})}
                    placeholder="E.g. Solve 50 Hard LeetCode problems"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    value={newQuest.description}
                    onChange={(e) => setNewQuest({...newQuest, description: e.target.value})}
                    placeholder="Break down the steps required to complete this quest..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy-100 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Domain</label>
                    <select 
                      value={newQuest.domain}
                      onChange={(e) => setNewQuest({...newQuest, domain: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                    >
                      {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phase</label>
                    <input 
                      type="number"
                      min="1" max="5"
                      value={newQuest.phase}
                      onChange={(e) => setNewQuest({...newQuest, phase: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">XP Reward</label>
                    <select 
                      value={newQuest.xp_reward}
                      onChange={(e) => setNewQuest({...newQuest, xp_reward: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                    >
                      {[50, 80, 100, 150, 200, 500].map(v => <option key={v} value={v}>{v} XP</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Rupee Reward</label>
                    <select 
                      value={newQuest.rupee_value}
                      onChange={(e) => setNewQuest({...newQuest, rupee_value: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                    >
                      {[20, 30, 50, 100, 200, 500].map(v => <option key={v} value={v}>₹{v}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Due Date</label>
                   <input 
                      type="date"
                      value={newQuest.due_date}
                      onChange={(e) => setNewQuest({...newQuest, due_date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none"
                   />
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="primary" className="w-full h-12 shadow-xl shadow-navy-100 text-sm tracking-widest">
                    INITIALIZE QUEST
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default QuestLog;
