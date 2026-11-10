# emanueletessore.com

Personal Hugo site deployed to GitHub Pages. **Docker with Compose v2 is the only
project runtime requirement**; commands below use Docker and standard shell utilities.
No host Hugo, Node.js, npm, browser, Task or custom wrapper is required.

## Initial setup

From the repository root, prepare the local environment and bind-mount directories:

```sh
# Do not overwrite an existing .env containing your configuration.
[ -e .env ] || cp .env.example .env
export LOCAL_UID="$(id -u)" LOCAL_GID="$(id -g)"
mkdir -p .docker/hugo-node_modules .docker/test-site-node_modules .docker/playwright-node_modules

# Initialize a fresh submodule only; preserve an existing theme development branch.
docker compose run --rm --workdir /project tools sh -c \
  'test -e src/emanueletessore.com/themes/careercanvas/.git || git submodule update --init --recursive'
```

Set the correct UID/GID in `.env` if you do not want to export them in each shell.
Only host-specific overrides (UID/GID, port, draft/future visibility) and the Pexels
key belong there. Image versions are pinned exclusively in `compose.yaml` so local
runs, CI and dependency updates use the same source. Theme selection and the public
Formspree endpoint are site configuration in `src/emanueletessore.com/config.yaml`;
`HUGO_IMAGE`, `HUGO_THEME` and `FORMSPREE_ENDPOINT` are not supported `.env` settings.

Set `PEXELS_API_KEY` there to enable Pexels backgrounds. `.env` is local and ignored;
`.env.example` contains no credentials. The Pexels key is emitted into browser-visible
HTML by the theme, so it is not a server-only secret.

## Start and stop development

```sh
docker compose up -d
docker compose logs -f serve
docker compose down
```

Open <http://localhost:1313>. Only `serve` starts by default. Source changes are
bind-mounted and Hugo provides live reload. Startup installs the locked npm dependencies.

```sh
# Change the host port.
HUGO_PORT=1414 docker compose up -d

# Include draft and future-dated content.
HUGO_BUILDDRAFTS=true HUGO_BUILDFUTURE=true docker compose up -d
```

The optional settings can also be saved in `.env`. Restore their normal values
and run `docker compose up -d` to recreate the server with the defaults.

## Application CLI

`tools` uses the `cli` profile. Explicitly targeting it activates it automatically;
a normal `up` does not start CLI containers. Each command runs inside the official
Hugo image, which also contains Node.js, npm and Git.

```sh
docker compose run --rm tools npm ci
docker compose run --rm tools npm run lint:css
docker compose run --rm tools npm run build
docker compose run --rm tools npm audit
docker compose run --rm tools hugo version
```

The build fails on Hugo warnings. Production output is `src/emanueletessore.com/public/`.
Stop the development server
before building to this shared directory, or use a separate destination:

```sh
docker compose run --rm tools npm run build -- --destination /project/.docker/production-preview
```

To refresh all pinned images:

```sh
docker compose --profile '*' pull
```

To remove generated site files, stop development first:

```sh
docker compose stop serve
docker compose run --rm tools sh -c 'rm -rf public resources'
```

## Browser tests

The browser runner uses Microsoft's official Playwright image; no host browser or
browser installation command is needed. Run tests in a separate Compose project:

```sh
docker compose -p emanueletessore-site-tests run --rm test
# Always clean up, including after a failed test run.
docker compose -p emanueletessore-site-tests --profile test down --remove-orphans
```

To select a browser-test project:

```sh
docker compose -p emanueletessore-site-tests run --rm test sh -c 'npm ci && npm test -- --project=mobile'
```

`test` starts its healthy `test-site` dependency, not the development server.
`--rm` removes the runner; the cleanup command removes its server and network.
The dedicated project ensures cleanup does not stop the development environment.
CI performs cleanup even if tests fail.

The test server publishes no host port, receives no Pexels key and renders to
`/tmp/hugo-test-public` inside its own container. It must never write to the shared
`public/`, which would overwrite development HTML and its Pexels configuration.
Compose, not Playwright, manages the test server lifecycle.

