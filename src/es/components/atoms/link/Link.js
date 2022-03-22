// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global location */

/**
 * Link is a wrapper for an a-tag
 * Example at: /src/es/components/pages/Home.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class Link
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} href used for the link reference
 *  {boolean} [hit-area=false] this lets you define a hit-area of your link, to avoid too large focus (hit-area) by fonts too large line-height, which can't be overwritten with css: https://github.com/mits-gossau/web-components-cms-template/issues/53
 * }
 * @css {
 *  --text-transform [none]
 *  --color [red]
 *  --font-size [1em]
 *  --font-weight [normal]
 *  --padding [14px 10px]
 *  --text-align [left]
 *  --text-transform [none]
 *  --color-hover [yellow]
 * }
 */
export default class Link extends Shadow() {
  constructor (a, ...args) {
    super(...args)

    this._a = a
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
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
    return !this.root.querySelector('a')
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      ${this.hitArea
        ? /* css */`
          :host {
            display: grid;
          }
          :host > a {
            z-index: 1;
          }
          :host > ${this.hitAreaTagName} {
            z-index: 0;
          }
          :host > a, :host > ${this.hitAreaTagName} {
            grid-column: 1;
            grid-row: 1;
          }
          :host > a:hover ~ ${this.hitAreaTagName} {
            color: var(--color-hover, var(--color, yellow));
            text-decoration: var(--text-decoration-hover, var(--text-decoration, none));
          }
        `
        : ''}
      :host {
        cursor: pointer;
      }
      :host > a, :host > ${this.hitAreaTagName} {
        box-sizing: border-box;
        color: var(--color, red);
        display: var(--display, block);
        font-size: var(--font-size, 1em);
        line-height: var(--line-height, normal);
        letter-spacing: var(--letter-spacing, normal);
        font-weight: var(--font-weight, normal);
        font-family: var(--font-family, inherit);
        height: var(--height, 100%);
        padding: var(--padding, 14px 10px);
        text-align: var(--text-align, left);
        text-decoration: var(--text-decoration, none);
        text-underline-offset: var(--text-underline-offset, var(--a-text-underline-offset, unset));
        text-transform: var(--text-transform, none);
        transition: var(--transition, all 0.3s ease-out);
        width: var(--width, 100%);
        white-space: var(--white-space, normal);
        word-break: var(--word-break, normal);
      }
      :host(.active) > a, :host(.active) > a ~ ${this.hitAreaTagName} {
        color: var(--color-active, var(--color-hover, var(--color, yellow)));
        text-decoration: var(--text-decoration-active, var(--text-decoration-hover, var(--text-decoration, none)));
        font-family: var(--font-family-active, var(--font-family-hover, var(--font-family, inherit)));
      }
      :host > a:hover, :host > a:hover ~ ${this.hitAreaTagName} {
        color: var(--color-hover, var(--color, yellow));
        text-decoration: var(--text-decoration-hover, var(--text-decoration, none));
        font-family: var(--font-family-hover, var(--font-family, inherit));
      }
      :host > a:focus {
        text-decoration: var(--text-decoration-focus, unset);
      }
      :host > span {
        display: var(--span-display, inline);
      }
      :host a[href$='.pdf'] {
        background: transparent url(${this.iconPath}) center left no-repeat;
        background-position: left bottom;
        padding:var(--icon-padding);
        display:inline;
        vertical-align:middle;
        transition: box-shadow .25s ease-out;
      }
      :host a[href$='.pdf'] span {
        color: var(--icon-span-color);
        font-family:var(--icon-span-font-family);
        padding:var(--icon-span-padding);
      }
      ${this.getAttribute('namespace') === 'download-'
        ? /* CSS */`
          :host > a:hover {
            box-shadow: 0 -2px 0 0 #ff9900 inset;
          }
        `
        : ''}
      ${this.getAttribute('namespace') === 'underline-'
        ? /* CSS */`
          :host {
            display: block;
            position: relative !important;
            width: var(--width, fit-content) !important;
          }
          :host > a::after, :host > ${this.hitAreaTagName}::after {
            position: absolute;
            top: 100%;
            left: 0;
            display: inline-block;
            width: 100%;
            height: var(--after-height, 0.25em);
            background-color: var(--after-background-color, var(--color-hover, green));
            content: '';
            opacity: 0;
            transform: translateY(1em);
            transition: opacity .3s ease 0s,transform .3s ease 0s;
          }
          :host > a:hover::after, :host > ${this.hitAreaTagName}:hover::after {
            opacity: 1;
            transform: translateY(0);
          }
        `
        : ''}
      @media only screen and (max-width: _max-width_) {
        :host > a, :host > ${this.hitAreaTagName} {
          color:var(--color-mobile, var(--color, inherit));
          display: var(--display-mobile, var(--display, block));
          line-height: var(--line-height-mobile, var(--line-height, normal));
        }
        :host > span {
          display: var(--span-display-mobile, var(--span-display, none));
        }
      }
    `
    switch (this.getAttribute('namespace')) {
      case 'underline-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./underline-/underline-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }])
        case 'download-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./download-/download-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }])
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.html = this.a
    if (this.hitArea) {
      this.hitArea.innerHTML = this.a.innerHTML
      this.hitArea.setAttribute('data-href', this.a.getAttribute('href'))
      this.hitArea.setAttribute('role', 'link')
      this.a.setAttribute('aria-label', this.a.textContent)
      this.a.innerHTML = ''
      this.root.appendChild(this.hitArea)
    }
    if (this.hasAttribute('set-active') && location.href.includes(this.a.getAttribute('href'))) this.classList.add('active')
  }

  get hitArea () {
    return this.getAttribute('hit-area') && this.getAttribute('hit-area') !== 'false' ? this._hitArea || (this._hitArea = document.createElement(this.hitAreaTagName)) : null
  }

  get hitAreaTagName () {
    return 'div'
  }

  get a () {
    return this._a || (this._a = this.root.querySelector('a'))
  }

  get iconPath () {
    return this.getAttribute('icon-path') || '../src/img/download.svg'
  }
}
