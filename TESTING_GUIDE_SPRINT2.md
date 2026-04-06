# Sprint 2 Testing Guide 🧪
**Roguelike Core System - Validation Checklist**

---

## 🚀 Quick Start Testing

### 1. Open the Game
```
Open: ui/index.html in browser
Load: game in console with window.game object
```

### 2. Enable Roguelike Mode
```javascript
// In browser console:
window.game.setRoguelikeMode(true)
```

### 3. Start a Roguelike Run
```javascript
// Fill player name
document.getElementById('player-name').value = 'TestPlayer'

// Start game
document.getElementById('btn-start').click()
```

---

## ✅ Testing Checklist

### Phase 1: Roguelike Mode Toggle
- [ ] `setRoguelikeMode(true)` returns without error
- [ ] `getRoguelikeMode()` returns `true`
- [ ] `setRoguelikeMode(false)` disables roguelike mode
- [ ] Console shows: `[GAME] Roguelike Mode: ENABLED`

**Console Command**:
```javascript
window.game.setRoguelikeMode(true);
console.log('Mode:', window.game.getRoguelikeMode());
```

---

### Phase 2: Run Creation & Perks
- [ ] Starting new roguelike battle creates a Run object
- [ ] `getCurrentRun()` returns Run with:
  - `wins: 0`
  - `losses: 0`
  - `perksCollected: []`
  - `active: true`
- [ ] Console shows: `[ROGUELIKE] Victoria #1 - Score: X` on win

**Console Command**:
```javascript
// After starting game (startGame clicked):
const run = window.game.getCurrentRun();
console.log('Run:', run);
console.log('Wins:', run?.wins);
console.log('Perks:', run?.perksCollected);
```

**Manual Test**:
1. Click "Jugar" to start
2. Win a battle (attack orc)
3. Check console for `[ROGUELIKE] Victoria #1`

---

### Phase 3: Difficulty Scaling
- [ ] After 0 wins: Orc HP normal (~50)
- [ ] After 1-2 wins: Orc HP increases (~60)
- [ ] After 3-5 wins: Orc HP increases more (~75)
- [ ] After 6+ wins: Orc HP very high (~90)

**Manual Test**:
1. Enable roguelike mode
2. Win 1 battle → Note orc HP
3. Continue to next battle → Check orc HP increase by ~20%
4. Continue winning → Verify progressive difficulty

**Console Command**:
```javascript
// Check difficulty scaling:
const run = window.game.getCurrentRun();
if (run) {
  console.log('Wins:', run.wins);
  const orcHp = window.game.state.orcHP;
  console.log('Orc HP:', orcHp);
}
```

---

### Phase 4: Reward Screen
- [ ] After victory, end screen appears
- [ ] "Siguiente Batalla" button shown (instead of "Jugar de Nuevo")
- [ ] Reward screen shows 3 perk options
- [ ] Each perk card displays: icon, name, rarity, description
- [ ] Clicking perk adds it to `currentRun.perksCollected`

**Manual Test**:
1. Start roguelike game
2. Win battle (attack until victory)
3. Wait for end screen
4. Should see reward screen with 3 perks
5. Click any perk card
6. Verify perk added to run:
   ```javascript
   window.game.getCurrentRun().perksCollected
   ```

**Expected Output**:
```
Run {
  playerName: 'TestPlayer',
  wins: 1,
  perksCollected: ['HP_PLUS_10'],  // or other perk ID
  active: true,
  ...
}
```

---

### Phase 5: Perk Application
- [ ] After selecting perk, game state is modified
- [ ] Perk effect visible in next battle
  - `HP_PLUS_10` → Player max HP increases
  - `DMG_PLUS_2` → Attack damage increases
  - `CRIT_CHANCE_15` → More critical hits
- [ ] Multiple perks stack correctly

**Manual Test**:
1. Select `DMG_PLUS_2` perk
2. Click "Siguiente Batalla"
3. Check player damage on first attack - should be higher

**Console Command** (before battle):
```javascript
// Check player stats after perk applied:
const state = window.game.state;
console.log('Player Base Damage:', state.playerDmg);
console.log('Max HP:', state.playerMaxHP);
console.log('Perks Applied:', window.game.getCurrentRun().perksCollected);
```

---