The 16 Chromium checks cover desktop/mobile layouts, light/dark mode, navigation,
modal opacity/dismissal, article width, card-header image sizing, docs and the 404 page.
External services are blocked or stubbed: CDN availability, live Pexels responses,
animation playback, contact
submissions and embedded video playback are not part of these deterministic tests.
Artifacts appear under `src/emanueletessore.com/test-results/` and are ignored.

The versioned `tests/compose-isolation.cjs` guards default profiles and private test
output. Run it without logging the potentially secret-bearing Compose model:

```sh
docker compose --profile '*' config --format json |
  docker compose run --rm -T --no-deps --workdir /project tools node tests/compose-isolation.cjs
```

## Images, dependencies and generated files

`compose.yaml` pins upstream images directly; there is no Dockerfile or custom build:

- `ghcr.io/gohugoio/hugo:v0.169.0`: Hugo extended with Node.js 24.22.1, npm and Git.
- `mcr.microsoft.com/playwright:v1.65.0-noble`: Playwright browsers and system libraries.

Source code is bind-mounted at `/project`. Dependencies use separate ignored bind
directories under `.docker/` for development, the test server and the browser runner.
This prevents mixing Alpine/musl, Ubuntu/glibc and host native modules. Containers
run with the configured host UID/GID so generated files retain usable ownership.

`hugo_stats.json`, `public/`, `resources/`, dependency caches and test artifacts are
generated and ignored. Hugo regenerates build stats during rendering; no committed
seed is needed. Root `docs/` holds local planning notes and is ignored, unlike the
published content under `src/emanueletessore.com/content/en/docs/`.

`.env` and build stats are no longer tracked. This does not erase their previous
Git history; rotate any credentials previously exposed in commits if necessary.

## Theme contributions

The theme submodule uses the [setola fork](https://github.com/setola/careercanvas),
branch `feat/tailwind-v4`. Its local `origin` fetches from the fork and pushes over
SSH; `upstream` points to `felipecordero/careercanvas`. Fresh clones need to add
`upstream` explicitly when preparing contributions.

Edit generic theme changes directly under `src/emanueletessore.com/themes/careercanvas`.
CSS compilation, typography, fonts and dark-mode defaults belong to the theme's
Tailwind 4 pipeline. There is no site-local stylesheet or migration-only template
copy hiding it. Existing personal layout customizations remain in the site's `layouts/`.

The theme provides an independent Docker example and regression suite in
`exampleSite/`; follow its README. Keep personal content and deployment configuration
out of the upstream PR. Push theme commits before recording the new submodule
pointer in the parent repository. Ordinary builds must not reset an active theme
branch to the parent's old gitlink. `.gitmodules` selects the migration branch for
explicit remote updates while the PR is pending; revise it after upstream merges.
When you intentionally want to update the submodule from its configured remote:

```sh
docker compose run --rm --workdir /project tools git submodule update --init --remote --recursive
```

Do not use that update command during active branch development: it can move the
checkout away from your branch. Normal build and test commands never invoke it.

## CI and updates

CI uses the same Compose CLI commands, verifies isolation, runs CSS lint and browser
tests, and requires a warning-free production build. Only successful runs on `main`
deploy. The deployment job alone receives the `github-pages` environment's
`PEXELS_API_KEY` secret and Pages write permissions. Actions are pinned by commit SHA.

Dependabot checks npm, Docker images and Actions. Keep the Playwright image version
and `@playwright/test` package synchronized. Re-run lint, browser tests, isolation
checks and production build after updates.

The typography plugin's scoped `postcss-selector-parser@6.1.6` override fixes
[GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf); remove it once
upstream fixes that dependency. Tailwind 4 requires Safari 16.4+, Chrome 111+ or
Firefox 128+. PostCSS and the legacy Tailwind JavaScript configuration are no longer
used. Stylelint must retain `import-notation: string` so it does not break Tailwind
package imports. Hugo's Node permission model remains enabled.
