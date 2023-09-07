// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

export default class Tabs extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.tabs = []
    this.activeTab = 0
    this.tabList = document.createElement('div')
    this.tabList.setAttribute('role', 'tablist')
    this.tabContent = document.createElement('div')
    this.tabContent.className = 'tab-content'
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    this.tabs = Array.from(this.root.children).map(child => child.getAttribute('tab-title'))
    this.renderHTML()
  }

  updateTabs () {
    this.tabList.innerHTML = ''
    this.tabContent.innerHTML = ''

    this.tabs.forEach((tab, index) => {
      const tabButton = document.createElement('button')
      tabButton.dataset.bsTarget = `#nav-${tab && tab.toLowerCase()}`
      tabButton.type = 'button'
      tabButton.role = 'tab'
      tabButton.textContent = tab
      tabButton.addEventListener('click', () => this.showTab(index))
      this.tabList.appendChild(tabButton)

      const tabPane = document.createElement('div')
      tabPane.id = `nav-${tab && tab.toLowerCase()}`
      tabPane.classList.add('tab-pane')
      tabPane.innerHTML = this.root.children[index].innerHTML
      this.tabContent.appendChild(tabPane)
    })

    this.showTab(this.activeTab)
  }

  showTab (index) {
    if (index >= 0 && index < this.tabs.length) {
      this.activeTab = index
      const tabPanes = this.tabContent.querySelectorAll('.tab-pane')

      tabPanes.forEach((pane, i) => {
        if (i === index) {
          // @ts-ignore
          pane.style.display = 'block'
        } else {
          // @ts-ignore
          pane.style.display = 'none'
        }
      })
    }
  }

  shouldRenderCSS () {
    return !this.shadowRoot.querySelector(
      `:host > style[_css], ${this.tagName} > style[_css]`
    )
  }

  renderCSS () {
    this.css = /* css */ `
      :host {
      }`
  }

  renderHTML () {
    this.updateTabs()

    this.html = /* html */`
        <div>
            <nav>
                <div role="tablist">
                    ${this.tabList.innerHTML}
                </div>
            </nav>
            <div class="tab-content">
                ${this.tabContent.innerHTML}
            </div>
        </div>`

    
  }
}
