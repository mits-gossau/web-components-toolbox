// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* @export
* @class OneTrust
* @type {CustomElementConstructor}
*/
export default class OneTrust extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    this.renderScripts()
    if (this.shouldRenderCSS()) this.renderCSS()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders the css
   */
  renderCSS () {
    this.css = /* css */`
      :host {}
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   */
  fetchTemplate () {
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'one-trust-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  async renderScripts () {
    // TODO TESTING
    // TODO Get from Attribute
    const id = '24c30047-255b-4c49-9da5-99d3419dc58b-test'

    await this.loadCookieLawScriptTemplates(id)
    await this.loadCookieLawDependency(id)
    await this.callOptanonWrapper()
  }

  /**
   * @param {string} id
   * @returns {Promise<any>}
   */
  async loadCookieLawDependency (id) {
    return this.loadCookieLawDependencyPromise || (this.loadCookieLawDependencyPromise = new Promise((resolve, reject) => {
      const cookieLawScript = document.createElement('script')
      cookieLawScript.setAttribute('async', '')
      cookieLawScript.setAttribute('type', 'text/javascript')
      cookieLawScript.setAttribute('id', 'one-trust-cookie-law')
      try {
        // @ts-ignore
        cookieLawScript.setAttribute('src', `https://cdn.cookielaw.org/consent/${id}/OtAutoBlock.js`)
        document.getElementsByTagName('head')[0].prepend(cookieLawScript)
        cookieLawScript.onload = () => resolve('cookie law loaded')
      } catch (e) {
        return reject(e)
      }
    }))
  }

  /**
   * @param {string} id
   * @returns {Promise<any>}
   */
  async loadCookieLawScriptTemplates (id) {
    return this.loadCookieLawScriptTemplatesPromise || (this.loadCookieLawScriptTemplatesPromise = new Promise((resolve, reject) => {
      const cookieLawScriptTemplatesScript = document.createElement('script')
      cookieLawScriptTemplatesScript.setAttribute('async', '')
      cookieLawScriptTemplatesScript.setAttribute('type', 'text/javascript')
      cookieLawScriptTemplatesScript.setAttribute('id', 'one-trust-cookie-law-script-templates')
      cookieLawScriptTemplatesScript.setAttribute('data-domain-script', id)
      cookieLawScriptTemplatesScript.setAttribute('data-document-language', 'true')
      try {
        // @ts-ignore
        cookieLawScriptTemplatesScript.setAttribute('src', 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js')
        document.getElementsByTagName('head')[0].prepend(cookieLawScriptTemplatesScript)
        cookieLawScriptTemplatesScript.onload = () => resolve('cookie law script templates loaded')
      } catch (e) {
        return reject(e)
      }
    }))
  }

  /**
   * @returns {Promise<any>}
   */
  async callOptanonWrapper () {
    return this.loadScriptDependencyPromise || (this.loadScriptDependencyPromise = new Promise((resolve, reject) => {
      const optanonWrapperScript = document.createElement('script')
      optanonWrapperScript.setAttribute('id', 'one-trust-optanon-wrapper')
      optanonWrapperScript.type = 'text/javascript'
      const fn = 'function OptanonWrapper() { }'
      try {
        optanonWrapperScript.appendChild(document.createTextNode(fn))
        document.getElementsByTagName('head')[0].append(optanonWrapperScript)
        return resolve('optanon wrapper loaded')
      } catch (e) {
        return reject(e)
      }
    }))
  }
}
