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
    this.setAttribute('role', 'link')
    this.removeAttribute('tabindex')
    this.a.setAttribute('tabindex', '0')

    this.mouseoverListener = event => {
      this.a.classList.add('hover')
    }
    this.mouseoutListener = event => {
      this.a.classList.remove('hover')
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.mouseEventElement) {
      this.mouseEventElement.addEventListener('mouseover', this.mouseoverListener)
      this.mouseEventElement.addEventListener('mouseout', this.mouseoutListener)
    }
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    if (this.mouseEventElement) {
      this.mouseEventElement.removeEventListener('mouseover', this.mouseoverListener)
      this.mouseEventElement.removeEventListener('mouseout', this.mouseoutListener)
      this.parentNodeShadowRootHost = null
    }
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
    if (!this._hasRendered) return (this._hasRendered = true)
    return false
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
          :host > a:hover ~ ${this.hitAreaTagName}, :host > a.hover ~ ${this.hitAreaTagName} {
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
        background-color: var(--background-color, transparent);
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
      :host > a:hover, :host > a:hover ~ ${this.hitAreaTagName}, :host > a.hover, :host > a.hover ~ ${this.hitAreaTagName} {
        box-shadow: var(--box-shadow-hover, none);
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
      :host([namespace='download-']) > a {
        padding: var(--icon-padding, 0.2em 0);
        display: inline;
        transition: box-shadow .25s ease-out;
      }
      :host([namespace='download-']) > a span {
        color: var(--icon-span-color);
        font-family:var(--icon-span-font-family);
        padding:var(--icon-span-padding);
      }
      :host([namespace='download-']) > a svg {
        box-shadow: var(--box-shadow, none);
        color: var(--icon-color);
        height: var(--icon-height, 1.5em);
        transform: translateY(0.6em);
      }
      :host([namespace='download-']) > a:hover svg {
        box-shadow: none;
      }
      :host > a > h1, :host > a > h2, :host > a > h3, :host > a > h4, :host > a > h5, :host > a > h6 {
        padding: 0;
        margin: 0;
      }
      :host > a > h2 {
        display: var(--h2-display, var(--h-display, block));
        font-size: var(--h2-font-size, 1.5em);
        line-height: var(--h2-line-height, 1.334em);
        font-family: var(--h2-font-family, var(--font-family-bold, var(--font-family, inherit)));
        font-weight: var(--h2-font-weight, var(--h-font-weight, normal));
        text-align: var(--h2-text-align, start);
        word-break: var(--h2-word-break, normal);
        text-transform: var(--h2-text-transform, none);
      }
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
          :host > a:hover::after, :host > ${this.hitAreaTagName}:hover::after, :host > a.hover::after, :host > ${this.hitAreaTagName}.hover::after {
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
    // download icon must be added directly as svg that currentColor works
    if (this.getAttribute('namespace') === 'download-') {
      const div = document.createElement('div')
      div.innerHTML = /* html */`
        <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="14.78px" height="20px" viewBox="0 0 14.78 20" enable-background="new 0 0 14.78 20" xml:space="preserve">
          <g>
            <g>
              <polygon fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" points="14.78,9.03 13.36,7.61 7.39,13.58 1.42,7.61 0,9.03
                7.39,16.42"/>
              <rect x="6.39" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" width="2" height="15"/>
            </g>
          </g>
        </svg>
      `
      this.a.innerHTML = `&nbsp;${this.a.innerHTML}`
      this.a.prepend(Array.from(div.children)[0])
    }
    if (!Array.from(this.root.childNodes).includes(this.a)) this.html = this.a
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
    return this.getAttribute('icon-path') || `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../molecules/teaser/download-/img/download.svg`
  }

  get parentNodeShadowRootHost () {
    if (this._parentNodeShadowRootHost) return this._parentNodeShadowRootHost
    const searchShadowRoot = node => node.root || node.shadowRoot ? node : node.parentNode ? searchShadowRoot(node.parentNode) : node.host ? searchShadowRoot(node.host) : node
    return (this._parentNodeShadowRootHost = searchShadowRoot(this.parentNode))
  }

  set parentNodeShadowRootHost (node) {
    this._parentNodeShadowRootHost = node
  }

  get mouseEventElement () {
    return this[this.hasAttribute('hover-on-parent-element') ? 'parentNode' : this.hasAttribute('hover-on-parent-shadow-root-host') ? 'parentNodeShadowRootHost' : undefined]
  }
}
