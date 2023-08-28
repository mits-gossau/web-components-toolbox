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
   * @param options
   * @param {any} args
   */
  constructor (options = {}, ...args) {
    super({
      importMetaUrl: import.meta.url,
      mode: 'false',
      ...options
    }, ...args)

    this.abortController = null
    this.subCategoryList = Array.from(document.querySelectorAll('[data-id]'))
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
    if (event.detail && event.detail.tags) this.setCategoryCode(event.detail.tags[0], event.detail.pushHistory)

    if (this.abortController) this.abortController.abort()
    this.abortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.abortController.signal
    }
    const limit = 100
    const categoryCode = this.getCategoryCode()
    const minPercentage = event?.detail?.this.getAttribute('min-percentage') || 0
    this.showSubCategories(this.subCategoryList, categoryCode)
    const endpoint = this.getAttribute('endpoint') + `?categoryCode=${categoryCode}&limit=${limit}&min_percentage=${minPercentage}`
    this.dispatchEvent(new CustomEvent(this.getAttribute('list-product') || 'list-product', {
      detail: {
        fetch: fetch(endpoint, fetchOptions).then(async response => {
          if (response.status >= 200 && response.status <= 299) {
            const data = await response.json()
            if (event.detail && event.detail.tags && data && data.tags && event.detail.tags !== data.tags) this.setCategoryCode(data.tags[0], true)
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

  /**
   * Displays o-wrapper according to data-id attribute
   * Only the first (string)element is considered for css class toggle
   * TODO: Make css class as param
   * @param {any[]} categories List list of all o-wrapper elements
   * @param {string} activeSubCategory Active sub category id
   */
  showSubCategories (categories, activeSubCategory) {
    categories.forEach(c => {
      c.classList.add('hide-sub-category')
      if (c.getAttribute('data-id') === activeSubCategory) c.classList.remove('hide-sub-category')
    })
  }
}
