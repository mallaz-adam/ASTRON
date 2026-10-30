# Chapter 1 / Unit 2: Our solar system

Implemented from the owner's 29-page PDF, with the editorial changes approved
on 30 October 2026. The PDF's production instructions are authoring context,
not learner-facing text. No source PDF is added to the repository.

## Reading and learning

The local manuscript is `public/content/our-solar-system.json`. It contains an
introduction, ten teaching steps, glossary definitions, optional practice,
feedback and source links. The shared `VisualUnit` reader loads it lazily.

The steps cover the Sun's family, reflected sunlight, the eight-planet order,
rocky worlds, gas and ice giants, cloud bands and rings, other moons,
asteroids and comets, Pluto, and a connected recap. Unit 1 completion unlocks
Unit 2; Continue on Unit 1's completion screen opens it directly.

Two optional practices use native selects with keyboard arrow-key support:

- Order the four inner planets, with the labelled reference picture still visible.
- Sort seven familiar objects into five groups, with feedback for each object.

Correct placements are kept, retries are unlimited, and Continue is always
available. Practice writes no scores or answers and grants no extra XP.
Finishing uses the existing reading-completion transaction, Learn quest and
replay protection. Temporary progress still resets on a full reload.

Unit 3 remains explicitly unprepared. The full ten-question evaluation belongs
after all six units. A pass mark and retry policy have not been invented.

## Visual and scientific choices

Ten compact NASA observation images are added; Earth, Sun and Moon reuse
the three existing local files. Alt text, image-processing notes, exact source
links and credits accompany the pictures. Rectangular cloud-band and ring
views remain rectangular rather than becoming misleading circular crops.
Processed Uranus and Neptune colours are not a natural-colour comparison.
All image processing predates this app; this app only resizes and compresses.

Original SVG and HTML diagrams explain family connections, separate example
moon paths and a comet tail directed away from the Sun. They are schematic,
labelled as not to scale and controlled by real buttons. There are no timers,
canvas loops or new libraries. Solid light arrows in Unit 1 remain distinct
from dashed orbit paths.

Pluto's main copy states that it belongs to the solar system and is a dwarf
planet. Orbital dominance and the meaning of 'cleared' appear only in the
optional explanation. The glossary wording is introductory, not a complete
formal classification. Distances and light-travel times remain later topics.

Phone stacks text and pictures; desktop pairs them. Definition controls retain
Close/Escape focus handling. Reduced motion disables decorative Glaux motion.
The introduction's explicit desktop grid placement prevents text/picture
overlap. Longer path labels wrap onto three short lines inside the hexagon.

## Media and checks

See `public/art/solar-system/README.md` and `provenance.json` for exact origins,
credits, original dimensions and download paths. New pictures total about
257 KiB. All teaching content, pictures, fonts and lazy reader chunks are
included in the production service-worker cache; reading makes no third-party
media requests.

Automated validation covers the local content and image references, planet
order, object-specific practice feedback, progression, unscored completion,
replay protection and title wrapping. Check commands, from `astron`:

```powershell
npm.cmd test
npm.cmd run build
```

The 30 October run passed 492 tests in 55 files and the production build.
All eleven reading views (introduction plus ten steps) were checked at 390,
768 and 1280 pixels: no horizontal overflow. Browser checks covered definition
opening/Escape, arrow-key selects, helpful missed-answer feedback, kept correct
placements, Unit 1 unlocking Unit 2, completion at 2 of 6 units, and the saved
Reduce motion setting reaching the reader. No browser errors were reported.

Offline check: a fresh production origin was loaded, its preview server was
stopped, and the page was reloaded. After the expected temporary-progress reset,
the welcome, Orion, Unit 1 and Unit 2 opened from the cache. Unit 2's new Jupiter
picture and reader rendered successfully with the server still stopped. The
production service worker precached 85 files, approximately 1.76 MiB. Physical
iPhone/Safari and VoiceOver checks still need a real device.
