/* ====================<运行时文案>==================== */

// 构建期由 baseof.html 输出，缺字段时用调用处传入的兜底文案
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

/* ====================<明暗切换>==================== */

const lds = ['light', 'dark']

const setLd = (ld) => {
  lds.forEach((name) => document.body.classList.remove(name))
  document.body.classList.add(ld)
  localStorage.setItem('ld', ld)
  console.info(`[INFO]:亮暗设置成功,当前布局为${ld}`)
}

export const toggleLd = () => {
  setLd(document.body.classList.contains('light') ? 'dark' : 'light')
}

/* ====================<沉浸阅读>==================== */

export const setImmersive = () => {
  const immersive = document.body.classList.toggle('immersive')
  console.info(`[INFO]:沉浸模式${immersive ? '开启' : '关闭'}`)
}

/* ====================<音乐播放器>==================== */

// 歌曲数据由 Hugo 从 data/music.json 在构建期嵌入页面
const dataEl = document.getElementById('music-data')
const config = dataEl ? JSON.parse(dataEl.textContent) : { songs: [] }
const musicList = config.songs || []

const player = document.getElementById('music-player')
const coverImg = player?.querySelector('.mp-cover-img')
const coverFallback = player?.querySelector('.mp-cover-fallback')
const titleEl = player?.querySelector('.mp-title')
const artistEl = player?.querySelector('.mp-artist')
const statusEl = player?.querySelector('.mp-status')
const currentTimeEl = player?.querySelector('.mp-current-time')
const durationEl = player?.querySelector('.mp-duration')
const seekEl = player?.querySelector('.mp-seek')
const volumeEl = player?.querySelector('.mp-volume-range')
const listEl = player?.querySelector('.mp-list')
const items = [...(player?.querySelectorAll('.mp-item') ?? [])]

let howler = null
let timer = null
let loadFailCount = 0
let musicIndex = 0
let volume = 1
let musicTime = 0
let duration = 0
let isPlaying = false
let isMuted = false
let mountToken = 0
let howlClass = null

// howler 体积较大：首次播放时才按 meta 地址加载，只浏览不点播放不会产生该请求
const loadHowl = () => {
  if (!howlClass) {
    const src = document.querySelector('meta[name="music-script"]')?.content
    if (!src) return Promise.reject(new Error('music script missing'))
    howlClass = import(src).then((mod) => mod.Howl)
    howlClass.catch(() => {
      howlClass = null
    })
  }
  return howlClass
}

const formatTime = (time) => {
  const min = Math.floor(time / 60)
  const s = Math.floor(time % 60)
  return `${min}:${s < 10 ? '0' : ''}${s}`
}

const setStatus = (text, error = false) => {
  if (!statusEl) return
  statusEl.hidden = !text
  statusEl.textContent = text || ''
  statusEl.classList.toggle('mp-status-error', error)
}

const renderProgress = () => {
  if (currentTimeEl) currentTimeEl.textContent = formatTime(musicTime)
  if (durationEl) durationEl.textContent = formatTime(duration)
  if (seekEl) seekEl.value = String(duration ? (musicTime / duration) * 100 : 0)
}

const renderCurrent = () => {
  if (!player) return
  const song = musicList[musicIndex]

  if (titleEl) titleEl.textContent = song?.title || '未选择歌曲'
  if (artistEl) artistEl.textContent = song?.artist || '未知艺术家'

  if (coverImg) {
    coverImg.hidden = !song?.cover
    if (song?.cover) coverImg.src = song.cover
  }
  if (coverFallback) coverFallback.hidden = !!song?.cover

  if (seekEl) seekEl.disabled = !song
  player.classList.toggle('playing', isPlaying)
  player.classList.toggle('muted', isMuted || volume === 0)
  renderProgress()

  items.forEach((item, index) => item.classList.toggle('on', index === musicIndex))
}

const musicStop = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const musicStart = () => {
  if (!howler) return
  musicStop()
  timer = setInterval(() => {
    musicTime = howler?.seek() ?? 0
    renderProgress()
  }, 500)
}

const musicUnmount = () => {
  musicStop()
  if (howler) {
    howler.unload()
    howler = null
  }
}

const nextMusic = () => {
  if (!musicList.length) return
  loadMusic((musicIndex + 1 + musicList.length) % musicList.length, true)
}

const musicMount = async (song, autoplay) => {
  musicUnmount()
  if (!song.audio) return

  const token = ++mountToken
  musicTime = 0
  duration = 0
  setStatus(i18n('musicLoading', '加载中…'))
  renderProgress()

  let Howl = null
  try {
    Howl = await loadHowl()
  } catch (error) {
    console.error('[ERR]:音乐模块加载失败', error)
    setStatus(i18n('musicLoadFailed', '音乐源加载失败'), true)
    return
  }
  // 等待模块加载期间用户可能又切了歌，丢弃过期请求
  if (token !== mountToken) return

  howler = new Howl({
    src: [song.audio, ...(song.backupAudio || [])],
    html5: true,
    autoplay,
    volume: isMuted ? 0 : volume,
    onplay: () => {
      isPlaying = true
      renderCurrent()
      musicStart()
    },
    onpause: () => {
      isPlaying = false
      renderCurrent()
      musicStop()
    },
    onstop: () => {
      isPlaying = false
      renderCurrent()
      musicStop()
    },
    onend: () => {
      isPlaying = false
      musicStop()
      nextMusic()
    },
    onload: () => {
      duration = howler?.duration() ?? 0
      loadFailCount = 0
      setStatus('')
      renderCurrent()
    },
    onloaderror: () => {
      setStatus('')
      loadFailCount += 1
      if (loadFailCount >= musicList.length) {
        setStatus(i18n('musicLoadFailed', '音乐源加载失败'), true)
        console.error('[ERR]:音乐源全部加载失败，已停止自动切歌')
        return
      }
      nextMusic()
    },
  })

  // html5 模式下 Howler 要等 canplaythrough 才写内部时长，这里直接听 loadedmetadata
  const audioNode = howler?._sounds?.[0]?._node
  audioNode?.addEventListener(
    'loadedmetadata',
    () => {
      duration = Math.ceil(audioNode.duration * 10) / 10
      renderProgress()
    },
    { once: true },
  )
}

