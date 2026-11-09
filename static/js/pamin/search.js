import MiniSearch from '../../vendor/minisearch.js'

/* ====================<搜索>==================== */

// 构建期由 baseof.html 输出，缺字段时用兜底文案
const i18nData = (() => {
  const el = document.getElementById('i18n-data')
  if (!el) return {}
  try {
    return JSON.parse(el.textContent)
  } catch {
    return {}
  }
})()

const i18n = (key, fallback) => i18nData[key] || fallback

let input = null
let pane = null
let resultsEl = null
let miniSearch = null
let keyword = ''
let searchRes = []
let searchOpen = false
let searchFailed = false
let searchTimer = null
let posRaf = null

// 中文分词：英文按分隔符切，中文额外补充相邻二字切片
const slicer = (text) => {
  const words = String(text)
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
  const tokens = new Set(words)
  words.forEach((w) => {
    if (/[\u4e00-\u9fff]/.test(w) && w.length > 1) {
      for (let i = 0; i < w.length; i++) tokens.add(w.slice(i, i + 2))
    }
  })
  return [...tokens]
}

const escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const esc = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => escMap[c] ?? c)

// 只高亮首个命中片段，前后内容先转义再回填
const searchHl = (text, kw) => {
  const s = String(text ?? '')
  const k = (kw || '').trim()
  if (!k) return esc(s)
  const i = s.toLowerCase().indexOf(k.toLowerCase())
  if (i === -1) return esc(s)
  return `${esc(s.slice(0, i))}<b class="search-hit">${esc(s.slice(i, i + k.length))}</b>${esc(s.slice(i + k.length))}`
}

const syncPos = () => {
  if (!pane) return
  const r = pane.getBoundingClientRect()
  resultsEl.style.left = `${r.left}px`
  resultsEl.style.top = `${r.top + r.height + 8}px`
  resultsEl.style.width = `${r.width}px`
}

const render = () => {
  if (!searchRes.length) {
    resultsEl.innerHTML = `<div class="search-empty">${esc(i18n('searchNoResult', '搜索「{kw}」：未找到结果').replace('{kw}', keyword))}</div>`
    return
  }

  const list = searchRes
    .map((r) => {
      const tags = (r.tags || [])
        .map((t) => `<span class="search-tag">${esc(t)}</span>`)
        .join('')
      return `<button type="button" class="search-item" data-url="${esc(r.url)}">
        <span class="search-item-title">${searchHl(r.title, keyword)}</span>
        <span class="search-item-meta">${esc(i18n('searchCategory', '分类'))}: <span>${searchHl(r.category, keyword)}</span><span class="search-item-date">${searchHl(r.date, keyword)}</span></span>
        ${tags ? `<span class="search-item-tags">${tags}</span>` : ''}
      </button>`
    })
    .join('')

  const counter = i18n('searchCounter', '{count} 个结果').replace('{count}', searchRes.length)
  resultsEl.innerHTML = `<div class="search-counter">${esc(counter)}</div><div class="search-list">${list}</div>`
}

const show = () => {
  searchOpen = true
  syncPos()
  resultsEl.classList.add('open')
}

const hide = () => {
  searchOpen = false
  resultsEl.classList.remove('open')
}

const resetSearch = () => {
  keyword = ''
  searchRes = []
  if (input) input.value = ''
  hide()
}

// 收起面板并把焦点还给输入框
const closeSearch = () => {
  resetSearch()
  input?.focus()
}

// 从输入框直接进入第一条结果
const focusFirstResult = () => {
  const first = resultsEl?.querySelector('.search-item')
  if (first) first.focus()
}

// 在结果之间循环移动焦点
const moveFocus = (step) => {
  const list = [...(resultsEl?.querySelectorAll('.search-item') ?? [])]
  if (!list.length) return
  const current = list.indexOf(document.activeElement)
  list[(current + step + list.length) % list.length]?.focus()
}

const go = (url) => {
  resetSearch()
  window.location.href = url
}

const search = (q) => {
  if (!miniSearch) {
    // 索引缺失或构建失败时给用户明确提示，而不是静默无反应
    if (!searchFailed) return
    resultsEl.innerHTML = `<div class="search-empty">${esc(i18n('searchFailed', '搜索索引加载失败'))}</div>`
    show()
    return
  }
  searchRes = miniSearch
    .search(q)
    .slice(0, 10)
    .map((r) => ({
      url: r.url,
      title: r.title,
      category: r.category,
      tags: r.tags,
      date: r.date,
    }))
  render()
  show()
}

const buildIndex = async () => {
  try {
    // Zola 侧把文章元信息内联在 #search-data，缺失时回退到 data-index 指向的 JSON
    const inlineEl = document.getElementById('search-data')
    let docs
    if (inlineEl) {
      docs = JSON.parse(inlineEl.textContent)
    } else {
      const indexUrl = pane?.dataset.index
      if (!indexUrl) {
        searchFailed = true
        return
      }
      const res = await fetch(indexUrl, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      docs = await res.json()
    }
    miniSearch = new MiniSearch({
      fields: ['title', 'category', 'tags', 'date'],
      storeFields: ['url', 'title', 'category', 'tags', 'date'],
      tokenize: slicer,
      searchOptions: {
        boost: { title: 3, tags: 2, category: 1, date: 1 },
        fuzzy: 0.2,
        prefix: true,
        combineWith: 'OR',
      },
    })
    miniSearch.addAll(docs)
    console.info('[INFO]:minisearch初始化完成')
  } catch {
    searchFailed = true
    console.error('[ERR]:miniSearch初始化失败')
  }
}

const onEnter = (e) => {
  if (e.isComposing) return
  if (searchRes[0]) go(searchRes[0].url)
}

const syncOnView = () => {
  if (!searchOpen || posRaf) return
  posRaf = requestAnimationFrame(() => {
    posRaf = null
    syncPos()
  })
}

export const initSearch = () => {
  input = document.querySelector('.search input')
  pane = document.querySelector('.search')
  if (!input || !pane) return

  // 模块是延迟加载的，绑定前用户可能已经输入了字符
  keyword = input.value.trim()

  resultsEl = document.createElement('div')
  resultsEl.className = 'search-results'
  resultsEl.setAttribute('role', 'status')
  document.body.appendChild(resultsEl)

  input.addEventListener('input', () => {
    keyword = input.value.trim()
    if (searchTimer) clearTimeout(searchTimer)
    if (!keyword) {
      searchRes = []
      hide()
      return
    }
    searchTimer = setTimeout(() => search(keyword), 200)
  })

  input.addEventListener('focus', () => {
    if (keyword) show()
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      onEnter(e)
    } else if (e.key === 'Escape') {
      closeSearch()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusFirstResult()
    }
  })

  resultsEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveFocus(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveFocus(-1)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closeSearch()
    }
  })

  resultsEl.addEventListener('click', (e) => {
    const item = e.target.closest('.search-item')
    if (item?.dataset.url) go(item.dataset.url)
  })

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) hide()
  })
  document.addEventListener('scroll', syncOnView, true)
  window.addEventListener('resize', syncOnView)

  buildIndex().then(() => {
    if (keyword) search(keyword)
  })
}
