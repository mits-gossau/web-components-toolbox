// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global self */

/**
 * HighlightList is the wrapper of molecules/Highlight.js which also styles a title/h1 for the list of highlights
 * Example at: /src/es/components/pages/Home.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class HighlightList
 * @type {CustomElementConstructor}
 * @css {
 *  --content-spacing [40px]
 *  --hr-color [black]
 *  --content-width [80%]
 *  --color [black]
 *  --font-family-secondary
 *  --font-size [2.5rem]
 *  --font-weight [normal]
 *  --text-align [center]
 *  --text-transform [uppercase]
 * }
 * @attribute {
 *  {string} mobile-breakpoint
 * }
 */
export default class HighlightList extends Shadow() {
  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
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
   * renders the o-highlight-list css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display: block;
      }
      :host > m-highlight:first-Child {
        border-top: var(--border-top, 1px solid var(--hr-color, var(--color, black)));
      }
      :host > m-highlight {
        border-bottom: var(--border-bottom, 1px solid var(--hr-color, var(--color, black)));
        display: flex;
        flex-direction: var(--flex-direction, row);
        gap: calc(var(--content-spacing, 40px) / 2);
        padding: var(--content-spacing, 40px 0) ;
        margin: 0 auto;
        width: var(--content-width, 80%);
      }
      :host > h1 {
        color: var(--color, black);
        display: block;
        font-family: var(--font-family-secondary);
        font-size: var(--font-size, 2.5rem);
        font-weight: var(--font-weight, normal);
        text-align: var(--text-align, center);
        text-transform: var(--text-transform, uppercase);
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host > m-highlight {
          flex-wrap: wrap;
          width: var(--content-width-mobile, 90%);
          padding: var(--content-spacing-mobile, 30px 0);
        }
      }
    `
  }
}
