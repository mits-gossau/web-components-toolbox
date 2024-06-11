// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* @export
* @class LanguageSwitcher
* @type {CustomElementConstructor}
*/
export default class LanguageSwitcher extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
  }

  disconnectedCallback () { }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return this.hasAttribute('id') ? !this.root.querySelector(`:host > style[_css], #${this.getAttribute('id')} > style[_css]`) : !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders the css
   */
  renderCSS () {
    this.css = /* css */`
    :host {
      grid-area: var(--grid-area, "login");
      margin: var(--margin, calc(var(--content-spacing, unset) / 2) auto); /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
      width: var(--width, var(--content-width, max(calc(_max-width_ - var(--content-spacing) * 2), 55%))); /* Environment.js mobileBreakpoint must correspond to the calc 1200px */
      }
      :host > ul {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: var(--justify-content, end);
        gap: calc(var(--content-spacing, 1em) * 2);
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          gap: calc(var(--content-spacing-mobile, var(--content-spacing, 1em)) * 2);
          margin: calc(var(--content-spacing-mobile, var(--content-spacing, unset)) / 2) auto;
          /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          width: var(--content-width-mobile, calc(100% - var(--content-spacing-mobile, var(--content-spacing)) * 2));
        }
        :host .font-size-tiny {
          font-size: calc(0.75 * var(--p-font-size-mobile, var(--p-font-size, 1em)));
          line-height: var(--line-height-mobile, var(--line-height, normal));
        }
        :host > div div[open] {
          top: 0 !important;
        }
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
      case 'language-switcher-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false
        }, ...styles])
      case 'language-switcher-delica-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./delica-/delica-.css`,
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }
}
