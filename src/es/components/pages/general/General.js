// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * General is simply a grid which expects certain grid-areas
 * As a page, this component becomes a domain dependent container and shall hold organisms, molecules and/or atoms
 *
 * @export
 * @class General
 * @type {CustomElementConstructor}
 * @css {
 *  NOTE: grid-template-areas!
 *  --header-height  [85px]
 *  --header-height-mobile [50px]
 *  --footer-min-height  [250px]
 *  --footer-min-height-mobile [150px]
 *  --color [black]
 *  --font-family [FuturaT, (fallback)]
 *  --font-family-bold [OPTIFutura-ExtraBlackCond, (fallback)]
 * }
 * @attribute {
 *  {string} mobile-breakpoint
 *  {string} [no-scroll="no-scroll"]
 * }
 */
export default class General extends Shadow() {
  constructor (...args) {
    super({ mode: 'false' }, ...args) // disabling shadow-DOM to control root font-size on html-tag

    if (this.detectIOS()) document.documentElement.classList.add('ios')
  }

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
   * renders css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display: grid;
        grid-template-areas: "header"
                             "body"
                             "footer";
        grid-template-columns: 100%;
        grid-template-rows: var(--header-height , 85px) 1fr minmax(var(--footer-min-height, 250px), auto);
        min-height: 100vh;
      }
      /* global css set by page */
      html {
        background-color: var(--html-background-color, transparent);
        font-size: var(--font-size, 10px);
        font-weight: var(--font-weight, normal);
        line-height: var(--line-height, normal);
        letter-spacing: var(--letter-spacing, normal);
        word-break: var(--word-break, normal);
      }
      /* to counteract initial.css */
      /* hide component stuff before it is rendered to avoid the blitz (flashing white) also set the --background-color in the variables...css */
      :host, html {
        color: var(--color, black);
        font-family: var(--font-family, "FuturaT", Arial, sans-serif);
        font-weight: var(--font-weight, normal);
      }
      html a {
        color: var(--a-color, var(--color-secondary, var(--color, blue)));
        font-family: var(--font-family, "FuturaT", Arial, sans-serif);
        font-weight: var(--font-weight, normal);
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
      }
      html a:hover {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, blue))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
      }
      /* sticky footer */
      body {
        margin: 0;
        min-height: 100vh;
        overflow-x: hidden;
      }
      /* navigation open */
      html.${this.getAttribute('no-scroll') || 'no-scroll'} {
        overflow: hidden;
      }
      html.${this.getAttribute('no-scroll') || 'no-scroll'} body {
        overflow: hidden;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          grid-template-rows: var(--header-height-mobile, 50px) 1fr minmax(var(--footer-min-height-mobile, 150px), auto);
        }
        /* global css set by page */
        html {
          font-size: var(--font-size-mobile, 10px);
          font-weight: var(--font-weight-mobile, var(--font-weight, normal));
          line-height: var(--line-height-mobile, var(--line-height, normal));
          word-break: var(--word-break-mobile, normal);
        }
      }
    `
  }

  detectIOS () {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  }
}
