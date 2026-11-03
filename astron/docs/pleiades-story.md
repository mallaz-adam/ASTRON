# The Pleiades: seven sisters

Implemented 3 November 2026 after review of the owner's Pleiades manuscript and
approval of the editing proposal. See [editorial review](pleiades-editorial-review.md).

## The experience

Stories now offers Orion and The Pleiades. The Pleiades opens with a credited
historical painting, followed by seven connected scenes with Continue and
Previous. The scenes keep the selected Hyginus sequence and explain unfamiliar
places or ideas in the sentence. Source uncertainties and adaptation notes sit
in Sources rather than repeatedly interrupting the tale.

The final scene leads to **Meet the real Pleiades**. A real ESO photograph can
be switched to an explicitly schematic **Cluster diagram**. Two optional
discoveries cover Atlas's burden and the differing counts of visible stars.
They use the existing discovery cue, keyboard controls and explored state.
Reading the optional details is not a completion requirement.

After **Light this star**, Alcyone appears in My sky. There is no Pleiades belt
exercise, quiz or score. The ending provides My sky and Back to stories. My sky
links back to the story. Opening the Pleiades course cell uses the same reader
and completion rather than another temporary page.

## Content and types

- `public/content/pleiades.json`: `kind: "illustrated"`, artwork descriptions,
  source notes, Glaux lines and the astronomy epilogue.
- `public/content/sample/chapters.json`: the seven narrative texts.
- Tale metadata uses `readerType: "illustrated"`, local `reader`, `cover` and
  required `coverAlt`. Omitted `readerType` retains the existing Orion reader.
- `IllustratedTaleData` is a separate branch of `TaleExperienceData`; it does
  not require invented Orion chart coordinates or activity choices.
- The reader checks that each numbered narrative scene has an illustration.
  Unsafe media/source paths and malformed artwork or discovery records are
  rejected before display. JSON text is rendered as text, not injected HTML.
- Existing IDs `pleiades-placeholder`, `pleiades-tale`, `alcyone` and `pleiades`
  remain unchanged to keep saved references valid. The word placeholder is only
  part of the stable internal ID and route, not the learner-facing story.

## Progress and rewards

Completion uses the existing `completeCell` and `lightStar` services in one
transaction. Existing tale behaviour grants Learn and Discover if not already
done that day; the story adds no new reward rule. Repeating it cannot duplicate
the cell, star or daily XP. Failed star saves roll back the completion and quests.

Illustrated stories advance from collection directly to the sky ending. Orion
still has its belt activity, and its first-visit preferences remain separate.
No progress field, index or database version changed. The approved temporary
development progress reset remains in effect.

## Visuals and access

The old atlas palette, fonts and page frame remain. Phone reading puts context
before each picture; desktop uses two columns. Active scene images load eagerly
and reserve their dimensions. The library cover loads lazily. The two cover
sizes, photograph and small static SVGs are local, with provenance documented
in [the art register](../public/art/pleiades/README.md).

New pictures do not move automatically. Glaux and discovery cues obey the saved
Reduce motion choice and device preference through the existing Page rules.
Pictures have text descriptions; native buttons expose pressed state; optional
details use native disclosures. Visible credits remain beside reused artwork.

## Verification

Automated coverage includes seven-scene content links and validation, local
asset sizes and descriptions, backwards navigation and resume, early collection
rejection, direct completion without an Orion quiz, duplicate rewards, transaction
rollback and preservation of the existing Orion star. Render checks cover story
prose, correct artwork, source credit, optional discoveries and the Alcyone ending.

Final results: **566 tests in 64 files pass**. `npm run build` passes, including
TypeScript and the production PWA with 115 precached entries (2800.22 KiB).
All 12 required Pleiades content/art files are present in that precache. Story
artwork totals 378,564 bytes, including both cover sizes.

The production browser check verified the cover and every scene at 390, 768 and
1280 px with no horizontal overflow. The epilogue and ending also fit all three
widths. The phone cover's full caption is contained in its frame. Tab gave the
next action a visible outline; Enter advanced scenes, switched pictures and
opened both optional details. Opening a detail removed its unseen cue. Space
toggled Reduce motion, after which the story had zero running CSS animations.
Alcyone appeared in My sky alongside the existing Betelgeuse.

With the preview server stopped, the app reloaded from its service worker,
completed the welcome, opened all seven Pleiades scenes, loaded both epilogue
pictures, and reached the Alcyone ending. No browser console warnings or errors
were recorded for that check. The existing update bar also applied the new build.
Local screenshots and browser records are in `output/pleiades-check/` outside
the app. Real iPhone/Safari and VoiceOver testing remains a separate device
check; browser viewport checks do not replace it.
