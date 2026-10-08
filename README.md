# cloudexplorers — Ghost theme for [cloudexplorers.club](https://cloudexplorers.club)

A slim fork of Ghost's default theme **[Source](https://github.com/TryGhost/Source) v1.7.3** with
the Cloud Explorers terminal look: burgundy header/footer, dark green & blue dotted backgrounds,
teal accents, a light reading pane, a `~/ce` blinking-cursor logo and a terminal-style footer.

Built for **Ghost 6** (checked with `gscan`, works on Ghost 5 too).

## Why a theme instead of Code Injection

The previous version lived in *Settings → Code injection* (~1,500 lines). Moving it into a theme:

- **No flash or layout jumps.** The menu, footer, share bars and Series page are rendered by Ghost
  on the server instead of being built by JavaScript after the page loads.
- **Much less code.** Roughly 880 lines of commented CSS and 120 lines of JS, with almost no
  `!important`, because the palette feeds Source's own variables instead of fighting them.
- **Version history and rollback.** Every change is a commit; deploys are automatic (below).
- **One place for each thing.** Social links, the Series list and colours are each defined once.

## What's custom (everything else is stock Source)

| Where | What |
| --- | --- |
| `assets/css/cloudexplorers.css` | Palettes + all styling (built to `assets/built/cloudexplorers.css`) |
| `assets/js/cloudexplorers.js` | Theme toggle, side-panel memory, copy-link button, table of contents |
| `partials/ce/` | Social links, side panel, subscribe pill, share row, Series list, theme toggle |
| `partials/navigation.hbs` | Adds the Series dropdown to the menu item with slug `series` |
| `partials/components/navigation.hbs` | `~/ce` logo, theme toggle, members buttons removed |
| `partials/components/footer.hbs` | Social bar, terminal footer, signup form on the homepage only |
| `page-series.hbs` | The `/series/` page: one card per series |
| `post.hbs` | Share rows top and bottom, article + sticky table of contents |
| `home.hbs` | Feed heading `./latest-dispatches --sort newest` |
| `default.hbs` | Palette picked before first paint, GoatCounter, side panel, subscribe pill |
| `package.json` | Theme name and Design settings (below) |

## Switching themes (palettes)

Two palettes ship: **Terminal** (the current look) and **Light**.

- **Site default:** Ghost Admin → *Settings → Design & branding → Customize → Site-wide → Color theme*
  (`Terminal`, `Light`, or `Auto` = follow the visitor's system light/dark setting).
- **Per visitor:** the half-moon button in the header switches palette and remembers the choice.
  Turn it off with *Show theme toggle*.
- **Adding a palette:** copy one of the `:root[data-theme="…"]` blocks at the top of
  `assets/css/cloudexplorers.css`, rename it, change the ~25 colours, then add the name to the
  inline script in `default.hbs` and to `color_theme.options` in `package.json`.

Animations kept: blinking cursor, card lift on hover, dropdown fade, smooth TOC scrolling. All of them
switch off for visitors whose system asks for reduced motion. The blinking heading borders and the
code-block typing effect from the old code were dropped (the first can trigger discomfort; the
second was never styled, so it did nothing).

## Traffic analytics (GoatCounter)

[GoatCounter](https://www.goatcounter.com) is free for personal/non-commercial sites, open source,
uses no cookies (so no consent banner) and adds a ~3.5 KB script.

1. The theme defaults to the `cloudexplorers` code (`cloudexplorers.goatcounter.com`).
2. To change it: Ghost Admin → *Design → Customize → Site-wide → Goatcounter code* → enter just the code.
3. Visits show up in your GoatCounter dashboard. Ghost Admin previews aren't counted (they run in a
   frame). To stop counting your own visits, open `https://cloudexplorers.club/#toggle-goatcounter`
   once in each browser you use.

Leave the field empty to turn analytics off. (Ghost 6 also has built-in web analytics, but on a
self-hosted install it needs a separate Tinybird setup; GoatCounter needs nothing on your server.)

## Installing

**First time (manual):**

```bash
pnpm install
pnpm zip            # -> dist/cloudexplorers.zip
```

Ghost Admin → *Settings → Design & branding → Change theme → Upload theme* → upload the zip → *Activate*.

**Automatic deploys:** `.github/workflows/deploy.yml` checks the theme on every push and pull request,
and on pushes to `main` uploads and activates it. To enable deploying, add two repository secrets
(*GitHub → Settings → Secrets and variables → Actions*):

- `GHOST_ADMIN_API_URL`: `https://cloudexplorers.club`
- `GHOST_ADMIN_API_KEY`: Ghost Admin → *Settings → Integrations → Add custom integration*
  (e.g. "GitHub theme deploy") → copy the **Admin API key**.

Until both secrets exist, the workflow only runs the checks.

## One-time Ghost Admin setup after activating

1. **Remove the old Code Injection.** *Settings → Code injection*: clear the Site Header and Site
   Footer boxes. Everything in them is now in the theme; leaving them would apply it twice.
   (Keep a copy somewhere first if you like.)
2. **Navigation:** keep a primary menu item labelled `Series` with URL `/series/`. Its slug becomes
   `series`, which is what turns it into a dropdown.
3. **Series page:** a published page with slug `series` uses `page-series.hbs` automatically. Its
   body can stay empty; anything you write there appears under the cards.
4. **Tags:** the Series menu and page read each tag's *name* and *description* from Ghost, so edit
   blurbs in *Tags*. The series slugs are listed in `partials/ce/series.hbs`. A series appears
   once it has at least one published post, listed alphabetically.
5. **Homepage signup text:** *Design → Site-wide → Signup heading / subheading* (e.g. "Deep technical
   guides on cloud architecture, OCI, AI platforms, and multi-cloud CloudOps engineering.").
6. **Portal button:** *Settings → Membership → Portal → Signup → "Show portal button"* off, if it's
   on (the floating Subscribe pill replaces it).
7. **Subscribe page content** (the `cadence.conf` block, series list, etc.) is now edited directly in
   the page editor. The old Code Injection used to rewrite it with JavaScript.

Design settings the theme starts with (all changeable in *Customize*): logo on the left, header
*Off* on the homepage, *Grid* feed, *Consistent mono* headings.

## Developing locally

```bash
pnpm install
pnpm dev        # rebuilds CSS/JS on change (theme folder must sit in a Ghost install's content/themes)
pnpm test       # build, zip and run gscan
```

## Keeping up with Source

The first commit is unmodified Source v1.7.3, so `git diff <first-commit>` shows every customisation.
To take a newer Source release, add it as a remote and merge its tag:

```bash
git remote add upstream https://github.com/TryGhost/Source.git
git fetch upstream --tags
git merge v1.x.y        # resolve conflicts, then: pnpm test
```

## License

MIT. Source is © Ghost Foundation (see `LICENSE`); the Cloud Explorers changes are © Paresh Zawar,
under the same license.
