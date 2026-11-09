/* ====================<链接页>==================== */

// 分页窗口：当前页±2、最多 5 个页码（不足 5 项时向末尾补齐，无省略号）
const windowPages = (current, total) => {
  const pages = []
  let start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)
  if (end - start < 4) start = Math.max(1, end - 4)
  for (let p = start; p <= end; p++) pages.push(p)
  return pages
}

let linkRoot = null
let linkGrids = []
let linkPageNums = []
let linkDropdownItems = []
let linkDropdown = null
let linkPrev = null
let linkNext = null
let linkInfo = null
let linkPage = 1
let linkTotal = 0
let linkNames = []

const setDropdown = (mode) => {
  linkDropdown?.classList.toggle('open', mode)
}

const renderLinkPage = () => {
  linkGrids.forEach((grid, i) => grid.classList.toggle('grid-on', i === linkPage - 1))

  const displayPages = windowPages(linkPage, linkTotal)
  linkPageNums.forEach((btn, i) => {
    const page = i + 1
    btn.classList.toggle('page-on', page === linkPage)
    btn.hidden = !displayPages.includes(page)
  })

  linkDropdownItems.forEach((item, i) => item.classList.toggle('dropdown-on', i === linkPage - 1))

  if (linkPrev) linkPrev.disabled = linkPage === 1
  if (linkNext) linkNext.disabled = linkPage === linkTotal
  if (linkInfo) linkInfo.textContent = `第 ${linkPage} / ${linkTotal} 页 · 当前分类：${linkNames[linkPage - 1]}`
}

const linkChangePage = (page) => {
  if (page >= 1 && page <= linkTotal) {
    linkPage = page
    renderLinkPage()
  }
  setDropdown(false)
}

const initLinkPage = () => {
  linkRoot = document.querySelector('.link-list')
  if (!linkRoot) return

  linkGrids = [...linkRoot.querySelectorAll('.link-grid')]
  linkPageNums = [...linkRoot.querySelectorAll('.page-num')]
  linkNames = linkPageNums.map((btn) => btn.textContent.trim())
  linkTotal = linkPageNums.length
  linkDropdown = linkRoot.querySelector('.dropdown-card')
  linkDropdownItems = [...linkRoot.querySelectorAll('.dropdown-item')]
  linkPrev = linkRoot.querySelector('[data-action="prev"]')
  linkNext = linkRoot.querySelector('[data-action="next"]')
  linkInfo = linkRoot.querySelector('.pager-info')

  const categoryBtn = linkRoot.querySelector('.category-btn')
  const btnArea = linkRoot.querySelector('.btn-area')

  linkPrev?.addEventListener('click', () => linkChangePage(linkPage - 1))
  linkNext?.addEventListener('click', () => linkChangePage(linkPage + 1))
  linkPageNums.forEach((btn, i) => btn.addEventListener('click', () => linkChangePage(i + 1)))
  linkDropdownItems.forEach((item, i) => item.addEventListener('click', () => linkChangePage(i + 1)))

  categoryBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    setDropdown(!linkDropdown?.classList.contains('open'))
  })
  linkDropdown?.addEventListener('click', (e) => e.stopPropagation())
  btnArea?.addEventListener('click', () => setDropdown(false))

  renderLinkPage()
  console.info('[INFO]:链接页初始化完成')
}

export { initLinkPage }
