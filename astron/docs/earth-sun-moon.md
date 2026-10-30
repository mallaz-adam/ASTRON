# Chapter 1 / Unit 1: Earth, the Sun and the Moon

Source manuscript: the owner's revised 31-page PDF, approved on 29 October 2026.
This is a teaching implementation of that manuscript, not a reproduction of the
production instructions or a claim that every proposed drawing was supplied.

## Content and navigation

`public/content/earth-sun-moon.json` holds the introduction, ten teaching steps,
selected glossary definitions, optional practices, targeted feedback and sources.
The shared lesson metadata uses `readerType: "visual-unit"`. The reader and its
styles are lazy-loaded by the existing `/cell/:id` route.

Chapter metadata remains in the legacy `Unit` table. The first chapter is now
`our-place`; its first lesson cell is `earth-sun-moon`. Unit 2, Our solar system,
is now playable and unlocks after Unit 1. The four remaining units are
placeholders, explicitly described as being prepared, not functioning lessons.
The final evaluation is reserved for ten questions across all six units. No pass
mark, retry policy or cross-chapter exam unlock has been invented. Earlier authored
lessons remain accessible at `/learn?chapter=first-sky` for development testing.

## Learning behaviour

- Introduction, ten manageable steps, then completion; one primary Continue.
- Definitions appear only on the first marked mention of a selected term in a step.
- Definition controls are buttons; opening focuses Close, and Escape restores focus.
- Orbit movement uses a native range input, including arrow keys and spoken state.
- Path and light reveals use real buttons. No drawing gesture is required.
- Matching uses labelled native selects; moonlight practice uses native radio inputs.
- Specific feedback preserves correct selections and supports unlimited retries.
- Optional practices store no answers, scores or extra XP.
- `finishReadingLesson` uses the existing transaction and reward rules. Repeated
  presses and replays do not duplicate completion or quest rewards.
- Existing development-preview progress reset behaviour is unchanged.

## Visual and scientific boundaries

Photos identify the objects. Original SVG diagrams explain their paths and light.
Gradients, irregular strokes and a static hatch pattern create the painted atlas
finish; no generated bitmap art, WebGL, canvas loops or new packages are needed.
Body sizes and separations are schematic and labelled as such. Near-circular
orbit tracks are not numerical simulations. Wide and close views use separate
scales. Light paths are solid, directional arrows; orbit tracks are dashed.
The Moon is offset from the Sun-Earth line and shaded towards the light source.
The lamp/wall comparison concerns light only and never treats the Moon as a mirror.

The manuscript's short planet definition is introductory, not the complete formal
classification. "Hot gas" is beginner shorthand for the Sun's plasma. These
qualifications stay in editorial notes rather than adding topics to the first unit.

All exploration is learner-controlled and untimed. Reduced motion retains the
same controls with immediate changes; Glaux's decorative motion is disabled.
Phone uses a single column; desktop pairs text and pictures. Existing reading
actions reserve their measured space above the phone's bottom edge.

## Media provenance and changes

All three pictures were downloaded from the exact NASA source pages below,
resized to a maximum of 640 pixels and compressed as WebP. No recolouring was
applied. The gallery displays circular views with the original observation labels.
The Sun's processed colours are explicitly described. Combined picture payload
is approximately 144 KiB. Each photograph has alternative text and accessible
credits in the lesson. See NASA's asset-specific information and usage guidelines;
these images are not represented as having a blanket Creative Commons licence.

| Local file | Original source | Credit |
| --- | --- | --- |
| `public/art/earth-sun-moon/earth.webp` | https://science.nasa.gov/resource/the-blue-marble/ | NASA Johnson Space Center; Apollo 17 AS17-148-22727 |
| `public/art/earth-sun-moon/sun.webp` | https://science.nasa.gov/photojournal/image-of-sun-from-nasas-solar-dynamics-observatory/ | NASA/GSFC/Solar Dynamics Observatory; PIA26681 |
| `public/art/earth-sun-moon/moon.webp` | https://science.nasa.gov/resource/lunar-near-side/ | NASA/Goddard Space Flight Center/Arizona State University |

NASA media terms: https://www.nasa.gov/nasa-brand-center/images-and-media/
No NASA logos or endorsement claims are included.

The PWA precaches local JSON, WebP images and the reader's JS/CSS chunks. Reading
does not fetch third-party media. Source links open externally only on request.
