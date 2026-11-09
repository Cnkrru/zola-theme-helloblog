/* ====================<sidebar>==================== */

export const toggleSidebar = () => {
  const sidebar = document.querySelector('.sidebar')
  if (!sidebar) return
  const open = sidebar.classList.toggle('sidebar-open')
  console.info(`[INFO]:侧栏${open ? '打开' : '关闭'}`)
}

/* ====================<ip>==================== */
// ip 结果模块级缓存，避免重复请求 ipinfo.io
let ipCache = null

// 天气胶囊里的兜底文案由模板输出，缺省用中文
const unknownText = () => document.querySelector('.weather-ip')?.dataset.unknown || '未知'

const setIp = (text) => {
  const ipEl = document.querySelector('.weather-ip .ip')
  if (!ipEl) return
  ipEl.textContent = text
  ipEl.classList.remove('weather-skeleton', 'weather-skeleton-city')
}

export const ip = async () => {
  if (ipCache) return ipCache
  try {
    const res = await fetch('https://ipinfo.io/json')
    const data = await res.json()
    ipCache = data
    setIp(data.city || unknownText())
    console.log('[INFO]:IP数据获取成功')
    return data
  } catch {
    // 失败时收起骨架并显示「未知」，避免天气胶囊一直空着
    setIp(unknownText())
    console.error('[ERR]:IP数据获取失败')
    return null
  }
}

/* ====================<weather>==================== */
const setWeather = (text) => {
  const weatherEl = document.querySelector('.weather-ip .weather-number')
  if (!weatherEl) return
  weatherEl.textContent = text
  weatherEl.classList.remove('weather-skeleton', 'weather-skeleton-temp')
}

export const weather = async () => {
  const ipData = await ip()
  // IP 失败时 ip() 内部已打日志，这里直接收起骨架
  if (!ipData?.loc) {
    setWeather('--°')
    return
  }

  const lat = ipData.loc.split(',')[0]
  const lon = ipData.loc.split(',')[1]

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
    )
    const data = await res.json()
    setWeather(`${String(data.current.temperature_2m)}°`)
    console.info('[INFO]:天气数据获取成功')
  } catch {
    setWeather('--°')
    console.error('[ERR]:天气数据获取失败')
  }
}

/* ====================<busuanzi>==================== */
let bszLoaded = false

// 与原版一致：挂载时注入一次不蒜子脚本
export const buSuanZi = () => {
  if (bszLoaded || document.querySelector('.bsz-script')) return
  bszLoaded = true
  const s = document.createElement('script')
  s.className = 'bsz-script'
  s.async = true
  s.defer = true
  s.src = 'https://cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js'
  document.body.appendChild(s)
}

/* ====================<绑定>==================== */
export const initSidebar = () => {
  document.querySelector('.menu-btn')?.addEventListener('click', toggleSidebar)
  document.querySelector('.sidebar-overlay')?.addEventListener('click', toggleSidebar)

  // 首页没有侧栏组件，不发起外部请求
  if (document.querySelector('.weather-ip')) weather()

  const statsBtn = document.querySelector('.bsz-btn')
  const statsBox = document.querySelector('.bsz-box')
  if (statsBtn && statsBox) {
    buSuanZi()
    statsBtn.addEventListener('click', () => statsBox.showModal())
    statsBox.querySelector('.bsz-close')?.addEventListener('click', () => statsBox.close())
  }
}
