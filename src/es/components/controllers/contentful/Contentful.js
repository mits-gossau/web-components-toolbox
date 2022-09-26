// @ts-check
/* global CustomEvent */
/* global fetch */
/* global sessionStorage */
/* global AbortController */
/* global self */

import { Shadow } from '../../prototypes/Shadow.js'

/**
 * TODO
 * @export
 * @class Contentful
 * @type {CustomElementConstructor}
 */
export default class Contentful extends Shadow() {
  constructor (...args) {
    super({ mode: 'false' }, ...args)
    const token = this.getAttribute('token')
    const spaceId = this.getAttribute('space-id')
    // @ts-ignore
    const endpoint = self.Environment.contentfulEndpoint + spaceId
    const limit = this.getAttribute('limit')
    const skip = this.getAttribute('skip') || 0
    this.abortController = null

    this.requestListNewsListener = async event => {
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()
      const variables = { limit: event.detail && event.detail.limit !== undefined ? Number(event.detail.limit) : Number(limit), skip: event.detail && event.detail.skip !== undefined ? Number(event.detail.skip) * skip : 0 }
      let query = null
      try {
        // @ts-ignore
        query = await import('../../../../../../controllers/contenful/Query.js')
        query = query.default
      } catch (e) {
        query = await import('./Query.js')
        query = query.default
      }
      const fetchOptions = {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token + ' ',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables }),
        signal: this.abortController.signal
      }

      this.dispatchEvent(new CustomEvent('listNews', {
        detail: {
          fetch: fetch(endpoint, fetchOptions).then(async response => {
            if (response.status >= 200 && response.status <= 299) {
              const data = await response.json()
              sessionStorage.setItem('news', JSON.stringify(data))
              return data
            }
            throw new Error(response.statusText)
          })
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallback () {
    this.addEventListener('requestListNews', this.requestListNewsListener)
  }

  disconnectedCallback () {
    this.removeEventListener('requestListNews', this.requestListNewsListener)
  }
}
