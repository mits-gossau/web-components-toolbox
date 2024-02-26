// @ts-check
/** @typedef {{
 fetchModulesParams: import("../../prototypes/Shadow.js").fetchModulesParams[],
 defineImmediately: boolean,
 resolve: (paths: string[]) => paths[],
 node: HTMLElement
}} fetchModulesEventDetail */

/* global HTMLElement */
/* global customElements */

/**
 * FetchModules is a caching mechanism for src/es/components/prototypes/Shadow.js:fetchModules L:598 and can just be set as an ancestor which listens to the fetch-modules events
 * Example at: /src/es/components/pages/plain.html
 * As a controller, this component communicates exclusively through events
 *
 * @export
 * @class FetchModules
 * @type {CustomElementConstructor}
 */
export default class FetchModules extends HTMLElement {
  constructor () {
    super()

    /**
     * caching the fetched style by path
     *
     * @type {Map<string, Promise<import("../../prototypes/Shadow.js").fetchModulesParams>>}
     */
    this.fetchModulesCache = new Map()
    /**
     * customElements define
     *
     * @param {any} module
     * @param {import("../../prototypes/Shadow.js").fetchModulesParams} fetchModulesParam
     * @return {import("../../prototypes/Shadow.js").fetchModulesParams}
     */
    const define = (module, fetchModulesParam) => {
      let constructorClass = module.default || module
      if (typeof constructorClass === 'object') constructorClass = constructorClass[Object.keys(constructorClass)[0]]()
      if (!customElements.get(fetchModulesParam.name)) customElements.define(fetchModulesParam.name, constructorClass)
      fetchModulesParam.constructorClass = constructorClass
      return fetchModulesParam
    }
    /**
     * Listens to the event 'fetch-modules' and resolve it with the paths returned by fetchModules
     *
     * @param {CustomEvent & {detail: fetchModulesEventDetail}} event
     */
    this.fetchModulesListener = event => {
      Promise.all(event.detail.fetchModulesParams.map(
        /**
         * @param {import("../../prototypes/Shadow.js").fetchModulesParams} fetchModulesParam
         * @return {Promise<import("../../prototypes/Shadow.js").fetchModulesParams>}
         */
        fetchModulesParam => {
          // clean the path of ./ and ../
          const path = FetchModules.pathResolver(fetchModulesParam.path)
          let fetchModules
          if (this.fetchModulesCache.has(path)) {
            fetchModules = this.fetchModulesCache.get(path)
          } else {
            this.fetchModulesCache.set(path, (fetchModules = FetchModules.fetchModules(fetchModulesParam, define, event.detail.defineImmediately)))
          }
          // @ts-ignore
          return fetchModules
        }
      )).then(modules => {
        if (!event.detail.defineImmediately) modules.forEach(module => define(module.constructorClass, module))
        return event.detail.resolve(modules)
      }).catch(error => error)
    }
  }

  connectedCallback () {
    document.body.setAttribute(this.getAttribute('fetch-modules') || 'fetch-modules', 'true')
    // @ts-ignore
    this.addEventListener(this.getAttribute('fetch-modules') || 'fetch-modules', this.fetchModulesListener)
  }

  disconnectedCallback () {
    document.body.removeAttribute(this.getAttribute('fetch-modules') || 'fetch-modules')
    // @ts-ignore
    this.removeEventListener(this.getAttribute('fetch-modules') || 'fetch-modules', this.fetchModulesListener)
  }

  /**
   * fetch the module
   *
   * @param {import("../../prototypes/Shadow.js").fetchModulesParams} fetchModulesParam
   * @param {(module: any, fetchModulesParam: import("../../prototypes/Shadow.js").fetchModulesParams) => import("../../prototypes/Shadow.js").fetchModulesParams} define
   * @param {boolean} defineImmediately
   * @return {Promise<import("../../prototypes/Shadow.js").fetchModulesParams>}
   */
  static fetchModules (fetchModulesParam, define, defineImmediately) {
    return import(fetchModulesParam.path).then(
      /**
       * return the paths with the response.text or an Error
       *
       * @param {any} module
       * @return {import("../../prototypes/Shadow.js").fetchModulesParams}
       */
      module => defineImmediately
        ? define(module, fetchModulesParam)
        : Object.assign(fetchModulesParam, { constructorClass: module })
    ).catch(
      /**
       * Return the paths with the attached error
       *
       * @param {string} error
       * @return {import("../../prototypes/Shadow.js").fetchModulesParams}
       */
      error => {
        error = `${fetchModulesParam.path} ${error}!!!`
        // @ts-ignore
        return { ...fetchModulesParam, error: (fetchModulesParam.node.html = console.error(error, this) || `<code style="color: red;">${error}</code>`) }
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
}
