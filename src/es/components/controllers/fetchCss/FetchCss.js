// @ts-check
/** @typedef {{
 fetchCSSParams: import("../../prototypes/Shadow.js").fetchCSSParams[],
 resolve: (fetchCSSParams: import("../../prototypes/Shadow.js").fetchCSSParams[]) => fetchCSSParams[],
 node: HTMLElement
}} fetchCssEventDetail */

import { Shadow } from '../../prototypes/Shadow.js'
import { WebWorker } from '../../prototypes/WebWorker.js'

/* global fetch */
/* global self */
/* global sessionStorage */

/**
 * FetchCss is a caching mechanism for src/es/components/prototypes/Shadow.js:fetchCSS L:347 and can just be set as an ancestor which listens to the fetch-css events
 * Example at: /src/es/components/pages/Home.html
 * As a controller, this component communicates exclusively through events
 *
 * @export
 * @class FetchCss
 * @type {CustomElementConstructor}
 */
export default class FetchCss extends Shadow(WebWorker()) {
  #timeout
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
    this.processedStyleCache = new Map(this.loadFromStorage())
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
          const fetchCSSParamWithDefaultValues = { cssSelector: event.detail.node.cssSelector, namespace: event.detail.node.namespace, namespaceFallback: event.detail.node.namespaceFallback, appendStyleNode: true, maxWidth: event.detail.node.mobileBreakpoint, importMetaUrl: event.detail.node.importMetaUrl, node: event.detail.node, ...fetchCSSParam }
          const processedStyleCacheKey = FetchCss.cacheKeyGenerator(fetchCSSParamWithDefaultValues)
          if (this.processedStyleCache.has(processedStyleCacheKey)) {
            return Promise.resolve(fetchCSSParamWithDefaultValues)
          }
          let fetchStyle
          if (this.fetchStyleCache.has(fetchCSSParamWithDefaultValues.path)) {
            fetchStyle = this.fetchStyleCache.get(fetchCSSParamWithDefaultValues.path)
          } else {
            this.fetchStyleCache.set(fetchCSSParamWithDefaultValues.path, (fetchStyle = FetchCss.fetchStyle(fetchCSSParamWithDefaultValues.path, event.detail.node)))
          }
          // @ts-ignore
          fetchStyle.catch(
            error => {
              fetchCSSParamWithDefaultValues.error = error
              return fetchCSSParamWithDefaultValues
            }
          )
          // @ts-ignore
          const processedStyle = this.processStyle(fetchCSSParamWithDefaultValues, fetchStyle)
          this.processedStyleCache.set(processedStyleCacheKey, processedStyle)
          this.saveToStorage(this.processedStyleCache)
          return Promise.resolve(fetchCSSParamWithDefaultValues)
        }
      )).then(fetchCSSParams => {
        // wait for styles to load and set them fetchCSSParam.style = style in order
        // @ts-ignore
        Promise.all(fetchCSSParams.map(fetchCSSParam => this.processedStyleCache.get(FetchCss.cacheKeyGenerator(fetchCSSParam)).then(style => {
          fetchCSSParam.style = style
          return fetchCSSParam
        }))).then(fetchCSSParams => {
          fetchCSSParams.forEach(fetchCSSParam => {
            // append styles in order, since this is important for overwrite
            FetchCss.appendStyle(fetchCSSParam)
            fetchCSSParam.styleNode.textContent += fetchCSSParam.style
          })
          event.detail.resolve(fetchCSSParams)
        }).catch(error => error)
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
   * @param {HTMLElement} node
   * @return {Promise<string>}
   */
  static fetchStyle (path, node) {
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
        return Promise.reject(node.html = console.error(error, node) || `<code style="color: red;">${error}</code>`)
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
    style = await this.webWorker(FetchCss.cssImportMetaUrl, style, fetchCSSParam.importMetaUrl)
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
    if (fetchCSSParam.replaces) style = await fetchCSSParam.replaces.reduce(async (style, replace) => this.webWorker(FetchCss.replace, await style, replace.pattern, replace.flags, replace.replacement), Promise.resolve(style))
    // TODO: Review the safari fix below, if the bug got fixed within safari itself (NOTE: -webkit prefix did not work for text-decoration-thickness). DONE 2021.11.10 | LAST CHECKED 2021.11.10
    // safari text-decoration un-supported shorthand fix
    // can not be run in web worker since it uses self
    if (navigator.userAgent.includes('Mac') && /(\n|\s|{){1}text-decoration:/g.test(style)) style = FetchCss.cssTextDecorationShortHandFix(style, fetchCSSParam.node)
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
      // @ts-ignore
      fetchCSSParam.styleNode.setAttribute('mobile-breakpoint', fetchCSSParam.maxWidth)
      fetchCSSParam.styleNode.setAttribute('protected', 'true') // this will avoid deletion by html=''
      // @ts-ignore
      if (self.Environment && self.Environment.isTestingEnv && fetchCSSParam.node.root.querySelector(fetchCSSParam.node.cssSelector + ` > [_css="${fetchCSSParam.path}"]`)) console.warn(`${fetchCSSParam.path} got imported more than once!!!`, fetchCSSParam.node)
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
  static cacheKeyGenerator ({ path, cssSelector, namespace, namespaceFallback, maxWidth, importMetaUrl, replaces = [] }) {
    return JSON.stringify({ path, cssSelector, namespace, namespaceFallback, maxWidth, importMetaUrl, replaces })
  }

  /**
   * casual string replace function which can be used as a webworker
   *
   * @param {string} style
   * @param {string} pattern
   * @param {string} flags
   * @param {string} replacement
   * @return {string}
   */
  static replace (style, pattern, flags, replacement) {
    return style.replace(new RegExp(pattern, flags), replacement)
  }

  /**
   * Save all fetched and processed files to local storage
   *
   * @name saveToStorage
   * @param {Map<string, Promise<string>>} cacheMap
   * @returns {void}
   */
  saveToStorage (cacheMap) {
    if (this.hasAttribute('no-storage')) return
    clearTimeout(this.#timeout)
    this.#timeout = setTimeout(() => Promise.all(Array.from(cacheMap).map(([key, asyncValue]) => asyncValue.then(value => [key, value]))).then(values => sessionStorage.setItem('FetchCssCache', JSON.stringify(values))), 1000)
  }

  /**
   * load all fetched and processed files from local storage
   *
   * @name loadFromStorage
   * @returns {Map<string, Promise<string>> | null}
   */
  loadFromStorage () {
    if (this.hasAttribute('no-storage')) return null
    try {
      // @ts-ignore
      return JSON.parse(sessionStorage.getItem('FetchCssCache')).map(([key, value]) => [key, Promise.resolve(value)])
    } catch (error) {
      return null
    }
  }
}
