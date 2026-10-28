# Chapters, lessons and evaluation

Confirmed with the project owner on 28 October 2026.

A **chapter** is the full collection, for example *How stars live and die*.
A **lesson**, such as *Scale of the cosmos*, teaches one connected topic.
A **part**, such as *Shrink the Sun*, is a section within that lesson.
The existing code/data calls a chapter a `Unit` and places lessons, tales and
the final evaluation in `Cell` records. Those stable IDs and types are retained.

## Learning flow

Teaching and interactive exploration → small guided practice → lesson recap
→ further lessons/stories → one full chapter evaluation.

The full evaluation belongs at the end of the chapter. It should connect ideas
across the chapter using medium and harder application questions. Individual
lessons and their parts do not each end in a separate compulsory exam.

Optional practice gives an explanation immediately after the learner explores
an answer. It is unscored, awards no separate XP, writes no assessment answers
and can be skipped. Finishing the reading lesson uses the existing Learn quest
rules, rather than requiring a score. Earlier saved scores and answers are
preserved; the new flow does not erase past progress.

## Current implementation

Scale of the cosmos retains its eight teaching parts and interactive diagrams.
It has two optional practice moments, in the scale-model and galaxy sections.
It finishes with a recap and **Finish lesson**, rather than an eight-question
exam. Normal course navigation labels the collection **CHAPTER 1**.
The preview count describes available steps, so finishing the currently authored
material is not presented as finishing all eleven planned chapter cells.

The path ends with a **Chapter evaluation** panel marked **Coming later**.
The chapter is still incomplete, so the app does not present a scale-only test
as a complete chapter evaluation. The existing final quiz cell
(`orion-quiz`, position 11) is now titled Chapter evaluation, but remains an
unauthored placeholder and unavailable in the normal production path.

The initial scale question bank and its pure grading helper are retained as
authoring material for later chapter work. Two questions supply optional
practice. The bank is not itself the full evaluation of the entire chapter.
The full chapter question set, mastery threshold and retry policy need to be
decided once the remaining chapter content is ready.

Development progress remains temporary. The separate permanent database is
unchanged. No new account, server, analytics or progress upload is introduced.

Verification: 441 tests in 47 files pass. The browser allowed continuing after
a missed optional practice answer and finishing the lesson without submitting
an exam. The recap stated where the full evaluation belongs. The course's final
evaluation panel was disabled and clearly marked Coming later. There was no
horizontal overflow at 390, 768 or 1280 px. Earlier completion scores/answers,
existing Learn rewards, replay idempotency and transaction rollback are tested.
