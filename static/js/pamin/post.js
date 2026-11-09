import mediumZoom from '../../vendor/medium-zoom.js'
import QRCode from '../../vendor/qrcode.js'

/* ====================<share>==================== */

export const shareLink = (platform, url, title) => {
  const platformMap = {
    weibo: `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    qq: `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    tg: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  }

  return platformMap[platform]
}

export const linkOpen = (platform, url, title) => {
  window.open(shareLink(platform, url, title), '_blank', 'noopener')
}

export const shareQrcode = async (el, url) => {
  if (!el) return
  await QRCode.toCanvas(el, url)
  console.log('[INFO]:二维码生成成功')
}

export const qrcodeOpen = async (url) => {
  const canvas = document.querySelector('.qrcanvas')
  if (canvas) {
    await shareQrcode(canvas, url)
  }
  document.querySelector('.qrcode-dialog')?.showModal()
}

export const qrcodeClose = () => {
  document.querySelector('.qrcode-dialog')?.close()
}

export const shareCopy = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    toastOpen('success', `已成功复制${text}`)
    console.info('[INFO]:已复制指定内容')
  } else {
    console.error('[ERR]:复制指定内容失败')
  }
}

export const initShare = () => {
  const area = document.querySelector('.share-area')
  if (!area) return
  const url = area.dataset.url
  const title = area.dataset.title

  // 微信：生成二维码后打开弹窗
  area.querySelector('.weixin')?.addEventListener('click', () => qrcodeOpen(url))
  // 外链平台：统一走 shareLink 拼接，保持原博客的 encodeURIComponent 行为
  area.querySelectorAll('[data-platform]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault()
      linkOpen(btn.dataset.platform, url, title)
    })
  })
  // 复制链接：成功/失败由 shareCopy 内部提示
  area.querySelector('.copy-btn')?.addEventListener('click', () => shareCopy(url))
  // 二维码弹窗关闭
  area.querySelector('.dialog-close')?.addEventListener('click', qrcodeClose)

  console.info('[INFO]:分享初始化完成')
}

/* ====================<toast>==================== */

// toast图标map
const levelIconMap = {
  success:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="24" height="24" role="img" aria-label="成功"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4 9.4 24.6 9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="24" height="24" role="img" aria-label="信息"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>',
  warning:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="24" height="24" role="img" aria-label="警告"><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>',
  error:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="24" height="24" role="img" aria-label="错误"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4-9.4-24.6-9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>',
}
// 关闭图标cons
const xIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
let toastTimer = null

export const toastOpen = (level, mes) => {
  const toastOn = document.querySelector('.toast-box') ?? undefined
  if (!toastOn) {
    const body = document.body
    const toast = document.createElement('div')
    const icon = document.createElement('div')
    const message = document.createElement('span')
    const x = document.createElement('div')

    // 给父级加样式
    toast.className = 'toast-box'
    // 给level图标的位置填充一下图标，加一下样式
    icon.innerHTML = levelIconMap[level]
    icon.className = 'toast-icon'
    // 把toast消息填进去，加一下样式
    message.innerText = mes
    message.className = 'toast-mes'
    // 把关闭图标加上，加一下样式
    x.innerHTML = xIcon
    x.className = 'toast-close'
    x.addEventListener('click', () => toastClose())
    // 先给子级挂上去，生成时，先生成父级，再挂载子级
    toast.appendChild(icon)
    toast.appendChild(message)
    toast.appendChild(x)
    // 挂父级
    body.appendChild(toast)
    // 按照level添加对应样式
    toast.classList.add('toast-' + level)

    toastTimer = setTimeout(() => toastClose(), 3000)
  }
}

export const toastClose = () => {
  const toastOn = document.querySelector('.toast-box')
  if (toastOn && toastTimer) {
    clearTimeout(toastTimer)
    toastOn.remove()
    toastTimer = null
    console.info('[INFO]:toast已成功移除')
  }
}

/* ====================<返回顶部 + 阅读进度>==================== */

