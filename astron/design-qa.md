# Orion first journey: design and interaction QA

Date:25 October2026.
Final result: passed

## Scope and visual truth

Existing React/Vite/TypeScript/Dexie/PWA application, not a replacement prototype.
Source truth:
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/astron-bible-plan/orion-visual-review/orion-opening-phone-desktop-v2.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/astron-bible-plan/orion-visual-review/orion-discovery-phone-desktop-v2.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/astron-bible-plan/orion-visual-review/orion-ending-phone-desktop.png
- The accepted manuscript and interaction rules in the companion planning folder.

The owner explicitly approved using supplied artwork rather than generating
replacement illustrations. The implementation uses those actual approved image
files. The scientific chart is an intentional correction of the concept art:
separately sourced star positions replace generated chart geometry.

## Evidence and normalization

Primary comparisons were assembled and opened with BOTH reference and rendered
app in the same image. Reference is on the left; implementation on the right.
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/compare-opening-phone-final.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/compare-opening-desktop-final.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/compare-ending-phone-final.png

Earlier comparisons:
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/compare-opening-phone.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/compare-opening-desktop.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/compare-ending-phone.png

Raw reference boards are1536x1024. The relevant phone/desktop app rectangles
were cropped, scaled proportionately to the implementation capture's width,
then top-cropped to the same visible height. The source concept boards contain
approximate viewport proportions; these comparisons are composition checks,
not a claim of pixel identity or matching full-page scroll heights.

Measured CSS browser viewports:
-390x560: document scroll width375, no horizontal overflow.
-768x560: document scroll width753, no horizontal overflow.
-1280x720: document scroll width1265, no horizontal overflow.
The15px difference is the desktop browser's vertical scrollbar. Raster client
exports are375x538 for the phone captures and1265x712 for desktop; comparison
normalization records these effective capture sizes. There is no density
upscaling of the implementation. Full-page capture was unavailable in this
IAB surface, so viewport captures, normal scrolling and DOM geometry checks
were used. No missing full-page screenshot is presented as an actual capture.

Additional focused evidence:
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/phone-opening-controls.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/tablet-activity-correct.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/offline-phone-opening.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/offline-lesson.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/phone-ending-final.png
- C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/orion-build-2026-10-25/comparison-normalization.json

The lower control region was inspected separately. Keyboard focus landed on
Sources with a visible solid outline. The primary start action measured52px
high. Source links/wordmark were given44px target areas; native radio labels
provide the activity and goal touch targets.

## Findings, fixes and comparison history

### P1 — Final setup could bounce back into welcome
Initial browser action: setup saved, but navigating before liveQuery delivered
the new learner caused the home guard to see the previous incomplete snapshot.
Fix: await observed welcome completion before routing home.
Post-fix: a fresh production origin completed the full welcome and reached Today,
showing the real saved Learn and Discover records, one freeze and the chosen goal.

### P1 — Local lesson guard still used placeholder prerequisites
Review found the normal screens used the authored-content path while the local
lesson service could still evaluate the full developer path.
Fix: lesson services now validate against the same authored-content path.
Post-fix: an integration test completes Orion and the real lesson with only their
two completions, two unique stars, unchanged daily quest rules and55 total XP.
Existing full-course model/tool tests remain intact.

### P2 — Phone ending introduced the chart before the star name
Fix: move the name/collection heading above the plate in the phone reading order;
use explicit columns/rows to preserve the paired desktop composition.
Post-fix: phone-ending-final.png and the final combined comparison show the
name before the chart; the DOM regression test verifies that order.

### P2 — Help left a previous incorrect radio choice checked
Fix: after an independent or assisted resolution, the taught belt group is
selected in both the diagram and native radio group.
Post-fix: the production keyboard test and UI regression test show Group B
checked, a specific explanation and an enabled Continue action.

### P2 — Two Reduce motion switches could disagree on the goal step
Fix: use the public shared persisted motion switch throughout setup; remove
the duplicate local control.
Post-fix: one switch remains in the goal DOM. Toggling it set data-reduce-motion
to true and computed owl-eye animation to none. Preferences retained the choice.

### P2 — Cover hierarchy was smaller than the selected study
Initial combined comparison showed a weak cover title and distant focal weight.
Fix: raise the cover-title scale, lead text and Glaux speech scale; use a
contained crop of the actual supplied artwork and keep both observers visible.
Post-fix: final phone/desktop comparisons establish a clear illustrated cover,
with title and primary action legible. Actual Cinzel/IM Fell English metrics
remain authoritative over the concept generator's approximate typefaces.

## Required fidelity surfaces

Fonts/typography: local Cinzel and real IM Fell English regular/italic faces,
no fabricated bold. Browser computed heading family confirmed IM Fell English.
Readable manuscript paragraphs use the existing18–20px reading direction.
Cover display type has its own scale. The generator's approximate letterforms
are not copied as raster UI text.

Spacing/layout: square controls, fine double frame, native page scroll,
responsive paired/stacked arrangements. Headings receive focus on stage
changes. No persistent action is trapped inside a nested scrolling window.

Colours/tokens: existing parchment, ink, vermilion and lapis tokens retained.
Gold is decorative, not essential reading text. Graphic selection also uses
rings, native checked state and words; it does not rely only on colour.

Image quality/assets: compressed approved painting and supplied hunter, native
resolution retained in the shipped files, no newly generated replacement.
The source hunter is403x530 and remains a deliberately modest illustration.
Its baked chart lines are not used as scientific coordinates. The checked
chart is code-native SVG as required by the project's original technology
and the later scientific-accuracy correction.

Copy/content: complete accepted four-chapter prose, one consistent myth variant,
named scientific fact, specific hints/responses and no grade/penalty. The ending
copy says Your sky has begun rather than implying every returning reader has
no other stars. Source notes distinguish illustration, myth and astronomy.
The related article is an original sourced text, with the older article ID kept.

## End-to-end checks actually performed

- New isolated browser origin → welcome → all four chapters → collect star.
- Optional hunter/checked-chart switch and guided features.
- A missed choice gets a specific clue; Show Me explains and permits completion.
- Reload after help preserves the checkpoint and learned result.
- A second fresh production journey recognises the belt using ArrowRight and Enter.
- Interests/Steady or Full goal → Today; returning does not reopen setup.
- Read the connected article and save its Read quest.
- Replay through Stories → My sky still contains one Betelgeuse entry.
- Public Reduce motion → owl animation computed as none.
- Responsive width checks at390,768,1280; native52px primary action and keyboard focus.
- Production /dev and /design → ordinary not-found pages.
- Stop the production preview server; confirm its port refuses a direct HTTP
  connection; reload Stories and reopen Orion from the installed service worker.
- With that server still stopped, open lesson3 and choose a hunch; its next
  interactive card and local art render. My sky still opens with saved progress.
- Browser console error log empty during these successful online/offline flows.
- Automated tests:383 passing across36 files. Production build passes.
  Final offline precache:55 entries, approximately1.18MiB.

## Follow-up polish and practical limits

P3: the concept's feathered art boundary is approximated with a local CSS mask,
not a new AI repaint. Crops differ from the generator's reinterpreted image:
the approved underlying painting is preserved.

P3: the approved artwork's resolution limits extremely large zooms. Better
originals/credit identification can improve a later art pass. The existing
native star asset is reused in the wordmark instead of inventing a new logo.

These are desktop-browser checks, not physical iPhone, VoiceOver or an external
learning-effectiveness pilot. No site was published or GitHub push performed.
No unresolved P0/P1/P2 issue remains in this first-journey scope.

final result: passed
