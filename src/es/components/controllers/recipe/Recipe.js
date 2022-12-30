// @ts-check
/* global fetch */
/* global AbortController */
/* global CustomEvent */

import { Shadow } from '../../prototypes/Shadow.js'

/**
 * TODO
 * @export
 * @class Recipe
 * @type {CustomElementConstructor}
 */
export default class Recipe extends Shadow() {
  constructor (...args) {
    super({ mode: 'false' }, ...args)
    this.abortController = null

    this.requestListRecipeListener = async event => {
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()

      // const limit = (event.detail && event.detail.limit) || this.getAttribute('limit') || 0
      // const currentSkip = event.detail && event.detail.skip ? Number(event.detail.skip) : 0

      const payload = {
        limit: 9,
        offset: 0,
        filters: {}
      }

      const fetchOptions = {
        method: 'POST',
        headers: {
          Accept: 'application.json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: this.abortController.signal
      }

      const endpoint = this.getAttribute('endpoint')
      this.dispatchEvent(new CustomEvent(this.getAttribute('list-recipe') || 'list-recipe', {
        detail: {
          fetch: fetch(endpoint, fetchOptions).then(async response => {
            if (response.status >= 200 && response.status <= 299) {
              const data = await response.json()
              // return data.data.recipes
              // TODO!!!!
              return {
                items: data.data.recipes.results,
                limit: 9,
                skip: data.data.recipes.offset * 9,
                tag: [],
                total: 648
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
  }

  connectedCallback () {
    this.addEventListener(this.getAttribute('request-list-recipe') || 'request-list-recipe', this.requestListRecipeListener)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('request-list-recipe') || 'request-list-recipe', this.requestListRecipeListener)
  }
}
