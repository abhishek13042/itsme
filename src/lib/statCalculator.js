import { supabase } from './supabase';

/**
 * Weighted Stat Calculator for PLAYER ONE
 * Calculates dimensions for the Character Radar Chart (0-100 scale)
 */
export const calculateAllStats = async () => {
    try {
        // 1. Fetch ALL required source data in parallel
        const [
            { data: player },
            { data: sdeChapters },
            { data: brainLogs },
            { data: healthLogs },
            { data: trades }
        ] = await Promise.all([
            supabase.from('player_state').select('*').single(),
            supabase.from('sde_progress').select('*').eq('completed', true),
            supabase.from('brain_logs').select('*'),
            supabase.from('health_logs').select('*').gte('log_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
            supabase.from('trades').select('*')
        ]);

        if (!player) return null;

        // --- DSA (60% LC + 40% Chapters) ---
        const lcSolved = player.lc_problems_solved || 0;
        const dsaChapters = (sdeChapters || []).filter(c => c.category === 'DSA');
        const stat_dsa = Math.min(
            (lcSolved / 400 * 60) + 
            (dsaChapters.length / 20 * 40), 
            100
        );

        // --- SYSTEM DESIGN (Chapters / 8) ---
        const sdChapters = (sdeChapters || []).filter(c => ['SysDesign', 'LLD'].includes(c.category));
        const stat_sysdesign = Math.min(
            (sdChapters.length / 8) * 100, 
            100
        );

        // --- BACKEND (60% Chapters + 40% Projects) ---
        const beChapters = (sdeChapters || []).filter(c => c.category === 'Backend');
        const projects = (sdeChapters || []).filter(c => c.category === 'Project');
        const stat_backend = Math.min(
            (beChapters.length / 10 * 60) + 
            (projects.length / 4 * 40), 
            100
        );

        // --- TRADING (40% Vol + 40% Rules + 20% Phases) ---
        const tradesCount = trades?.length || 0;
        const rulesFollowed = (trades || []).filter(t => t.rules_followed === 'YES' || t.rules_followed === true).length;
        const ruleRate = tradesCount > 0 ? (rulesFollowed / tradesCount) : 0;
        // Mocking phases complete for now as we don't have a table yet, pull from metadata if needed
        const phasesComplete = 1; 
        const stat_trading = Math.min(
            (Math.min(tradesCount / 100, 1) * 40) +
            (ruleRate * 40) +
            (phasesComplete / 4 * 20),
            100
        );

        // --- PHYSIQUE (60% Vol + 40% Phases) ---
        const gymDaysMonth = (healthLogs || []).filter(l => l.gym_done).length;
        // Mock phases for now
        const healthPhases = 1; 
        const stat_physique = Math.min(
            (gymDaysMonth / 26 * 60) + 
            (healthPhases / 4 * 40),
            100
        );

        // --- ANALYTICAL BRAIN (40% Vol + 20% Time + 20% Solve + 20% Concept) ---
        const totalBrainLogs = brainLogs?.length || 0;
        const totalMinutes = (brainLogs || []).reduce((sum, l) => sum + (l.minutes_pushed || 0), 0);
        const avgMinutes = totalBrainLogs > 0 ? (totalMinutes / totalBrainLogs) : 0;
        const solvedCount = (brainLogs || []).filter(l => l.solved).length;
        const solveRate = totalBrainLogs > 0 ? (solvedCount / totalBrainLogs) : 0;
        const conceptsCount = (brainLogs || []).filter(l => l.concept_unlocked).length;

        const stat_analytical = Math.min(
            (Math.min(totalBrainLogs / 50, 1) * 40) +
            (Math.min(avgMinutes / 30, 1) * 20) +
            (solveRate * 20) +
            (Math.min(conceptsCount / 20, 1) * 20),
            100
        );

        // 2. Prepare Stats Object
        const finalStats = {
            dsa: Math.round(stat_dsa),
            sysdesign: Math.round(stat_sysdesign),
            backend: Math.round(stat_backend),
            trading: Math.round(stat_trading),
            physique: Math.round(stat_physique),
            analytical: Math.round(stat_analytical)
        };

        // 3. Update player_state back to DB
        await supabase.from('player_state').update({
            stat_dsa: finalStats.dsa,
            stat_sysdesign: finalStats.sysdesign,
            stat_backend: finalStats.backend,
            stat_trading: finalStats.trading,
            stat_physique: finalStats.physique,
            stat_analytical: finalStats.analytical,
            stats_last_updated: new Date().toISOString()
        }).eq('id', player.id);

        return finalStats;

    } catch (err) {
        console.error('Stat Calculation Failed:', err);
        return null;
    }
};
