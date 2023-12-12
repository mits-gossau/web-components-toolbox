// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
* @export
* @class OneTrust
* @type {CustomElementConstructor}
*/
export default class OneTrust extends Shadow() {
  constructor (options = {}, ...args) {
    super({ mode: 'false' }, ...args)
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
    await this.loadCookieLawDependency(this.id)
    await this.loadCookieLawScriptTemplates(this.id)
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
        const src = self.Environment.getApiBaseUrl('onetrust').consent.replace(/id/, id)
        cookieLawScript.setAttribute('src', src)
        document.getElementsByTagName('head')[0].appendChild(cookieLawScript)
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
        cookieLawScriptTemplatesScript.setAttribute('src', `${self.Environment.getApiBaseUrl('onetrust').scriptTemplates}`)
        document.getElementsByTagName('head')[0].appendChild(cookieLawScriptTemplatesScript)
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

  get id () {
    return this.getAttribute('id')
  }
}
