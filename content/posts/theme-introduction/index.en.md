+++
title = "Theme Introduction"
date = 2026-11-09
description = "Helloblog is a glassmorphism personal blog theme with light and dark modes, bilingual content, local search and a full writing component set."
[taxonomies]
tags = ["zola", "theme"]
[extra]
category = "Docs"
keywords = ["zola", "theme", "blog"]
+++

# Theme introduction

Helloblog is a Zola theme built for personal writing. Visually it is glassmorphism with soft gradients; functionally it ships the pieces a blog usually needs: light and dark modes, bilingual content, local search, table of contents, reading progress, syntax highlighting, writing components, comments and analytics. There is no front-end build step — a single `zola build` command produces the whole site.

{% <tip title="Design principle"> %}
Content first: typography, TOC and search are resolved at build time, so the first paint is complete HTML that does not depend on scripts.
{% </tip> %}


## Features

| Area | What you get |
| --- | --- |
| Appearance | Glassmorphism, five palettes, light/dark toggle, custom background and avatar |
| Reading | Table of contents, reading progress, prev/next, related posts, archive and tags |
| Content | Bilingual content, RSS, Open Graph, Sitemap, robots.txt |
| Writing | Admonitions, details, tabs, code groups, steps, timeline, file tree, flow, Q&A, compare, quote |
| Code | Chroma highlighting, terminal block, diff, mermaid |
| Interaction | Local search, giscus comments, sharing, back to top, music player |
| Analytics | Page views and a homepage activity heatmap |

## Writing components

Every component renders to HTML at build time; only browser-dependent features ship a small script. Admonitions come in four semantic levels with an optional custom title:

{% <warning> %}
tip / info / warning / danger map to different meanings; without a title the theme falls back to its localized default label.
{% </warning> %}


Tabs are handy when several angles of one topic sit side by side:

{% <tabs> %}
@tab Writing
Write content in Markdown and let the theme handle typography.

@tab Configuration
Theme options live in config.toml.

@tab Deployment
The output is plain static files — host it anywhere.
{% </tabs> %}


Adding a post always follows the same path:

{% <steps> %}
Create folder | Add a slug directory under content/posts
Write content | Create index.md, plus index.en.md for a translation
Preview locally | Run zola serve and check the result
Build | Run zola build to emit static files
{% </steps> %}


## Quick start

{% <console> %}
$ git clone <repo-url> themes/helloblog
$ zola serve
Web Server is available at http://127.0.0.1:1111/
{% </console> %}


{% <info> %}
The theme requires Zola 0.23 or later and does not need Node.js; Tera components are supported natively.
{% </info> %}


See the [configuration guide](../config-guide/) for every option, the minimum setup and common pitfalls.

## Directory layout

{% <filetree> %}
content/
  posts/
    theme-introduction/
      index.md | Chinese content
      index.en.md | English translation
    config-guide/ | Configuration docs
  about/ | About page
  link/ | Links page
data/
  link.json | Friend links data
  music.json | Playlist data
templates/
  components/ | Writing components
{% </filetree> %}


## License and feedback

The theme is open source under the MIT license. Issues and pull requests are welcome.
