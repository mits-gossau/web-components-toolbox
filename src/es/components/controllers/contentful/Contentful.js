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

    const TOKEN = this.getAttribute('token')
    const SPACE_ID = this.getAttribute('space-id')
    const ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`
    const LIMIT = this.getAttribute('limit')
    const QUERY_VARS = { limit: Number(LIMIT) };

    this.requestListArticlesListener = event => {
      console.log("request article listener....");
      const fetchOptions = {
        method: "POST",
        headers: {
          Authorization: "Bearer " + TOKEN + " ",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, QUERY_VARS })
      }

      fetch(ENDPOINT, fetchOptions)
        .then(response => response.json())
        .then(data => {
          console.log(data)
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
