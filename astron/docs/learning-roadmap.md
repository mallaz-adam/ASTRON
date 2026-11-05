# Learning roadmap — 5 November 2026

## What the learner sees

Learn now begins with one primary Begin/Continue action pointing directly to the
next available lesson. The chapter selector and the selected chapter's ordered
units follow it. On a computer they sit side by side; on a phone the chapter
selector comes before the units. Small hexagonal number markers retain the
atlas identity while readable text replaces the large interactive honeycomb.
The Honeycomb design component and its geometry tests are retained.

Chapter buttons preview the contents even when a chapter is locked. Choosing a
chapter does not award progress. Selection is reflected in `?chapter=…`, works
with browser history, and moves keyboard focus to its heading. Unknown chapter
IDs fall back to the current chapter. Unit and chapter states have words and
icons, so colour is not the only cue.

- **Available / Ready to begin:** authored content that the learner can open.
- **Completed:** existing completion, with a full-row Review link when authored.
- **Locked:** authored content blocked by earlier learning or a chapter gate.
- **Still being prepared:** content that has not been authored. It has no link
  or pretend completion action in the normal roadmap.

Completion and readiness have separate counts. Chapter 1 shows all six planned
units, four ready units, and its unfinished evaluation. Finishing the four ready
units does not pretend that the six-unit chapter is complete. When there is no
next lesson, a clear waiting message replaces the primary action.

## Chapter gates and evaluation boundary

`buildLearningRoadmap` in `src/logic/learningRoadmap.ts` reads the existing local
completion records. A chapter is complete only when all its planned non-quiz
cells are authored and completed, and its authored final quiz has a completion.
There is no minimum score. Gates are cumulative: a completed later chapter
cannot skip an unfinished earlier chapter. Placeholder quiz completions do not
unlock a chapter. Duplicates, unknown IDs and other learners do not add progress.

The normal Cell route, lesson answer/completion services, reading-next links and
Today's Continue destination use the same gate. A completed authored lesson
remains reviewable even if its chapter is now locked. Stories remain independent
through Stories and the welcome, without inventing science prerequisites.

The ten-question evaluation player, submission validation and final question bank
are **not authored by this change**. There is no working evaluation link in the
current sample content. Future authoring must implement the real ten-question
submission flow before setting its lesson as authored and writing its completion.
Future-ready evaluation fixtures test the read-side gate; they are not shipped
curriculum or a claim that a real exam was submitted in the browser.

The older `buildCoursePath` remains a per-chapter helper for developer tools and
the original geometry/reward tests. It is not the normal chapter permission
model. Those tools can still exercise temporary placeholders; this does not
make them available in the learner's roadmap. No database migration, XP change,
new star, account, server or permanent storage policy is introduced.

## Validation

- 610 tests in 68 files passed, including chapter unlock boundaries, unfinished
  content, replay, duplicate/foreign progress, content immutability, the primary
  action, visible states, normal service rejection and preserved story rewards.
- The TypeScript production build passed and the PWA generated its precache.
- Browser check entered through the real welcome and Orion flow. Keyboard Enter
  selected the belt picture and submitted it, then reached Today and Learn.
- Chapter selection with Enter moved focus to the chapter heading. Tab exposed a
  visible solid focus outline. The primary Begin opened Unit 1 normally.
- At 320, 390, 768 and 1280 CSS pixels, the locked chapter overview had no horizontal
  overflow, clipped chapter/unit/evaluation panels, or checked active controls
  below 44 by 44 pixels. Phone and desktop screenshots were inspected.
- The browser check used the saved Reduce motion preference; the roadmap adds no
  automatic animation. A real iPhone and VoiceOver check are still needed.

Evidence is local under `output/chapter-roadmap/`, outside the shipped app. These
checks are selected layout/keyboard checks, not a complete accessibility or
performance audit. This change is local until it is pushed and deployed.
