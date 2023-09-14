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

    // TODO - Refactor
    // show/hide o-wrapper, based on the data-id tag
    // example: src/es/components/pages/ProductList.html
    this.subCategoryList = Array.from(this.root.querySelectorAll('[data-id]'))
    
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

    if (this.abortController) this.abortController.abort()
    this.abortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.abortController.signal
    }
    const category = this.getCategory()
    this.showSubCategories(this.subCategoryList, category)
    if (category !== null) {
      const endpointGetProductByCategory = this.getAttribute('endpoint-get-product-by-category') + `?category=${category}`
      const endpointActiveOrderEndpoint = this.getAttribute('endpoint-get-active-order-and-order-items') + `?category=${category}`

      this.dispatchEvent(new CustomEvent(this.getAttribute('list-product') || 'list-product', {
        detail: {
          fetch: Promise.all([
            fetch(endpointGetProductByCategory, fetchOptions).then(async response => {
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
              // @ts-ignore
            }).catch(error => console.error(`fetch ${endpointGetProductByCategory} failed! error: ${error}`) || `fetch ${endpointGetProductByCategory} failed!`),
            fetch(endpointActiveOrderEndpoint, fetchOptions).then(async response => {
              if (response.status >= 200 && response.status <= 299) {
                return await response.json()
              }
              // @ts-ignore
            }).catch(error => console.error(`fetch ${endpointActiveOrderEndpoint} failed! error: ${error}`) || `fetch ${endpointActiveOrderEndpoint} failed!`)
          ])
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
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
   * The function sets the category parameter in the URL and optionally pushes the new URL
   * to the browser history.
   * @param {string} category - The category parameter is the value that you want to set for the category in the URL.
   * @param [pushHistory=true] - The `pushHistory` parameter is a boolean value that determines whether
   * to push the new URL with the updated category to the browser's history. If `pushHistory` is set to
   * `true`, the new URL will be added to the browser's history. If `pushHistory` is set to `
   * @returns the updated URL object.
   */
  setCategory (category, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    url.searchParams.set('category', category)
    if (pushHistory) history.pushState({ ...history.state, category }, document.title, url.href)
    return url
  }

  /**
   * The function retrieves the value of the 'category' parameter from the URL query
   * string, or returns 'all' if the parameter is not present.
   * @returns the value of the 'category' parameter from the URL query string. If the 'category'
   * parameter is not present in the URL, it will return 'all' as the default value.
   */
  getCategory () {
    const urlParams = new URLSearchParams(location.search)
    return urlParams.get('category') || null
  }

  /**
   * Displays o-wrapper according to data-id attribute
   * Only the first (string)element is considered for css class toggle
   * TODO: Make css class as param
   * @param {any[]} categories List list of all o-wrapper elements
   * @param {string | null} activeSubCategory Active sub category id
   */
  showSubCategories (categories, activeSubCategory = '') {
    categories.forEach(c => {
      c.classList.add('hide-sub-category')
      if (c.getAttribute('data-id') === activeSubCategory) c.classList.remove('hide-sub-category')
    })
  }
}
