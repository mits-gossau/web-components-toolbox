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

    let unlockNode
    this.noScrollEventListener = event => {
      if (event.detail && event.detail.hasNoScroll) {
        unlockNode = event.detail.unlockNode
        document.documentElement.classList.add(this.getAttribute('no-scroll') || 'no-scroll')
      } else if(!unlockNode || unlockNode === (event.detail?.unlockNode || event.composedPath()[0])) {
        document.documentElement.classList.remove(this.getAttribute('no-scroll') || 'no-scroll')
      }
    }
    if (this.detectIOS()) document.documentElement.classList.add('ios')
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    this.addEventListener(this.getAttribute('no-scroll') || 'no-scroll', this.noScrollEventListener)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('no-scroll') || 'no-scroll', this.noScrollEventListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
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
        min-height: var(--min-height, 100vh);
        overflow-x: var(--overflow-x, visible); /* it is a strong indicator, that something does not stay within bounds, when there is a scrollbar on the x-axis. It is preferable to fix it by finding the mistake, if not possible, set this variable to overflow-x hidden. */
      }
      /* global css set by page */
      :root {
        background-color: var(--root-background-color, var(--background-color, transparent));
        font-size: var(--font-size, 10px);
        line-height: var(--line-height, normal);
        letter-spacing: var(--letter-spacing, normal);
        word-break: var(--word-break, normal);
        /*on Safari still not supported but all other browser does*/
        scrollbar-gutter: var(--scrollbar-gutter-desktop, auto);
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
        margin: var(--body-margin, 0);
        max-width: var(--body-max-width, none);
        min-height: var(--body-min-height, var(--min-height, 100vh));
        overflow-x: hidden;
        padding: var(--body-padding, 0);
      }
      /* navigation open */
      :root.${this.getAttribute('no-scroll') || 'no-scroll'} {
        overflow: var(--root-no-scroll-overflow, hidden);
      }
      :root.${this.getAttribute('no-scroll') || 'no-scroll'} body {
        overflow: var(--body-no-scroll-overflow, hidden);
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
      @media only screen and (max-width: 1200px) {
        :root {
          scrollbar-gutter: var(--scrollbar-gutter-mobile, auto);
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
