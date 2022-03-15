// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * FetchCss is an icon
 * Example at: /src/es/components/pages/Home.html
 * As a controller, this component communicates exclusively through events
 *
 * @export
 * @class FetchCss
 * @type {CustomElementConstructor}
 */
export default class FetchCss extends Shadow() {
  constructor (...args) {
    super(...args)

    /**
     * Listens to the event 'fetch-css' and resolve it with the fetchCSSParams returned by fetchCSS
     * important don't appendStyleNode here but let the requestor do it at there web component
     *
     * @param {CustomEvent & {detail: import("../../prototypes/Shadow.js").fetchCssEventDetail}} event
     */
    this.fetchCssListener = event => event.detail.resolve(this.fetchCSS(event.detail.fetchCSSParams.map(fetchCSSParam => {return {...fetchCSSParam, appendStyleNode: false}}), false, false))
  }

  connectedCallback () {
    document.body.setAttribute(this.getAttribute('fetch-css') || 'fetch-css', 'true')
    this.addEventListener(this.getAttribute('fetch-css') || 'fetch-css', this.fetchCssListener)
  }

  disconnectedCallback () {
    document.body.removeAttribute(this.getAttribute('fetch-css') || 'fetch-css')
    this.removeEventListener(this.getAttribute('fetch-css') || 'fetch-css', this.fetchCssListener)
  }
}
