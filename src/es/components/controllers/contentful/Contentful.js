// @ts-check
/* global CustomEvent */
/* global fetch */
/* global sessionStorage */
/* global AbortController */

import { Shadow } from '../../prototypes/Shadow.js'
import query from '../../../../../../controllers/contenful/Query.js'

/**
 * TODO
 * @export
 * @class Contentful
 * @type {CustomElementConstructor}
 */
export default class Contentful extends Shadow() {
  constructor(...args) {
    super({ mode: 'false' }, ...args)

    // TODO:
    // Move Base URL to Environment

    const token = this.getAttribute('token')
    const spaceId = this.getAttribute('space-id')
    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`
    const limit = this.getAttribute('limit')
    const skip = this.getAttribute('skip') || 0
    this.abortController = null

    //this.requestListArticlesListener = async event => {
    this.requestListArticlesListener =  event => {
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()
      const variables = { limit: Number(limit), skip: Number(event.detail.skip * skip) || 0 }
      // try {
      //   let query = await import('../../../../../../controllers/contenful/Query.js')
      //   query = query.default

      // } catch (e) {
      //   console.log(e)
      // }
      // console.log(query);
      const fetchOptions = {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token + ' ',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables }),
        signal: this.abortController.signal
      }

      this.dispatchEvent(new CustomEvent('listArticles', {
        detail: {
          fetch: fetch(endpoint, fetchOptions).then(response => {
            if (response.status >= 200 && response.status <= 299) {
              const json = response.json()
              json.then(data => {
                sessionStorage.setItem('articles', JSON.stringify(data))
              })
              return json
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

  connectedCallback() {
    this.addEventListener('requestListArticles', this.requestListArticlesListener)
  }

  disconnectedCallback() {
    this.removeEventListener('requestListArticles', this.requestListArticlesListener)
  }
}
