// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

export default class MetaHeader extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
  }

  shouldRenderCSS () {
    return this.hasAttribute('id') ? !this.root.querySelector(`:host > style[_css], #${this.getAttribute('id')} > style[_css]`) : !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`) 
  }

  shouldRenderHTML () {
    return !this.divWrapper
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */ `
      :host {
        align-items: var(--align-items, stretch);
        display:var(--display,flex);
        flex-direction:var(--flex-direction, row);
        gap:var(--gap,normal);
        justify-content:var(--justify-content, flex-start);
        margin:var(--margin,0);
        padding:var(--padding, 0);
        width:var(--width, auto);
        z-index:var(--z-index, 9999);
      }
      :host div {
        display:var(--div-display, flex);
        flex-direction:var(--div-flex-direction, row);
        align-items:var(--div-align-items, center);
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          justify-content: var(--justify-content-mobile, space-between);
          width: var(--width-mobile, var(--width, auto));
        }
        :host div {
          flex: var(--div-flex-mobile, 1);
        }
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
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
      case 'meta-header-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles, false)
    }
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML () {
    this.divWrapper = this.root.querySelector(this.cssSelector + ' > div') || document.createElement('div')
    this.html = this.divWrapper
  }
}
