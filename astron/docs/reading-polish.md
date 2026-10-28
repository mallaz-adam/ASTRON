# Clearer reading and lighter visual hierarchy

28 October 2026. A focused refinement of the existing atlas, with no new
learning content, accounts, dependencies or progress rules.

## What changed

- Welcome explains Learn, Stories, Articles, Today and My sky before the Orion
  invitation, following the owner's final preference. Learn, Stories and Articles
  use simple rows rather than three competing bordered cards. Phone and desktop
  keep this same reading order, with one Orion action after the explanation.
- The story cover offers Begin/Resume before Glaux's extra guidance. Its phone
  image is shorter and shows the full painting rather than cropping out its sky.
  Full illustrations, descriptions and artwork credits are retained.
- Story chapters and the Scale reader share one reading-action component.
  Continue is primary; Previous is a quieter review control. At phone widths
  the actions sit within reach at the bottom. Their actual height is measured
  with ResizeObserver and reserved in page padding, including safe-area padding.
  Focusable controls get scroll clearance. On short screens (480 px high or less)
  and wider layouts the controls remain in normal document flow. If the PWA
  update banner is present, it owns the bottom edge and reading controls return
  to document flow. Unsupported ResizeObserver falls back to resize events.
- Reading metadata uses larger, ordinary text where small spaced capitals
  previously competed with the teaching. Heading, body and button fonts keep
  the established atlas identity.
- Sources remain accessible native disclosures with visited/unvisited status,
  but use a quiet style. Gold ripples and Tap to explore remain on genuine
  discovery controls and optional practice.

## Performance work

One shared IntersectionObserver pauses decorative SVG motion and gold ripples
outside the viewport. The document visibility event also pauses decorative
motion when the browser tab is hidden. Observers and listeners are released
when the last subscribed element unmounts. Without IntersectionObserver, the
fallback still respects hidden tabs. Existing saved/device Reduce motion rules
continue to stop movement entirely.

The painting's high fetch priority is reserved for its cover. Secondary painting
views load lazily, with asynchronous image decoding and responsive source sizes.
The article cover also decodes asynchronously. All existing artwork remains local
and the service worker still precaches the complete app and authored content.

Development tools load only in development and have separate chunks. They and
their dedicated styles are excluded from the production entry. The preceding
production entry was 470.86 kB JavaScript and 50.30 kB CSS; the final revised build
is 454.82 kB and 46.55 kB respectively. These are bundle sizes, not measured
improvements in loading time or scrolling frame rate on a physical phone.

## Verification

450 tests across 49 files passed. Coverage includes one shared motion observer,
offscreen/hidden states and cleanup, the observer fallback, quiet source
disclosures, first-action reading order, retained story paragraphs, local tool
loading and production not-found routes. Existing reward and progress tests pass.

Browser checks covered the welcome, story entry, all four chapters, discovery
opening, Sources links, chapter Previous/Continue, the belt activity, preferences,
Today, the course, all sixteen Scale steps and its next-lesson handoff. All Scale
steps were checked at 390, 768 and 1280 px without horizontal overflow. Story
checks also covered 320 px and a 390-by-480 short viewport. Native keyboard
activation and focus clearance above the phone action bar worked. Saved Reduce
motion stopped the visible SVG animations and discovery cues.

The earlier action-first iteration was checked at 390 by 800; the final welcome
puts the platform explanation before Orion. Source-link focus remained above
the reading action bar. Decorative Glaux/Sources
elements offscreen reported inactive while the visible discovery remained active.

The real PWA update notice appeared after publishing a second local build. While
it was visible, the reading bar returned to normal flow; REFRESH installed the
new build successfully. With the verified local preview server then stopped and
its port closed, a fresh document load, the complete Orion journey, local art and
fonts, and the lazy-loaded Scale reader all worked from the cache. The preview
server was restarted after the check.

Physical iPhone, VoiceOver, large text and actual slow-device timing remain useful
device checks. The full chapter evaluation is still Coming later, and the new
Light and distance manuscript remains a review document rather than a live lesson.

## Phone check

1. Start a fresh visit. Learn, Stories, Articles and the daily orientation should
   appear before the Orion invitation on both phone and desktop.
2. Open the story. Its start button should appear before Glaux's guidance.
3. Read a chapter, scroll to its end and open Sources. Every final line and link
   should be reachable above Continue, with room for the home indicator.
4. Rotate the phone. The reading action bar should return to the page on a short
   landscape screen.
5. Open Scale of the cosmos and explore a diagram. Continue and Previous should
   work, and reduced motion should retain all words and controls.
6. After an online visit, reopen the installed app offline and try the journey.

Temporary progress continues to restart on a full page load. The separate
permanent database and all XP, streak, freeze and star rules are unchanged.
