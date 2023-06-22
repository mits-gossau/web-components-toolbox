// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */
/* global CustomEvent */


export default class MetaHeader extends Shadow() {
  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
  }

  shouldRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  shouldRenderHTML() {
    return !this.divWrapper
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS() {
    this.css = /* css */ `
      :host {
        display:var(--display,flex);
        flex-direction:var(--flex-direction, row);
        justify-content:var(--justify-content, flex-start);
        padding:var(--padding, 0);
        gap:var(--gap,normal);
      }
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate() {
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
      case 'metaheader-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML() {
    this.divWrapper = this.root.querySelector(this.cssSelector + ' > div') || document.createElement('div')
    this.html = this.divWrapper
  }
}
