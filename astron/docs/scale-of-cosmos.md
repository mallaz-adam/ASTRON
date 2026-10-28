# Scale of the cosmos: teaching and optional practice

Updated 28 October 2026 to follow the confirmed chapter-level evaluation
structure. The current policy is in [learning-structure.md](learning-structure.md).
The original lesson ID `patterns` and cell ID `orion-lesson` are preserved.

## Content and navigation

`public/content/lesson-01.json` contains eight substantial teaching sections,
a question bank, two optional practice mappings and six primary sources.
`public/content/sample/exercises.json` holds the canonical questions, options,
answer keys and explanations. Each scale question has zero extra XP.

The lesson teaches our cosmic address, the Sun and its system, proportional
models, reading scientific images, interstellar gaps, the Milky Way and the
wider universe. Code-drawn diagrams explicitly describe their simplifications.
They are not presented as photographs or maps of observed positions. The
learner controls diagram changes, and Reduce motion stops Glaux's animation.

The reader renders one section at a time in normal document flow, with no
inner scroll viewport or snapping. Previous/Continue and a native contents
selector provide navigation. Intentional navigation focuses the section heading.
The recap finishes with **Finish lesson** rather than an individual exam.

## Practice and completion

The model and galaxy sections each offer **Try this idea (optional)**.
A native radio choice and Explore the answer button reveal a kind response
and explanation. Practice is not scored, never blocks Continue/Finish, writes
no assessment answers and awards no extra XP.

`finishReadingLesson` completes the individual lesson and can meet the existing
Learn quest once. Concurrent clicks and later replays do not duplicate rewards
or rewrite an earlier completion. Storage failure rolls back the transaction.
Older scores and saved answers remain untouched even though the new reader no
longer requires an individual exam.

The eight-question scale bank and its pure grading helper remain authoring
material for future chapter work. Two bank questions provide the optional
practice. There is no full evaluation or diagnostic score after this lesson.
The chapter-wide evaluation is reserved for the end of How stars live and die
and stays marked Coming later while the chapter's other lessons are unwritten.

Normal course navigation proceeds to the next authored lesson after reading.
Lesson 2 is still unavailable; the current authored path proceeds to lesson 3.
Development progress still resets on a full page load, using the separate
working database described in development-preview.md.

## Scientific model and sources

The slider uses NASA source values: Sun diameter 1,400,000 km, Earth diameter
12,800 km, mean Earth–Sun distance 149,600,000 km, Neptune–Sun distance
4,495,000,000 km, and nearest-star distance about 265,000 au. A 10 cm model Sun
gives Earth about 0.9 mm, a 10.7 m Earth gap, a 321 m Neptune gap and a 2,832 km
nearest-star gap. Teaching prose rounds these to 1 mm, 11 m, 320 m and roughly
3,000 km. Practice explicitly supplies rounded model figures when assessing
proportional reasoning rather than numerical recall.

Sources researched for the draft on 27 October 2026:

- https://science.nasa.gov/solar-system/skywatching/night-sky-network/solar-system-galaxy-universe-whats-the-difference/
- https://science.nasa.gov/sun/facts/
- https://science.nasa.gov/resource/the-voyage-scale-model-solar-system/
- https://www.jpl.nasa.gov/edu/resources/lesson-plan/create-a-solar-system-scale-model-with-spreadsheets/
- https://science.nasa.gov/learn/basics-of-space-flight/chapter1-1/
- https://science.nasa.gov/universe/galaxies/

## Performance and verification

The immutable content load is shared throughout a document visit, including
concurrent mounts. Failed loads can retry. Lesson players use separate lazy
chunks with loading/error recovery; their code and reader JSON are precached.
The older player uses proximity snapping instead of mandatory stops.

The preceding lesson milestone passed a cold-start offline journey, no
horizontal overflow at 390/768/1280 px, keyboard diagram controls and Reduce
motion. The reader had no inner scroll areas, and its slider was 44 px high.
Those checks describe the shared reader/diagrams, not a physical iPhone test.

The revised chapter-level flow passes automated completion/reward tests,
optional-practice validation, and accessible structure checks. The final
chapter evaluation is deliberately not enabled before its teaching exists.
