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
  /**
   * @param {any} args
   */
  constructor(options = {}, ...args) {
    super({
      importMetaUrl: import.meta.url,
      mode: 'false',
      ...options
    }, ...args)

    this.abortController = null
    this.requestListProductListener = this.requestListProductListenerEvent
    this.updatePopState = this.updatePopStateEvent
  }

  connectedCallback() {
    this.addEventListener(this.getAttribute('request-list-product') || 'request-list-product', this.requestListProductListener)
    // @ts-ignore
    if (!this.hasAttribute('no-popstate')) self.addEventListener('popstate', this.updatePopState)
  }

  disconnectedCallback() {
    this.removeEventListener(this.getAttribute('request-list-product') || 'request-list-products', this.requestListProductListener)
    // @ts-ignore
    if (!this.hasAttribute('no-popstate')) self.removeEventListener('popstate', this.updatePopState)
  }

  /**
   * Fetch products
   * @param {{ detail: any; }} event
   */
  async requestListProductListenerEvent(event) {
    console.log('PRODUCTS', event.detail)
    if (this.abortController) this.abortController.abort()
    this.abortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.abortController.signal
    }
    const endpoint = this.getAttribute('endpoint') + `MigrosProProductApi/GetProductsByCategory?categoryCode=BeSS_0101&limit=100`
    this.dispatchEvent(new CustomEvent(this.getAttribute('list-products') || 'list-products', {
      detail: {
        fetch: (this._fetch || (this._fetch = fetch(endpoint, fetchOptions))).then(response => {
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

  /**
   * Update pop state when navigating back/forward
   * @param {{ detail: { pushHistory: boolean; }; state: any; }} event
   */
  updatePopStateEvent(event) {
    console.log("UPDATE_POP_STATE:", event);
    if (!event.detail) event.detail = { ...event.state }
    event.detail.pushHistory = false
    this.requestListProductListener(event)
  }

}
