/* ====================<站点运行时长>==================== */

// 起始日期与文案模板由 hugo.toml / i18n 注入，对应原版 Vue 的插值写法
export const webageTick = () => {
  const box = document.querySelector('.siteage')
  const text = box?.querySelector('span')
  if (!box || !text || !box.dataset.start) return

  // 与原版一致：按总秒数换算天/时/分/秒
  const diffTime = Date.now() - Number(new Date(box.dataset.start))
  const totalSeconds = Math.floor(Math.max(diffTime, 0) / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const format = box.dataset.format || '%s 天 %s 时 %s 分 %s秒'
  const values = [days, hours, minutes, seconds]
  let i = 0
  text.textContent = format.replace(/%s/g, () => String(values[i++]))
}

export const webageStart = () => {
  if (!document.querySelector('.siteage')) return
  webageTick()
  setInterval(webageTick, 1000)
  console.info('[INFO]:站点运行时长初始化完成')
}
