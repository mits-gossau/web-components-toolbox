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
    if (event.detail && event.detail.tags) {
      this.setCategory(event.detail.tags[0], event.detail.pushHistory)
    }
    if (event.detail && event?.detail?.this.getAttribute('min-percentage')) {
      this.setMinPercentage(event?.detail?.this.getAttribute('min-percentage'), event.detail.pushHistory)
    }

    if (this.abortController) this.abortController.abort()
    this.abortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.abortController.signal
    }
    const limit = 100
    const category = this.getCategory()
    this.showSubCategories(this.subCategoryList, category)
    const endpoint = this.getAttribute('endpoint') + `?category=${category}&limit=${limit}`
    this.dispatchEvent(new CustomEvent(this.getAttribute('list-product') || 'list-product', {
      detail: {
        fetch: fetch(endpoint, fetchOptions).then(async response => {
          if (response.status >= 200 && response.status <= 299) {
            const data = await response.json()
            if (event.detail && event.detail.tags && data && data.tags && event.detail.tags !== data.tags) {
              this.setCategory(data.tags[0], true)
            }
            return {
              tag: [category],
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
    if (event.detail && event.detail.resolve) {
      event.detail.resolve(this.setCategory(event.detail.tags[0], event.detail.pushHistory).href, event.detail.pushHistory)
    }
  }

  /**
   * Update pop state when navigating back/forward
   * @param {{ detail: { pushHistory: boolean; }; state: any; }} event
   */
  updatePopState = async (event) => {
    if (!event.detail) event.detail = { ...event.state }
    event.detail.pushHistory = false
    this.requestListProductListener(event)
  }

  /**
   * Set category
   * @param {string} category
   * @param {boolean} [pushHistory = true]
   * @return {URL}
   */
  setCategory (category, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    url.searchParams.set('category', category)
    if (pushHistory) history.pushState({ ...history.state, category }, document.title, url.href)
    return url
  }

  /**
   * Get category
   * @return {string}
   */
  getCategory () {
    const urlParams = new URLSearchParams(location.search)
    return urlParams.get('category') || 'all'
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
