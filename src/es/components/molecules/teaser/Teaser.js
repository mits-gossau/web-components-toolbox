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
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    this.addEventListener('click', this.clickListener)
    if (!this.aPicture.hasAttribute('loaded')) {
      this.hidden = true
      this.addEventListener('picture-load', event => this.hidden = false, { once: true })
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
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return this.hidden
  }

  /**
   * renders the m-Teaser css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        cursor: ${this.getAttribute('href') ? 'pointer' : 'auto'};
        display: var(--display, flex);
        flex-direction: var(--flex-direction, column);
        align-items: var(--align-items, flex-start);
        justify-content: var(--justify-content, space-between);
      }
      :host figure {
        display: flex;
        flex-direction: column;
        margin: 0;
        background-color: #c2262f;
        width: 100%;
      }
      /* fallback if a-picture is not used */
      :host figure picture {
        height: var(--height, 300px);
        overflow: hidden;
      }
      :host figure > picture > img {
        min-height: var(--min-height, 100%);
        height: auto;
        object-fit: var(--object-fit, cover);
        width: 100%;
      }
      :host figure figcaption {
        background-color: #c2262f;
        opacity: var(--opacity, 1);
        padding: 15px 15px 20px 15px;
      }
      :host figure > *:not(${this.getAttribute('a-picture') || 'a-picture'} ~ figcaption):not(picture ~ figcaption) {
        padding-top: 0;
      }
      @media only screen and (max-width: _max-width_) {
        :host figure figcaption {
          padding: 15px 15px 20px 15px;
        }
        :host figure > *:not(${this.getAttribute('a-picture') || 'a-picture'} ~ figcaption):not(picture ~ figcaption) {
          padding-top: 0;
        }
      }
    `
    this.fetchCSS(['../../../css/reset.css', '../../../css/style.css'], undefined, undefined, undefined, undefined, false)
  }

  /**
   * renders the a-link html
   *
   * @return {void}
   */
  renderHTML () {
    
  }

  get aPicture () {
    return this.root.querySelector('a-picture')
  }
}