const loadMusic = (index, autoplay) => {
  const target = musicList[index]
  if (!target) return
  musicIndex = index
  renderCurrent()
  musicMount(target, autoplay)
}

const toggleMusic = () => {
  if (howler && howler.playing()) {
    howler.pause()
    return
  }
  if (howler) {
    howler.play()
    return
  }
  if (musicList.length) loadMusic(musicIndex, true)
}

const preMusic = () => {
  if (!musicList.length) return
  loadMusic((musicIndex - 1 + musicList.length) % musicList.length, true)
}

const selectMusic = (index) => {
  if (index === musicIndex) {
    toggleMusic()
    return
  }
  loadMusic(index, true)
}

const setVolume = (vol) => {
  volume = vol
  if (howler) howler.volume(isMuted ? 0 : volume)
  player?.classList.toggle('muted', isMuted || volume === 0)
}

const toggleMuted = () => {
  isMuted = !isMuted
  if (howler) howler.mute(isMuted)
  player?.classList.toggle('muted', isMuted || volume === 0)
}

export const initMusic = () => {
  if (!player) return

  document.querySelector('.music-btn')?.addEventListener('click', toggleMusicPanel)

  player.querySelector('.mp-close')?.addEventListener('click', () => {
    player.classList.remove('open')
    listEl?.classList.remove('open')
  })

  player.querySelector('.mp-prev')?.addEventListener('click', preMusic)
  player.querySelector('.mp-next')?.addEventListener('click', nextMusic)
  player.querySelector('.mp-play')?.addEventListener('click', toggleMusic)
  player.querySelector('.mp-mute')?.addEventListener('click', toggleMuted)
  player.querySelector('.mp-listtoggle')?.addEventListener('click', () => {
    listEl?.classList.toggle('open')
  })

  seekEl?.addEventListener('input', () => {
    if (howler && duration) howler.seek((Number(seekEl.value) / 100) * duration)
  })
  volumeEl?.addEventListener('input', () => setVolume(Number(volumeEl.value)))

  items.forEach((item) => {
    item.addEventListener('click', () => selectMusic(Number(item.dataset.index)))
  })

  coverImg?.addEventListener('error', () => {
    coverImg.hidden = true
    if (coverFallback) coverFallback.hidden = false
  })

  // 只先渲染首曲信息，首次点击播放时再加载音频模块
  if (musicList.length) renderCurrent()
  console.info('[INFO]:音乐播放器初始化完成')
}

export const toggleMusicPanel = () => {
  if (!player) return
  const open = player.classList.toggle('open')
  if (!open) listEl?.classList.remove('open')
}

/* ====================<语言菜单>==================== */

const localeMenu = () => document.querySelector('.locale-menu')
const localeBtn = () => document.querySelector('.locale-btn')

const closeLocale = () => {
  const menu = localeMenu()
  if (!menu?.classList.contains('open')) return
  menu.classList.remove('open')
  localeBtn()?.setAttribute('aria-expanded', 'false')
}

const localeItems = () => [...(localeMenu()?.querySelectorAll('.locale-item') ?? [])]

// 菜单内 ↑↓ 循环、Home/End 跳首尾
const moveLocaleFocus = (step) => {
  const list = localeItems()
  if (!list.length) return
  const current = list.indexOf(document.activeElement)
  list[(current + step + list.length) % list.length]?.focus()
}

export const toggleLocale = () => {
  const menu = localeMenu()
  const btn = localeBtn()
  if (!menu) return
  const open = menu.classList.toggle('open')
  btn?.setAttribute('aria-expanded', String(open))
  if (open) menu.querySelector('.locale-item.on')?.focus()
}

export const initLocale = () => {
  const btn = localeBtn()
  if (!btn) return

  btn.addEventListener('click', toggleLocale)

  // 触发按钮上按 ↓ 直接打开并聚焦第一项
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!localeMenu()?.classList.contains('open')) toggleLocale()
      localeItems()[0]?.focus()
    }
  })

  localeMenu()?.addEventListener('keydown', (e) => {
    const list = localeItems()
    if (!list.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveLocaleFocus(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveLocaleFocus(-1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      list[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      list[list.length - 1]?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closeLocale()
      btn.focus()
    }
  })

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.locale-wrap')) closeLocale()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLocale()
  })
  console.info('[INFO]:语言菜单初始化完成')
}

/* ====================<绑定>==================== */

export const initHeader = () => {
  document.querySelector('.ld-btn')?.addEventListener('click', toggleLd)
  document.querySelector('.immersive-btn')?.addEventListener('click', setImmersive)
  initLocale()
}
