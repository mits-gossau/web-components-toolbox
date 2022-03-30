// @ts-check
/** @typedef {{
 fetchCSSParams: import("../../prototypes/Shadow.js").fetchCSSParams[],
 hide?: boolean,
 resolve: (fetchCSSParams: import("../../prototypes/Shadow.js").fetchCSSParams[]) => fetchCSSParams[],
 node: HTMLElement
}} fetchCssEventDetail */

import { Shadow } from '../../prototypes/Shadow.js'
import { WebWorker } from '../../prototypes/WebWorker.js'

/**
 * FetchCss is an icon
 * Example at: /src/es/components/pages/Home.html
 * As a controller, this component communicates exclusively through events
 *
 * @export
 * @class FetchCss
 * @type {CustomElementConstructor}
 */
export default class FetchCss extends Shadow(WebWorker()) {
  constructor (...args) {
    super(...args)

    /**
     * caching the fetched style by path
     *
     * @type {Map<string, Promise<string>>}
     */
    this.fetchStyleCache = new Map()
    /**
     * caching the processed style
     *
     * @type {Map<import("../../prototypes/Shadow.js").fetchCSSParams, Promise<string>>}
     */
    this.processedStyleCache = new Map()
    /**
     * Listens to the event 'fetch-css' and resolve it with the fetchCSSParams returned by fetchCSS
     *
     * @param {CustomEvent & {detail: fetchCssEventDetail}} event
     */
    this.fetchCssListener = event => {
      Promise.all(event.detail.fetchCSSParams.map(
        /**
         * @param {import("../../prototypes/Shadow.js").fetchCSSParams} fetchCSSParam
         * @return {Promise<import("../../prototypes/Shadow.js").fetchCSSParams>}
         */
        fetchCSSParam => {
          /**
           * @type {import("../../prototypes/Shadow.js").fetchCSSParams}
           */
          const fetchCSSParamWithDefaultValues = { cssSelector: event.detail.node.cssSelector, namespace: event.detail.node.namespace, namespaceFallback: event.detail.node.namespaceFallback, maxWidth: event.detail.node.mobileBreakpoint, node: event.detail.node, ...fetchCSSParam }
          if (this.processedStyleCache.has(fetchCSSParam)) return this.processedStyleCache.get(fetchCSSParam).then(style => {
            fetchCSSParamWithDefaultValues.style = style
            return FetchCss.appendStyle(fetchCSSParamWithDefaultValues)
          })
          let fetchStyle
          if (this.fetchStyleCache.has(fetchCSSParamWithDefaultValues.path)) {
            fetchStyle = this.fetchStyleCache.get(fetchCSSParamWithDefaultValues.path)
          } else {
            this.fetchStyleCache.set(fetchCSSParamWithDefaultValues.path, (fetchStyle = FetchCss.fetchStyle(fetchCSSParamWithDefaultValues.path)))
          }
          return fetchStyle.then(style => {
            const processedStyle = FetchCss.processStyle(fetchCSSParamWithDefaultValues, style)
            this.processedStyleCache.set(fetchCSSParam, processedStyle)
            return processedStyle.then(style => {
              fetchCSSParamWithDefaultValues.style = style
              return FetchCss.appendStyle(fetchCSSParamWithDefaultValues)
            })
          }).catch(
            error => {
              fetchCSSParamWithDefaultValues.error = error
              return fetchCSSParamWithDefaultValues
            }
          )
        }
      )).then(fetchCSSParams => event.detail.resolve(fetchCSSParams)).catch(error => error)
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

  /**
   * fetch the style
   *
   * @param {string} path
   * @return {Promise<string>}
   */
  static fetchStyle (path) {
    return fetch(path).then(
      /**
       * return the fetchCSSParam with the response.text or an Error
       *
       * @param {Response} response
       * @return {Promise<string>}
       */
      response => {
        if (response.status >= 200 && response.status <= 299) return response.text()
        throw new Error(response.statusText)
      }
    ).catch(
      /**
         * Return the fetchCSSParams with the attached error
         *
         * @param {string} error
         * @return {string}
         */
      error => {
        error = `${path} ${error}!!!`
        // @ts-ignore
        return Promise.reject(this.html = console.error(error, this) || `<code style="color: red;">${error}</code>`)
      }
    )
  }

  /**
   * process the style
   *
   * @param {import("../../prototypes/Shadow.js").fetchCSSParams} fetchCSSParam
   * @param {string} style
   * @return {Promise<string>}
   */
  static processStyle (fetchCSSParam, style) {
    return Promise.resolve('baaahhh')
  }

  
  /**
   * finalize the style
   *
   * @param {import("../../prototypes/Shadow.js").fetchCSSParams} fetchCSSParam
   * @return {import("../../prototypes/Shadow.js").fetchCSSParams}
   */
  static appendStyle (fetchCSSParam) {
    return fetchCSSParam
  }

  /**
   * clean the path from ../ and ./
   *
   * @param {string} path
   * @return {string}
   */
  static pathCleaner (path) {
    return path
  }
}
