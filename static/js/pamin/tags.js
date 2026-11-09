/* ====================<标签页>==================== */

let tagRoot = null
let tagCloudTags = []
let tagItems = []
let tagTimeline = null
let tagTitle = null
let tagItem = ''

const tagRender = () => {
  const active = tagItem.trim().toLowerCase()
  tagCloudTags.forEach((tag) => tag.classList.toggle('tag-on', tag.dataset.tag.trim().toLowerCase() === active))

  if (!tagItem) {
    tagTimeline.hidden = true
    return
  }

  tagTimeline.hidden = false
  // 标题模板由模板层按语言输出，{tag} 交给脚本替换
  tagTitle.textContent = (tagRoot.dataset.title || '{tag}').replaceAll('{tag}', tagItem)
  tagItems.forEach((item) => {
    const tags = JSON.parse(item.dataset.tags || '[]')
    item.hidden = !tags.some((tag) => tag.toLowerCase() === active)
  })
}

const tagToggle = (tag) => {
  tagItem = tagItem === tag ? '' : tag
  tagRender()
}

const initTagPage = () => {
  tagRoot = document.querySelector('.tag-list')
  if (!tagRoot) return

  tagCloudTags = [...tagRoot.querySelectorAll('.cloud-tag')]
  tagItems = [...tagRoot.querySelectorAll('.tl-item')]
  tagTimeline = tagRoot.querySelector('.timeline-area')
  tagTitle = tagRoot.querySelector('.tl-title')

  tagCloudTags.forEach((tag) => tag.addEventListener('click', () => tagToggle(tag.dataset.tag)))

  tagRender()
  console.info('[INFO]:标签页初始化完成')
}

export { initTagPage }
