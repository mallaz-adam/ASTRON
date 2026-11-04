# Orion and Today: review follow-up

4 November 2026. Implements the owner's approved next pass: improve the first
Orion journey, then clarify Today. The parchment atlas, existing painting and
hunter artwork, temporary progress and reward rules remain in place.

## Orion

- Names Gaia where the Earth goddess enters the story. Explains Artemis's care
  for Orion and request to Zeus, keeping the scorpion version of the myth.
- Adds a short aftermath to Orion's death and keeps both figures in the ending.
  These are original retelling sentences, not quotations or a new myth version.
- Replaces the unrelated valley picture in The Scorpion with an original local
  SVG of a scorpion. The figure is explicitly imagined, not a scientific chart.
- Chart switches have instructions and an immediate response before the picture.
  The full scientific chart still uses the sourced J2000 positions.
- The belt activity uses three native buttons containing star-pattern pictures,
  replacing the indirect radio list. Each button has an equivalent descriptive
  accessible label, selected state and visible check. Pictures use a common scale
  and preserve the shapes of the sourced point groups.
- This is recognition practice with Hint, Show me and specific retry feedback.
  It is not individual-star tapping: choosing complete pattern pictures avoids
  overlapping touch targets around the closely spaced belt stars. No new
  assessment score, reward gate or time limit is introduced.
- The whole chart can be opened before answering and expands after success/help.
  Feedback has a persistent polite live region and learner-triggered, immediate
  focus/scroll handling. New pictures and controls add no automatic animation.

Story sources checked 4 November 2026:

- [Pseudo-Hyginus, Astronomica 2.26, translated text on Theoi](https://www.theoi.com/Gigante/GiganteOrion.html):
  Earth/Gaia sends the scorpion; Artemis's affection explains her request to Zeus.
- [NASA, Discovering the Universe Through Orion](https://science.nasa.gov/universe/stories/quick-reads/discovering-the-universe-through-the-constellation-orion/):
  retained astronomy context. No new live visibility or opposite-horizon claim added.

## Today

- Continue learning opens the next authored lesson directly. When all currently
  authored units are complete it opens the path, without claiming a new lesson
  is available or sending the learner automatically back to Unit 1.
- Today’s activities come before the sun on phones. Desktop keeps the sun on
  the left and activities on the right, below the main learning action.
- Each activity explains its completion action. Stories explicitly count towards
  Learn too; each daily activity still counts only once.
- A uniquely matching saved completion/read timestamp can identify the source
  beside a completed activity. Replays or ambiguous timestamps say Done today
  rather than guessing. Other learners' records are ignored.
- XP and daily rules move into the closed Daily goal and XP disclosure. Per-row
  XP is hidden on Today; the shared QuestRow still shows it by default elsewhere.
- Today, onboarding goal choices and Preferences use activity/activities instead
  of quest/quests. Internal table names and the daily reward values are unchanged.

## Validation and limits

592 tests in 67 files pass. TypeScript and the Vite/PWA production build pass;
118 precache entries, 2824.52 KiB. New tests cover pattern shape/common scale,
picture-button states and help, story/illustration changes, direct next-lesson
links, completed-path fallback, exact/ambiguous completion attribution and quiet XP.

Browser checks reached The Hunter, The Scorpion, Among the Stars and Look Up.
The star-chart switch and Betelgeuse control worked with Enter. Scorpion layout
geometry was checked at 320, 390, 768 and 1280 px without horizontal overflow or
clipped checked controls; a full desktop screenshot was saved and inspected.
A phone guided-chart screenshot was also captured.

The browser connection then failed, including on read-only state retrieval.
Final interactive belt activity, Today responsive layout and saved Reduce motion
checks could not be completed in this pass. Rendering/service tests pass, but
they do not replace those browser checks. No physical iPhone or VoiceOver claim.
Local evidence is in `output/orion-today/`; the initial narrow-panel desktop
capture is rejected in favour of `01-scorpion-desktop-full.png`.

No database schema, progress mode, quest rewards, streak rules, accounts,
analytics, external media requests or runtime dependency was added.
