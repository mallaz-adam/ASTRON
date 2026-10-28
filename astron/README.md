# ASTRON app

The project overview is in the [main README](../README.md). It describes the
current learning experience, temporary progress, iPhone testing and deployment.

## Start locally

Use Node.js 24, matching `.node-version`. Open PowerShell in this folder:

```powershell
npm.cmd ci
npm.cmd start
```

Keep the terminal running while using the local site. Press Ctrl+C to stop it.
On macOS or Linux, use `npm` in place of `npm.cmd`.

## Check and build

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

Build before previewing. The production output is `dist`. Offline caching is
available in the production preview and hosted app, rather than the Vite
development server.

## Development progress

Refreshing or fully reopening currently starts from the welcome again.
The **Start from the beginning** link also restarts a visit. Working records
are separate from earlier permanent progress. See
[temporary progress](docs/development-preview.md).

## Useful addresses

| Address | Purpose |
| --- | --- |
| `/start` | Start the welcome and Orion journey again. |
| `/guide` | Review the short explanation of ASTRON. |
| `/` | Today, after the welcome. |
| `/learn` | The authored course path. |
| `/cell/orion-lesson` | Scale of the cosmos, with optional practice and a recap. |
| `/cell/star-lesson` | Why stars differ, after its authored prerequisite. |
| `/stories` | Greek stories. |
| `/articles` | Scientific articles. |
| `/sky` | My sky. |
| `/settings` | Preferences and Reduce motion. |
| `/dev`, `/design` | Developer pages; unavailable in production. |

First visits enter the welcome before the normal learning pages.

## Guides

- [Content format](docs/content-format.md)
- [Chapters, lessons and evaluation](docs/learning-structure.md)
- [Scale lesson, practice and performance](docs/scale-of-cosmos.md)
- [Glaux's character](docs/glaux-character.md)
- [Orion journey](docs/orion-journey.md)
- [Art credits and provenance](docs/orion-assets.md)
- [Hosting and phone testing](docs/private-test.md)
