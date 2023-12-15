// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global window */

/**
* @export
* @class CookieSettings
* @type {CustomElementConstructor}
*/
export default class CookieSettings extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    this.oneTrustHref?.addEventListener('click', this.settingsLinkListener)
  }

  disconnectedCallback () {
    this.oneTrustHref?.removeEventListener('click', this.settingsLinkListener)
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
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.settingsLink
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
      case 'cookie-settings-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML () {
    this.settingsLink = '<a class="ot-sdk-show-settings">Cookie Settings</a>'
    this.html = this.settingsLink
  }

  get oneTrustHref () {
    return this.root.querySelector('a')
  }
}
