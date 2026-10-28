# Welcome and article navigation

This update keeps the existing atlas design, Orion journey, local progress and
reward rules. It adds one introduction for new learners and five destinations:
Today (`/`), Learn (`/learn`), Stories (`/stories`), Articles (`/articles`) and
My sky (`/sky`). Native links indicate the current destination. No Timeline
placeholder remains in the main navigation.

The introduction invites the learner to meet Orion, with explanations of Learn,
Stories and Articles below that first action. Returning readers keep their checkpoint. Your preferences links
to `/guide`, a read-only way to revisit the introduction without erasing progress.
The existing opening animation and reduced-motion preferences are unchanged.

Article cards show a category, reading time, title, local cover, summary and
reading link. Phones show the title before the cover so its subject is visible
immediately. A single card places the image beside the text on larger screens.
The title link expands across the card, while the credit and licence retain
their own keyboard-accessible links. The article reader uses the same cover.

## Cover credit

- Local file: `public/art/articles/betelgeuse-alma.jpg`
- Original, downloaded unchanged: https://cdn.eso.org/images/screen/potw1726a.jpg
- Source: https://eso.org/public/images/potw1726a/
- Credit: ALMA (ESO/NAOJ/NRAO)/E. O’Gorman/P. Kervella
- Licence: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/
- ESO reuse guidance: https://eso.org/public/outreach/copyright/

This is an observation mapped into visible colours, not a visible-light portrait.
The on-screen caption states this explicitly. No generated imagery was added.
The file is local and included in the offline cache; reading needs no external
image request. Only following a source link opens the external source.

## Verification

Automated tests cover introduction persistence, no reward side effects,
preservation of old checkpoints and preferences, the five active destinations,
and valid/invalid article metadata. Manual browser checks cover keyboard
activation, article saving, image loading, responsive layout and offline loading.
These browser checks do not substitute for physical iPhone or VoiceOver testing.

On 27 October 2026, all 411 tests in 42 files passed and the production build
completed. Vite reported a nonfatal JavaScript chunk-size advisory (about 501 kB).
The PWA precaches 56 entries, including the new cover. At 390, 768 and 1280 px,
the article page had no horizontal overflow. All five phone navigation targets
were more than 44 px high. Enter activated navigation and article controls;
marking the article read produced the existing +10 XP Read quest on Today.
The update banner successfully installed the final build through REFRESH.

With the preview server stopped and its port closed, reloading `/guide`, opening
`/articles` and opening `/cell/star-lesson` succeeded from the service worker.
The article image loaded and local fonts reported loaded. The server was then
restarted. This verifies server-unavailable loading in the desktop browser;
the phone airplane-mode check remains a real-device check for the user.

To check on an existing device, open `/guide` to review the welcome page, then
return to Today and open Articles. There is no need to erase saved progress.
