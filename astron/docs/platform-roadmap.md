# ASTRON: platform and learning roadmap

## Implementation update — 5 November 2026

The [chapter roadmap](learning-roadmap.md) now presents chapters and their planned
units with explicit readiness, completion and lock states. A shared access model
gates normal lessons behind the preceding chapter's authored evaluation and unit
completions. Chapter 2 is a locked preview for new learners, with completed lessons
still reviewable and Greek stories independently available through Stories.
The actual evaluation player and remaining Chapter 1 units still need authoring.
This supersedes the earlier availability/roadmap status below.

Draft for the owner to review, 2 November 2026.
Grounded in the local app at commit `f7dc2fe` and a fresh browser walkthrough.
This is a working plan, not a claim that the proposed features already exist.
Status updated after Unit 4 and dedicated practice phases were implemented on
2 November, the Pleiades story on 3 November, and reading/navigation polish on
4 November. The linked initial audit still
documents the earlier app state.

## The result we are working towards

A beginner can understand what ASTRON offers, follow a complete astronomy
chapter, explore related Greek stories and scientific articles, revisit useful
discoveries, and return on a phone without losing their place. The experience
keeps the parchment atlas, real astronomy pictures, clearly labelled diagrams
and Glaux's quiet, useful presence.

The first complete release needs a complete learning journey and coherent
sections. It does not require an encyclopaedia of astronomy or an account system.

## What exists now

| Area | Current state | What still needs work |
| --- | --- | --- |
| Welcome | Explains Learn, Stories and Articles, then opens Orion | Check the compact first view on real iPhones |
| Today | Quests, XP, sun, streak, freeze and next-unit link | Check the prominent next action and persistent tabs on real phones |
| Learn | Chapter 1 Units 1–4 are playable, with prerequisites, definitions, pictures and dedicated ungraded practice | Units 5–6, the final evaluation, and a consistent whole-course roadmap |
| Earlier chapter | Scale of the cosmos, Why stars differ and Orion are available as development material | Its place in the final sequence and its mixed numbering need review |
| Stories | Orion and The Pleiades, each linked to a collected star | A small coherent collection and easier browsing as it grows |
| Articles | One sourced Betelgeuse article, with cover, category and reading time | A curated collection connected to learning topics; section guide and action buttons are implemented |
| My sky | Betelgeuse links to its story/article; Alcyone links back to The Pleiades | A fuller, meaningful record of discoveries and revisits |
| Preferences | Daily goal and Reduce motion | Real-device usability checks remain necessary |
| Web foundation | React/Vite/TypeScript, local content, IndexedDB, PWA and Cloudflare test setup | Verify the latest deployment, real iPhone behaviour and release progress settings |

Progress intentionally resets on a full reload during development. Preserve
that behaviour until the owner explicitly chooses the durable testing/release
phase. Do not erase or migrate the separate earlier permanent records.

## The student's learning roadmap

The owner's latest priority is to expand and agree the learning chapters and
Greek story collection before article authoring. See the researched
[curriculum and stories proposal](curriculum-and-stories-proposal.md): seven
chapters, 47 proposed teaching units and eight initial sky stories. The proposed
order needs review; the current app and the existing material below are unchanged.

The [Chapter 1 blueprint](chapter-one-blueprint.md) maps its six unit goals to
the ten-question evaluation. [Specific research briefs](next-research-briefs.md)
were used for Unit 4 and the Pleiades story, now implemented. The proposed
remaining units and chapter-unlock gate are not implemented.

Use **Chapter → Unit → Part** consistently in the learner-facing interface.
The existing internal Unit/Cell records can keep their stable IDs.

### Chapter 1: Our place in space

| Order | Unit | Content status | Learning prerequisite |
| --- | --- | --- | --- |
| 1 | Earth, the Sun and the Moon | Implemented | Starting unit |
| 2 | Our solar system | Implemented | Finish Unit 1 |
| 3 | Stars and the Milky Way | Implemented | Finish Unit 2 |
| 4 | Galaxies and the universe | Implemented, 2 November | Finish Unit 3 |
| 5 | Understanding sizes and distances | Awaiting research and approval | Finish Unit 4 when Unit 5 is ready |
| 6 | Light takes time to travel | Awaiting research and approval | Finish Unit 5 when Unit 6 is ready |
| End | Chapter evaluation | Planned: ten questions across all six units | Complete and submit after the units to unlock the next chapter; no minimum score |

The final path should explain four different states in words as well as symbols:
**Ready to begin**, **Completed**, **Locked by a prerequisite**, and
**Still being prepared**. A lesson without content must never look like a
finished lesson waiting only for progress.

### Chapter 2: How stars live and die

Retain the existing authored material for development. Before presenting it as
the next full chapter, review its sequence with the owner. Some introductory
scale/distance topics overlap the new Chapter 1, and the current authored map
shows cells 1, 3, Orion and The Pleiades. Do not silently delete lessons, renumber stable
content IDs or fabricate completion. Apply the confirmed chapter-unlock rule
when the complete curriculum and evaluations are implemented.

