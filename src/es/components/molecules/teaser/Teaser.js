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

    this.mouseoverListener = event => {
      if (this.aArrow) this.aArrow.setAttribute('hover', 'true')
    }
    this.mouseoutListener = event => {
      if (this.aArrow) this.aArrow.setAttribute('hover', '')
    }
  }

  connectedCallback () {
    this.addEventListener('click', this.clickListener)
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS())
    if (this.aPicture && this.aPicture.hasAttribute('picture-load') && !this.aPicture.hasAttribute('loaded')) showPromises.push(new Promise(resolve => this.addEventListener('picture-load', event => resolve(), { once: true })))
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => (this.hidden = false))
    }
    if (this.getAttribute('namespace') === 'overlay-') {
      this.addEventListener('mouseover', this.mouseoverListener)
      this.addEventListener('mouseout', this.mouseoutListener)
    }
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.clickListener)
    if (this.getAttribute('namespace') === 'overlay-') {
      this.removeEventListener('mouseover', this.mouseoverListener)
      this.removeEventListener('mouseout', this.mouseoutListener)
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
   * renders the m-Teaser css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host([href]) {
        cursor: pointer;
      }
      :host figure {
        display: var(--display, flex);
        background-color: var(--background-color, #c2262f);
        flex-direction: var(--flex-direction, column);
        align-items: var(--align-items, flex-start);
        justify-content: var(--justify-content, space-between);
        margin: var(--margin, 0);
        padding: var(--padding, 0);
        height: var(--height, 100%);
        width: var(--width, 100%);
        overflow: var(--overflow, visible);
        position: var(--position, static);
      }
      ${this.getAttribute('namespace') === 'overlay-'
        ? /* css */`
          :host figure {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
          }
          :host figure a-picture, :host figure figcaption {
            grid-column: 1;
            grid-row: 1;
          }
          :host figure figcaption {
            z-index: 1;
          }
        `
        : ''}
      :host figure a-picture {
        height: var(--a-picture-height, 100%);
        width: var(--a-picture-width, 100%);
        transition: var(--a-picture-transition, none);
        transform: var(--a-picture-transform, none);
      }
      :host(:hover) figure a-picture {
        transform: var(--a-picture-transform-hover, none);
      }
      :host figure figcaption {
        align-self: var(--figcaption-align-self, auto);
        background-color: var(--figcaption-background-color, #c2262f);
        margin: var(--figcaption-margin, 0);
        padding: var(--figcaption-padding, 1rem);
        font-size: var(--figcaption-font-size, 1rem);
        flex-grow: var(--figcaption-flex-grow, 1);
        height: var(--figcaption-height, 100%);
        width: var(--figcaption-width, 100%);
        transition: var(--figcaption-transition, none);
        transform: var(--figcaption-transform, none);
      }
      :host(:hover) figure figcaption {
        transform: var(--figcaption-transform-hover, none);
      }
      :host figure figcaption a-link {
        position: var(--a-link-position, static);
        top: var(--a-link-top, auto);
        bottom: var(--a-link-bottom, auto);
        transition: var(--a-link-transition, none);
        transform: var(--a-link-transform, none);
      }
      :host(:hover) figure figcaption a-link {
        transform: var(--a-link-transform-hover, none);
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
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tile-/tile-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'overlay-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./overlay-/overlay-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  get aPicture () {
    return this.root.querySelector('a-picture')
  }

  get aArrow () {
    return this.root.querySelector('a-arrow')
  }
}
