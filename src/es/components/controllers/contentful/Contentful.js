// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'
import query from './Query.js';

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
    // AbortController()
    // Move Base URL to Environment

    const token = this.getAttribute('token')
    const spaceId = this.getAttribute('space-id')
    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`
    const limit = this.getAttribute('limit')
    console.log("limit", limit)
    const variables = { limit: Number(limit) };

    this.requestListArticlesListener = event => {
      console.log("request article listener....");
      const fetchOptions = {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token + " ",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables })
      }

      fetch(endpoint, fetchOptions)
        .then(response => response.json())
        .then(data => {
          console.log("fetched data", data)
          this.dispatchEvent(new CustomEvent('listArticles', {
            detail: {
              data
            },
            bubbles: true,
            cancelable: true,
            composed: true
          }))
        });
    }
  }

  connectedCallback() {
    console.log("controller running....");
    this.addEventListener('requestListArticles', this.requestListArticlesListener)
  }

  disconnectedCallback() {
    this.removeEventListener('requestListArticles', this.requestListArticlesListener)
  }

}