Confirmed on 2 November 2026: each chapter has its own units and ten-question
evaluation. Finish the units, then complete and submit the evaluation to unlock
the next chapter, with no minimum score requirement. Completed chapters remain
reviewable. Optional retakes and detailed review support still need design.
Further chapters need their own approved learning goals and research before
being added; content still being prepared must not appear playable.

Stories and articles can offer optional exploration independently of formal
lesson locks. Confirm any restrictions before changing that existing behaviour.

## Development milestones

Work by completed outcomes rather than promising dates before the manuscripts
and learner testing are available.

| Stage | Concrete work | Evidence that it is finished |
| --- | --- | --- |
| 1. Make the next step clear | A more compact phone welcome; a prominent next-unit action on Today; reachable main navigation; clear roadmap state labels | A new tester can identify where to begin, what to do next, and what is unavailable without coaching |
| 2. Make the lessons comfortable | Apply the best Unit 1 reading hierarchy consistently; bring activity invitations into view; simplify media layout without dropping attribution; retain plain definitions and quiet Glaux clues | A tester reads and uses a diagram on a phone without missing its control or losing the next action |
| 3. Complete Chapter 1 | Research, approve and implement Units 4–6 one at a time; then write the ten-question evaluation and targeted review feedback | A complete beginner can follow all six units and an assessment that covers the whole chapter |
| 4. Connect the platform | Build an agreed starter collection of stories/articles; use useful related-content links; give My sky meaningful revisit points | The learner can follow a lesson's question into a relevant article/story and return to their learning place |
| 5. Prepare the real test release | Agree when durable local progress replaces the development reset; check update/recovery behaviour; verify the latest GitHub/Cloudflare publication; test on a real iPhone and desktop | The correct version opens over HTTPS, installs, reopens offline, preserves approved progress and updates safely |
| 6. Improve from actual use | Give the approved release to 3–5 testers; fix observed confusion/performance issues; then agree the next chapter | Recorded feedback and resolved priority issues support the next release |

Stage 1 remains a recommended usability batch. The owner's current priority
is the chapter/unit structure and Greek stories in the linked curriculum
proposal. Review that content direction first. All UI proposals still need
owner review; no application UI changes were made as part of this review.

## The next batch, made concrete

1. **Welcome:** retain the three-part explanation and Orion invitation, but fit
   the first clear action into the opening phone view through shorter summaries
   and spacing. Keep the approved opening animation and atlas identity.
2. **Today:** bring the next unit's action ahead of the lower-priority daily
   detail on a new visit. Keep XP, quest rewards and streak rules unchanged.
3. **Main navigation:** make the five destinations reachable on phone library
   screens without scrolling past the entire card. Retain the focused lesson
   reader with its Continue/Previous controls and Back to the path.
4. **Course roadmap:** distinguish ready, completed, locked and unauthored
   states clearly. Identify the older chapter as preview material while its
   final sequence is being agreed. Confirm its normal-menu treatment before
   changing availability.

This batch does not author Unit 4, decide assessment pass marks, add accounts,
introduce a server, change progress retention, award new stars or publish the
site. Those belong to their explicitly identified later stages.

## How we work on each new unit

The owner supplies a research PDF. We review the science, plain language,
learning sequence, illustrations, practice and sources together. After approval,
implement local JSON, real/source-linked media and labelled concept diagrams.
Keep the connected explanation and optional ungraded practice. Check phone and
desktop layouts, keyboard operation, Reduce motion, progress behaviour, tests,
build and offline loading. Save a local commit; publish through the agreed
GitHub/Cloudflare workflow when requested.

Use the existing one-idea-at-a-time Continue reader. Large visual or curriculum
changes are discussed before implementation. Glaux's mystery belongs to his
presence and history; controls and teaching instructions stay clear.

## Release checks and open decisions

- The final assessment has ten questions after the chapter. Completing and
  submitting it unlocks the next chapter; no score threshold is required.
  Design optional retakes and review guidance before implementation.
- The older chapter is now a locked preview in the normal roadmap; review its
  overlapping introductory topics before publishing its complete curriculum.
- Agree the initial story/article collection and its connections, rather than
  adding empty categories or filters that have no useful content.
- Enable lasting progress only with the owner's decision; it stays on-device.
- Check a real iPhone/Safari installation, offline reopen, update and VoiceOver.
  Browser viewport screenshots do not replace these tests.
- Confirm image provenance, captions and required attribution as assets ship.
- Check the actual published revision after pushing. This review did not push
  or deploy. Three learning-unit commits are ahead of the locally recorded
  origin/master; that record is not a live verification of GitHub or Cloudflare.

The fresh review covered a 390×844 phone viewport and a sampled 1280×900 desktop
screen. It confirmed selected keyboard interactions, not full accessibility
compliance. No new test/build run was needed for these documentation changes;
the last recorded implementation run passed 517 tests on 30 October 2026.
