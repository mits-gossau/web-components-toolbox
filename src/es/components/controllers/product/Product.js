// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global fetch */
/* global AbortController */
/* global CustomEvent */
/* global self */
/* global location */
/* global history */

/**
 * @export
 * @class Product
 * @type {CustomElementConstructor}
 */
export default class Product extends Shadow() {
  /**
   * @param {any} args
   */
  constructor (options = {}, ...args) {
    super({
      importMetaUrl: import.meta.url,
      mode: 'false',
      ...options
    }, ...args)

    this.abortController = null
  }

  connectedCallback () {
    // @ts-ignore
    if (!this.hasAttribute('no-popstate')) self.addEventListener('popstate', this.updatePopState)
    this.addEventListener(this.getAttribute('request-list-product') || 'request-list-product', this.requestListProductListener)
    this.addEventListener('request-href-' + (this.getAttribute('request-list-product') || 'request-list-product'), this.requestHrefEventListener)
  }

  disconnectedCallback () {
    // @ts-ignore
    if (!this.hasAttribute('no-popstate')) self.removeEventListener('popstate', this.updatePopState)
    this.removeEventListener(this.getAttribute('request-list-product') || 'request-list-product', this.requestListProductListener)
    this.removeEventListener('request-href-' + (this.getAttribute('request-list-product') || 'request-list-product'), this.requestHrefEventListener)
  }

  /**
   * Fetch products
   * @param {{ detail: any; }} event
   */
  requestListProductListener = async (event) => {
    console.log('PRODUCTS', event.detail)
    if (event.detail && event.detail.tags) this.setCategoryCode(event.detail.tags[0], event.detail.pushHistory)

    if (this.abortController) this.abortController.abort()
    this.abortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.abortController.signal
    }
    const limit = 100
    const categoryCode = this.getCategoryCode()
    const minPercentage = 50;
    const endpoint = this.getAttribute('endpoint') + `?categoryCode=${categoryCode}&limit=${limit}&min-percentage=${minPercentage}`
    this.dispatchEvent(new CustomEvent(this.getAttribute('list-product') || 'list-product', {
      detail: {
        fetch: fetch(endpoint, fetchOptions).then(async response => {
          if (response.status >= 200 && response.status <= 299) {
            const data = await response.json()
            return {
              tag: [categoryCode],
              ...data
            }
          }
          throw new Error(response.statusText)
        })
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  requestHrefEventListener = event => {
    if (event.detail && event.detail.resolve) event.detail.resolve(this.setCategoryCode(event.detail.tags[0], event.detail.pushHistory).href)
  }

  /**
   * Update pop state when navigating back/forward
   * @param {{ detail: { pushHistory: boolean; }; state: any; }} event
   */
  updatePopState = async (event) => {
    console.log('UPDATE_POP_STATE:', event)
    if (!event.detail) event.detail = { ...event.state }
    event.detail.pushHistory = false
    this.requestListProductListener(event)
  }

  /**
   * Set categoryCode
   * @param {string} categoryCode
   * @param {boolean} [pushHistory = true]
   * @return {URL}
   */
  setCategoryCode (categoryCode, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    url.searchParams.set('category-code', categoryCode)
    if (pushHistory) history.pushState({ ...history.state, categoryCode }, document.title, url.href)
    return url
  }

  /**
   * Get categoryCode
   * @return {string}
   */
  getCategoryCode () {
    const urlParams = new URLSearchParams(location.search)
    return urlParams.get('category-code') || 'all'
  }
}
