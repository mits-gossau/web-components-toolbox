// @ts-check
/** @typedef {{
 fetchCSSParams: import("../../prototypes/Shadow.js").fetchCSSParams[],
 hide?: boolean,
 resolve: (fetchCSSParams: import("../../prototypes/Shadow.js").fetchCSSParams[]) => fetchCSSParams[],
 node: HTMLElement
}} fetchCssEventDetail */

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
     * caching the fetchCSS fetched strings processed by setCSS
     *
     * @type {WeakMap<import("../../prototypes/Shadow.js").fetchCSSParams[], Promise<import("../../prototypes/Shadow.js").fetchCSSParams[]>>}
     */
    this.fetchCSSParamsCache = new WeakMap()
    /**
     * Listens to the event 'fetch-css' and resolve it with the fetchCSSParams returned by fetchCSS
     *
     * @param {CustomEvent & {detail: fetchCssEventDetail}} event
     */
    this.fetchCssListener = event => {
      /**
       * fill default values for setCSS from the web component host scope
       *
       * @type {import("../../prototypes/Shadow.js").fetchCSSParams[]}
       */
      const fetchCSSParamsWithDefaultValues = event.detail.fetchCSSParams.map(fetchCSSParam => { return { cssSelector: event.detail.node.cssSelector, namespace: event.detail.node.namespace, namespaceFallback: event.detail.node.namespaceFallback, maxWidth: event.detail.node.mobileBreakpoint, node: event.detail.node, ...fetchCSSParam } })
      const resultFetchCSSParams = this.fetchCSS(fetchCSSParamsWithDefaultValues, false, false)
      for (let i = 0; i < fetchCSSParamsWithDefaultValues.length; i++) {
        this.fetchCSSParamsCache.set(fetchCSSParamsWithDefaultValues[i], resultFetchCSSParams.then(resultFetchCSSParam => resultFetchCSSParam[i]))  
      }
      event.detail.resolve(resultFetchCSSParams)
      console.log('changed', this.fetchCSSParamsCache);
    }
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
