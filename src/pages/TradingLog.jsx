import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  History, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePlayer } from '../context/PlayerContext';
import { cn } from '../lib/utils';

const TradingLog = () => {
  const { addXP } = usePlayer();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    pair: 'XAUUSD',
    direction: 'Long',
    entry: '',
    exit: '',
    lot_size: '',
    pnl: '',
    rules_followed: 'Yes',
    notes: ''
  });

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTrades(data);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateXP = (data) => {
    let xp = 0;
    if (data.rules_followed === 'Yes') xp += 30;
    if (parseFloat(data.pnl) > 0) xp += 20;
    if (data.rules_followed === 'No') xp -= 20;
    return xp;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const xpAwarded = calculateXP(formData);
    
    const { data, error } = await supabase
      .from('trades')
      .insert({ ...formData, xp_awarded: xpAwarded })
      .select()
      .single();

    if (error) {
      console.error('Error adding trade:', error);
      return;
    }

    setTrades([data, ...trades]);
    await addXP(xpAwarded);
    setShowForm(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      pair: 'XAUUSD',
      direction: 'Long',
      entry: '',
      exit: '',
      lot_size: '',
      pnl: '',
      rules_followed: 'Yes',
      notes: ''
    });
  };

  const stats = {
    total: trades.length,
    winRate: trades.length ? Math.round((trades.filter(t => parseFloat(t.pnl) > 0).length / trades.length) * 100) : 0,
    streak: trades.reduce((acc, t, i) => {
      if (i === 0) return t.rules_followed === 'Yes' ? 1 : 0;
      if (trades[i-1].rules_followed === 'Yes' && t.rules_followed === 'Yes') return acc + 1;
      return acc;
    }, 0)
  };

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-accent/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Trades</p>
            <p className="text-3xl font-black italic">{stats.total}</p>
          </div>
          <History className="w-8 h-8 text-accent/30" />
        </div>
        <div className="card p-6 border-success/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Win Rate</p>
            <p className="text-3xl font-black italic text-success">{stats.winRate}%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-success/30" />
        </div>
        <div className="card p-6 border-warning/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Rule Streak</p>
            <p className="text-3xl font-black italic text-warning">{stats.streak} Days</p>
          </div>
          <CheckCircle className="w-8 h-8 text-warning/30" />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Trading History</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-accent flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel Entry' : 'Log New trade'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 border-accent/30 bg-accent/5 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Pair</label>
              <input type="text" name="pair" value={formData.pair} onChange={handleInputChange} className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Direction</label>
              <select name="direction" value={formData.direction} onChange={handleInputChange} className="w-full bg-background border border-border rounded px-3 py-2 text-sm">
                <option>Long</option>
                <option>Short</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Rules Followed?</label>
              <select name="rules_followed" value={formData.rules_followed} onChange={handleInputChange} className="w-full bg-background border border-border rounded px-3 py-2 text-sm">
                <option>Yes</option>
                <option>Partial</option>
                <option>No</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Entry Price</label>
              <input type="number" step="any" name="entry" value={formData.entry} onChange={handleInputChange} className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Exit Price</label>
              <input type="number" step="any" name="exit" value={formData.exit} onChange={handleInputChange} className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Lot Size</label>
              <input type="number" step="any" name="lot_size" value={formData.lot_size} onChange={handleInputChange} className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-black text-white">Profit / Loss ($)</label>
              <input type="number" step="any" name="pnl" value={formData.pnl} onChange={handleInputChange} className="w-full bg-background border border-accent rounded px-3 py-2 text-sm text-white font-bold" />
            </div>
            <div className="md:col-span-3 lg:col-span-4 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Trade Notes / Psychological State</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full bg-background border border-border rounded px-3 py-2 text-sm h-20" placeholder="Why did you take this trade? Any emotions?" />
            </div>
            <div className="md:col-span-3 lg:col-span-4 flex justify-end">
              <button type="submit" className="btn-accent px-12 uppercase font-black italic tracking-tighter">Submit to Ledger</button>
            </div>
          </form>
        </div>
      )}

      {/* Trade Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-border">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">A_SET</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Position</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lot</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rules</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Net P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {trades.map((trade) => {
              const pnl = parseFloat(trade.pnl);
              const isProfit = pnl > 0;
              const isLoss = pnl < 0;
              
              return (
                <tr 
                  key={trade.id} 
                  className={cn(
                    "group transition-colors",
                    isProfit ? "hover:bg-success/5" : isLoss ? "hover:bg-danger/5" : "hover:bg-white/5"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{trade.date}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{new Date(trade.created_at).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black italic text-accent">{trade.pair}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {trade.direction === 'Long' ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-danger" />}
                      <span className="text-sm font-medium">{trade.direction}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{trade.lot_size}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {trade.rules_followed === 'Yes' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : trade.rules_followed === 'Partial' ? (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      ) : (
                        <XCircle className="w-4 h-4 text-danger" />
                      )}
                      <span className="text-[10px] font-bold">{trade.rules_followed}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-lg font-black italic tracking-tighter",
                        isProfit ? "text-success" : isLoss ? "text-danger" : "text-gray-400"
                      )}>
                        {isProfit ? '+' : ''}{trade.pnl}
                      </span>
                      <span className={cn(
                        "text-[9px] font-bold uppercase",
                        trade.xp_awarded >= 0 ? "text-accent" : "text-danger"
                      )}>
                        {trade.xp_awarded >= 0 ? '+' : ''}{trade.xp_awarded} XP
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {trades.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500 italic">No trades logged in current epoch.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradingLog;
