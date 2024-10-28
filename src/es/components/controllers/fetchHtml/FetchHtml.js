// @ts-check
/** @typedef {{
 paths: string[],
 resolve: (paths: string[]) => paths[],
 node: HTMLElement
}} fetchHtmlEventDetail */

/* global fetch */
/* global HTMLElement */

/**
 * FetchHtml is a caching mechanism for src/es/components/prototypes/Shadow.js:fetchHTML L:490 and can just be set as an ancestor which listens to the fetch-html events
 * Example at: /src/es/components/pages/Home.html
 * As a controller, this component communicates exclusively through events
 * at consumer do "eval('`' + html[0] + '`')" to set the variables in the literal string
 *
 * @export
 * @class FetchHtml
 * @type {CustomElementConstructor}
 */
export default class FetchHtml extends HTMLElement {
  #timeout
  constructor () {
    super()

    /**
     * caching the fetched style by path
     *
     * @type {Map<string, Promise<string>>}
     */
    this.fetchHtmlCache = new Map(this.loadFromStorage())
    /**
     * Listens to the event 'fetch-html' and resolve it with the paths returned by fetchHTML
     *
     * @param {CustomEvent & {detail: fetchHtmlEventDetail}} event
     */
    this.fetchHtmlListener = event => {
      Promise.all(event.detail.paths.map(
        /**
         * @param {string} path
         * @return {Promise<string>}
         */
        path => {
          // clean the path of ./ and ../
          path = FetchHtml.pathResolver(path)
          let fetchHtml
          if (this.fetchHtmlCache.has(path)) {
            fetchHtml = this.fetchHtmlCache.get(path)
          } else {
            this.fetchHtmlCache.set(path, (fetchHtml = FetchHtml.fetchHtml(path, event.detail.node)))
            this.saveToStorage(this.fetchHtmlCache)
          }
          // @ts-ignore
          return fetchHtml
        }
      )).then(htmls => event.detail.resolve(htmls)).catch(error => error)
    }
  }

  connectedCallback () {
    document.body.setAttribute(this.getAttribute('fetch-html') || 'fetch-html', 'true')
    // @ts-ignore
    this.addEventListener(this.getAttribute('fetch-html') || 'fetch-html', this.fetchHtmlListener)
  }

  disconnectedCallback () {
    document.body.removeAttribute(this.getAttribute('fetch-html') || 'fetch-html')
    // @ts-ignore
    this.removeEventListener(this.getAttribute('fetch-html') || 'fetch-html', this.fetchHtmlListener)
  }

  /**
   * fetch the style
   *
   * @param {string} path
   * @param {HTMLElement} node
   * @return {Promise<string>}
   */
  static fetchHtml (path, node) {
    return fetch(path).then(
      /**
       * return the path with the response.text or an Error
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
       * Return the paths with the attached error
       *
       * @param {string} error
       * @return {string}
       */
      error => {
        error = `${path} ${error}!!!`
        // @ts-ignore
        return (node.html = console.error(error, node) || `<code style="color: red;">${error}</code>`)
      }
    )
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
   * Save all fetched and processed files to local storage
   * 
   * @name saveToStorage
   * @param {Map<string, Promise<string>>} cacheMap
   * @returns {void}
   */
  saveToStorage (cacheMap) {
    if (this.hasAttribute('no-storage')) return
    clearTimeout(this.#timeout)
    this.#timeout = setTimeout(() => Promise.all(Array.from(cacheMap).map(([key, asyncValue]) => asyncValue.then(value => [key, value]))).then(values => sessionStorage.setItem('FetchHtmlCache', JSON.stringify(values))), 1000)
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
      return JSON.parse(sessionStorage.getItem('FetchHtmlCache')).map(([key, value]) => [key, Promise.resolve(value)])
    } catch (error) {
      return null
    }
  }
}
