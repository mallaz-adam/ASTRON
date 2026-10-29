# Unit 1 verification - 29 October 2026

## Automated

- 472 tests pass across 52 files, including existing streak, quest, lesson and
  content tests and the new visual-unit cases.
- TypeScript and the production Vite/PWA build pass.
- New tests cover content validation, local described media, term linking,
  accessible controls, closed orbit geometry, specific practice feedback and
  transactional completion with no practice score or duplicate XP.
- Older chapter tests explicitly select their chapter rather than assuming
  every new learner should start in the older star-life chapter.

## Browser checks

- All ten steps visited using the real controls; exactly one teaching view and
  one visual region remain after each transition.
- Opened optional practice at step 6 and continued through steps 7-10. This
  verifies the correction for duplicate sibling keys that previously left an
  old illustration on screen. The practice and teaching view now use distinct keys.
- Gallery choices, wide/close path views, incoming and reflected light reveals,
  lamp comparison and recap connection reveal work.
- Orbit native range responds to ArrowRight and End, with meaningful spoken state.
- Definition opens, focuses Close, and Escape returns focus to the originating term.
- Matching preserves selections and gives specific feedback on mistakes and success.
- Moonlight choices distinguish reflected light from stored sunlight. Glaux changes
  from gentle guidance to proud feedback without adding a scored assessment.
- Keyboard Continue completes the unit. The path reports one of six units done;
  unwritten units and the chapter evaluation remain unavailable.
- Phone 390 px, tablet 768 px and desktop 1280 px checked, with no horizontal
  document overflow. Phone reading controls remain reachable above the bottom edge.
- Saved Reduce motion reaches the new page. Its diagrams remain controllable;
  all visual exploration is untimed. The shared device-preference hook and CSS
  also disable decorative motion. A physical iPhone test is still for the owner.

## Offline check

The production PWA was served at a fresh loopback origin to avoid a legacy
preview's service worker. After its first visit, the preview server was stopped.
Reload still opened ASTRON. The welcome journey, then the new unit, its three
local photographs and the reflected-light interaction worked with the server off.
The expected development-preview reset on reload was retained.

The generated service worker precaches 70 entries, including the new JSON,
reader chunks, WebP photographs and local fonts. No remote media requests are
required during a lesson. Production developer routes remain excluded.

Screenshots of the phone, tablet, desktop and offline views are retained in
the task's local artifacts. No public deployment was performed for this change.
