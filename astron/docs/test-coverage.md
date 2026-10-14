# Task 2 cases, checked before Today

The XP sum and the all-three daily bonus are listed separately, making twelve cases.
`%s` in a test name is replaced by each value in its test table.

| Case | Test name | File |
| --- | --- | --- |
| Sun stages 0–3 | `shows sun stage %s` | `src/logic/quests.test.ts` |
| Thirteen kept days | `counts thirteen consecutive kept days` | `src/logic/streak.test.ts` |
| Gap without a freeze | `breaks at a missed day without a freeze` | `src/logic/streak.test.ts` |
| Gap with a freeze | `bridges a missed day protected by a freeze` | `src/logic/streak.test.ts` |
| Today unfinished, yesterday kept | `keeps yesterday’s streak while today is unfinished` | `src/logic/streak.test.ts` |
| Goals 1, 2, and 3 | `meets goal %s only at its threshold` | `src/logic/quests.test.ts` |
| Stage limits: 1, 6, 7, 29, 30, 99, 100 | `uses streak stage %s → %s` | `src/logic/streak.test.ts` |
| Local midnight, 23:59 to 00:01 | `changes between 23:59 and 00:01 at local midnight` | `src/logic/dates.test.ts` |
| Each quest counted once per day | `counts each quest once on the requested day` | `src/logic/quests.test.ts` |
| Tale counts as Learn and Discover | `counts a tale cell as both Learn and Discover` | `src/data/services.test.ts` |
| XP from every requested source | `adds completion, daily quests, correct exercise, and ten-point bonus` | `src/logic/xp.test.ts` |
| All-three bonus only once | `awards the all-three bonus once, even after repeat presses` | `src/data/services.test.ts` |

## Task 3 additions

- `src/logic/clockChanges.test.ts`: actual 23-hour and 25-hour days in New York;
  device time-zone changes forward and backward. The test process changes its own
  time zone; your Windows setting is not changed.
- `src/logic/today.test.ts`: every requested streak text, remaining quests, all
  goals, sun stages, XP display, row order, the seven-day row, and a device time-zone
  change. The model reads only passed-in records and time.
- `src/data/observeProgress.test.ts`: updates from another database connection,
  persisted Reduce motion, no freeze refills, and erased progress.
- `src/pages/TodayView.test.tsx`: native keyboard controls, current Learn link,
  disabled future tabs, inline SVG parts, and the development-only link.

A new learner starts with **one freeze**. Existing balances stay saved. There is
no feature for earning or refilling freezes. Older missed-day service tests set
the balance to zero explicitly when they need to check an unprotected gap.

Run every test with `npm test`. Run only pure rules with `npm test -- src/logic`.
