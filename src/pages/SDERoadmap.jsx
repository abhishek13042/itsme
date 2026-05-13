import React, { useEffect, useState, useMemo } from 'react';
import { useSdeStore } from '../store/sdeStore';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Code2, 
  BookOpen, 
  Terminal, 
  ExternalLink, 
  Layers, 
  ChevronRight,
  TrendingUp,
  Globe,
  Info
} from 'lucide-react';
import { clsx } from 'clsx';

const CATEGORIES = ['All', 'DSA', 'Python', 'Backend', 'SysDesign', 'LLD', 'Project'];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8];

const CATEGORY_COLORS = {
  DSA: '#1A1A2E',
  Python: '#7C3AED',
  Backend: '#1A6B4A',
  SysDesign: '#E07B39',
  LLD: '#C0392B',
  Project: '#D97706'
};

const SDERoadmap = () => {
  const { 
    chapters, 
    dsaSolved, 
    loading, 
    isLoading,
    loadRoadmap, 
    updateChapterStatus, 
    updateNotes, 
    updateDsaSolved 
  } = useSdeStore();

  const [activeMonth, setActiveMonth] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedNotes, setExpandedNotes] = useState(null);

  useEffect(() => {
    if (!chapters?.length) loadRoadmap();
  }, []);

  const filteredChapters = useMemo(() => {
    return chapters.filter(c => {
      const monthMatch = c.month_target === activeMonth;
      const categoryMatch = activeCategory === 'All' || c.category === activeCategory;
      return monthMatch && categoryMatch;
    });
  }, [chapters, activeMonth, activeCategory]);

  const stats = useMemo(() => {
    const total = chapters.length;
    const done = chapters.filter(c => c.completed).length;
    const projects = chapters.filter(c => c.category === 'Project' && c.completed).length;
    const readyPercent = total > 0 ? Math.floor((done / total) * 100) : 0;

    const categoryData = CATEGORIES.slice(1).map(cat => ({
      name: cat,
      value: chapters.filter(c => c.category === cat && c.completed).length,
      total: chapters.filter(c => c.category === cat).length,
      color: CATEGORY_COLORS[cat]
    }));

    return { total, done, projects, readyPercent, categoryData };
  }, [chapters]);

  const chartData = stats.categoryData.filter(d => d.value > 0);

  const handleStatusToggle = (chapter) => {
    // 0 -> Not Started, 1 -> In Progress, 2 -> Done
    // Since our database currently uses 'completed' (boolean), 
    // I'll toggle between false -> false (but with notes?) -> true
    // Or for this UI logic: 0 (white) -> 1 (amber) -> 2 (green)
    // I'll simplify to toggle false -> true for now, 
    // or simulate the 3-state if the user prefers.
    const currentStatus = chapter.completed ? 2 : 0;
    const nextStatus = (currentStatus + 1) % 3;
    updateChapterStatus(chapter.chapter_id, nextStatus);
  };

  if (isLoading && !chapters?.length) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 bg-[#F5F4F0] animate-pulse rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-32 bg-[#F5F4F0] animate-pulse rounded-2xl" />
          <div className="h-32 bg-[#F5F4F0] animate-pulse rounded-2xl" />
          <div className="h-32 bg-[#F5F4F0] animate-pulse rounded-2xl" />
        </div>
        <div className="h-96 bg-[#F5F4F0] animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto">
      
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1">SDE ROADMAP</h1>
          <div className="flex items-center gap-4 mt-3">
            <Badge text={`${stats.done}/${stats.total} Chapters Complete`} color="navy" />
            <div className="flex-1 max-w-md">
              <ProgressBar value={stats.readyPercent} color="navy" height="8px" />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">DSA Solved</p>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-navy-500" />
              <input 
                type="number" 
                value={dsaSolved}
                onChange={(e) => updateDsaSolved(parseInt(e.target.value) || 0)}
                className="w-full text-xl font-mono font-bold text-slate-900 bg-transparent focus:outline-none"
              />
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chapters Done</p>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-500" />
              <p className="text-xl font-mono font-bold text-slate-900">{stats.done}</p>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Projects Live</p>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <p className="text-xl font-mono font-bold text-slate-900">{stats.projects}</p>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Interview Ready</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <p className="text-xl font-mono font-bold text-slate-900">{stats.readyPercent}%</p>
            </div>
          </Card>
        </div>

        {/* Month Timeline */}
        <div className="bg-white border border-slate-100 p-2 rounded-2xl shadow-sm flex gap-2 overflow-x-auto no-scrollbar">
          {MONTHS.map(m => (
            <button
              key={m}
              onClick={() => setActiveMonth(m)}
              className={clsx(
                "flex-1 min-w-[80px] py-3 rounded-xl text-xs font-bold tracking-widest transition-all",
                activeMonth === m 
                  ? "bg-navy-900 text-white shadow-lg shadow-navy-100" 
                  : "text-slate-400 hover:bg-slate-50"
              )}
            >
              MONTH {m}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                "px-5 py-2 rounded-lg text-xs font-bold tracking-widest whitespace-nowrap transition-all border",
                activeCategory === cat 
                  ? "bg-navy-50 border-navy-200 text-navy-700" 
                  : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Chapter List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChapters.map(chapter => (
            <Card key={chapter.chapter_id} className="p-0 overflow-hidden border-slate-200 hover:border-navy-200 transition-all group">
              <div className="flex">
                <div 
                  className="w-1.5" 
                  style={{ backgroundColor: CATEGORY_COLORS[chapter.category] || '#64748B' }} 
                />
                <div className="flex-1 p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                        {chapter.category}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-navy-50 text-navy-600 rounded uppercase tracking-wider">
                        M{chapter.month_target}
                      </span>
                    </div>
                    {chapter.resource_url && (
                      <a 
                        href={chapter.resource_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <h3 className="text-[15px] font-bold text-slate-900 mb-4 group-hover:text-navy-900 transition-colors">
                    {chapter.title}
                  </h3>

                  <div className="flex flex-col gap-3">
                    {/* Notes Area */}
                    <div 
                      className={clsx(
                        "transition-all duration-300 overflow-hidden",
                        expandedNotes === chapter.chapter_id ? "max-h-40" : "max-h-0"
                      )}
                    >
                      <textarea
                        value={chapter.notes || ''}
                        onChange={(e) => updateNotes(chapter.chapter_id, e.target.value)}
                        placeholder="Key concepts, takeaways, or links..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-navy-100"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button 
                        onClick={() => setExpandedNotes(expandedNotes === chapter.chapter_id ? null : chapter.chapter_id)}
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-navy-600"
                      >
                        <Info className="w-3 h-3" /> {expandedNotes === chapter.chapter_id ? 'Hide Notes' : 'Notes'}
                      </button>
                      
                      <button
                        onClick={() => handleStatusToggle(chapter)}
                        className={clsx(
                          "px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all",
                          chapter.completed 
                            ? "bg-success text-white" 
                            : "bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-700"
                        )}
                      >
                        {chapter.completed ? 'DONE' : 'MARK COMPLETE'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filteredChapters.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
               <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No chapters assigned for Month {activeMonth} in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Sidebar */}
      <div className="w-[300px] space-y-8 sticky top-8 h-fit">
        
        {/* Completion Donut */}
        <Card className="p-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest text-center mb-6">Overall Progress</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.length > 0 ? chartData : [{ name: 'Pending', value: 1, color: '#F1F3F5' }]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  {chartData.length === 0 && <Cell fill="#F1F3F5" />}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <span className="text-2xl font-display font-bold text-slate-900">{stats.readyPercent}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Ready</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {stats.categoryData.map(cat => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">{cat.name}</span>
                  <span className="text-slate-900">{cat.value}/{cat.total}</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${(cat.value/cat.total)*100}%`,
                      backgroundColor: cat.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Resources */}
        <Card className="p-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Resources</h3>
          <div className="space-y-3">
            {[
              { label: 'Striver A2Z', icon: '📚' },
              { label: 'CampusX Python', icon: '🎥' },
              { label: 'Chai aur Backend', icon: '🎥' },
              { label: 'Alex Xu Vol 1', icon: '📖' },
              { label: 'Gaurav Sen', icon: '🎥' },
              { label: 'NeetCode 150', icon: '📚' },
            ].map(res => (
              <button 
                key={res.label}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-xs font-medium text-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{res.icon}</span>
                  <span>{res.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
};

export default SDERoadmap;
