// @ts-check
/* global fetch */
/* global AbortController */
/* global CustomEvent */
/* global self */

import { Shadow } from '../../prototypes/Shadow.js'

/**
 * @export
 * @class Basket
 * @type {CustomElementConstructor}
 */
export default class Basket extends Shadow() {
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
    this.addEventListener(this.getAttribute('request-basket') || 'request-basket', this.requestListBasketListener)
    this.addEventListener(this.getAttribute('add-basket') || 'add-basket', this.addBasketListener)
    this.addEventListener(this.getAttribute('remove-basket') || 'remove-basket', this.removeBasketListener)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('request-basket') || 'request-basket', this.requestListBasketListener)
    this.removeEventListener(this.getAttribute('add-basket') || 'add-basket', this.addBasketListener)
    this.removeEventListener(this.getAttribute('remove-basket') || 'remove-basket', this.removeBasketListener)
  }

  /**
   * Fetch basket
   * @param {{ detail: any; }} event
   */
  requestListBasketListener = async (event) => {
    console.log('Basket', event.detail)
    if (this.abortController) this.abortController.abort()
    this.abortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.abortController.signal
    }
    const endpoint = this.getAttribute('endpoint')
    this.dispatchEvent(new CustomEvent(this.getAttribute('basket') || 'basket', {
      detail: {
         fetch: fetch(endpoint, fetchOptions).then(async response => {
          if (response.status >= 200 && response.status <= 299) return await response.json()
          throw new Error(response.statusText)
        })
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  /**
   * add to basket
   * @param {{ detail: any; }} event
   */
  addBasketListener = async (event) => {
    return console.log('add to Basket', event.detail)
    const fetchOptions = {
      method: 'PUT'
    }
    const endpoint = this.getAttribute('endpoint')
    this.dispatchEvent(new CustomEvent(this.getAttribute('basket') || 'basket', {
      detail: {
         fetch: fetch(endpoint, fetchOptions).then(async response => {
          if (response.status >= 200 && response.status <= 299) return await response.json()
          throw new Error(response.statusText)
        })
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  /**
   * remove to basket
   * @param {{ detail: any; }} event
   */
  removeBasketListener = async (event) => {
    return console.log('remove to Basket', event.detail)
    const fetchOptions = {
      method: 'PUT'
    }
    const endpoint = this.getAttribute('endpoint')
    this.dispatchEvent(new CustomEvent(this.getAttribute('basket') || 'basket', {
      detail: {
         fetch: fetch(endpoint, fetchOptions).then(async response => {
          if (response.status >= 200 && response.status <= 299) return await response.json()
          throw new Error(response.statusText)
        })
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }
}
