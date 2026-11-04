# Reading, actions and navigation: comfort pass

Completed 4 November 2026, following the owner's request to improve the existing
platform before adding more course material. The selected visual target remains
the existing parchment atlas, square controls, thin ink rules, Cinzel labels,
IM Fell English reading text, original artwork and quiet Glaux presence.

## What changed

- Articles have an actual **Read the article** link styled as a primary button.
  Its category, reading time, title and summary appear together. The action is
  available before the image on phones, rather than below a long credit block.
- The Betelgeuse article has three named sections and an **In this article**
  guide. Each guide control has a real fragment URL, moves keyboard focus to
  its heading, and scrolls to that heading. Back to top and All articles are
  available at the end; a desktop section guide stays alongside the reading.
- The complete original prose remains in the same order. Optional `sections`
  metadata must reproduce `body` exactly when its texts are joined. Validation
  rejects missing prose, duplicate or unsafe IDs, and incomplete sections.
  Older articles without sections still work.
- Today puts the next learning action directly after its heading on phones.
  The desktop keeps its existing two-column quest and streak layout. Tablets
  use a wider reading area instead of the narrow phone-width column.
- Below 1024 px, the five main tabs remain at the bottom of the viewport.
  Pages reserve room for them, including the phone home indicator. The active
  destination has a visible rule and filled background as well as its colour
  and `aria-current`. The article reader now includes the same navigation.
- Return, explore, chapter, Previous and source-disclosure controls have clear
  bordered shapes. Inline definitions and source citations retain their reading
  conventions. Preferences' return control has the correct **Back to Today**
  accessible name.
- The phone welcome has tighter spacing while retaining all three area
  explanations before Orion. At 390 x 844, Meet Orion fits in the opening view.
- Page arrivals use a short opacity fade; buttons provide brief hover/press
  feedback. No wheel or touch scrolling is intercepted. Section scrolling is
  initiated by the reader and becomes immediate with either reduced-motion
  preference. The page fade does not transform a parent of fixed navigation.

## Performance work and its limits

The article route and its styles load when requested. The production build now
places them in separate files: article JavaScript 6.31 kB (2.20 kB gzip), article
CSS 2.98 kB (0.94 kB gzip). The initial application JavaScript is 295.27 kB,
compared with 297.75 kB at the previous story milestone. This is a small measured
bundle change, not a claim of a large speed improvement or a frame-rate result.
The PWA still precaches those files so they are available offline.

Library cover images load lazily; the active article picture loads eagerly.
Images reserve their dimensions and retain the original local, credited assets.
The existing 50,310-byte ALMA cover was already small, so no larger replacement
or image-generation dependency was added.

The device clock now cancels its periodic checks while the document is hidden.
Returning refreshes the real local date immediately before scheduling the next
check. The existing local-midnight and timezone-check behaviour continues while
visible. Tests cover hidden periods, cleanup, returning on a later date, and a
midnight wake-up. Decorative motion already pauses off-screen and in hidden tabs.

No accounts, analytics, remote progress storage or new runtime library was added.
The working development progress reset and the existing reward services continue
to apply. Article completion uses the existing markArticleRead service and
restores a first-read-today confirmation from the observed records on return.

## Evidence and validation

Fresh baseline captures and notes are in `output/experience-polish/`. The audit
and implementation review cover these steps:

| Step | Baseline finding | Result |
| --- | --- | --- |
| 1. Welcome, phone | The first story action fell below the initial viewport. | Clearer: compact explanations preserve their order and expose Meet Orion sooner. |
| 2. Today, phone | The next learning action and main navigation were below the first view. | Clearer: the learning action is near the heading and main tabs stay reachable. |
| 3. Article discovery, phone | Read the article was decorative text; a stretched title link did the navigation. | Clearer: a real, labelled primary link appears beside the summary. |
| 4. Article reading, phone | Long prose had no section guide and the reader lacked main navigation. | Clearer: three sections, working guide links and persistent navigation. |
| 5. Article reading, desktop | The article had no guide for returning to a particular idea. | Clearer: a bounded reading column with a sticky section guide. |
| 6. Course path, desktop | The inactive chapter looked like underlined prose. | Clearer: explicit chapter controls and consistent return/Previous buttons. |

There were 32 production layout checks: Today, Learn, Stories, Articles,
My sky, article reading, lesson introduction and lesson reading at 320, 390,
768 and 1280 px. Those checks found no horizontal overflow, clipped action
controls, underlined navigation actions or action targets shorter than 44 px.
The phone/tablet main tabs remained inside the viewport; desktop navigation
remained in the header. The article section target landed approximately 24 px
below the viewport top and received keyboard focus.

Keyboard checks used native links/buttons, Enter, Tab and Space. Mark as read
worked and its confirmation survived navigation away and back. The saved Reduce
motion choice resulted in zero running CSS animations and an immediate section
jump. Lesson Continue, Previous and Back to the path worked after the styling.

Automated validation: **577 tests in 66 files pass**; TypeScript and the Vite/PWA
production build pass. The PWA contains 117 precached entries (2811.48 KiB).
The update bar offered the final build and REFRESH loaded it. With the local
preview server stopped, a full reload opened the welcome; the normal Orion
journey, deferred article route and article section links worked. The local
cover loaded, both font checks passed, and no warnings or errors were captured
in that final article walkthrough. This is a desktop browser offline check,
not a physical-phone result. Detailed screenshots and layout results are in
the accompanying local review under `output/experience-polish/`.
Physical iPhone Safari, VoiceOver, device-specific scrolling performance and
network/CPU-throttled profiling remain separate checks. Screenshots and these
browser checks do not establish full accessibility compliance or an FPS claim.
