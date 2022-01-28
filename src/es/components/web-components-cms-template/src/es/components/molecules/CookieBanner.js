// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global self */
/* global location */

/**
 * CookieBanner
 * Example at: /src/es/components/pages/Home2.html
 *
 * @export
 * @class CookieBanner
 * @type {CustomElementConstructor}
 * @attribute {
 *  getAttribute('timeout') || 2000);
 *  getAttribute('storage')
 *  getAttribute('storage-name') || `${location.origin}-${this.tagName}-shown`
 * }
 * @css {
 *  var(--color)]
 *  var(--align-items, center);
 *  var(--background-color, black);
 *  var(--border-bottom, 0);
 *  var(--border-left, 0);
 *  var(--border-right, 0);
 *  var(--border-top, 3px solid white);
 *  var(--box-shadow, 0px -3px 10px white);
 *  var(--color, white);
 *  var(--display, flex);
 *  var(--font-size, 3em);
 *  var(--height, auto);
 *  var(--justify-content, space-between);
 *  var(--padding, 10px);
 *  var(--transistion, bottom 2s ease);
 *  var(--a-color, var(--color, blue));
 *  var(--a-transition, all 0.5s ease);
 *  var(--a-color-focus, var(--color, coral));
 *  var(--a-color-hover, var(--color, coral));
 *  var(--button-color, white);
 *  var(--button-background-color, orange);
 *  var(--button-border-bottom, solid white);
 *  var(--button-border-left, solid white);
 *  var(--button-border-right, solid white);
 *  var(--button-border-top, 0.1em solid white);
 *  var(--button-border-radius, 1em);
 *  var(--button-cursor, pointer);
 *  var(--button-font-size, var(--font-size, 1em));
 *  var(--button-padding, 0.2em);
 *  var(--button-transition, all 0.5s ease);
 *  var(--button-color-focus, var(--button-color, gray));
 *  var(--button-background-color-focus, var(--background-color, red));
 *  var(--button-color-hover, var(--button-color, gray));
 *  var(--button-background-color-hover, var(--background-color, red));
 *  var(--p-margin, 0);
 * }
 */
export default class CookieBanner extends Shadow() {
  constructor (...args) {
    super(...args)

    this.clickListener = event => {
      this.section.classList.remove('show')
      this.shown = true
    }
  }

  connectedCallback () {
    if (!this.shown) {
      if (this.shouldComponentRenderCSS()) this.renderCSS()
      if (this.shouldComponentRenderHTML()) this.renderHTML()
      this.addEventListener('click', this.clickListener)
      setTimeout(() => this.section.classList.add('show'), this.getAttribute('timeout') || 2000)
    } else {
      this.css = /* css */`
        :host {
          display: none;
        }
      `
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
    return !this.section
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host > section {
        align-items: var(--align-items, center);
        background-color: var(--background-color, black);
        border-bottom: var(--border-bottom, 0);
        border-left: var(--border-left, 0);
        border-right: var(--border-right, 0);
        border-top: var(--border-top, 3px solid white);
        bottom: -100%;
        box-shadow: var(--box-shadow, 0px -3px 10px white);
        box-sizing: border-box;
        color: var(--color, white);
        display: var(--display, flex);
        font-size: var(--font-size, 3em);
        height: var(--height, auto);
        justify-content: var(--justify-content, space-between);
        padding: var(--padding, 10px);
        position: fixed;
        transition: var(--transition, bottom 2s ease);
        width: 100%;
      }
      :host > section.show {
        bottom: 0;
      }
      :host > section a {
        color: var(--a-color, var(--color, blue));
        transition: var(--a-transition, all 0.5s ease);
      }
      :host > section a:focus {
        color: var(--a-color-focus, var(--color, coral));
      }
      :host > section a:hover {
        color: var(--a-color-hover, var(--color, coral));
      }
      :host > section button {
        color: var(--button-color, white);
        background-color: var(--button-background-color, orange);
        border-bottom: var(--button-border-bottom, solid white);
        border-left: var(--button-border-left, solid white);
        border-right: var(--button-border-right, solid white);
        border-top: var(--button-border-top, 0.1em solid white);
        border-radius: var(--button-border-radius, 1em);
        cursor: var(--button-cursor, pointer);
        font-size: var(--button-font-size, var(--font-size, 1em));
        padding: var(--button-padding, 0.2em);
        transition: var(--button-transition, all 0.5s ease);
      }
      :host > section button:focus {
        color: var(--button-color-focus, var(--button-color, gray));
        background-color: var(--button-background-color-focus, var(--background-color, red));
      }
      :host > section button:hover {
        color: var(--button-color-hover, var(--button-color, gray));
        background-color: var(--button-background-color-hover, var(--background-color, red));
      }
      :host > section p {
        margin: var(--p-margin, 0);
      }
    `
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.html = /* html */`
      <section></section>
    `
    Array.from(this.root.children).forEach(node => {
      if (node !== this.section && !node.getAttribute('slot') && node.tagName !== 'STYLE') this.section.appendChild(node)
    })
  }

  get section () {
    return this.root.querySelector('section')
  }

  get shown () {
    // @ts-ignore
    return this.hasAttribute('storage') ? self[this.getAttribute('storage')].getItem(this.storageName) : this._shown
  }

  set shown (shown) {
    // @ts-ignore
    this.hasAttribute('storage') ? self[this.getAttribute('storage')].setItem(this.storageName, shown) : this._shown = shown
  }

  get storageName () {
    return this.getAttribute('storage-name') || `${location.origin}-${this.tagName}-shown`
  }
}
