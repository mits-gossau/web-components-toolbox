// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global fetch */
/* global CustomEvent */
/* global self */

/**
 * @export
 * @class Favorite
 * @type {CustomElementConstructor}
 */
export default class Favorite extends Shadow() {
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
  }

  connectedCallback () {
    this.addEventListener(this.getAttribute('request-favorite-event-name') || 'request-favorite-event-name', this.requestFavoriteListener)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('request-favorite-event-name') || 'request-favorite-event-name', this.requestFavoriteListener)
  }

  /**
   * Fetch favorite
   * @param {{ detail: any; }} event
   */
  requestFavoriteListener = async (event) => {
    if (this.addAbortController) this.addAbortController.abort()
    this.addAbortController = new AbortController()
    const fetchOptions = {
      method: 'GET',
      signal: this.addAbortController.signal
    }
    const productId = event.detail.id
    // @ts-ignore
    const endpoint = `${self.Environment.getApiBaseUrl('migrospro').ToggleFavorite}?id=${productId}`
    this.dispatchEvent(new CustomEvent(this.getAttribute('update-favorite') || 'update-favorite', {
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
