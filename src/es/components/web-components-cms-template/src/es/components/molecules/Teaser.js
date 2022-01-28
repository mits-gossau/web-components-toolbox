// @ts-check
import Body from '../organisms/Body.js'

/* global self */

/**
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Teaser
 * @type {CustomElementConstructor}
 * @attribute {
 *  {boolean} [theme=false] there is only one theme, light
 * }
 * @css {
 *  --background-color [#c2262f]
 *  --background-color-light-theme
 *  --h3-color [white]
 *  --h3-color-light-theme [#c2262f]
 *  --p-color [white]
 *  --p-color-light-theme [black]
 *  --figcaption-padding [15px 15px 20px 15px]
 *  --figcaption-padding-light-theme [15px 0]
 *  --h3-font-size [1.2rem]
 *  --p-font-size [1rem]
 *  --font-family
 *  --height [300px] picture tag resp. whole teaser height
 *  --min-height [100%] if set the image covers all of the teaser resp. picture tag
 *  --object-fit [cover] image tag object fit
 *  --opacity [1]
 * }
 * @html {
 *  <figure>
 *    <picture>
 *     <img src="" alt="" width="" height="">
 *    </picture>
 *    <figcaption>
 *      <h3>Teaser Title</h3>
 *      <p>Teaser Text</p>
 *    </figcaption>
 *  </figure>
 * }
 */
export default class Teaser extends Body {
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
    const theme = this.getAttribute('theme')
    let backgroundColor = '--background-color'
    let figcaptionPadding = '--figcaption-padding'
    let figcaptionPaddingMobile = '--figcaption-padding-mobile'
    if (theme) {
      backgroundColor = '--background-color-light-theme'
      figcaptionPadding = '--figcaption-padding-light-theme'
      figcaptionPaddingMobile = '--figcaption-padding-mobile-light-theme'
    }
    // extend body styles
    super.renderCSS()
    const bodyCss = this.css.replace(/\s>\smain/g, '')
    this.css = ''
    this._css.textContent = bodyCss
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
        background-color: var(${backgroundColor}, #c2262f);
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
        background-color: var(${backgroundColor}, #c2262f);
        opacity: var(--opacity, 1);
        padding: var(${figcaptionPadding}, 15px 15px 20px 15px);
      }
      :host figure > *:not(${this.getAttribute('a-picture') || 'a-picture'} ~ figcaption):not(picture ~ figcaption) {
        padding-top: 0;
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host figure figcaption {
          padding: var(${figcaptionPaddingMobile}, var(${figcaptionPadding}, 15px 15px 20px 15px));
        }
        :host figure > *:not(${this.getAttribute('a-picture') || 'a-picture'} ~ figcaption):not(picture ~ figcaption) {
          padding-top: 0;
        }
      }
    `
  }
}