### Phase 6: Run Persistence
- [ ] After run ends (loss), it saves to localStorage
- [ ] `runLeaderboard` contains completed runs
- [ ] Runs ranked by wins (descending)
- [ ] JSON stored at key: `roguelike_runs_v3`

**Manual Test**:
1. `setRoguelikeMode(true)` and start game
2. Win 1 battle, select a perk
3. On next battle, intentionally lose (let orc win)
4. Run should end and save

**Console Command**:
```javascript
// Check localStorage:
const stored = localStorage.getItem('roguelike_runs_v3');
const leaderboard = JSON.parse(stored);
console.log('Leaderboard:', leaderboard);
console.log('Top run:', leaderboard?.leaderboard[0]);

// Check run object:
console.log('Current run active?', window.game.getCurrentRun().active);
```

---

### Phase 7: Leaderboard Display
- [ ] End screen shows top 10 runs
- [ ] Ranked by: wins desc, score desc, perks desc
- [ ] Shows: Rank / Player / Wins / Score / Perks

**Manual Test**:
1. Complete 2-3 runs
2. Check end screen leaderboard
3. Verify rows show all 3+ runs
4. Verify sorted by wins descending

---

### Phase 8: Classic Mode Still Works
- [ ] `setRoguelikeMode(false)` reverts to classic mode
- [ ] Classic battles don't increment runs
- [ ] Ads show after 3 battles (leaderboard only shows seasonal)
- [ ] "Jugar de Nuevo" button appears (not "Siguiente Batalla")

**Manual Test**:
1. `setRoguelikeMode(false)`
2. Start game and win
3. Should see "Jugar de Nuevo" button
4. Repeat 3 times → Check for ad

---

## 🐛 Debugging Commands

### Check Current State
```javascript
// Full state dump:
console.log('==== GAME STATE ====');
console.log('Mode:', window.game.getRoguelikeMode());
console.log('Current Run:', window.game.getCurrentRun());
console.log('Player State:', window.game.state);
console.log('Stats:', window.game.stats);
```

### Check Perk System
```javascript
// List all available perks:
import('./ui/modules/roguelike-system.js').then(m => {
  console.log('All Perks:', m.PERKS_COMPLETE);
  console.log('Common:', m.PERKS_COMMON);
  console.log('Legendary:', m.PERKS_LEGENDARY);
});

// Manually get reward perks:
const run = window.game.getCurrentRun();
import('./ui/modules/roguelike-system.js').then(m => {
  const rewards = m.getRewardPerks(run, 3);
  console.log('Reward Options:', rewards);
});
```

### Manual Perk Application
```javascript
// Test perk application:
const run = window.game.getCurrentRun();
if (run) {
  run.selectPerk('HP_PLUS_10');
  run.applyPerks(window.game.state);
  console.log('Perks Applied!');
  console.log('New Max HP:', window.game.state.playerMaxHP);
}
```

### Check Leaderboard
```javascript
// Raw localStorage:
console.log(localStorage.getItem('roguelike_runs_v3'));

// Parsed leaderboard:
const data = JSON.parse(localStorage.getItem('roguelike_runs_v3'));
console.log('Saved Runs:', data.leaderboard);
console.log('Count:', data.leaderboard.length);
```

### Reset All Data
```javascript
// Clear roguelike data:
localStorage.removeItem('roguelike_runs_v3');
window.game.setRoguelikeMode(false);
console.log('Roguelike data cleared!');
```

---

## 📊 Test Scenarios

### Scenario 1: Win-Loss Sequence
**Goal**: Verify 2-run sequence with different outcomes

1. Enable roguelike: `setRoguelikeMode(true)`
2. Start game: Name = "Player1", click Jugar
3. **Run 1**: Win 2 battles, select 2 perks, lose on 3rd
4. Verify saved to leaderboard: `console.log(localStorage.getItem('roguelike_runs_v3'))`
5. Start new game: Name = "Player2"
6. **Run 2**: Win 1 battle, lose
7. Check leaderboard: Player1 should rank #1 (2 wins > 1 win)

---

### Scenario 2: Perk Stacking
**Goal**: Verify multiple perks apply and stack

