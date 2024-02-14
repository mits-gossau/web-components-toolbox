// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global window */
/* global self */

/**
* @export
* @class OneTrust
* @type {CustomElementConstructor}
*/
export default class OneTrust extends Shadow() {
  /**
   * @param {any} args
   */
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, mode: 'false', ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderHTML()) {
      this.renderHTML().then(() => {
        if (this.settingsLink) this.settingsLink.addEventListener('click', this.settingsLinkListener)
      })
    } else if (this.settingsLink) this.settingsLink.addEventListener('click', this.settingsLinkListener)
  }

  disconnectedCallback () {
    if (this.settingsLink) this.settingsLink.removeEventListener('click', this.settingsLinkListener)
  }

  settingsLinkListener = (e) => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.OneTrust) {
      try {
        // @ts-ignore
        window.OneTrust.ToggleInfoDisplay()
      } catch (err) {
        console.error('Failed to open Info Display:', err)
      }
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !document.head.querySelector('#one-trust-cookie-law')
  }

  /**
   * Render HTML
   * OneTrust loads its settings and we check whether we should display the link or not.
   * The link opens the cookie settings in a modal window
   * @returns void
   */
  async renderHTML () {
    await this.renderScripts()
    const span = document.createElement('span')
    span.classList.add('ot-sdk-show-settings')
    span.setAttribute('style', 'display: none !important;')
    document.body.appendChild(span)
    if (self.getComputedStyle(span).getPropertyValue('visibility') === 'visible') this.html = `<a class="ot-sdk-show-settings">${this.linkText}</a>`
  }

  async renderScripts () {
    await this.loadCookieLawDependency(this.id)
    await this.loadCookieLawScriptTemplates(this.id)
    await this.callOptanonWrapper()
  }

  /**
   * Loads a script for cookie law compliance.
   * @param {string} id
   * @returns a promise.
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
        document.getElementsByTagName('head')[0].appendChild(cookieLawScript)
        cookieLawScript.onload = () => resolve('cookie law loaded')
      } catch (e) {
        return reject(e)
      }
    }))
  }

  /**
   * Loads a script template for a cookie law script.
   * @param {string} id
   * @returns a promise.
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
        document.getElementsByTagName('head')[0].appendChild(cookieLawScriptTemplatesScript)
        cookieLawScriptTemplatesScript.onload = () => resolve('cookie law script templates loaded')
      } catch (e) {
        return reject(e)
      }
    }))
  }

  /**
   * Loads a script dependency called "optanon wrapper"
   * @returns a promise.
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

  get settingsLink () {
    return this.root.querySelector('a')
  }

  get linkText () {
    return this.getAttribute('link-text') || 'Cookie Settings'
  }
}
