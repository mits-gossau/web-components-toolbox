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
    this.abortProductSearchController = null

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
    this.addEventListener(this.getAttribute('request-submit-search') || 'submit-search', this.requestSubmitSearchListener)
  }

  disconnectedCallback () {
    // @ts-ignore
    if (!this.hasAttribute('no-popstate')) self.removeEventListener('popstate', this.updatePopState)
    this.removeEventListener(this.getAttribute('request-list-product') || 'request-list-product', this.requestListProductListener)
    this.removeEventListener('request-href-' + (this.getAttribute('request-list-product') || 'request-list-product'), this.requestHrefEventListener)
    this.removeEventListener(this.getAttribute('request-submit-search') || 'submit-search', this.requestSubmitSearchListener)
  }

  /**
   * Fetch products
   * @param {{ detail: any; }} event
   */
  requestListProductListener = async (event) => {
    if (event.detail && event.detail.tags) {
      this.setCategory(event.detail.tags[0], event.detail.pushHistory)
    }

    this.updateSortParam(event.detail)

    if (this.abortController) this.abortController.abort()
    this.abortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.abortController.signal
    }
    const sortOrder = this.getSort() || ''
    const category = this.getCategory()
    this.showSubCategories(this.subCategoryList, category)
    if (category !== null || event.detail.searchterm) {
      // @ts-ignore
      const endpointGetProduct = event.detail.searchterm ? `${self.Environment.getApiBaseUrl('migrospro').apiGetProductsBySearch}?searchterm=${event.detail.searchterm}` : `${self.Environment.getApiBaseUrl('migrospro').apiGetProductByCategory}?category=${category}&sort=${sortOrder}`
      // @ts-ignore
      const endpointActiveOrderEndpoint = `${self.Environment.getApiBaseUrl('migrospro').apiGetActiveOrderAndOrderItems}`

      this.dispatchEvent(new CustomEvent(this.getAttribute('list-product') || 'list-product', {
        detail: {
          fetch: Promise.all([
            fetch(endpointGetProduct, fetchOptions).then(async response => {
              if (response.status >= 200 && response.status <= 299) {
                const data = await response.json()
                if (event.detail && event.detail.tags && data && data.tags && event.detail.tags !== data.tags) {
                  this.setCategory(data.tags[0], true)
                }
                return {
                  tags: [category?.split('_')[0]],
                  sort: this.getSort(),
                  ...data
                }
              }
              throw new Error(response.statusText)
              // @ts-ignore
            }).catch(error => console.error(`fetch ${endpointGetProduct} failed! error: ${error}`) || `fetch ${endpointGetProduct} failed!`),
            fetch(endpointActiveOrderEndpoint, fetchOptions).then(async response => {
              if (response.status >= 200 && response.status <= 299) {
                return await response.json()
              }
              return true
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
    await this.requestListProductListener(event)
  }

  /**
   * The function sets the category parameter in the URL and optionally pushes the new URL
   * to the browser history.
   * @param {string} category - The category parameter is the value that you want to set for the category in the URL.
   * @param [pushHistory=true] - The `pushHistory` parameter is a boolean value that determines whether
   * to push the new URL with the updated category to the browser's history. If `pushHistory` is set to
   * `true`, the new URL will be added to the browser's history. If `pushHistory` is set to `
   * @returns module:url.URL updated URL object.
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
   * Updates the sort parameter in the URL and optionally pushes the updated URL to the browser history.
   * @param {object} eventDetail - An object containing the details of the event.
   * @param [pushHistory=true] - A boolean value indicating whether to push the updated URL to the
   * browser history. If set to true, it will add a new entry to the browser history with the updated
   * URL. If set to false, it will not modify the browser history.
   * @returns the updated URL object.
   */
  updateSortParam (eventDetail, pushHistory = true) {
    const { tags, sortOrder } = eventDetail
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    if (sortOrder) url.searchParams.set('sort', sortOrder)
    if (tags) url.searchParams.delete('sort')
    if (pushHistory) history.pushState({ ...history.state, sortOrder }, document.title, url.href)
    return url
  }

  /**
   * Retrieves the value of the 'sort' parameter from the URL query string, or returns null if it is not present.
   * @returns the value of the 'sort' parameter from the URL query string.
   */
  getSort () {
    const urlParams = new URLSearchParams(location.search)
    return urlParams.get('sort') || ''
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
