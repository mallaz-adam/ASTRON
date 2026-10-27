# Optional detail discovery cues

26 October 2026. The project owner chose soft gold to match the atlas.

Updated 27 October 2026 after phone testers missed the original small light.
An unopened detail now has a shaded parchment header, the visible instruction
`Tap to explore`, and a 20 px star medallion with a stronger gold halo. Two
staggered rings expand outward to about 70 px and fade over a 3.6-second cycle.
The native disclosure arrow remains visible. Gold is decorative; labels and
instructions remain readable in ink, and motion is not the only action cue.

Opening immediately removes the rings, halo, shading and tap instruction.
Closing it or changing chapters does not bring the cue back during that visit.
An optional `exploredDetails` array on the learner remembers opened IDs.
The current development mode resets all temporary progress on a full page load,
so its cues reappear for a fresh test. A future persistent build retains the
opened IDs across reloads. Earlier permanent progress is left untouched.
Opening is recorded, not proof of reading or understanding. Existing exports
include it and Erase my progress clears it. The existing schema/index version,
XP, quests, answers, stars and streak rules are unchanged.

Applied consistently to the chapter notes, pattern descriptions, tale sources
and article sources. The original titles and content are unchanged. Screen readers
get an unopened/previously opened description, in addition to the native
expanded/collapsed state.

Reduce motion, including the device preference, stops both ring animations.
The still marker and tap instruction identify unopened content. Enter and touch/mouse
clicks retain the native details behaviour, with a clear focus outline.

Validation: 416 tests pass across 43 files and the production build succeeds.
The component tests check that the actionable hint appears only for unopened
details. Browser checks cover Enter-to-open, Space-to-close, immediate removal
of the hint/glow, quiet ink labels after closing, independent chapter IDs and
both rings reporting `animation-name: none` with Reduce motion enabled.
At 375, 390, 768 and 1280 px there is no horizontal overflow. Unopened headers
measure 72–73 px high. Existing storage and reward tests continue to pass.

Physical iPhone and VoiceOver verification remain part of the tester check.
