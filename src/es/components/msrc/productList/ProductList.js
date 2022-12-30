// @ts-check
import { Prototype } from '../Prototype.js'

/* global CustomEvent */

export default class ProductList extends Prototype() {
  constructor (...args) {
    super(...args)
    this.config = this.configSetup()
    this.requestListArticlesEventListener = event => this.widgetRenderSetup(event)
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
    document.body.addEventListener(this.getAttribute('request-list-articles') || 'request-list-articles', this.requestListArticlesEventListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('request-list-articles') || 'request-list-articles', this.requestListArticlesEventListener)
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

  widgetRenderSetup (event = null) {
    if (event) this.config.filterOptions.category = event.detail.tags || [event.detail.category]
    this.dispatchEvent(new CustomEvent(this.getAttribute('list-articles') || 'list-articles', {
      detail: {
        this: this,
        config: this.config,
        msrcProductListWrapper: this.msrcProductListWrapper,
        tags: this.config.filterOptions.category,
        subTagFetch: event && event.detail.fetchSubTags
          ? fetch(`https://testadmin.alnatura.ch/umbraco/api/ProductsApi/GetCats?cat=${this.config.filterOptions.category}`).then(async response => {
            if (response.status >= 200 && response.status <= 299) {
              return await response.json()
            }
            throw new Error(response.statusText)
          })
          : null,
        clearSubTags: event && event.detail.clearSubTags
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
    return this.msrc.components.articles.productList(this.msrcProductListWrapper, this.config)
  }

  shouldComponentRender () {
    return !this.msrcProductListWrapper
  }

  render () {
    this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
    return this.loadDependency().then(async msrc => {
      this.msrc = msrc
      await this.widgetRenderSetup()
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
