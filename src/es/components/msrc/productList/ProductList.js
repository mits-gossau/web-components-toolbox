// @ts-check
/** @typedef {{
  pushHistory?: boolean,
  fetchSubTags: boolean,
  clearSubTags: boolean,
  isActive: boolean,
  origEvent: CustomEvent,
  tags: [string],
  this: HTMLElement,
  textContent: string
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
    super({
      importMetaUrl: import.meta.url,
      intersectionObserverInit: { },
      ...options
    }, ...args)
    this.config = this.configSetup()
    this.requestListArticlesEventListener = event => this.widgetRenderSetup(event)
    // inform about the url which would result on this filter
    this.requestHrefEventListener = event => {
      if (event.detail && event.detail.resolve) event.detail.resolve(this.setFilter(event).href)
    }
    this.updatePopState = event => {
      /** @type {productListEventDetail} */
      if (!event.detail) event.detail = { ...event.state }
      this.widgetRenderSetup(event, false)
    }
  }

  connectedCallback () {
    super.connectedCallback()
    document.body.addEventListener(this.getAttribute('request-list-articles') || 'request-list-articles', this.requestListArticlesEventListener)
    document.body.addEventListener('request-href-' + (this.getAttribute('request-list-articles') || 'request-list-articles'), this.requestHrefEventListener)
    if (!this.hasAttribute('no-popstate')) self.addEventListener('popstate', this.updatePopState)
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    document.body.removeEventListener(this.getAttribute('request-list-articles') || 'request-list-articles', this.requestListArticlesEventListener)
    document.body.removeEventListener('request-href-' + (this.getAttribute('request-list-articles') || 'request-list-articles'), this.requestHrefEventListener)
    if (!this.hasAttribute('no-popstate')) self.removeEventListener('popstate', this.updatePopState)
  }

  intersectionCallback (entries, observer) {
    if ((this.isIntersecting = entries && entries[0] && entries[0].isIntersecting)) {
      this.hidden = true
      const showPromises = []
      if (this.shouldRender()) showPromises.push(this.render())
      Promise.all(showPromises).then(() => {
        this.hidden = false
        if (this.shouldRenderCSS()) {
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
    if (!setup || Object.keys(setup).length === 0) return
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
      if (setFilter) this.setFilter(event)
    } else if ((detail = this.getFilter())) {
      // check if this has no subTags and won't clear subTags plus if there has been a detailWithSubTags in the url pre-run it
      if (!detail.fetchSubTags && !detail.clearSubTags) {
        const detailWithSubTags = this.getFilter('detailWithSubTags')
        if (detailWithSubTags) await this.widgetRenderSetup({ detail: detailWithSubTags }, false)
      }
      event = {
        detail
      }
      event.detail.textContent = event.detail.tags.join(' ')
    }
    this.setTitle(event)
    if (event) this.config.filterOptions.category = event.detail.tags || this.configSetup().filterOptions.category
    let subTagFetch
    this.dispatchEvent(new CustomEvent(this.getAttribute('list-articles') || 'list-articles', {
      detail: {
        this: this,
        config: this.config,
        msrcProductListWrapper: this.msrcProductListWrapper,
        tags: this.config?.filterOptions.category,
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
  shouldRenderCSS () {
    return this.hasAttribute('id') ? !this.root.querySelector(`:host > style[_css], #${this.getAttribute('id')} > style[_css]`) : !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  shouldRender () {
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
   * @param {CustomEvent} event
   * @return {URL}
   */
  setFilter (event) {
    const detail = {
      pushHistory: event.detail.pushHistory,
      fetchSubTags: event.detail.fetchSubTags,
      clearSubTags: event.detail.clearSubTags,
      tags: event.detail.tags
    }
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    const detailValue = encodeURIComponent(JSON.stringify(detail))
    url.searchParams.set('detail', detailValue)
    // save the last with sub categories into the url
    if (detail.fetchSubTags) url.searchParams.set('detailWithSubTags', detailValue)
    if (detail.pushHistory !== false) history.pushState({ ...history.state, ...detail }, document.title, url.href)
    return url
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

  /**
   * @param {CustomEvent | null} event
   * @param {false | string} [addToTitle = false]
   */
  setTitle (event, addToTitle = false) {
    let textContent
    if (event && event.detail && event.detail.textContent && (textContent = event.detail.textContent.trim())) {
      if (addToTitle) {
        document.title = document.title.replace(new RegExp(`(.*)${addToTitle.replace(/\s/g, '\\s').replace(/\|/g, '\\|')}.*`), '$1')
        document.title += addToTitle + textContent
      } else if (document.title.includes('|')) {
        document.title = document.title.replace(/[^|]*(.*)/, textContent + ' $1')
      } else {
        document.title = textContent
      }
    }
  }
}
