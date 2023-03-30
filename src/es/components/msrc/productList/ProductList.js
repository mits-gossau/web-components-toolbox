// @ts-check
/** @typedef {{
  pushHistory?: boolean,
  fetchSubTags: boolean,
  clearSubTags: boolean,
  isActive: boolean,
  origEvent: CustomEvent,
  tags: [string],
  this: HTMLElement
}} productListEventDetail */

import { Prototype } from '../Prototype.js'
import { Intersection } from '../../prototypes/Intersection.js'

/* global CustomEvent */
/* global location */
/* global self */
/* global history */
/* global fetch */

export default class ProductList extends Intersection(Prototype()) {
  constructor (options = {}, ...args) {
    super(Object.assign(options, { intersectionObserverInit: {} }), ...args)
    this.config = this.configSetup()
    this.requestListArticlesEventListener = event => this.widgetRenderSetup(event)
    this.updatePopState = event => {
      if (!event.state) return
      /** @type {productListEventDetail} */
      if (!event.detail) event.detail = { ...event.state }
      this.widgetRenderSetup(event, false)
    }
  }

  connectedCallback () {
    super.connectedCallback()
    document.body.addEventListener(this.getAttribute('request-list-articles') || 'request-list-articles', this.requestListArticlesEventListener)
    self.addEventListener('popstate', this.updatePopState)
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    document.body.removeEventListener(this.getAttribute('request-list-articles') || 'request-list-articles', this.requestListArticlesEventListener)
    self.removeEventListener('popstate', this.updatePopState)
  }

  intersectionCallback (entries, observer) {
    if ((this.isIntersecting = entries && entries[0] && entries[0].isIntersecting)) {
      this.hidden = true
      const showPromises = []
      if (this.shouldComponentRender()) showPromises.push(this.render())
      Promise.all(showPromises).then(() => {
        this.hidden = false
        if (this.shouldComponentRenderCSS()) {
          this.renderCSS()
          // Issue loading animation hanging
          // https://jira.migros.net/browse/SHAREDCMP-2625
          setTimeout(() => {
            const scrollY = self.scrollY
            self.scroll(0, scrollY + 1)
            self.scroll(0, scrollY)
          }, 200)
          this.intersectionObserveStop()
        }
      })
    }
  }

  configSetup () {
    // https://react-components.migros.ch/?path=/docs/msrc-articles-06-widgets--product-list
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

  /**
   *
   *
   * @param {{detail: productListEventDetail} | null} [event=null]
   * @return {Promise<[void, any]>}
   */
  async widgetRenderSetup (event = null, setFilter = true) {
    let detail
    // check if it has a real event or else it renders the first-time after load at render
    if (event && event.detail && event.detail.tags) {
      if (setFilter) this.setFilter(event.detail)
    } else if ((detail = this.getFilter())) {
      // check if this has no subTags and won't clear subTags plus if there has been a detailWithSubTags in the url pre-run it
      if (!detail.fetchSubTags && !detail.clearSubTags) {
        const detailWithSubTags = this.getFilter('detailWithSubTags')
        if (detailWithSubTags) await this.widgetRenderSetup({ detail: detailWithSubTags }, false)
      }
      event = {
        detail
      }
    }
    if (event) this.config.filterOptions.category = event.detail.tags
    let subTagFetch
    this.dispatchEvent(new CustomEvent(this.getAttribute('list-articles') || 'list-articles', {
      detail: {
        this: this,
        config: this.config,
        msrcProductListWrapper: this.msrcProductListWrapper,
        tags: this.config.filterOptions.category,
        subTagFetch: (subTagFetch = event && event.detail.fetchSubTags
          ? fetch((this.getAttribute('endpoint') ? this.getAttribute('endpoint') : 'https://testadmin.alnatura.ch/umbraco/api/ProductsApi/GetCats?cat=') + this.config.filterOptions.category).then(async response => {
            if (response.status >= 200 && response.status <= 299) {
              return await response.json()
            }
            throw new Error(response.statusText)
          })
          : null),
        clearSubTags: event && event.detail.clearSubTags
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
    this.msrcProductListWrapper.scrollIntoView()
    return Promise.all([this.msrc.components.articles.productList(this.msrcProductListWrapper, this.config), subTagFetch])
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
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
    this.css = /* css */`
      a {
        color: var(--color);
      }
      :host h2 {
        font-family: "Helvetica Now Text XBold", var(--font-family-bold, var(--font-family, inherit));
      }
      /* msrc style overwrite */
      :host div[data-testid="msrc-articles--pagination"] {
        background-color: var(--color-secondary);
      }
      :host ul > li > button > div[color="text"] {
        color: var(--background-color);
      }
      :host ul > li > button[data-testid="msrc-articles--pagination-link-current-page"] > div[color="text"] {
        color: var(--color);
      }
      :host ul > li > button {
        border-color: var(--color-secondary);
      }
      :host ul > li > button[data-testid="msrc-articles--pagination-link-current-page"], :host ul > li > button:hover {
        border-color: var(--color-tertiary, var(--color-secondary));
      }
      :host ul > li > button[data-testid="msrc-articles--pagination-link-next"], :host ul > li > button[data-testid="msrc-articles--pagination-link-previous"] {
        color: var(--background-color);
      }
    `
  }

  /**
   * Set detail and page in window.history
   * @param {productListEventDetail} detail
   * @return {void}
   */
  setFilter (detail) {
    detail = {
      pushHistory: detail.pushHistory,
      fetchSubTags: detail.fetchSubTags,
      clearSubTags: detail.clearSubTags,
      tags: detail.tags
    }
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
    const detailValue = encodeURIComponent(JSON.stringify(detail))
    url.searchParams.set('detail', detailValue)
    // save the last with sub categories into the url
    if (detail.fetchSubTags) url.searchParams.set('detailWithSubTags', detailValue)
    if (detail.pushHistory !== false) history.pushState({ ...history.state, ...detail }, document.title, url.href)
  }

  /**
   * Get detail from url else store
   * @param {string} [name='detail']
   * @return {productListEventDetail|null}
   */
  getFilter (name = 'detail') {
    const urlParams = new URLSearchParams(location.search)
    try {
      return JSON.parse(decodeURIComponent(urlParams.get(name) || '')) || null
    } catch (e) {
      return null
    }
  }
}
