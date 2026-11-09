/* ====================<index 配置>==================== */

// 构建期由 home.html 输出的 <script id="index-config">，缺失时用各处兜底值
const indexConfig = (() => {
  const el = document.getElementById('index-config')
  if (!el) return {}
  try {
    return JSON.parse(el.textContent)
  } catch {
    return {}
  }
})()

/* ====================<首页热力图>==================== */

const heatmapPad = (num) => String(num).padStart(2, '0')

let heatmapRoot = null
let heatmapData = { years: [], activity: {} }
let heatmapYear = null
let heatmapMonth = 1

const heatmapSelect = (name) => heatmapRoot?.querySelector(`[data-select="${name}"]`)

const heatmapCloseMenus = () => {
  heatmapRoot?.querySelectorAll('.custom-select').forEach((select) => {
    select.querySelector('.dropdown-menu')?.classList.remove('open')
    select.querySelector('.select-trigger')?.classList.remove('active')
    select.querySelector('.select-arrow')?.classList.remove('rotated')
  })
}

const heatmapToggleMenu = (select) => {
  const menu = select.querySelector('.dropdown-menu')
  const open = menu?.classList.contains('open')
  heatmapCloseMenus()
  if (!open && menu) {
    menu.classList.add('open')
    select.querySelector('.select-trigger')?.classList.add('active')
    select.querySelector('.select-arrow')?.classList.add('rotated')
  }
}

// 与 Vue 版一致：活动数 ≥4 封顶为 4 级
const heatmapLevel = (activity) => Math.min(activity, 4)

