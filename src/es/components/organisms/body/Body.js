// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global location */
/* global self */

/**
 * Defines a body body for content and maps variables to global tags
 * Example at: /src/es/components/pages/General.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Body
 * @type {CustomElementConstructor}
 * @css {
 *  NOTE: grid-area: body;
 *  --content-spacing [40px]
 *  --content-width [80%]
 *  --h1-color [--color, black]
 *  --font-family-secondary
 * }
 */
export default class Body extends Shadow() {
  constructor (...args) {
    super(...args)

    this.clickAnchorEventListener = event => {
      let element = null
      if (event && event.detail && event.detail.selector && (element = this.root.querySelector(event.detail.selector))) element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    document.body.addEventListener(this.getAttribute('click-anchor') || 'click-anchor', this.clickAnchorEventListener)
    if (location.hash) {
      self.addEventListener('load', event => this.clickAnchorEventListener({ detail: { selector: location.hash } }), { once: true })
      document.body.addEventListener(this.getAttribute('wc-config-load') || 'wc-config-load', event => setTimeout(() => this.clickAnchorEventListener({ detail: { selector: location.hash } }), 1000), { once: true })
    }
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('click-anchor') || 'click-anchor', this.clickAnchorEventListener)
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
    return !this.root.querySelector('main')
  }

  /**
   * controls all body > main content width and margin (keep as small as possible and add other styles into the style.css)
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        background-color: var(--background-color, transparent);
        background-repeat: var(--background-repeat, initial);
        background-position: var(--background-position, 0);
        grid-area: body;
      }
      :host > main {
        padding: var(--main-padding, 0);
      }
      :host > main > *:not(style):not(script) {
        display: var(--any-display, block);
      }
      :host > main > * {
        margin: var(--content-spacing, unset) auto;  /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        width: var(--content-width, 80%);
      }
      :host > main > o-body-style {
        display: inline-block !important;
        margin: 0;
        width: 100%;
      }
      :host(.content-max-width) > main > *:not(.ignore-max-width), :host> main > *.content-max-width {
        max-width: var(--content-max-width, none);
      }
      :host(.content-max-width-two) > main > *:not(.ignore-max-width), :host > main > *.content-max-width-two {
        max-width: var(--content-max-width-two, none);
      }
      @media only screen and (max-width: _max-width_) {
        :host > main {
          padding: var(--main-padding-mobile, var(--main-padding, 0));
        }
        :host > main > * {
          margin: var(--content-spacing-mobile, var(--content-spacing, unset)) auto; /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          width: var(--content-width-mobile, calc(100% - var(--content-spacing-mobile, var(--content-spacing)) * 2));
        }
        :host(.content-max-width) > main > *:not(.ignore-max-width), :host> main > *.content-max-width {
          max-width: var(--content-max-width-mobile, none);
        }
        :host(.content-max-width-two) > main > *:not(.ignore-max-width), :host > main > *.content-max-width-two {
          max-width: var(--content-max-width-two-mobile, none);
        }
      }
    `
    this.fetchCSS([
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`,
        namespace: false
      },
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`
      }
    ])
  }

  /**
   * renders the a-link html
   *
   * @return {void}
   */
  renderHTML () {
    const main = this.root.appendChild(document.createElement('main'))
    Array.from(this.root.children).forEach(node => {
      if (node === main || node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      main.appendChild(node)
    })
  }
}
