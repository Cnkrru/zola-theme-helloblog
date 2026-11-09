+++
title = "配置指南"
date = 2026-11-07
description = "Helloblog 主题的配置分层、最小配置、全部参数说明与常见问题，可直接作为站点初始化模板。"
[taxonomies]
tags = ["hugo", "配置"]
[extra]
category = "文档"
keywords = ["hugo", "配置", "主题"]
+++


# 配置指南

本页说明主题的配置该怎么写：哪些由主题内置、哪些必须写在你的站点里、每个参数的作用，以及容易踩的坑。按顺序抄一遍就能跑起来。

## 配置分三层

| 文件 | 作用 | 要不要动 |
| --- | --- | --- |
| 主题根 `hugo.toml` | 主题内置默认值，Hugo 会自动合并进你的站点 | 不用动，需要时在站点里覆盖 |
| 站点 `hugo.toml` | 你自己的站点配置 | 必须写 |
| `exampleSite/hugo.toml` | 示例站配置，含仓库自测用的挂载 | 只作参考 |

<div class="admonition admonition-warn"><div class="admonition-head"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg><span class="admonition-title">警告</span></div><div class="admonition-body"><p>不要把 exampleSite/hugo.toml 整份复制到自己的站点。它的 [module] 段挂载的是 ../layouts、../assets 这些上层目录，只有「仓库根就是主题」的结构才成立。主题安装到 themes/helloblog 后这些路径不存在，构建会直接失败。</p></div></div>


## 最小可用配置

初始化站点只需要下面这些：

```toml
baseURL = 'https://your-domain.com/'
title = 'My Blog'
timeZone = 'Asia/Shanghai'
theme = 'helloblog'

# 生成 robots.txt，并指向 sitemap
enableRobotsTXT = true

# 标签只在 /tags/ 原地筛选，不生成 /tags/<term>/ 详情页
disableKinds = ['term']

# 首页额外输出 index.json，搜索功能依赖它
[outputs]
  home = ['html', 'rss', 'json']

# 列表页每页条数
[pagination]
  pagerSize = 6

# 只保留标签 taxonomy
[taxonomies]
  tag = 'tags'
```

<div class="admonition admonition-warn"><div class="admonition-head"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg><span class="admonition-title">警告</span></div><div class="admonition-body"><p>outputs.home 必须包含 json。少了它，搜索会静默失效，页面不报错但没有任何结果。</p></div></div>


## 只能写在站点里的配置

Hugo 只会把主题配置里的 `params`、`taxonomies`、`markup` 这类表合并进站点，下面这些是站点级配置，写在主题的 `hugo.toml` 里不生效：

| 配置 | 用途 |
| --- | --- |
| `outputs` | 首页 JSON 索引（搜索） |
| `pagination` | 列表分页条数 |
| `services.rss` | RSS 条目上限 |
| `imaging` | 图片处理画质与重采样 |
| `sitemap` | 抓取提示 |
| `module` | 主题安装方式 |

## 主题参数

`[params]` 已经有通用默认值，只写你想改的项即可。

| 参数 | 默认 | 说明 |
| --- | --- | --- |
| `description` | 空 | SEO 兜底描述，页面 front matter 优先 |
| `keywords` | 空 | SEO 兜底关键词 |
| `images` | `og-cover.png` | 社交分享默认封面，放 `static/` |
| `color_theme` | `sakura` | `sakura` / `purple` / `ink` / `cyan` / `blue` |
| `glass_opacity` | `0.5` | 玻璃拟态透明度，0~1 |
| `siteage` | 空 | 建站日期，留空则页脚不显示运行天数 |
| `avatar` | `avator.webp` | 侧栏头像，相对 `static/` |
| `saying` | 空 | 侧栏一句话，留空用 i18n 文案 |

### 首页

```toml
[params.index]
  logo = ''                     # 首页大标题，留空用 site.Title
  welcome = ['Hello, world']    # 打字机文案，可多句循环
  increase_speed = 60           # 打字间隔（毫秒）
  decrease_speed = 40           # 删除间隔（毫秒）
  loop_speed = 1000             # 句子切换前停顿（毫秒）
  particle_enable = true        # 粒子背景
  particle_distance = 180       # 粒子连线距离阈值
```

