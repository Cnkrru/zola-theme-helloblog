+++
title = "Configuration Guide"
date = 2026-11-07
description = "How helloblog configuration is layered, the minimum setup, every parameter, and the common pitfalls. Use it as a starting template."
[taxonomies]
tags = ["hugo", "configuration"]
[extra]
category = "Docs"
keywords = ["hugo", "configuration", "theme"]
+++


# Configuration guide

This page explains how to configure the theme: what ships with the theme, what must live in your own site, what each parameter does, and the mistakes that are easy to make. Work through it in order and you have a running blog.

## Three layers of configuration

| File | Purpose | Do you edit it? |
| --- | --- | --- |
| Theme `hugo.toml` | Built-in defaults, merged into your site by Hugo | No, override only what you need |
| Your site `hugo.toml` | Your site configuration | Yes, required |
| `exampleSite/hugo.toml` | Demo site config, including self-test mounts | Reference only |

<div class="admonition admonition-warn"><div class="admonition-head"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg><span class="admonition-title">Warning</span></div><div class="admonition-body"><p>Do not copy exampleSite/hugo.toml wholesale. Its [module] section mounts ../layouts and ../assets from the parent directory, which only works when the repository root is the theme itself. Once installed under themes/helloblog those paths do not exist and the build fails.</p></div></div>


## Minimum working configuration

This is all a new site needs:

```toml
baseURL = 'https://your-domain.com/'
title = 'My Blog'
timeZone = 'Asia/Shanghai'
theme = 'helloblog'

# Generate robots.txt pointing at the sitemap
enableRobotsTXT = true

# Filter tags in place on /tags/ instead of generating /tags/<term>/ pages
disableKinds = ['term']

# Extra JSON output for the home page, required by search
[outputs]
  home = ['html', 'rss', 'json']

# Items per list page
[pagination]
  pagerSize = 6

# Keep only the tag taxonomy
[taxonomies]
  tag = 'tags'
```

<div class="admonition admonition-warn"><div class="admonition-head"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg><span class="admonition-title">Warning</span></div><div class="admonition-body"><p>outputs.home must include json. Without it search silently returns nothing, and no error is shown.</p></div></div>


## Settings that only work at site level

Hugo merges only tables such as `params`, `taxonomies` and `markup` from a theme. The following are site-level and have no effect in the theme's `hugo.toml`:

| Setting | Purpose |
| --- | --- |
| `outputs` | Home page JSON index for search |
| `pagination` | List page size |
| `services.rss` | RSS item limit |
| `imaging` | Image quality and resampling |
| `sitemap` | Crawl hints |
| `module` | How the theme is installed |

## Theme parameters

`[params]` already has sensible defaults; only write what you want to change.

| Parameter | Default | Description |
| --- | --- | --- |
| `description` | empty | SEO fallback description, page front matter wins |
| `keywords` | empty | SEO fallback keywords |
| `images` | `og-cover.png` | Default social share image, placed in `static/` |
| `color_theme` | `sakura` | `sakura` / `purple` / `ink` / `cyan` / `blue` |
| `glass_opacity` | `0.5` | Glassmorphism opacity, 0–1 |
| `siteage` | empty | Site launch date; leave empty to hide the day counter |
| `avatar` | `avator.webp` | Sidebar avatar, relative to `static/` |
| `saying` | empty | One-line sidebar quote, falls back to the i18n string |

### Home page

```toml
[params.index]
  logo = ''                     # Big home title, falls back to site.Title
  welcome = ['Hello, world']    # Typewriter lines, loops through the list
  increase_speed = 60           # Typing interval (ms)
  decrease_speed = 40           # Deleting interval (ms)
  loop_speed = 1000             # Pause before switching lines (ms)
  particle_enable = true        # Particle background
  particle_distance = 180       # Distance threshold for particle links
```

### Background

```toml
[params.background]
  enable = true
  image = 'background.webp'     # Relative to static/
  overlay_dark = 0.6            # Dark mode overlay strength
  overlay_light = 0.5           # Light mode overlay strength
```