export const backToTop = () => {
  const area = document.querySelector('.main')
  const canArea = area && area.scrollHeight > area.clientHeight
  if (canArea) {
    area.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export const scrollProgress = () => {
  const area = document.querySelector('.main')
  // 收窄到返回顶部按钮内部，避免命中正文 progress 围栏代码块生成的 .progress
  const progress = document.querySelector('.back-top-btn .progress')
  if (!area || !progress) return

  const update = () => {
    // canArea 每次重算：内容撑开 .main 后滚动者会在 .main 与 window 之间切换
    const canArea = area.scrollHeight > area.clientHeight
    let _progress = 0
    if (canArea) {
      // 桌面端按 .main 容器行程计
      const total = area.scrollHeight - area.clientHeight
      _progress = total > 0 ? Math.min(1, area.scrollTop / total) : 0
    } else {
      // 移动端整页滚动时按正文块进出视口计
      const content = document.querySelector('.content')
      if (content) {
        const rect = content.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        _progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0
      }
    }
    progress.style.setProperty('--scroll-deg', _progress * 360 + 'deg')
  }

  area.addEventListener('scroll', update, { passive: true })
  window.addEventListener('scroll', update, { passive: true })
  update()
}

export const initBackToTop = () => {
  const btn = document.querySelector('.back-top-btn')
  if (!btn) return
  scrollProgress()
  btn.addEventListener('click', backToTop)
  console.info('[INFO]:返回顶部初始化完成')
}

/* ====================<正文组件>==================== */

const COPY_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'

let mermaidPromise = null
let mermaidObserver = null
let lastDark = null
let zoom = null

const isDark = () => document.body.classList.contains('dark')

// Chroma 把语言放在 code 的 data-lang 或 language-* 类上，取其一即可
const codeLang = (code) => code.dataset.lang || [...code.classList].find((name) => name.startsWith('language-'))?.slice(9)

const codeToolbar = (block, lang) => {
  // 补上原版依赖的 language-* 类，顶栏样式才能命中
  block.classList.add(`language-${lang}`)
  if (block.querySelector('.code-toolbar')) return

  const toolbar = document.createElement('div')
  toolbar.className = 'code-toolbar'
  toolbar.innerHTML =
    `<span class="lang lang-${lang}"><span class="lang-dot"></span><span class="lang-text">${lang}</span></span>` +
    `<button class="copy" type="button" aria-label="复制代码" title="复制代码">${COPY_ICON}</button>`
  block.prepend(toolbar)
}

const codeWrapper = (code) => {
  const existed = code.closest('.highlight')
  if (existed) return existed

  // 未命中 Chroma 高亮的语言（如 mermaid）只有裸 pre，这里补齐统一外壳
  const pre = code.closest('pre')
  if (!pre) return null
  const block = document.createElement('div')
  block.className = 'highlight'
  pre.parentNode.insertBefore(block, pre)
  block.appendChild(pre)
  return block
}

const codeRender = (root) => {
  root.querySelectorAll('pre > code').forEach((code) => {
    // 代码组面板已有自己的顶栏语义，不再补普通代码块顶栏
    if (code.closest('.code-group-panel')) return
    const lang = codeLang(code)
    if (!lang) return
    const block = codeWrapper(code)
    if (!block) return
    codeToolbar(block, lang)
  })
}

const copyInit = (root) => {
  root.addEventListener('click', (event) => {
    const button = event.target.closest('button.copy')
    if (!button) return
    const block = button.closest('.highlight')
    const text = block?.querySelector('pre code')?.textContent || ''
    navigator.clipboard.writeText(text).then(() => {
      button.classList.add('copied')
      setTimeout(() => {
        button.classList.remove('copied')
        button.blur()
      }, 2000)
    })
  })
}

const mermaidLoad = (root) => {
  // 页面里出现 id="mermaid" 的标题时，window.mermaid 会被同名元素占用，必须按能力判断
  if (window.mermaid?.run) return Promise.resolve(window.mermaid)
  if (mermaidPromise) return mermaidPromise

  const src = root.dataset.mermaid
  if (!src) return Promise.reject(new Error('mermaid script missing'))

  mermaidPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve(window.mermaid)
    script.onerror = () => reject(new Error('mermaid load failed'))
    document.head.appendChild(script)
  })
  return mermaidPromise
}

const mermaidRender = async (root) => {
  const nodes = [...root.querySelectorAll('.highlight.language-mermaid pre code')]
  if (!nodes.length) return

  // run 会用 svg 替换 code 内容：首次存源码，重渲染前还原源码并清掉 processed 标记
  nodes.forEach((code) => {
    const src = code.dataset.mermaidSrc ?? code.textContent ?? ''
    code.dataset.mermaidSrc = src
    code.textContent = src
    code.removeAttribute('data-processed')
  })

  try {
    const mermaid = await mermaidLoad(root)
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark() ? 'dark' : 'default',
    })
    await mermaid.run({ nodes })
  } catch (error) {
    console.error('[ERR]:mermaid渲染错误', error)
  }
}

const mermaidInit = (root) => {
  if (!root.querySelector('.highlight.language-mermaid')) return
  lastDark = isDark()
  mermaidRender(root)

  // 亮暗切换需要按当前主题重绘，全局只绑一次
  if (mermaidObserver) return
  mermaidObserver = new MutationObserver(() => {
    if (isDark() === lastDark) return
    lastDark = isDark()
    mermaidRender(root)
  })
  mermaidObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
}