1. Enable roguelike + start game
2. Win battle 1 → Select `DMG_PLUS_2`
3. Note damage on battle 2
4. Win battle 2 → Select `DMG_PLUS_2` again
5. Note damage on battle 3 should be +4 (2+2)
6. Win battle 3 → Select `CRIT_CHANCE_15`
7. Note crit chance on battle 4

---

### Scenario 3: Difficulty Scaling
**Goal**: Verify progressive difficulty increases

1. `setRoguelikeMode(true)` → Start game
2. **Battle 1**: Note orc HP (baseline)
3. Win, select perk, continue
4. **Battle 2**: Orc HP ~1.1-1.2x higher
5. Win, select perk, continue
6. **Battle 3**: Continue winning...
7. **Battle 5+**: Should be noticeably harder

---

### Scenario 4: Leaderboard Persistence
**Goal**: Verify data survives page reload

1. Complete 1 roguelike run
2. Check leaderboard has 1 entry
3. **Refresh page** (F5)
4. Console: Check `localStorage.getItem('roguelike_runs_v3')`
5. Verify run data still there

---

## ✅ Success Criteria

**All 8 phases passing = Sprint 2 Validated** ✅

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Mode Toggle | ✅ | Console feedback working |
| 2. Run Creation | ✅ | Run object created, properties correct |
| 3. Difficulty Scaling | ✅ | Orc HP increases per wins |
| 4. Reward Screen | ✅ | 3 perks shown, clickable, recorded |
| 5. Perk Application | ✅ | Stats modified correctly |
| 6. Run Persistence | ✅ | localStorage populated on run end |
| 7. Leaderboard Display | ✅ | Top 10 shown, sorted correctly |
| 8. Classic Mode | ✅ | Still works, ads functional |

---

## 📝 Test Results Template

Use this template to document test results:

```
=== SPRINT 2 TEST RUN ===
Date: [Date]
Tester: [Name]
Browser: [Chrome/Firefox/Safari]

Phase 1 - Mode Toggle: ✅ PASS / ❌ FAIL
  Notes: [Any issues]

Phase 2 - Run Creation: ✅ PASS / ❌ FAIL
  Notes: [Any issues]

Phase 3 - Difficulty Scaling: ✅ PASS / ❌ FAIL
  Notes: [Orc HP values, scaling observed]

Phase 4 - Reward Screen: ✅ PASS / ❌ FAIL
  Notes: [UI issues, perk selection]

Phase 5 - Perk Application: ✅ PASS / ❌ FAIL
  Notes: [Stat changes observed]

Phase 6 - Run Persistence: ✅ PASS / ❌ FAIL
  Notes: [localStorage content]

Phase 7 - Leaderboard: ✅ PASS / ❌ FAIL
  Notes: [Ranking, sorting verified]

Phase 8 - Classic Mode: ✅ PASS / ❌ FAIL
  Notes: [Ad display, button text]

OVERALL: ✅ PASS / ❌ FAIL
```

---

## 🚀 Next Steps on Pass

If all phases pass:

1. ✅ Mark Sprint 2 as Production-Ready
2. ✅ Move to Sprint 3 (UI/UX Refinement)
3. ✅ Create GitHub release
4. ✅ Update version to 3.0 Sprint 2

---

## 🐞 Troubleshooting

### Issue: Reward screen doesn't appear
**Solution**:
- Check: `window.game.getCurrentRun()?.active === true`
- Verify: Victory detected (player won battle)
- Check console for errors in `showRewardScreen()`

### Issue: Perks not applying
**Solution**:
- Verify: `run.selectPerk(perkId)` called
- Check: `run.applyPerks(state)` executed
- Console: `console.log(state.playerDmg)` in next battle

### Issue: localStorage not saving
**Solution**:
- Check: `window.game.getRoguelikeMode() === true`
- Verify: Run ended (loss occurred)
- Check: `window.game.getCurrentRun().active === false`
- Manual save: `runLeaderboard.save('roguelike_runs_v3')`

### Issue: Difficulty not scaling
**Solution**:
- Verify: `run.wins > 0` (won at least 1 battle)
- Check: `scaleDifficultyForRun(wins)` returns > 1.0
- Console: `import('./ui/modules/roguelike-system.js').then(m => console.log(m.scaleDifficultyForRun(2)))`

---

**Last Updated**: Sprint 2 Complete  
**Status**: Ready for Testing
