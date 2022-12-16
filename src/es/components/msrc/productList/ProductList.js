// @ts-check
import { Prototype } from '../Prototype.js'

/* global CustomEvent */

export default class ProductList extends Prototype() {
  constructor (...args) {
    super(...args)
    this.config = this.configSetup()
    this.answerArticleCategory = event => {
      this.config.filterOptions.category = [event.detail.tag || event.detail.category]
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
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerArticleCategory)
    this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
      detail: {},
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.requestArticleCategory)
  }

  configSetup () {
    const setup = this.constructor.parseAttribute(this.getAttribute('config') || '{}')
    if (Object.keys(setup).length === 0) return
    if (this.hasAttribute('web-api-key')) setup.webAPIKey = this.getAttribute('web-api-key') || ''
    if (this.hasAttribute('mode')) setup.mode = this.getAttribute('mode') || 'default'
    if (this.hasAttribute('env')) setup.environment = this.getAttribute('env') || 'local'
    if (this.hasAttribute('language')) setup.language = this.getAttribute('language') || 'de'
    if (this.hasAttribute('sort')) setup.sort = this.getAttribute('sort') || 'updated_at'
    if (this.hasAttribute('pagination-disabled') && setup.paginationOptions) setup.paginationOptions.disabled = (this.getAttribute('pagination-disabled') === 'true')
    if (this.hasAttribute('category') && setup.filterOptions) setup.filterOptions.category = [this.getAttribute('category') || '']
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
