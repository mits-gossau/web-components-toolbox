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
      const fetchOptions = {
        signal: this.abortController.signal
      }
      
      const endpoint = 'https://testadmin.alnatura.ch/umbraco/api/AlnaturaRecipeApi/GetAllRecipes?limit=100'
      this.dispatchEvent(new CustomEvent(this.getAttribute('list-recipe') || 'list-recipe', {
        detail: {
          fetch: fetch(endpoint, fetchOptions).then(async response => {
            if (response.status >= 200 && response.status <= 299) {
              const data = await response.json()
              return data.data.recipes.results
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
