# cloudexplorers — Ghost theme for [cloudexplorers.club](https://cloudexplorers.club)

The **"Notebook" design** (made in Claude Design) on top of Ghost's default theme
**[Source](https://github.com/TryGhost/Source) v1.7.3**: IBM Plex Sans and Plex Mono, greyscale,
light and dark. Built for **Ghost 6**.

- Colour is greyscale only; the one colour is the link (`#326A54` light, `#86C0A7` dark).
- Code uses two muted tones (text and strings), no rainbow highlighting.
- Every text colour has at least 5:1 contrast. No gradients, glows or purple.

## What's in it

| Where | What |
| --- | --- |
| `assets/css/cloudexplorers.css` | The whole design: both palettes at the top, then every component |
| `assets/js/cloudexplorers.js` | Light/dark toggle, "On this page", reading progress, code blocks (line numbers, Copy), series marker, `/` opens search |
| `assets/fonts/plex/` | IBM Plex Sans + Mono, self-hosted (SIL Open Font License, `OFL.txt`) |
| `default.hbs` | Page frame: fonts, light/dark chosen before first paint, GoatCounter |
| `post.hbs` | Article + sidebar ("On this page", the series' posts), author, series navigation, subscribe box |
| `page.hbs` | Pages (About, Subscribe), ending with the subscribe box |
| `home.hbs`, `index.hbs`, `tag.hbs`, `author.hbs` | Homepage (intro band + posts with thumbnails), older posts, series index (tag page, oldest first), author page |
| `partials/ce/` | Header, footer, post row, subscribe box, series lists, pagination |

## Series

A series is a Ghost **tag**. Make it the post's **primary tag** (first tag) and the post shows
"Series · Name" in the sidebar, numbered 01, 02… oldest first, with "Next →" to the next post in
the same series. The tag page (`/tag/<slug>/`) is the series index; its name and description come from
Ghost Admin → Tags.

Post sections (h2) are numbered 01, 02… automatically, unless the headings already start with a number.

## Light / dark

- Site default: Ghost Admin → Design → Customize → **Color theme** (`Auto` follows the visitor's system).
- Visitors switch with the moon/sun button; the choice is remembered.
- All colours live in the two `:root[data-theme=…]` blocks at the top of `cloudexplorers.css`.

## Analytics

GoatCounter (free, no cookies). The code defaults to `cloudexplorers`; change or clear it in
Design → Customize → Goatcounter code. Visit `https://cloudexplorers.club/#toggle-goatcounter` once
per browser to stop counting your own visits.

## Deploying

Every push to `main` runs the checks (`gscan`) and, with the repository secrets
`GHOST_ADMIN_API_URL` and `GHOST_ADMIN_API_KEY` set, uploads the theme to Ghost. Ghost replaces the
active theme in place, so changes go live within a minute. Manual alternative: `pnpm install && pnpm zip`
and upload `dist/cloudexplorers.zip` in Ghost Admin → Design → Change theme.

## Developing

```bash
pnpm install
pnpm dev     # rebuild CSS/JS on change (theme folder inside a Ghost install's content/themes)
pnpm test    # build, zip and run gscan
```

## Keeping up with Source

The first commit is unmodified Source v1.7.3. Source's own templates and partials that the design
replaces were removed; its CSS (`screen.css`, for Ghost cards, lightbox and search) and helper scripts
remain. To take a newer Source release: add `https://github.com/TryGhost/Source.git` as `upstream`,
merge its tag, resolve conflicts, `pnpm test`.

## License

MIT. Source is © Ghost Foundation (see `LICENSE`); IBM Plex is © IBM, SIL Open Font License; the
Cloud Explorers changes are © Paresh Zawar, under the same MIT license.
