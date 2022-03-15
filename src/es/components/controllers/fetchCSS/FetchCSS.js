// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * FetchCSS is an icon
 * Example at: /src/es/components/pages/Home.html
 * As a controller, this component communicates exclusively through events
 *
 * @export
 * @class FetchCSS
 * @type {CustomElementConstructor}
 */
export default class FetchCSS extends Shadow() {
  constructor (...args) {
    super(...args)

    this.fetchCSSListener = event => {
      console.log('got the event', event);
    }
  }

  connectedCallback () {
    this.mouseEventElement.addEventListener('fetch-css', this.fetchCSSListener)
  }

  disconnectedCallback () {
    this.mouseEventElement.removeEventListener('fetch-css', this.fetchCSSListener)
  }
}
