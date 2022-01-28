// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global self */

/**
 * PlaylistItem can be wrapped by src/es/components/organisms/Playlist.js and expects p, h4, ul > li
 * Example at: /src/es/components/pages/ClassicsHighlights.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class PlaylistItem
 * @type {CustomElementConstructor}
 * @attribute {
 *
 * }
 * @css {
 * --text-align, center
 * --padding, 0
 * --text-transform, uppercase
 * --p-margin, 0
 * --p-line-height, normal
 * --h4-margin, 0
 * --h4-font-family, var(--font-family-bold)
 * --ul-flex-direction, row
 * --ul-justify-content, center
 * --ul-margin, 0
 * --ul-padding, 0
 * --ul-list-style-type, none
 * --li-margin, unset
 * --ul-justify-content-mobile, space-around
 * --li-margin-mobile, unset
 * }
 */
export default class PlaylistItem extends Shadow() {
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
   * renders the m-PlaylistItem css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        cursor: ${this.getAttribute('href') ? 'pointer' : 'auto'};
        display: block;
        text-align: var(--text-align, center);
        padding: var(--padding, 0);
      }
      :host > * {
        margin: var(--content-spacing, unset) auto;  /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        width: var(--content-width, 80%);
      }
      :host h4, :host ul li {
        text-transform: var(--text-transform, uppercase);
      }
      :host p {
        margin: var(--p-margin, 0) auto;
        line-height: var(--p-line-height, normal);
      }
      :host a {
        text-decoration: var(--a-text-decoration, none);
        text-underline-offset: var(--a-text-underline-offset, unset);
        text-transform: var(--a-text-transform, uppercase);
        color: var(--a-color, green);
      }
      :host a:hover, :host([href]:hover) a {
        text-decoration: var(--a-text-decoration-hover, underline);
        color: var(--a-color-hover, var(--color, pink));
      }
      :host h4 {
        margin: var(--h4-margin, 0) auto;
        font-family: var(--h4-font-family, var(--font-family-bold));
        font-weight: var(--h4-font-weight, var(--font-weight, normal));
      }
      :host ul {
        display: flex;
        flex-direction: var(--ul-flex-direction, row);
        flex-wrap: var(--ul-flex-wrap, wrap);
        justify-content: var(--ul-justify-content, center);
        margin: var(--ul-margin, 0) auto;
        padding: var(--ul-padding, 0);
        list-style-type: var(--ul-list-style-type, none);
      }
      :host ul li {
        margin: var(--li-margin, 0 5px);
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host > * {
          margin: var(--content-spacing-mobile, 0) auto; /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          width: var(--content-width-mobile, 90%);
        }
        :host ul {
          justify-content: var(--ul-justify-content-mobile, space-around);
        }
        :host ul li {
          margin: var(--li-margin-mobile, 0 5px);
        }
      }
    `
  }
}
