// @ts-check
import { Prototype } from '../Prototype.js'

export default class ProductList extends Prototype() {
  constructor (...args) {
    super(...args)
    this.config = this.configSetup()
    this.requestArticleCategory = event => {
      this.config.filterOptions.category = [event.detail.tag]
      this.widgetRenderSetup()
    }
  }

  connectedCallback () {
    const showPromises = []
    if (this.shouldComponentRender()) showPromises.push(this.render())
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => {
        this.hidden = false
        this.renderCSS()
      })
    }
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.requestArticleCategory)
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.requestArticleCategory)
  }

  configSetup () {
    const setup = this.constructor.parseAttribute(this.getAttribute('config') || '{}')
    if (Object.keys(setup).length === 0) return
    setup.webAPIKey = this.getAttribute('web-api-key') || ''
    setup.mode = this.getAttribute('mode') || 'default'
    setup.environment = this.getAttribute('env') || 'local'
    setup.language = this.getAttribute('language') || 'de'
    setup.sort = this.getAttribute('sort') || 'updated_at'
    setup.paginationOptions.disabled = (this.getAttribute('pagination-disabled') === 'true')
    setup.filterOptions.category = [this.getAttribute('category') || '']
    return setup
  }

  widgetRenderSetup () {
    this.msrc.components.articles.productList(this.msrcProductListWrapper, this.config)
  }

  shouldComponentRender () {
    return !this.msrcProductListWrapper
  }

  render () {
    this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
    return this.loadDependency().then(async msrc => {
      this.msrc = msrc
      await msrc.components.articles.productList(this.msrcProductListWrapper, this.config)
      const getStylesReturn = this.getStyles(document.createElement('style'))
      this.html = [this.msrcProductListWrapper, getStylesReturn[0]]
      return getStylesReturn[1] // use this line if css build up should be avoided
    })
  }

  renderCSS () {
    this.css = /* css */ `
    a {
      color: var(--color);
    }
    :host h2 {
      font-family: "Helvetica Now Text XBold", var(--font-family-bold, var(--font-family, inherit));
    }`
  }
}
