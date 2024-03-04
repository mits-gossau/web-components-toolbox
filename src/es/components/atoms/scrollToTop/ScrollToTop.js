// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* @export
* @class ScrollToTop
* @type {CustomElementConstructor}
*/
export default class ScrollToTop extends Shadow() {
  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
     this.button = this.root.children[0];

  }

  connectedCallback() {
    if (this.shouldRenderCSS()) this.renderCSS()
    this.button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.document.onscroll = () => {
      if (document.body.scrollTop > 10 || document.documentElement.scrollTop >= 10) {
        this.button.style = 'display: block; opacity: 1;'
      } else {
        this.button.style = 'display: none; opacity: 2;'
      }

    }

  }

  disconnectedCallback() { }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML() {
    return !this.div
  }

  /**
   * renders the css
   */
  renderCSS() {
    this.css = /* css */`
    :host {
      z-index: var(--scroll-to-top-host-z-index, 1000); 
    }

    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
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
      case 'scroll-to-top-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }
}