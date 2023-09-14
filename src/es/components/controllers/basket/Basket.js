// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global fetch */
/* global CustomEvent */

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

    this.addAbortController = null
    this.removeAbortController = null
    this.requestAbortController = null
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
    if (this.requestAbortController) this.requestAbortController.abort()
    this.requestAbortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.requestAbortController.signal
    }
    const endpoint = 'http://testadmin.migrospro.ch/umbraco/api/MigrosProOrderApi/GetActiveOrderAndOrderItems'
    this.dispatchEvent(new CustomEvent(this.getAttribute('list-basket') || 'list-basket', {
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
    if (this.addAbortController) this.addAbortController.abort()
    this.addAbortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.addAbortController.signal
    }
    // id from 'event.detail.tags': returned by default button behaviour
    // id from 'event.detail.id'  : returned from quantity field input event
    const productId = event.detail.tags && event.detail.tags[0] || event.detail.id

    // amount returned from quantity field input value
    const amount = event.detail.amount ? `&amount=${event.detail.amount}` : ''  
    
    const endpoint = `https://testadmin.migrospro.ch/umbraco/api/MigrosProOrderApi/AddToOrder?productId=${productId}${amount}`
    this.dispatchEvent(new CustomEvent(this.getAttribute('update-basket') || 'update-basket', {
      detail: {
        id: productId,
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
    console.log('remove to Basket', event.detail)
    if (this.removeAbortController) this.removeAbortController.abort()
    this.removeAbortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.removeAbortController.signal
    }
    const productId = event.detail.tags[0]
    const endpoint = `https://testadmin.migrospro.ch/umbraco/api/MigrosProOrderApi/RemoveFromOrder?productId=${productId}`
    this.dispatchEvent(new CustomEvent(this.getAttribute('update-basket') || 'update-basket', {
      detail: {
        id: productId,
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
