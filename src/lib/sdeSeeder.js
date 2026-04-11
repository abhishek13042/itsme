import { supabase } from '../lib/supabase';

const chapters = [
  // PHASE 1: DSA Foundation (Month 1-2)
  { id: 'dsa-arrays', title: 'Arrays & Hashing', category: 'DSA', phase: 1, month_target: 1, resource_url: 'https://takeuforward.org/strivers-a2z-dsa-course' },
  { id: 'dsa-twopointer', title: 'Two Pointers & Sliding Window', category: 'DSA', phase: 1, month_target: 1 },
  { id: 'dsa-stack-queue', title: 'Stack & Queue', category: 'DSA', phase: 1, month_target: 1 },
  { id: 'dsa-linked-list', title: 'Linked Lists', category: 'DSA', phase: 1, month_target: 2 },
  { id: 'dsa-binary-search', title: 'Binary Search', category: 'DSA', phase: 1, month_target: 2 },
  { id: 'dsa-trees-basic', title: 'Binary Trees', category: 'DSA', phase: 1, month_target: 2 },
  { id: 'python-basics', title: 'Python Deep Dive (CampusX)', category: 'Python', phase: 1, month_target: 1, resource_url: 'https://youtube.com/campusx' },
  { id: 'python-oop', title: 'OOP + File Handling + Exceptions', category: 'Python', phase: 1, month_target: 2 },

  // PHASE 2: Core DSA (Month 2-4)
  { id: 'dsa-trees-advanced', title: 'BST + AVL + Segment Trees', category: 'DSA', phase: 2, month_target: 3 },
  { id: 'dsa-graphs', title: 'Graph Theory + BFS/DFS', category: 'DSA', phase: 2, month_target: 3 },
  { id: 'dsa-graphs-advanced', title: 'Dijkstra + Topo Sort + MST', category: 'DSA', phase: 2, month_target: 3 },
  { id: 'dsa-dp-basic', title: 'Dynamic Programming Basics', category: 'DSA', phase: 2, month_target: 3 },
  { id: 'dsa-dp-advanced', title: 'DP Advanced + Patterns', category: 'DSA', phase: 2, month_target: 4 },
  { id: 'dsa-heap', title: 'Heaps + Priority Queue', category: 'DSA', phase: 2, month_target: 4 },
  { id: 'dsa-trie', title: 'Tries + String Algorithms', category: 'DSA', phase: 2, month_target: 4 },
  { id: 'sql-basics', title: 'SQL + PostgreSQL', category: 'Backend', phase: 2, month_target: 3 },
  { id: 'sql-advanced', title: 'Advanced SQL + Query Optimization', category: 'Backend', phase: 2, month_target: 4 },

  // PHASE 3: Backend + Systems (Month 4-6)
  { id: 'backend-api', title: 'REST API + FastAPI', category: 'Backend', phase: 3, month_target: 4, resource_url: 'https://fastapi.tiangolo.com' },
  { id: 'backend-mindset', title: 'Backend Mindset (Chai aur Code)', category: 'Backend', phase: 3, month_target: 4, resource_url: 'https://youtube.com/chaiaurcode' },
  { id: 'backend-auth', title: 'Auth + JWT + Sessions', category: 'Backend', phase: 3, month_target: 5 },
  { id: 'backend-db', title: 'Database Design + ORM', category: 'Backend', phase: 3, month_target: 5 },
  { id: 'sysdesign-basics', title: 'System Design Concepts', category: 'SysDesign', phase: 3, month_target: 5, resource_url: 'https://bytebytego.com' },
  { id: 'sysdesign-patterns', title: 'Load Balancer + Cache + CDN', category: 'SysDesign', phase: 3, month_target: 5 },
  { id: 'lld-basics', title: 'LLD + SOLID Principles', category: 'LLD', phase: 3, month_target: 5 },
  { id: 'lld-patterns', title: 'Design Patterns (Factory/Observer/Strategy)', category: 'LLD', phase: 3, month_target: 6 },

  // PHASE 4: Advanced (Month 6-8)
  { id: 'dsa-greedy', title: 'Greedy Algorithms', category: 'DSA', phase: 4, month_target: 6 },
  { id: 'dsa-backtrack', title: 'Backtracking', category: 'DSA', phase: 4, month_target: 6 },
  { id: 'dsa-bitmanip', title: 'Bit Manipulation', category: 'DSA', phase: 4, month_target: 7 },
  { id: 'sysdesign-hld', title: 'HLD — Design Twitter/YouTube/Uber', category: 'SysDesign', phase: 4, month_target: 6, resource_url: 'https://youtube.com/gaurav_sen' },
  { id: 'sysdesign-advanced', title: 'Distributed Systems + CAP Theorem', category: 'SysDesign', phase: 4, month_target: 7 },
  { id: 'backend-redis', title: 'Redis + Caching Strategies', category: 'Backend', phase: 4, month_target: 7 },
  { id: 'backend-docker', title: 'Docker + Deployment', category: 'Backend', phase: 4, month_target: 7 },
  { id: 'backend-testing', title: 'Testing + CI/CD Basics', category: 'Backend', phase: 4, month_target: 8 },

  // PROJECTS
  { id: 'project-1', title: 'Project 1: DSA Visualizer or CLI Tool', category: 'Project', phase: 1, month_target: 2 },
  { id: 'project-2', title: 'Project 2: ML Trading Signal API', category: 'Project', phase: 2, month_target: 4 },
  { id: 'project-3', title: 'Project 3: Full Stack App (FastAPI + React)', category: 'Project', phase: 3, month_target: 6 },
  { id: 'project-4', title: 'Project 4: System Design Implementation', category: 'Project', phase: 4, month_target: 8 },
];

export const seedSdeRoadmap = async () => {
  // 1. Create table via RPC if needed or just assume it exists (or run SQL)
  // Since I can't run DDL via Supabase JS without special permissions, 
  // I'll define it here but recommend user runs the SQL in dashboard if it fails.
  
  const { data: existing } = await supabase.from('sde_progress').select('id').limit(1);
  
  if (existing?.length === 0) {
    console.log('Seeding SDE Roadmap chapters...');
    const { error } = await supabase.from('sde_progress').insert(
      chapters.map(c => ({
        chapter_id: c.id,
        title: c.title,
        category: c.category,
        phase: c.phase,
        month_target: c.month_target,
        resource_url: c.resource_url || null
      }))
    );
    if (error) console.error('Error seeding SDE roadmap:', error);
  }
};
