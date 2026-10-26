# Optional detail discovery cues

26 October 2026. The project owner chose soft gold to match the atlas.

An unopened expandable detail has a small gold light, a slowly expanding and
fading circle, and a soft glow behind its ink label. The native disclosure
arrow remains visible. Gold is decorative and never replaces readable ink.

Opening the detail immediately removes its light and glow. Closing it, changing
chapters or reloading does not bring the cue back. An optional `exploredDetails`
array on the existing learner record remembers opened IDs on this device.
Opening is recorded, not proof of reading or understanding. Existing exports
include it and Erase my progress clears it. The existing schema/index version,
XP, quests, answers, stars and streak rules are unchanged.

Applied consistently to the chapter notes, pattern descriptions, tale sources
and article sources. The approved visible wording is unchanged. Screen readers
get an unopened/previously opened description, in addition to the native
expanded/collapsed state.

Reduce motion, including the device preference, stops the circle animation.
The still marker continues to identify unopened content. Enter and touch/mouse
clicks retain the native details behaviour, with a clear focus outline.

Validation: 396 tests pass across 39 files and the production build succeeds.
Browser checks cover Enter-to-open/close, immediate removal of the glow,
persistence after reload, independent chapter IDs, click-to-open, a still ring
with saved Reduce motion, and no horizontal overflow at 375, 390, 768 and
1280 px. Storage tests cover concurrent updates, compatibility with old learner
records, preservation of progress/settings, existing export and erase behaviour.

Physical iPhone and VoiceOver verification remain part of the tester check.
