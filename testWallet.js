import { checkAndResetMonth } from './src/lib/monthlyReset.js';
import { rewards, penalties, withdraw } from './src/lib/rewards.js';

const runTests = async () => {
  console.log("=== STARTING WALLET SYSTEM TESTS ===");

  try {
    console.log("1. Running Month Reset Check...");
    await checkAndResetMonth();
    console.log("-> Month check completed.");

    console.log("\n2. Testing Rewards...");
    console.log("   -> completeDailyQuest (expect +500 paise for 20xp)");
    const r1 = await rewards.completeDailyQuest(20);
    console.log(`      Success: tx=${r1?.transaction?.id}, new balance=${r1?.balance}`);

    console.log("   -> defeatBoss (expect +20000 paise)");
    const r2 = await rewards.defeatBoss();
    console.log(`      Success: tx=${r2?.transaction?.id}, new balance=${r2?.balance}`);

    console.log("\n3. Testing Penalties...");
    console.log("   -> breakStreak (expect -5000 paise)");
    const p1 = await penalties.breakStreak();
    console.log(`      Success: tx=${p1?.transaction?.id}, new balance=${p1?.balance}`);

    console.log("\n4. Testing Withdraw Eligibility...");
    const check = await withdraw.canWithdraw();
    console.log(`   -> Allowed: ${check.allowed}`);
    if (!check.allowed) console.log(`   -> Reason: ${check.reason}`);

    console.log("\n=== ALL DIRECT TESTS PASSED ===");
    process.exit(0)
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1)
  }
};

runTests();
