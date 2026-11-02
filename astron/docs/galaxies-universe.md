# Chapter 1 / Unit 4: Galaxies and the universe

Implemented from the owner's 13-page review manuscript, reviewed on 2 November
2026. The original PDF remains unchanged. Editorial instructions are not learner
copy. The [editorial review](lessons/unit-four-review.md) documents the corrections.

## Reading and practice

The local manuscript `public/content/galaxies-universe.json` has an introduction,
ten teaching parts and a separate three-point recap. It reuses the illustrated
reader, definition controls, local reading completion service and Reduce motion.
The existing `galaxies-universe` cell and `unit-galaxies-universe` lesson IDs remain.

Two dedicated practice phases follow the relationship map and reconstruction
parts. The first reasons about our place in the universe; the second interprets
what picture sizes, processed colours and a reconstruction can establish. This
second practice deliberately goes beyond Unit 3's image-type matching.

The owner's newer decision supersedes the PDF's optional-practice presentation:
each question needs an attempt and feedback, not a correct answer, before
Continue. The same dedicated-phase behaviour applies to the existing two
practices in Units 1–3. Going back retains the current session's form state.
Practice remains ungraded and creates no Answer records, separate XP or stars.
The evidence practice presents one question at a time. Continue advances to the
next question after feedback; Previous retains earlier answers. It does not
stack three exercises into a long phone page.

Completing Unit 3 now leads directly here. Completing Unit 4 records four of six
teaching units done. Units 5–6 and the chapter's ten-question evaluation remain
forthcoming. No unfinished chapter is unlocked or fabricated, and the approved
future chapter-evaluation gate is not claimed as implemented in this task.

## Media and refinements

- Andromeda's text uses the ground-based Andromeda observation, not M51.
- Four new small local WebP observations total 276262 bytes. Full provenance,
  credits and licences are in `public/art/galaxies/` and visible with each image.
- The existing ESA Gaia reconstruction is reused with its separate licence.
- Original diagrams explain membership, material and selected spiral features.
  They are labelled schematic, not measured positions, borders or true colours.
- Keyboard buttons select material and compare a real M51 feature with a drawing.
  Gold overlays are explicitly ASTRON teaching annotations.
- The observable-universe part briefly explains light travel without introducing
  premature numerical cosmology, a physical universe wall or a complete map.
- The introduction puts the purpose before the map on a phone. The shared atlas,
  approved opening animation, chapter rules and temporary progress policy remain.

## Verification

Tests cover local manuscript validation, semantic media labels, definitions,
practice feedback/attempt rules, separate recap, Unit 3 prerequisites, completion,
replay and unchanged quest XP. The full suite currently has 547 passing tests in
62 files. Production TypeScript/Vite/PWA build succeeds with 102 cached entries.

Fresh browser checks exercised the eight practice phases in Units 1–4. All
Unit 4 reading, practice, recap and completion views were measured at 390, 768
and 1280 pixels: no horizontal overflow or missing images. They also checked
keyboard radio/button operation, definition Escape/focus restoration, selected
feature feedback, reduced-motion state, retained answers and four-of-six progress.
The new desktop-layout recommendations are kept in the local recording review
under `output/desktop-recording-review/`; broad media-layout changes remain
proposals. Physical iPhone/VoiceOver checks are still real-device work.

Offline verification used the final production build on a fresh local origin.
After its first visit, the preview server was stopped and the app reloaded from
cache. The welcome, Units 1–3 and all their revised practices worked. Unit 4 then
completed its introduction, ten teaching parts, four individual practice-question
screens and recap, with all observations loaded and no horizontal overflow or
console warnings/errors at the production browser's 1280-pixel viewport. This
is a server-disconnection test, not a claim that an actual iPhone was tested.

Unit 4's duration label is a provisional ten-minute editorial estimate, to check
with real learners. New observation files total about 270 KiB. The final PWA
precache contains 102 entries, approximately 2.35 MiB.