const zoomInit = (root) => {
  const images = root.querySelectorAll('img')
  if (!images.length) return
  if (zoom) {
    zoom.attach('.content img')
    return
  }
  zoom = mediumZoom('.content img', { background: 'var(--g-bg)' })
}

export const initContent = () => {
  const root = document.querySelector('.content')
  if (!root) return
  codeRender(root)
  copyInit(root)
  mermaidInit(root)
  zoomInit(root)
  console.info('[INFO]:正文组件初始化完成')
}

/* ====================<评论区>==================== */

const GISCUS_ORIGIN = 'https://giscus.app'

let themeObserver = null

const themeUrl = (box) => {
  const mode = document.body.classList.contains('dark') ? 'dark' : 'light'
  const base = box.dataset.themeBase.replace(/\/$/, '')
  return `${window.location.origin}${base}/${box.dataset.colorTheme}-${mode}.css`
}

const commentTheme = (box) => {
  const frame = box.querySelector('iframe.giscus-frame')
  frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: themeUrl(box) } } }, GISCUS_ORIGIN)
}

const commentMount = (box) => {
  if (box.dataset.mounted) return
  box.dataset.mounted = '1'

  // 容器上的 data-* 原样搬到脚本上，giscus 只认 document.currentScript 上的配置
  const script = document.createElement('script')
  script.src = box.dataset.script
  Object.entries(box.dataset).forEach(([key, value]) => {
    if (['script', 'themeBase', 'colorTheme', 'mounted'].includes(key)) return
    script.dataset[key] = value
  })
  script.dataset.theme = themeUrl(box)

  // 加载完成收起骨架；失败则显示可操作提示
  const settle = (failed) => {
    box.classList.remove('comment-box-loading')
    box.setAttribute('aria-busy', 'false')
    if (failed) box.querySelector('.comment-failed')?.removeAttribute('hidden')
  }
  script.addEventListener('load', () => requestAnimationFrame(() => settle(false)))
  script.addEventListener('error', () => settle(true))

  box.insertAdjacentElement('afterend', script)

  // 亮暗切换后同步 iframe 主题，全局只绑一次
  if (themeObserver) return
  themeObserver = new MutationObserver(() => commentTheme(box))
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
}

export const initComments = () => {
  const box = document.querySelector('.comment-box .giscus[data-script]')
  if (!box) return
  commentMount(box)
  console.info('[INFO]:评论区初始化完成')
}

/* ====================<目录>==================== */

const items = () => [...document.querySelectorAll('.toc-item[href^="#"]')]
const headings = () => [...document.querySelectorAll('.content h1[id], .content h2[id], .content h3[id], .content h4[id], .content h5[id], .content h6[id]')]

let rafId = 0

const activeId = (id) => {
  items().forEach((item) => {
    item.classList.toggle('toc-item-on', decodeURIComponent(item.getAttribute('href').slice(1)) === id)
  })
}

// 正文可滚时滚 .main，否则整页滚动；布局变化（图片加载）后也能拿到当前容器
const probeCtn = () => {
  const main = document.querySelector('.main')
  return main && main.scrollHeight > main.clientHeight ? main : null
}

const jump = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  const ctn = probeCtn()
  if (ctn) {
    const top = el.getBoundingClientRect().top - ctn.getBoundingClientRect().top + ctn.scrollTop
    ctn.scrollTo({ top: top - 20, behavior: 'smooth' })
  } else {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' })
  }
  activeId(id)
}

const sync = () => {
  const list = headings()
  if (!list.length) return

  const ctn = probeCtn()
  const base = ctn ? ctn.getBoundingClientRect().top : 0
  let current = null
  list.forEach((heading) => {
    if (heading.getBoundingClientRect().top - base <= 100) current = heading
  })
  if (current) activeId(current.id)

  // 触底时最后一章可能进不了高亮区，直接补上
  const atBottom = ctn
    ? ctn.scrollTop + ctn.clientHeight >= ctn.scrollHeight - 2
    : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
  if (atBottom) activeId(list[list.length - 1].id)
}

const onScroll = () => {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    sync()
  })
}

export const initToc = () => {
  const anchors = items()
  if (!anchors.length) return

  window.addEventListener('scroll', onScroll, { passive: true })
  document.querySelector('.main')?.addEventListener('scroll', onScroll, { passive: true })

  anchors.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault()
      jump(decodeURIComponent(item.getAttribute('href').slice(1)))
      if (item.closest('.toc-dialog')) item.closest('.toc-dialog').close()
    })
  })

  const dialog = document.querySelector('.toc-dialog')
  document.querySelector('.toc-fab')?.addEventListener('click', () => dialog?.showModal())
  dialog?.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close())

  sync()
  console.info('[INFO]:目录初始化完成')
}
