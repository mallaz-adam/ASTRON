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

## Task 4 additions

- `src/logic/sun.test.ts`: stage, target, ratio at 0, 1, 6, 7, 13, 29, 30, 99,
  and 100; tick positions; longest runs with missing/missed days, historical goals
  and freezes; clockwise rays and their agreement with Today; all requested copy.
- `src/data/testHistory.test.ts`: fixtures at 0, 5, 13, 30 and 100; replacement,
  unchanged freeze balances and preferences, other learners, invalid counts,
  and full erasure.
- `src/pages/YourSunView.test.tsx`: Back to Today, descriptive SVG, supplied art,
  unselected zero stage and reduced-motion state. Today view tests also check
  the labelled link to Your sun and the desktop wordmark.

## Task 5 additions

- `src/logic/coursePath.test.ts`: none, three, or eleven completions; tale and quiz
  details; unrelated/duplicate completions; stable ordering; 4/3/4 honeycomb
  coordinates, spacing, radius gaps and title wrapping.
- `src/data/pathServices.test.ts`: locked-cell protection, Learn on completion,
  Discover and a lit star for tales, Alcyone's placeholder chapter, no repeat
  rewards, and persistence after reopening storage.
- `src/pages/CoursePathView.test.tsx`: eleven native controls with labels,
  selected current cell, BEGIN destination, announcements and reduced motion.
- Existing content-loader and Today tests reflect the eleven-cell sample and
  the new Continue link.

## Task 6 additions

- `src/data/lessonContent.test.ts`: exact supplied lesson and exercise copy,
  approved card sequence, moods, picture descriptions, exercise references, required feedback,
  correct answers and useful diagnostics for invalid content.
- `src/logic/lessonPlayer.test.ts`: progressive card gating, tap-to-place and Undo,
  correct answers, repeated misses, reveal after two misses, first-try scoring,
  native-choice selection state and a fresh practice run.
- `src/data/lessonServices.test.ts`: prerequisites, 40 XP, saved first-try scores,
  retries, conditional Learn reward, assisted completion, duplicate/concurrent
  calls, persistence and practice with no extra writes or XP, including later days.
- `src/pages/LessonPlayer.test.tsx`: initial card visibility, accessible progress,
  labelled Close, described inline art, Glaux, saved motion preference and radios.
- Browser checks cover keyboard use, actual scrolling and AGAIN, both exercises,
  two-miss SHOW ME, saved XP, and the 390/768/1280 px layouts. Device motion rules
  are covered by CSS; the saved Reduce motion switch is also checked in the browser.

## Task 7 additions

- `src/logic/glauxReactions.test.ts`: all event moods and approved speech, each
  hunch response, variants without immediate repetition, one-line pools, callback
  substitution, hint priority, twenty-percent sneeze boundary, no consecutive
  right-answer sneezes, deterministic results and unchanged inputs.
- `src/logic/lessonPlayer.test.ts`: hunch gating and four session-only choices,
  eight-card restart, retained missed discs, Undo/retry, and hints that do not add
  attempts or alter the existing score rules.
- `src/data/lessonContent.test.ts`: exact eight-card copy, unchanged exercises,
  required reaction pools, malformed hunch choices, missing/empty/duplicate pools.
  The content loader now reads thirteen files, including glaux-lines.json.
- `src/pages/LessonReactions.test.tsx`: one speech box, callback and five decorative
  stars, all text retained without particles under Reduce motion, missed/solved
  ladder states and SHOW ME gating. First-render tests check the hunch choices
  and absence of CONTINUE before a choice.
- Browser checks cover every hunch response, a first-try celebration and sneeze,
  nonrepeating missed lines, gentle/thinking/proud moods, hint, SHOW ME, Undo and
  retry, correct callback, 40 XP and unchanged practice rewards. Widths 390, 768
  and 1280 px fit without horizontal scrolling. Saved Reduce motion also updates
  the open lesson from another tab and stops owl, clue and ladder animations.
