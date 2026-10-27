# Temporary development progress

As requested on 27 October 2026, development visits begin from the start rather
than resuming a previous learner checkpoint. Stars, XP, quests and the streak
still use the real rules during that visit. Navigation within the app keeps
the current practice progress; refreshing or opening the app in a new document
starts a fresh visit, including the welcome and Orion journey.

`/start` is a direct restart address. The Start from the beginning links in the
story footer, Profile and Today use native full-page links so they also replay
the opening animation, subject to the device's reduced-motion preference.

The existing services still use IndexedDB as their temporary working store.
This is not a zero-storage mode: `astron-development-preview` holds the current
practice records, and they are cleared atomically before the next app render.
This reset applies to the shared preview database at that browser address, so
refreshing another open preview tab also resets its working records. Offline
art, fonts, content and the app cache are unaffected.

The permanent `astron-progress` database is separate and is never cleared by
this startup operation. Earlier saved progress is left untouched. Nothing is
uploaded, and no accounts or analytics are added.

Permanent saving can be restored for a future release by building with
`VITE_PERSIST_PROGRESS=true`. Without that flag, development mode is the default
locally and on the existing online test address. Tests prove that resetting
preview records cannot clear a differently named permanent database.

Welcome, Profile and the Today footer explain that progress is temporary. The
normal erase-progress service remains available for a future persistent build.
This document supersedes earlier claims that test visits resume on reload.

## Checks on 27 October 2026

All 416 tests in 43 files passed. The production build passed (with the existing
nonfatal chunk-size advisory) and precached 56 assets. In the browser, Meet Orion
opened the cover, Begin the story opened chapter one, and Continue opened
chapter two without losing state. Refreshing from chapter two returned to the
welcome with the temporary-progress notice. With the preview server stopped
and its port closed, a fresh reload still opened the welcome offline. The
preview server was restarted after this check.
