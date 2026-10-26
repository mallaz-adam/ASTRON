# Phone reading improvements

26 October 2026.

The approved wording and the 4.9-second name, Glaux wave and entry sequence remain unchanged.

## Changes

- Each chapter starts with its existing opening paragraph, followed by its illustration and remaining paragraphs. A regression test checks that every approved paragraph appears exactly once and the opening precedes the illustration.
- Phone hunter illustrations fit within 200–260 px. The landscape picture is also shorter; star charts retain their full map and use larger labels on phones.
- Chapter controls use two equal, 52 px tall buttons with the chapter count above them. A chapter with only Continue gives that button the full row.
- Phone headers and Glaux speech boxes use space more efficiently. Reading text remains 18 px, and the close button remains 44 px.
- The star fact appears before its chart, so the learner has an explanation before exploring the picture.
- The page content, decorative frame, skip link and opening greeting respect all four device safe-area insets. The viewport enables edge-to-edge display while reserving space for the iPhone cutout and home indicator.

Safe-area implementation follows [WebKit's guidance](https://webkit.org/blog/7929/designing-websites-for-iphone-x/). No zoom restriction is added to the viewport.

## Checks completed

- At a 390 × 700 viewport, the first paragraph moved from approximately 765 px to 203 px from the top.
- Portrait widths 375, 390 and 430 px; tablet 768 px; desktop 1280 px; landscape 844 × 390 px: no horizontal document overflow.
- Opened all four chapters, switched the hunter illustration to the chart, selected Betelgeuse, opened the star and completed the belt activity on the local test origin.
- Previous chapter and Continue are equal width, 52 px tall, with a visible keyboard focus ring. Enter advances the story.
- Opened the real lesson at portrait and landscape sizes. Its inner scroll area stays inside the viewport. Selected a hunch and used the heat slider with the keyboard.
- Course navigation and Today still work at phone and desktop widths. No browser console errors during these checks.
- All 390 tests passed across 37 files. The production build passed and includes the updated content and local assets in the offline precache.

## Physical iPhone check

These are desktop browser viewport checks, not a physical iPhone or VoiceOver certification. On the iPhone, open the test link in Safari, accept REFRESH if the update bar appears, then check:

1. The top controls clear the status bar and cutout.
2. The story begins with a readable paragraph before its picture.
3. Previous chapter and Continue are easy to tap and clear the home indicator.
4. Rotate the phone, open lesson 3 and move the heat slider.
5. Open the installed app after one online visit, then try it in airplane mode.

Progress, XP, quests, saved stars, IDs and database rules are unchanged by this layout pass.
