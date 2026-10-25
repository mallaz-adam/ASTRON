# Clearer reading and the opening greeting

Review of the phone and desktop recordings supplied on 25 October 2026.

## What the recordings show

The atlas has a consistent visual identity. The main reading obstacle is the wording: abstract images and unnamed actors make the plot harder to follow. The phone also requires substantial scrolling between the illustrations, paragraphs and next action. This change keeps the artwork and layout, and addresses the language and opening greeting.

| Step | Phone time | Desktop time | Finding |
| --- | --- | --- | --- |
| Cover | 0:00–0:06 | 0:00–0:25 | Strong painting and clear start action. The teaser assumes the reader understands a metaphor before meeting Orion. |
| The Hunter | 0:09–0:30 | 0:29–0:56 | “Boast”, “conquer” and “reach of his gaze” add difficulty without adding needed events. |
| The Scorpion | 0:30–0:55 | 0:58–1:13 | Earth becomes “she” without introducing the goddess. The cause of her anger is implicit. |
| Among the Stars | 0:57–1:21 | 1:16–1:29 | Useful picture/chart switch. “Hunter’s fall” and “traced through the lights” blur the action. |
| Look Up | 1:24–1:43 | 1:30–1:45 | The belt is a concrete, memorable learning anchor. Explain “star chart” immediately. |
| Star and activity | 1:45–1:57 | 1:49–2:18 | The three choices and help are clear visually. Star facts and feedback can use more direct language. |
| Preferences | 2:00–2:03 | 2:25–2:40 | “What draws you” and “Begin my days” are less direct than the actions. Explain daily quests. |
| Return to the app | 2:03–2:22 | 2:43–2:54 | The links connect Today, Stories, My sky and the course. The recordings show almost none of lesson 3, so they do not support a full lesson audit. |

Times are approximate samples from the supplied videos. The desktop source lasts 174.43 seconds and the phone source 144.9 seconds. Review used 48 visual samples per recording plus enlarged frames. Audio was not transcribed; this is a visual and text review, not a claim to have heard the recordings. The videos cannot establish reading comprehension, contrast compliance, VoiceOver behaviour or keyboard accessibility by themselves. Some phone views place text near the status/browser bars; a physical iPhone safe-area check remains useful. No private notifications from the recordings are reproduced here.

## Changes made

- Four complete, connected chapters remain. Events and causes are explicit, and the Earth goddess and star chart are explained.
- Related star facts, feedback, the Betelgeuse article and first-visit guidance use simpler wording. Proper names, chart positions, answer rules and progress identifiers remain compatible.
- One 1.8-second greeting on a document load: the existing Glaux SVG waves its right wing; ASTRON sits below. No new generated character or sound.
- Tap/click, Enter, Space or Escape dismisses the greeting. Background content loads concurrently and is inert until the greeting ends. Focus then moves into the page.
- The greeting waits for saved motion preferences before moving. Saved or device Reduce motion skips it; it never repeats on route changes or progress updates. A storage error also dismisses it. No welcome/progress records are written by the greeting.

## Writing approach

Use familiar words and concrete images. Name a new person or idea before using a pronoun. Connect cause and effect. Explain a necessary astronomy word where it first appears. Keep paragraphs and story atmosphere instead of turning the tale into isolated speeches. Glaux speaks briefly and points to something the learner can notice.

Before: “The Earth heard Orion’s boast.”

After: “The Greeks imagined the Earth as a goddess who could think and act. In this story, she was angry because Orion said he could kill any animal.”

This retains the previously selected scorpion version, rather than mixing several myths. References: [Pseudo-Hyginus, Astronomica 2.26, translated excerpt](https://www.theoi.com/Gigante/GiganteOrion.html), [NASA: Betelgeuse](https://science.nasa.gov/universe/what-is-betelgeuse-inside-the-strange-volatile-star/). No invented historical quotation has been added.

## Revised story

### 1. The Hunter

Long ago, people told stories about Orion, a strong and skilled hunter.

He walked through forests and over hills, following the tracks animals left behind. He could wait quietly until he found what he was looking for. Each hunt made him more sure of his strength.

Soon, Orion believed he was the greatest hunter of all. He said he could kill any animal on Earth. He thought no creature could stop him.

But his words angered the goddess of the Earth. Orion was about to face an animal he had never feared: a scorpion.

Glaux: Even a great hunter has something left to learn.

### 2. The Scorpion

The Greeks imagined the Earth as a goddess who could think and act. In this story, she was angry because Orion said he could kill any animal.

She sent a scorpion to face him.

Orion saw it near his feet. Its tail curved over its back, ready to sting. The hunter trusted his strength, just as he always had.

Then the scorpion stung him. Orion died.

His strength could not save him. Yet people would remember the hunter in a surprising place: the night sky.

Glaux: His strength could not protect him from the sting.

### 3. Among the Stars

In this myth, Zeus, the ruler of the gods, placed the scorpion in the sky. Artemis, the goddess of the hunt, wanted Orion to be remembered too. She asked Zeus to give him a place among the stars.

So Orion became a hunter in the night sky.

Look at the picture. His arm is raised, and a belt crosses his waist. People imagined this shape when they looked at the stars.

They did not see a real person in the sky. They joined bright points into a picture, then gave that picture a story.

Glaux: The story gives us a picture. Now let us find its stars.

### 4. Look Up

Now look at the star chart. A star chart is a map of the sky.

Near the middle, three bright stars sit close together, almost in a straight line. They form the belt in the picture of Orion.

From the belt, look up towards his shoulders. The reddish star at one shoulder is called Betelgeuse.

The hunter is part of the myth. The stars are real, faraway suns. The lines help us see a shape; they are not real lines in space.

Start with those three belt stars. You now know a simple way to recognise Orion.

Glaux: Find the belt first. Then look for the shoulders.

## Revised connected article

### Why does Betelgeuse look red?

Find Orion's belt on the chart. Then look towards the reddish star at one shoulder. That star is Betelgeuse.

Why does it look red? A star's colour tells us something about its surface, the outer part we see. Blue stars have hotter surfaces than red stars. A red star is still very hot. Cooler does not mean cold.

Betelgeuse is a red supergiant. This means it is a reddish star much larger than the Sun. As it grew older, its outer layers spread out and cooled. It became larger, with a cooler surface.

You may remember that heavier stars are hotter. That rule describes the long, steady part of a star's life. Later, a star can change. Betelgeuse has already left that steady stage. This is why a very large star can look red.

Now return to the chart. The three belt stars help you find Betelgeuse. The hunter and the lines are pictures people imagined. The stars are real, and stars that look close on the chart can be far apart in space.

You have two clues to keep: the belt shows where to look, and colour tells you about heat.

## Verification

Local browser checks cover Enter-to-skip, automatic completion, focus return, saved Reduce motion across reload, no replay on chapter changes, and layout at 390, 768 and 1280 px. Unit tests cover the intro state transitions. Final verification: 387 tests passed across 37 files; the production build passed. Offline precache still includes 55 entries, including the local fonts, art and revised JSON. This pass did not repeat a physical iPhone or airplane-mode test.

This pass does not claim that the whole course has been rewritten or that the new copy has been tested with learners. A useful comprehension check is to ask a tester: Who is Orion? Why did the goddess send the scorpion? What do the three belt stars help you find?
