// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
 * Flockler
 * https://github.com/flockler/react-flockler-embed/blob/main/src/index.tsx
 *
 * @export
 * @class Flockler
 * @type {CustomElementConstructor}
 * @attribute {
 * }
 * @css {
 * }
 */
export default class Flockler extends Shadow() {
  constructor (...args) {
    super(...args)
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) {
      this.renderCSS();
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders the css
   *
   * @return {Promise<void>|void}
   */
  renderCSS () {
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: false
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'list-vertical-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./vertical-/vertical-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }
}
