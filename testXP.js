import { awardXP, checkAndUpdateStreak, checkBadges } from './src/lib/xpEngine.js';
import { runDailyReset } from './src/lib/dailyReset.js';

const runTests = async () => {
  console.log("=== STARTING XP SYSTEM TESTS ===");

  try {
    console.log("1. Testing XP Award (amount: 50, source: 'test')...");
    const result = await awardXP(50, 'test_source');
    console.log(`   -> Awarded: ${result.xpAwarded} XP (Multiplier: ${result.multiplier})`);
    console.log(`   -> New Level: ${result.newLevel} (LevelUp: ${result.levelUp})`);
    
    console.log("\n2. Testing Streak Check...");
    const streak = await checkAndUpdateStreak();
    console.log(`   -> Current Streak: ${streak.streakDays} (Lost: ${streak.streakLost})`);

    console.log("\n3. Testing Badge Check...");
    const badges = await checkBadges(streak.player || result.player);
    console.log(`   -> New Badges potential: ${badges.join(', ') || 'None'}`);

    console.log("\n4. Running Daily Reset Simulation...");
    const reset = await runDailyReset();
    console.log(`   -> Reset Run: ${reset.reset} (Reason: ${reset.reason || 'N/A'})`);
    if (reset.penaltyApplied) console.log(`   -> Penalty Applied: ${reset.penaltyDetails}`);

    console.log("\n=== ALL DIRECT XP TESTS PASSED ===");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
};

runTests();
