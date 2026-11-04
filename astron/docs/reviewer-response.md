# Review response: first lesson clarity

4 November 2026. First implementation pass following the owner's approval of the
review analysis. This is a focused improvement to Unit 1 and the shared visual
reader, not a claim that every item in the review has been resolved.

## Implemented

- P5/P7: Unit 1 diagrams give a visible instruction before their controls. Live
  results sit immediately beneath the controls, above the large SVG. Native
  sliders retain arrow-key support and position descriptions; buttons expose
  their selected state. The orbit is visible from the beginning.
- P6: Sun/Earth question reveals say **Think about it · Optional**, with explicit
  Show/Hide explanation controls. Required practice remains a separate phase.
- P8: Three native dropdowns are replaced by a picture-based matching activity.
  One object is shown at a time, with native radio choices, role descriptions,
  chosen/not-chosen object controls and Next navigation. Changing objects focuses
  the new object heading and brings it into view when necessary. Correct and
  mistaken choices receive the existing targeted feedback. Review my choices
  retains answers; no dragging, timing or extra reward is required.
- P7: Practice feedback receives focus and scrolls into view after checking.
  Changes are immediate, so these actions introduce no reduced-motion exception.
  Matching and moonlight feedback use persistent, polite live regions.
- P9: A pure reading sequence counts introductions, teaching, each practice
  question and recaps together. Unit totals are 13, 13, 14 and 16 respectively.
  The shared top progress bar and footer count agree, including on Previous.
  This is reading position; saved completion and rewards still use existing rules.
- P10 (partial): Unit labels grow from 12 to 14 px. Existing 14–15 px captions and
  ink colours remain. This is not a whole-product contrast or accessibility audit.
- P14: Meet the Moon shows its real local observation as the primary visual.
  The repeated orbit diagram is removed from that screen; the next path screen
  still provides the controlled, labelled diagram.

No lesson science, content schema, database, XP, streak, chapter prerequisites,
evaluation policy, temporary-progress setting or runtime dependencies changed.
Photograph credits and source disclosures remain available. SVG pictures are
schematic and retain their limitations. No automatic diagram animation added.

## Verification

- 584 tests across 67 files pass. TypeScript and the production build pass.
  PWA build: 117 precache entries, 2816.80 KiB. The PWA callback completed slowly
  in this environment; this is not an app frame-rate or loading benchmark.
- Added tests cover Unit 1 positions around both practices, all four unit totals,
  each galaxy evidence question, separate recaps, Previous and invalid positions.
- Rendering tests cover picture matching, an incomplete-attempt guard, native
  radio labels, optional reveals, live results before diagrams and the single
  Moon observation. Existing misconception-feedback and completion tests pass.
- Browser walkthrough completed Unit 1 and opened Unit 2. Mistaken matching
  answers unlocked Continue after feedback; Previous retained answers; correcting
  them produced the approved success line. Keyboard radio arrows, Enter, slider
  arrows, Next-object focus, path switches, both light stages and the second
  practice's specific missed-answer feedback were exercised.
- Orbit, matching, sunlight and reflection layouts were checked at 320, 390,
  768 and 1280 px. No horizontal overflow or clipped checked controls; checked
  buttons and radio-label targets met 44 px. The phone orbit and sunlight result
  were visible directly below their controls and above the reading action bar.
- Screenshots from the walkthrough are in `output/reviewer-response/` locally.
  Minor final refinements (persistent feedback regions and a Review choices
  return) passed tests/build, but the final saved-motion browser check could not
  finish because the browser connection timed out. No new automated motion was
  added. Physical iPhone Safari and VoiceOver remain untested in this pass.

## Remaining review work

The [Orion and Today follow-up](orion-today-review.md) implements picture choices,
story illustration/character clarity and plain daily-activity explanations.
Whole-app vocabulary, beginner terminology pacing, the Betelgeuse prerequisite
assumption and broader visual consistency remain separate passes. Permanent progress remains
deliberately disabled during development, per the owner's instruction. Changing
reward rules, restoring persistence, expanding the myth or adding accounts is
not part of this implementation.
