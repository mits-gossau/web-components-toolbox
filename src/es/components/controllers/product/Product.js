// @ts-check
/* global fetch */
/* global AbortController */
/* global location */
/* global CustomEvent */
/* global history */
/* global self */

import { Shadow } from '../../prototypes/Shadow.js'

/**
 * @export
 * @class Product
 * @type {CustomElementConstructor}
 */
export default class Product extends Shadow() {
  constructor (options = {}, ...args) {
    super({
      importMetaUrl: import.meta.url,
      mode: 'false',
      ...options
    }, ...args)
    this.abortController = null

    this.requestListProductListener = async event => {
      console.log('PRODUCT =>', event.detail)
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()
      const fetchOptions = {
        method: 'GET',
        signal: this.abortController.signal
      }
      // let endpoint = this.getAttribute('endpoint') + '?' + 'tags=' + event.detail.tags
      const localTestEndpoint = '../src/es/components/controllers/product/dummy_products.json'
      this.dispatchEvent(new CustomEvent(this.getAttribute('list-products') || 'list-products', {
        detail: {
          fetch: (this._fetch || (this._fetch = fetch(localTestEndpoint, fetchOptions))).then(response => {
            if (response.status >= 200 && response.status <= 299) {
              return response.json()
            }
            throw new Error(response.statusText)
          })
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
    // inform about the url which would result on this filter
    this.requestHrefEventListener = event => {
      if (event.detail && event.detail.resolve) event.detail.resolve(this.setTag(event.detail.tags.join(';'), event.detail.pushHistory).href)
    }
    this.updatePopState = event => {
      if (!event.detail) event.detail = { ...event.state }
      event.detail.pushHistory = false
      this.requestListEventsListener(event)
    }
  }

  connectedCallback () {
    this.addEventListener(this.getAttribute('request-list-product') || 'request-list-product', this.requestListProductListener)
    if (!this.hasAttribute('no-popstate')) self.addEventListener('popstate', this.updatePopState)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('request-list-product') || 'request-list-products', this.requestListProductListener)
    if (!this.hasAttribute('no-popstate')) self.removeEventListener('popstate', this.updatePopState)
  }

  /**
   * Set tag and page in window.history
   * @param {string} tag
   * @param {boolean} [pushHistory = true]
   * @return {URL}
   */
  setTag (tag, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    url.searchParams.set('tag', tag)
    url.searchParams.set('page', '1')
    if (pushHistory) history.pushState({ ...history.state, tag, page: '1' }, document.title, url.href)
    return url
  }

  /**
   * Get tag from url else store
   * @return string
   */
  getTags () {
    const urlParams = new URLSearchParams(location.search)
    const tag = urlParams.get('tag')
    if (tag) return tag
  }

  /**
   * Set page in window.history
   * @param {string} page
   * @param {boolean} [pushHistory = true]
   * @return {void}
   */
  setPage (page, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    if (page === '1') {
      url.searchParams.delete('page')
    } else {
      url.searchParams.set('page', page)
    }
    // set Page is very difficult and would need more testing, assumption that this wouldn't effect SEO anyways, since pages are proper links in opposite to buttons
    // this.setTitle(event, event.detail && event.detail.pageName ? ` ${event.detail.pageName} ` : ' Page ')
    if (pushHistory) history.pushState({ ...history.state, tag: this.getTags(), page }, document.title, url.href)
  }

  /**
   * Get page from url
   * @return [string]
   */
  getPage () {
    const urlParams = new URLSearchParams(location.search)
    return Number(urlParams.get('page') || 1)
  }

  /**
   * Get skip aka. offset for the api request from url else store
   * @return [number]
   */
  getCurrentPageSkip () {
    const page = this.getPage()
    return page - 1
  }

  /**
   * @param {CustomEvent} event
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