const heatmapRenderGrid = () => {
  const content = heatmapRoot?.querySelector('.heatmap-content')
  if (!content) return

  const grid = document.createElement('div')
  grid.className = 'heatmap-grid'

  const daysInMonth = new Date(heatmapYear, heatmapMonth, 0).getDate()
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${heatmapYear}-${heatmapPad(heatmapMonth)}-${heatmapPad(day)}`
    const activity = heatmapData.activity[date] ?? 0
    const cell = document.createElement('span')
    cell.className = `heatmap-cell heatmap-lv${heatmapLevel(activity)}`
    cell.title = `${date}：${activity > 0 ? activity + ' 次活动' : '无活动'}`
    grid.appendChild(cell)
  }

  content.replaceChildren(grid)
}

const heatmapMarkActive = (select, value) => {
  select?.querySelectorAll('.dropdown-item').forEach((item) => {
    item.classList.toggle('active', Number(item.dataset.value) === Number(value))
  })
}

const heatmapRender = () => {
  const yearSelect = heatmapSelect('year')
  const monthSelect = heatmapSelect('month')
  if (!yearSelect || !monthSelect || !heatmapYear) return

  yearSelect.querySelector('.select-value').textContent = `${heatmapYear}年`
  heatmapMarkActive(yearSelect, heatmapYear)

  monthSelect.querySelector('.select-value').textContent =
    monthSelect.querySelector(`.dropdown-item[data-value="${heatmapMonth}"]`)?.textContent ?? ''
  heatmapMarkActive(monthSelect, heatmapMonth)

  heatmapRenderGrid()
}

// 取该年份里最近一个有活动的月份，避免切年后停在无数据的月份
const heatmapDefaultMonth = (year) => {
  let month = 1
  Object.entries(heatmapData.activity).forEach(([date, count]) => {
    const dateMonth = Number(date.slice(5, 7))
    if (date.startsWith(`${year}-`) && count > 0) {
      month = Math.max(month, dateMonth)
    }
  })
  return month
}

const heatmapSetYear = (year) => {
  heatmapYear = year
  heatmapMonth = heatmapDefaultMonth(year)
  heatmapRender()
}

const heatmapSetMonth = (month) => {
  heatmapMonth = month
  heatmapRender()
}

export const initHitmap = () => {
  heatmapRoot = document.querySelector('.heatmap-wrapper')
  if (!heatmapRoot) return

  // Zola 侧只输出 { dates: [...] }，这里折算成按日期的活动次数与年份列表
  const dataEl = document.getElementById('heatmap-data')
  const rawDates = dataEl ? (JSON.parse(dataEl.textContent).dates ?? []) : []
  const activity = {}
  rawDates.forEach((date) => {
    activity[date] = (activity[date] ?? 0) + 1
  })
  heatmapData = {
    years: [...new Set(rawDates.map((date) => date.slice(0, 4)))].sort().reverse(),
    activity,
  }
  const years = heatmapData.years ?? []
  if (!years.length) return

  heatmapYear = years[0]
  heatmapMonth = heatmapDefaultMonth(heatmapYear)

  heatmapRoot.querySelectorAll('.custom-select').forEach((select) => {
    const name = select.dataset.select
    select.querySelector('.select-trigger')?.addEventListener('click', (e) => {
      e.stopPropagation()
      heatmapToggleMenu(select)
    })
    select.querySelector('.dropdown-menu')?.addEventListener('click', (e) => e.stopPropagation())
    select.querySelectorAll('.dropdown-item').forEach((item) => {
      item.addEventListener('click', () => {
        if (name === 'year') heatmapSetYear(Number(item.dataset.value))
        else heatmapSetMonth(Number(item.dataset.value))
        heatmapCloseMenus()
      })
    })
  })

  document.addEventListener('click', heatmapCloseMenus)
  heatmapRender()
  console.info('[INFO]:热力图初始化完成')
}

/* ====================<particle>==================== */

export const particles = () => {
  const LINK_DISTANCE = indexConfig.particleDistance ?? 180 // 连接长度阈值
  const PARTICLE_COUNT = 80 // 桌面端粒子数
  const PARTICLE_COUNT_SM = 32 // 移动端（≤768px）粒子数
  const DPR_CAP = 2
  const REPEL_DISTANCE = 110 // 光标排斥半径
  const REPEL_STRENGTH = 2.2 // 光标排斥强度（每帧位移）
  const RIPPLE_MAX = 140 // 涟漪最大半径，超过即销毁
  const RIPPLE_SPEED = 3.2 // 涟漪每帧扩张量
  const RIPPLE_FORCE = 6 // 点击时附近粒子获得的径向冲量

  // 画布上下文与尺寸
  let canvas = null
  let ctx = null
  let width = 0
  let height = 0
  let raf = null
  let resizeRaf = null
  // 粒子与鼠标状态
  let particleList = []
  let mouse = null
  let rippleList = []

  // 主题色：随亮暗/主题切换读取 CSS 变量
  const pickThemeColor = () => getComputedStyle(canvas).getPropertyValue('--g-color').trim()

  // rgb 分量在主题色变化时预解析一次，避免连线循环里反复解析字符串
  let colorRgb = { r: 0, g: 0, b: 0 }
  const parseColor = (hex) => {
    const _hex = hex.replace('#', '')
    colorRgb = {
      r: parseInt(_hex.slice(0, 2), 16),
      g: parseInt(_hex.slice(2, 4), 16),
      b: parseInt(_hex.slice(4, 6), 16),
    }
  }
  const toRgba = (opacity) => `rgba(${colorRgb.r},${colorRgb.g},${colorRgb.b},${opacity})`

  // 主题色只在亮暗/主题变化时重读：Hugo 侧用 body 的 class 作为变化标识
  let themeKey = ''
  const syncThemeColor = () => {
    const key = document.body.className
    if (key === themeKey) return
    themeKey = key
    parseColor(pickThemeColor())
  }

  // 粒子配置：随机位置/速度/半径
  const createParticle = (canvasWidth, canvasHeight) => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vX: (Math.random() - 0.5) * 1.5,
    vY: (Math.random() - 0.5) * 1.5,
    radius: Math.random() * 2 + 1,
  })

  // 单粒子运行：移动 + 触边反弹 + 描点
  const runParticle = (particle) => {
    particle.x += particle.vX
    particle.y += particle.vY
    if (particle.x < 0 || particle.x > width) particle.vX = -particle.vX
    if (particle.y < 0 || particle.y > height) particle.vY = -particle.vY

    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
    ctx.fillStyle = toRgba(0.8)
    ctx.fill()
  }

  // 粒子间连线：间距小于阈值画线，透明度随距离增大
  const drawLinks = () => {
    for (let i = 0; i < particleList.length; i++) {
      const p1 = particleList[i]
      for (let j = i + 1; j < particleList.length; j++) {
        const p2 = particleList[j]
        const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y)
        if (distance < LINK_DISTANCE) {
          ctx.beginPath()
          ctx.strokeStyle = toRgba(1 - distance / LINK_DISTANCE)
          ctx.lineWidth = 1
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }
    }
  }

  // 鼠标连线：距鼠标最近的 8 个粒子与鼠标连线
  const drawMouseLinks = () => {
    if (!mouse) return
    const nearParticles = particleList
      .map((particle, index) => ({
        index,
        distance: Math.hypot(particle.x - mouse.x, particle.y - mouse.y),
      }))
      .filter((item) => item.distance < LINK_DISTANCE)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8)

    ctx.lineWidth = 1.5
    for (const item of nearParticles) {
      const particle = particleList[item.index]
      ctx.strokeStyle = toRgba(1 - item.distance / LINK_DISTANCE)
      ctx.beginPath()
      ctx.moveTo(particle.x, particle.y)
      ctx.lineTo(mouse.x, mouse.y)
      ctx.stroke()
    }
  }

  // 光标排斥：光标附近的粒子被轻微推开，移开后自行漂回原轨迹
  const applyRepel = () => {
    if (!mouse) return
    for (let i = 0; i < particleList.length; i++) {
      const particle = particleList[i]
      const dx = particle.x - mouse.x
      const dy = particle.y - mouse.y
      const distance = Math.hypot(dx, dy)
      if (distance > 0 && distance < REPEL_DISTANCE) {
        const force = (1 - distance / REPEL_DISTANCE) * REPEL_STRENGTH
        particle.x += (dx / distance) * force
        particle.y += (dy / distance) * force
      }
    }
  }

  // 点击涟漪：半径逐帧扩张并淡出，超出阈值即移除
  const runRipple = () => {
    for (let i = rippleList.length - 1; i >= 0; i--) {
      const ripple = rippleList[i]
      ripple.radius += RIPPLE_SPEED
      if (ripple.radius > RIPPLE_MAX) {
        rippleList.splice(i, 1)
        continue
      }
      ctx.beginPath()
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
      ctx.strokeStyle = toRgba(0.5 * (1 - ripple.radius / RIPPLE_MAX))
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }

  // 双端粒子配置：断点与 CSS 的 sm（768px）保持一致
  const particleCount = () => (window.matchMedia('(max-width: 768px)').matches ? PARTICLE_COUNT_SM : PARTICLE_COUNT)

  // 粒子数量同步：只按目标数量增删，不重建已有粒子，resize 时位置不会重置
  const syncParticleCount = () => {
    const target = particleCount()
    if (particleList.length < target) {
      for (let i = particleList.length; i < target; i++) {
        particleList.push(createParticle(width, height))
      }
    } else if (particleList.length > target) {
      particleList.length = target
    }
  }

  // 画布配置：DPR 缩放 + 重设尺寸（复用已有粒子，尺寸变化时粒子自行反弹回界内）
  const resizeCanvas = () => {
    const dpr = Math.min(devicePixelRatio, DPR_CAP)
    const vw = document.documentElement.clientWidth
    const vh = document.documentElement.clientHeight

    canvas.width = vw * dpr
    canvas.height = vh * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    width = vw
    height = vh

    syncParticleCount()
  }

  // resize 用 rAF 节流，连续拖拽窗口不再每个事件都重设画布
  const onResize = () => {
    if (resizeRaf) return
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null
      resizeCanvas()
    })
  }

  /* ====================<鼠标/触摸事件>==================== */
  const mouseMove = (e) => {
    mouse = { x: e.clientX, y: e.clientY }
  }
  const mouseLeave = () => {
    mouse = null
  }
  const touchMove = (e) => {
    if (e.touches.length > 0) {
      mouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }
  const touchLeave = () => {
    mouse = null
  }
  // 点击：生成涟漪，并给附近粒子一次径向冲量
  const windowClick = (e) => {
    rippleList.push({ x: e.clientX, y: e.clientY, radius: 0 })
    for (let i = 0; i < particleList.length; i++) {
      const particle = particleList[i]
      const dx = particle.x - e.clientX
      const dy = particle.y - e.clientY
      const distance = Math.hypot(dx, dy)
      if (distance > 0 && distance < RIPPLE_MAX) {
        const force = (1 - distance / RIPPLE_MAX) * RIPPLE_FORCE
        particle.x += (dx / distance) * force
        particle.y += (dy / distance) * force
      }
    }
  }

  // 清理器：停帧循环并解绑全部监听
  const stop = () => {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = null
    }
    if (resizeRaf) {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = null
    }
    window.removeEventListener('resize', onResize)
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('mouseleave', mouseLeave)
    window.removeEventListener('touchmove', touchMove)
    window.removeEventListener('touchend', touchLeave)
    window.removeEventListener('click', windowClick)

    particleList = []
    mouse = null
    rippleList = []
  }

  // 帧循环：清屏 → 排斥 → 跑粒子 → 粒子连线 → 鼠标连线 → 涟漪 → 下一帧
  const tick = () => {
    syncThemeColor()
    ctx.clearRect(0, 0, width, height)
    applyRepel()
    particleList.forEach((particle) => runParticle(particle))
    drawLinks()
    drawMouseLinks()
    runRipple()
    raf = requestAnimationFrame(tick)
  }

  // 启动函数：绑定画布/上下文/监听后进入帧循环
  const start = (el) => {
    canvas = el
    ctx = el.getContext('2d')
    resizeCanvas()

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseleave', mouseLeave)
    window.addEventListener('touchmove', touchMove, { passive: true })
    window.addEventListener('touchend', touchLeave)
    window.addEventListener('click', windowClick)
    tick()
  }

  return {
    start,
    stop,
  }
}

export const initParticle = () => {
  const canvas = document.querySelector('.particle-canvas')
  if (!canvas) return
  // 系统开启「减少动态效果」时不启动粒子，直接移除画布避免留白
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.remove()
    return
  }
  particles().start(canvas)
  console.info('[INFO]:粒子初始化完成')
}

/* ====================<typewrite>==================== */

const texts = indexConfig.welcome?.length ? indexConfig.welcome : ['欢迎来到我的博客', 'Welcome to my blog']
const onSpeed = indexConfig.increaseSpeed ?? 60 // 正向打字速度(打字间隔时间)
const unSpeed = indexConfig.decreaseSpeed ?? 40 // 反向打字速度
const loopSpeed = indexConfig.loopSpeed ?? 1000 // 句子轮询间隔时间

let welcomeEl = null
let strIndex = 0 // 句子索引，打到第几个句子了
let charIndex = 0 // 字符索引。打到第几个字符了
let increasing = true // 是否正向，正反两个打字方向

// 打字步进（内部递归）：正/反两个方向 + 句子轮询
const twStep = () => {
  const currentStr = texts[strIndex]
  if (increasing) {
    charIndex++
    welcomeEl.textContent = currentStr.slice(0, charIndex)
    // 反转打印方向，延时 loopSpeed 后重新执行
    if (charIndex === currentStr.length) {
      increasing = false
      setTimeout(twStep, loopSpeed)
      return
    }
    // 正向打字 + onSpeed 延时
    setTimeout(twStep, onSpeed)
  } else {
    charIndex--
    welcomeEl.textContent = currentStr.slice(0, charIndex)
    // 反转打印方向，延时 loopSpeed 后重新执行
    if (charIndex === 0) {
      increasing = true
      strIndex = (strIndex + 1) % texts.length
      setTimeout(twStep, loopSpeed)
      return
    }
    // 反向打字 + unSpeed 延时
    setTimeout(twStep, unSpeed)
  }
}

export const twWorker = () => {
  welcomeEl = document.querySelector('.welcome')
  if (!welcomeEl) return
  // 系统开启「减少动态效果」时直接显示首句，不做逐字动画
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    welcomeEl.textContent = texts[0]
    return
  }
  welcomeEl.textContent = ''
  twStep()
}
