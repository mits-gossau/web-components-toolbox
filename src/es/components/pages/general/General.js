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
    super({ mode: 'false' }, ...args) // disabling shadow-DOM to control root font-size on :root-tag

    if (this.detectIOS()) document.documentElement.classList.add('ios')

    let timeout = null
    this.resizeListener = event => {
      clearTimeout(timeout)
      timeout = setTimeout(() => document.documentElement.style.setProperty('--vh', document.documentElement.clientHeight * 0.01 + 'px'), 50)
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    self.addEventListener('resize', this.resizeListener)
    this.resizeListener()
  }

  disconnectedCallback () {
    self.removeEventListener('resize', this.resizeListener)
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
        grid-template-areas: "login"
                             "header"
                             "body"
                             "footer";
        grid-template-columns: 100%;
        grid-template-rows: auto minmax(var(--header-height , 50px), auto) 1fr minmax(var(--footer-min-height, 50px), auto);
        min-height: var(--min-height, calc(var(--vh, 1vh) * 100)); /* ios mobile vh bug */
      }
      /* global css set by page */
      :root {
        background-color: var(--root-background-color, var(--background-color, transparent));
        font-size: var(--font-size, 10px);
        line-height: var(--line-height, normal);
        letter-spacing: var(--letter-spacing, normal);
        word-break: var(--word-break, normal);
      }
      /* to counteract initial.css */
      /* hide component stuff before it is rendered to avoid the blitz (flashing white) also set the --background-color in the variables...css */
      :host, :root {
        color: var(--color, black);
        font-family: var(--font-family, "FuturaT", Arial, sans-serif);
        font-weight: var(--font-weight, normal);
      }
      a {
        color: var(--a-color, var(--color-secondary, var(--color, blue)));
        font-family: var(--font-family, "FuturaT", Arial, sans-serif);
        font-weight: var(--font-weight, normal);
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
      }
      a:hover {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, blue))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
      }
      /* sticky footer */
      body {
        margin: 0;
        min-height: var(--min-height, calc(var(--vh, 1vh) * 100)); /* ios mobile vh bug */
        overflow-x: hidden;
      }
      /* navigation open */
      :root.${this.getAttribute('no-scroll') || 'no-scroll'} {
        overflow: hidden;
      }
      :root.${this.getAttribute('no-scroll') || 'no-scroll'} body {
        overflow: hidden;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          grid-template-rows: auto minmax(var(--header-height-mobile, var(--header-height, 50px)), auto) 1fr minmax(var(--footer-min-height-mobile, var(--footer-min-height, 50px)), auto);
        }
        /* global css set by page */
        :root {
          font-size: var(--font-size-mobile, var(--font-size, 10px));
          font-weight: var(--font-weight-mobile, var(--font-weight, normal));
          line-height: var(--line-height-mobile, var(--line-height, normal));
          word-break: var(--word-break-mobile, var(--word-break, normal));
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
