import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Circle,
  Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePlayer } from '../context/PlayerContext';
import { cn } from '../lib/utils';

const Roadmap = () => {
  const { addXP } = usePlayer();
  const [goals, setGoals] = useState([]);
  const [expandedPhases, setExpandedPhases] = useState([1]); // Default Phase 1 open
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Career', 'Trading', 'Health', 'Learning', 'Money', 'Mind', 'ML/AI', 'Startup', 'Curiosity'];

  const phases = [
    { id: 1, title: 'Phase 1', subtitle: 'Foundation lock (Month 1)' },
    { id: 2, title: 'Phase 2', subtitle: 'Prove it to yourself (Months 1-3)' },
    { id: 3, title: 'Phase 3', subtitle: 'Skill stacking (Months 3-6)' },
    { id: 4, title: 'Phase 4', subtitle: 'Execute and earn (Months 6-12)' },
    { id: 5, title: 'Phase 5', subtitle: 'Compound and diverge (Year 1-3)' },
  ];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setGoals(data);
    setLoading(false);
  };

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(p => p !== phaseId) 
        : [...prev, phaseId]
    );
  };

  const toggleGoal = async (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    const newStatus = !goal.completed;
    
    const { data } = await supabase
      .from('goals')
      .update({ 
        completed: newStatus,
        completed_at: newStatus ? new Date().toISOString() : null
      })
      .eq('id', goalId)
      .select()
      .single();

    if (data) {
      setGoals(goals.map(g => g.id === goalId ? data : g));
      if (newStatus) {
        await addXP(100);
      }
    }
  };

  const getFilteredGoals = (phaseId) => {
    return goals.filter(g => 
      g.phase === phaseId && (filter === 'All' || g.category === filter)
    );
  };

  const getProgress = (phaseId) => {
    const phaseGoals = goals.filter(g => g.phase === phaseId);
    if (phaseGoals.length === 0) return 0;
    const completed = phaseGoals.filter(g => g.completed).length;
    return (completed / phaseGoals.length) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter italic uppercase underline decoration-accent decoration-4 underline-offset-8 mb-2">
            The Roadmap
          </h2>
          <p className="text-gray-400">FAANG SDE & High-Value Individual Path</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-card border border-border rounded-md px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-accent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {phases.map((phase) => {
          const isExpanded = expandedPhases.includes(phase.id);
          const phaseGoals = getFilteredGoals(phase.id);
          const progress = getProgress(phase.id);

          return (
            <div key={phase.id} className="card overflow-hidden">
              <button 
                onClick={() => togglePhase(phase.id)}
                className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{phase.title}</span>
                    <span className="text-xl font-black italic text-accent">{phase.id.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold">{phase.subtitle}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="w-32 bg-background h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-accent h-full transition-all duration-700" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold">{Math.round(progress)}% COMPLETE</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-6 border-t border-border/50 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {phaseGoals.map((goal) => (
                      <div 
                        key={goal.id} 
                        className="flex items-start gap-3 group cursor-pointer"
                        onClick={() => toggleGoal(goal.id)}
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-600 shrink-0 group-hover:text-gray-400" />
                        )}
                        <div>
                          <p className={cn(
                            "text-sm font-medium transition-colors",
                            goal.completed ? "text-gray-500 line-through" : "text-gray-200 group-hover:text-white"
                          )}>
                            {goal.text}
                          </p>
                          <span className="text-[9px] font-black uppercase tracking-tighter text-accent/50 group-hover:text-accent transition-colors">
                            {goal.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {phaseGoals.length === 0 && (
                    <p className="text-center py-8 text-sm text-gray-500 italic">No goals found for this category.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Roadmap;
