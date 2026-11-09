// 归档页：视图切换 + 分组展开 / 收起
const archiveView = () => {
  const tabs = document.querySelectorAll('.view-tab')
  const views = document.querySelectorAll('.arch-view')
  if (!tabs.length) return

  console.info('[INFO]:归档页交互已就绪')

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view
      tabs.forEach((item) => item.classList.toggle('tab-on', item === tab))
      views.forEach((item) => item.classList.toggle('view-on', item.dataset.view === view))
    })
  })

  document.querySelectorAll('.group-header').forEach((header) => {
    header.addEventListener('click', () => {
      const group = header.closest('.arch-group')
      const body = group.querySelector('.group-body')
      const open = body.classList.toggle('open')
      header.classList.toggle('header-on', open)
      header.querySelector('.group-arrow').classList.toggle('arrow-open', open)
    })
  })
}

export { archiveView }
