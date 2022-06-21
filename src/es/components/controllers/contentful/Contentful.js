// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * @class Contentful
 * @type {CustomElementConstructor}
 * @attribute {}
 */
export default class Contentful extends Shadow() {
  constructor(...args) {
    super({ mode: 'false' }, ...args)
    this.requestListArticlesListener = event => {
      console.log("request article listener....");
      fetch('https://dummyjson.com/products/1')
        .then(res => res.json())
        .then(json => {
          console.log(json)
          this.dispatchEvent(new CustomEvent('listArticles', {
            detail: {
              data: json
            },
            bubbles: true,
            cancelable: true,
            composed: true
          }))
        })
    }
  }

  connectedCallback() {
    console.log("running....");
    this.addEventListener('requestListArticles', this.requestListArticlesListener)
  }

  disconnectedCallback() {
    this.removeEventListener('requestListArticles', this.requestListArticlesListener)
  }

}
