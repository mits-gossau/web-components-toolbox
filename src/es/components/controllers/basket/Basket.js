// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global fetch */
/* global CustomEvent */
/* global self */

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
    this.deleteFromOrderAbortController = null
    this.requestAbortController = null
    this.requestActiveOrderAbortController = null
    this.removeFromOrderAbortController = null
  }

  connectedCallback () {
    this.addEventListener(this.getAttribute('request-active-order') || 'request-active-order', this.requestActiveOrderListener)
    this.addEventListener(this.getAttribute('request-basket') || 'request-basket', this.requestListBasketListener)
    this.addEventListener(this.getAttribute('add-basket') || 'add-basket', this.addBasketListener)
    this.addEventListener(this.getAttribute('remove-basket') || 'remove-basket', this.removeBasketListener)
    this.addEventListener(this.getAttribute('delete-from-order') || 'delete-from-order', this.deleteFromOrderListener)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('request-active-order') || 'request-active-order', this.requestActiveOrderListener)
    this.removeEventListener(this.getAttribute('request-basket') || 'request-basket', this.requestListBasketListener)
    this.removeEventListener(this.getAttribute('add-basket') || 'add-basket', this.addBasketListener)
    this.removeEventListener(this.getAttribute('remove-basket') || 'remove-basket', this.removeBasketListener)
    this.removeEventListener(this.getAttribute('delete-from-order') || 'delete-from-order', this.deleteFromOrderListener)
  }

  /**
   * Fetch basket
   * @param {{ detail: any; }} event
   */
  requestActiveOrderListener = async (event) => {
    if (this.requestActiveOrderAbortController) this.requestActiveOrderAbortController.abort()
    this.requestActiveOrderAbortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.requestActiveOrderAbortController.signal
    }
    // @ts-ignore
    const endpoint = `${self.Environment.getApiBaseUrl('migrospro').apiGetActiveOrderAndOrderItemsEnrichedProductData}`
    this.dispatchEvent(new CustomEvent(this.getAttribute('update-basket') || 'update-basket', {
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
    // @ts-ignore
    const endpoint = `${self.Environment.getApiBaseUrl('migrospro').apiGetActiveOrderAndOrderItems}`
    this.dispatchEvent(new CustomEvent(this.getAttribute('update-basket') || 'update-basket', {
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
    const productId = (event.detail.tags && event.detail.tags[0]) || event.detail.id
    const productName = this.getProductName(event.detail)
    const amount = this.getProductAmount(event.detail, 'add')

    // @ts-ignore
    const endpoint = `${self.Environment.getApiBaseUrl('migrospro').apiUpdateOrderItem}?productId=${productId}&amount=${amount}&name=${productName}`
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
    if (this.removeAbortController) this.removeAbortController.abort()
    this.removeAbortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.removeAbortController.signal
    }
    const productId = event.detail.tags[0]
    const productName = this.getProductName(event.detail)
    const amount = this.getProductAmount(event.detail, 'remove')

    // @ts-ignore
    let endpoint = `${self.Environment.getApiBaseUrl('migrospro').apiUpdateOrderItem}?productId=${productId}&amount=${amount}&name=${productName}`
    if (amount === '0') {
      // @ts-ignore
      endpoint = `${self.Environment.getApiBaseUrl('migrospro').apiDeleteFromOrder}?orderItemId=${productId}`
    }

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
   * delete from order
   * @param {{ detail: any; }} event
   */
  deleteFromOrderListener = async (event) => {
    if (this.deleteFromOrderAbortController) this.deleteFromOrderAbortController.abort()
    this.deleteFromOrderAbortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.deleteFromOrderAbortController.signal
    }
    const productId = event.detail.tags[0]

    // @ts-ignore
    const endpoint = `${self.Environment.getApiBaseUrl('migrospro').apiDeleteFromOrder}?orderItemId=${productId}`
    this.dispatchEvent(new CustomEvent(this.getAttribute('list-basket') || 'list-basket', {
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
   * Returns the value of the attribute 'product-name' if it exists,
   * otherwise it returns the value of the property 'productName'.
   * @param {object} data - The `data` parameter is an object that contains information about a product.
   * @returns {string} the value of the "product-name" attribute if it exists in the "data.this" object, otherwise
   * it is returning the value of the "productName" property in the "data" object.
   */
  getProductName (data) {
    return data.this?.hasAttribute('product-name') ? data.this.getAttribute('product-name') : data?.productName
  }

  /**
   * Takes in two parameters, `data` and `calc`, and returns the updated amount based on the value of `calc`.
   * @param {object} data - The `data` parameter is an object that contains information about a product. It may
   * have an attribute called "amount" that represents the quantity of the product.
   * @param {string} calc - The `calc` parameter is a string that determines whether to add or subtract from the
   * product amount. It can have two possible values: 'add' or 'subtract'.
   * @returns the updated value of the "amount" attribute in the "data" object. If the "calc" parameter
   * is set to 'add', it will increment the value by 1. If the "calc" parameter is set to any other
   * value, it will decrement the value by 1. If the "data" object has a property called "this" and it has an
   */
  getProductAmount (data, calc) {
    const amountCalc = calc === 'add' ? +1 : -1
    return data.this?.hasAttribute('amount') ? `${Number(data?.this.getAttribute('amount')) + amountCalc}` : data?.amount
  }
}