### Comments

Comments are off by default. Configure giscus first, otherwise comments are posted to someone else's repository.

```toml
[params.giscus]
  enable = true
  repo = 'owner/repo'
  repo_id = 'R_xxx'
  category = 'General'
  category_id = 'DIC_xxx'
  mapping = 'pathname'
  strict = '0'
  reactions_enabled = '1'
  emit_metadata = '0'
  input_position = 'bottom'
```

## Multilingual

Translations are matched by filename: `content/about/index.md` pairs with `content/about/index.en.md`.

```toml
defaultContentLanguage = 'zh'
defaultContentLanguageInSubdir = false   # Default language served at the root

[languages]
  [languages.zh]
    languageName = '中文'
    languageCode = 'zh-cn'
    weight = 1
  [languages.en]
    languageName = 'English'
    languageCode = 'en'
    weight = 2
```

Data files are language-aware too: the default is `data/link.json`, and the English site automatically reads `data/link-en.json` (`music` works the same way).

## Navigation menu

Navigation is menu-driven, so adding a link does not require template changes:

```toml
[[menus.main]]
  identifier = 'nav.posts'   # Maps to the nav.posts i18n key
  name = 'Posts'             # Fallback label when identifier is missing
  url = 'posts/'             # Relative URL, language prefix added automatically
  weight = 1
```

When `identifier` matches a `nav.*` key in `i18n/*.toml`, the translated label wins. Keep `url` relative; the English site turns it into `/en/posts/`.

## Content and fields

Posts are page bundles at `content/posts/<slug>/index.md`.

```yaml
---
title: Post title
date: '2026-10-23'
lastmod: '2026-11-07'
category: Tech
tags: [hugo, markdown]
description: Post summary
keywords: [hugo, markdown]
draft: false
---
```

| Field | Purpose |
| --- | --- |
| `title` | Title used in the page head and search index |
| `date` | Publish date, lists and archive sort by it descending |
| `lastmod` | Update date; the update block shows only when it differs from `date` |
| `category` | Groups posts on the archive page |
| `tags` | Tag cloud and filtering |
| `description` | Meta description, falls back to the site description |
| `keywords` | Meta keywords, an array is recommended |
| `draft` | Built into Hugo, excluded from builds when `true` |
| `history` | Optional changelog array, also feeds the home page heatmap |

## Data files

Friend links and the music player read from your site's `data/` directory, not from the theme:

- `data/link.json`: friend links
- `data/music.json`: playlist

For a bilingual site, add `link-en.json` and `music-en.json` next to the defaults. No configuration change is needed.

## FAQ

<div class="qa"><details class="qa-item"><summary class="qa-q"><span class="qa-badge">Q</span>Search returns nothing</summary><div class="qa-a"><span class="qa-badge qa-badge-a">A</span>Check that outputs.home includes json and that /index.json is reachable</div></details><details class="qa-item"><summary class="qa-q"><span class="qa-badge">Q</span>Comments do not show</summary><div class="qa-a"><span class="qa-badge qa-badge-a">A</span>Check that params.giscus.enable is true and repo_id / category_id are filled in</div></details><details class="qa-item"><summary class="qa-q"><span class="qa-badge">Q</span>Language switch 404s</summary><div class="qa-a"><span class="qa-badge qa-badge-a">A</span>A translation must live next to the original with a language suffix, e.g. index.en.md</div></details><details class="qa-item"><summary class="qa-q"><span class="qa-badge">Q</span>Theme parameters have no effect</summary><div class="qa-a"><span class="qa-badge qa-badge-a">A</span>Site-level settings such as outputs, pagination, imaging and sitemap are ignored inside a theme</div></details></div>


## Pre-launch checklist

- Replace `baseURL` with your real domain
- Replace `params.description` and `params.images`
- Set `siteage` to your launch date
- Confirm `hugo --minify` builds with zero errors
- If comments are enabled, verify giscus loads correctly