### 背景

```toml
[params.background]
  enable = true
  image = 'background.webp'     # 相对 static/
  overlay_dark = 0.6            # 暗色遮罩浓度
  overlay_light = 0.5           # 亮色遮罩浓度
```

### 评论

评论默认关闭。启用前需要先在 giscus 应用里拿到仓库信息，否则评论会挂到别人的仓库。

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

## 多语言

主题按文件名配对译文：`content/about/index.md` 对应 `content/about/index.en.md`。

```toml
defaultContentLanguage = 'zh'
defaultContentLanguageInSubdir = false   # 默认语言挂在根路径

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

数据文件同样支持多语言：默认读 `data/link.json`，英文站会自动改用 `data/link-en.json`（`music` 同理）。

## 导航菜单

导航由 Hugo 菜单驱动，加链接不需要改模板：

```toml
[[menus.main]]
  identifier = 'nav.posts'   # 对应 i18n 的 nav.posts
  name = '文章'              # identifier 缺失时的回退文案
  url = 'posts/'             # 相对地址，自动补语言前缀
  weight = 1
```

`identifier` 命中 `i18n/*.toml` 里的 `nav.*` 时优先用译文；`url` 写相对路径，英文站会变成 `/en/posts/`。

## 内容与字段

文章使用 page bundle：`content/posts/<slug>/index.md`。

```yaml
---
title: 文章标题
date: '2026-10-23'
lastmod: '2026-11-07'
category: 技术
tags: [hugo, markdown]
description: 文章摘要
keywords: [hugo, markdown]
draft: false
---
```

| 字段 | 用途 |
| --- | --- |
| `title` | 标题，用于页面标题与搜索索引 |
| `date` | 发布时间，列表与归档按它倒序 |
| `lastmod` | 更新时间，与 `date` 不同时文章页才显示更新块 |
| `category` | 归档页分组 |
| `tags` | 标签云与筛选 |
| `description` | meta description，缺省回退站点描述 |
| `keywords` | meta keywords，建议数组 |
| `draft` | Hugo 内置，`true` 时不参与构建 |
| `history` | 可选，更新记录数组，同时用于首页热力图 |

## 数据文件

友链与播放器的数据在站点 `data/` 下，不放在主题里：

- `data/link.json`：友链列表
- `data/music.json`：歌单

多语言站点在默认文件旁放 `link-en.json`、`music-en.json` 即可，无需改配置。

## 常见问题

<div class="qa"><details class="qa-item"><summary class="qa-q"><span class="qa-badge">Q</span>搜索没有结果</summary><div class="qa-a"><span class="qa-badge qa-badge-a">A</span>检查 outputs.home 是否包含 json，并确认 /index.json 可以访问</div></details><details class="qa-item"><summary class="qa-q"><span class="qa-badge">Q</span>评论不显示</summary><div class="qa-a"><span class="qa-badge qa-badge-a">A</span>检查 params.giscus.enable 是否为 true，repo_id 与 category_id 是否填写</div></details><details class="qa-item"><summary class="qa-q"><span class="qa-badge">Q</span>语言切换后 404</summary><div class="qa-a"><span class="qa-badge qa-badge-a">A</span>译文需与原文同目录、同文件名加语言后缀，如 index.en.md</div></details><details class="qa-item"><summary class="qa-q"><span class="qa-badge">Q</span>主题参数不生效</summary><div class="qa-a"><span class="qa-badge qa-badge-a">A</span>outputs、pagination、imaging、sitemap 等站点级配置写在主题里无效</div></details></div>


## 上线前检查

- `baseURL` 换成正式域名
- `params.description`、`params.images` 换成自己的
- `siteage` 填建站日期
- 确认 `hugo --minify` 构建 0 ERROR
- 若启用评论，验证 giscus 能正常加载
