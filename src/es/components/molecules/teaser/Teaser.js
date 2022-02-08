// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Teaser
 * @type {CustomElementConstructor}
 */
export default class Teaser extends Shadow() {
  constructor (...args) {
    super(...args)

    this.clickListener = event => {
      if (this.hasAttribute('href')) self.open(this.getAttribute('href'), this.getAttribute('target') || '_self', this.hasAttribute('rel') ? `rel=${this.getAttribute('rel')}` : '')
    }
    // link behavior made accessible
    if (this.hasAttribute('href')) {
      this.setAttribute('data-href', this.getAttribute('href'))
      this.setAttribute('role', 'link')
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    this.addEventListener('click', this.clickListener)
    if (this.aPicture.hasAttribute('picture-load') && !this.aPicture.hasAttribute('loaded')) {
      this.hidden = true
      this.addEventListener('picture-load', event => (this.hidden = false), { once: true })
    }
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.clickListener)
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
   * renders the m-Teaser css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host([href]) {
        cursor: pointer;
      }
      :host figure {
        display: var(--display, flex);
        flex-direction: var(--flex-direction, column);
        align-items: var(--align-items, flex-start);
        justify-content: var(--justify-content, space-between);
        margin: var(--margin, 0);
        padding: var(--padding, 0);
        height: var(--height, 100%);
      }
      :host figure figcaption {
        background-color: var(--figcaption-background-color, #c2262f);
        margin: var(--figcaption-margin, 0);
        padding: var(--figcaption-padding, 1rem);
        flex-grow: var(--figcaption-flex-grow, 1);
      }
      @media only screen and (max-width: _max-width_) {
        
      }
    `
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'tile-':
        this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tile-.css`, // apply namespace since it is specific and no fallback
          namespaceFallback: false
        }, ...styles], false)
        break
      case 'tile-pink-':
        this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tile-.css`, // apply namespace since it is specific and no fallback
          namespaceFallback: false
        }, {
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tile-pink-.css`, // apply namespace since it is specific and no fallback
          namespaceFallback: false
        }, ...styles], false)
        break
      default:
        this.fetchCSS(styles, false)
        break
    }
  }

  get aPicture () {
    return this.root.querySelector('a-picture')
  }
}
