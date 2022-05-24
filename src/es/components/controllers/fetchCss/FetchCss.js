// @ts-check
/** @typedef {{
 fetchCSSParams: import("../../prototypes/Shadow.js").fetchCSSParams[],
 resolve: (fetchCSSParams: import("../../prototypes/Shadow.js").fetchCSSParams[]) => fetchCSSParams[],
 node: HTMLElement
}} fetchCssEventDetail */

import { Shadow } from '../../prototypes/Shadow.js'
import { WebWorker } from '../../prototypes/WebWorker.js'

/* global fetch */

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
    super({ mode: 'false' }, ...args)

    /**
     * caching the fetched style by path
     *
     * @type {Map<string, Promise<string>>}
     */
    this.fetchStyleCache = new Map()
    /**
     * caching the processed style
     *
     * @type {Map<string, Promise<string>>}
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
          // clean the path of ./ and ../
          fetchCSSParam.path = FetchCss.pathResolver(fetchCSSParam.path)
          /**
           * add nodes default values
           *
           * @type {import("../../prototypes/Shadow.js").fetchCSSParams}
           */
          const fetchCSSParamWithDefaultValues = { cssSelector: event.detail.node.cssSelector, namespace: event.detail.node.namespace, namespaceFallback: event.detail.node.namespaceFallback, appendStyleNode: true, maxWidth: event.detail.node.mobileBreakpoint, node: event.detail.node, ...fetchCSSParam }
          const processedStyleCacheKey = FetchCss.cacheKeyGenerator(fetchCSSParamWithDefaultValues)
          if (this.processedStyleCache.has(processedStyleCacheKey)) {
            return Promise.resolve(fetchCSSParamWithDefaultValues)
          }
          let fetchStyle
          if (this.fetchStyleCache.has(fetchCSSParamWithDefaultValues.path)) {
            fetchStyle = this.fetchStyleCache.get(fetchCSSParamWithDefaultValues.path)
          } else {
            this.fetchStyleCache.set(fetchCSSParamWithDefaultValues.path, (fetchStyle = FetchCss.fetchStyle(fetchCSSParamWithDefaultValues.path)))
          }
          fetchStyle.catch(
            error => {
              fetchCSSParamWithDefaultValues.error = error
              return fetchCSSParamWithDefaultValues
            }
          )
          const processedStyle = this.processStyle(fetchCSSParamWithDefaultValues, fetchStyle)
          this.processedStyleCache.set(processedStyleCacheKey, processedStyle)
          return Promise.resolve(fetchCSSParamWithDefaultValues)
        }
      )).then(fetchCSSParams => {
        // do append in order
        Promise.all(fetchCSSParams.map(fetchCSSParam => this.processedStyleCache.get(FetchCss.cacheKeyGenerator(fetchCSSParam)).then(style => {
          FetchCss.appendStyle(fetchCSSParam).style = fetchCSSParam.styleNode.textContent = style
          return fetchCSSParam
        }))).then(fetchCSSParams => event.detail.resolve(fetchCSSParams)).catch(error => error)
      }).catch(error => error)
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
        return Promise.reject(console.error(error) || `<code style="color: red;">${error}</code>`)
      }
    )
  }

  /**
   * process the style
   *
   * @param {import("../../prototypes/Shadow.js").fetchCSSParams} fetchCSSParam
   * @param {Promise<string>} fetchStyle
   * @return {Promise<string>}
   */
  async processStyle (fetchCSSParam, fetchStyle) {
    let style = await fetchStyle
    // !IMPORTANT: Changes which are made below have to be cloned to src/es/components/web-components-toolbox/src/es/components/prototypes/Shadow.js
    style = await this.webWorker(FetchCss.cssMaxWidth, style, fetchCSSParam.maxWidth)
    if (fetchCSSParam.cssSelector !== ':host') style = await this.webWorker(FetchCss.cssHostFallback, style, fetchCSSParam.cssSelector)
    if (fetchCSSParam.namespace) {
      if (style.includes('---')) console.error('this.css has illegal dash characters at:', fetchCSSParam.node)
      if (fetchCSSParam.namespaceFallback) {
        style = await this.webWorker(FetchCss.cssNamespaceToVarFunc, style, fetchCSSParam.namespace)
        style = await this.webWorker(FetchCss.cssNamespaceToVarDec, style, fetchCSSParam.namespace)
      } else {
        style = await this.webWorker(FetchCss.cssNamespaceToVar, style, fetchCSSParam.namespace)
      }
    }
    // TODO: Review the safari fix below, if the bug got fixed within safari itself (NOTE: -webkit prefix did not work for text-decoration-thickness). DONE 2021.11.10 | LAST CHECKED 2021.11.10
    // safari text-decoration un-supported shorthand fix
    // can not be run in web worker since it uses self
    if (navigator.userAgent.includes('Mac') && style.includes('text-decoration:')) style = FetchCss.cssTextDecorationShortHandFix(style, fetchCSSParam.node)
    return style
  }

  /**
   * finalize the style
   *
   * @param {import("../../prototypes/Shadow.js").fetchCSSParams} fetchCSSParam
   * @return {import("../../prototypes/Shadow.js").fetchCSSParams}
   */
  static appendStyle (fetchCSSParam) {
    // !IMPORTANT: Changes which are made below have to be cloned to src/es/components/web-components-toolbox/src/es/components/prototypes/Shadow.js
    // create a new style node if none is supplied
    if (!fetchCSSParam.styleNode) {
      /** @type {HTMLStyleElement} */
      fetchCSSParam.styleNode = document.createElement('style')
      fetchCSSParam.styleNode.setAttribute('_css', fetchCSSParam.path)
      fetchCSSParam.styleNode.setAttribute('protected', 'true') // this will avoid deletion by html=''
      if (fetchCSSParam.node.root.querySelector(`[_css="${fetchCSSParam.path}"]`)) console.warn(`${fetchCSSParam.path} got imported more than once!!!`, fetchCSSParam.node)
    }
    if (fetchCSSParam.appendStyleNode) fetchCSSParam.node.root.appendChild(fetchCSSParam.styleNode) // append the style tag in order to which promise.all resolves
    return fetchCSSParam
  }

  /**
   * resolve the path from ../ and ./ to have the absolute path which can be used as absolute key for the cache Map
   *
   * @param {string} path
   * @return {string}
   */
  static pathResolver (path) {
    const a = document.createElement('a')
    a.href = path
    return a.href
  }

  /**
   * key generator for cache
   *
   * @param {import("../../prototypes/Shadow.js").fetchCSSParams} fetchCSSParam
   * @return {string}
   */
  static cacheKeyGenerator ({ path, cssSelector, namespace, namespaceFallback, maxWidth }) {
    return JSON.stringify({ path, cssSelector, namespace, namespaceFallback, maxWidth })
  }
}
