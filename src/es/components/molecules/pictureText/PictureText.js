// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 *
 *
 * @export
 * @class Hotspot
 * @type {CustomElementConstructor}
 * @css {
 *
 * }
 * @attribute {
 * { has } [place-right] default is left
 * { has } [place-bottom] default is top
 * }
 */
export default class Hotspot extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    this.buttonClickListener = e => {
      if (this.hasAttribute('show-text')) {
        this.removeAttribute('show-text')
      } else {
        this.setAttribute('show-text', true)
      }
    }

    this.clickListener = event => {
      if (event.composedPath()[0] !== this.button && this.hasAttribute('show-text')) this.removeAttribute('show-text')
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    this.button.addEventListener('click', this.buttonClickListener)
    this.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    this.button.removeEventListener('click', this.buttonClickListener)
    this.removeEventListener('click', this.clickListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.wrapper
  }

  /**
   * renders the a-Hotspot css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host([show-text]) {
        cursor: pointer;
      }
      :host .wrapper {
        width: max-content;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        margin: 0 auto;
        max-width: 100%;
        align-items: end;
        overflow: overlay;
        max-height: 90vh;
      }
      :host .wrapper > * {
        grid-column: 1;
        grid-row: 1;
      }
      :host .image-button {
        cursor: pointer;
        background-color: var(--image-button-background-color);
        margin: 1em;
        width: 38px;
        height: 38px;
        border: 0;
        border-radius: 50%;
        transition: background-color 0.3s ease-out;
        position: relative;
        z-index: 3;
      }
      :host([place-right]) .image-button {
        justify-self: end;
      }
      :host([place-bottom]) .image-button {
        align-self: end;
      }
      :host .image-button:hover{
        background-color: var(--image-button-background-color-hover, var(--image-button-background-color));
      }
      :host .image-button::before{
        border-top: 2px solid var(--image-button-border-color);
        border-bottom: 2px solid var(--image-button-border-color);
        position: absolute;
        top: 16px;
        left: 11px;
        width: 16px;
        height: 3px;
        content: '';
        transition: border-top-color 0.3s ease-out;
      }
      :host .image-button::after{
        border-bottom: 2px solid var(--image-button-border-color);
        position: absolute;
        top: 16px;
        left: 11px;
        width: 10px;
        height: 10px;
        content: '';
        transition: border-bottom-color 0.3s ease-out;
      }
      :host .content-wrapper {
        display: flex;
        align-items: end;
        color: var(--color);
        background: var(--content-wrapper-background);
        opacity: 0;
        transition: opacity .3s ease-out;
      }
      :host .content {
        padding: 1em;
        z-index: 2;
      }
      :host([show-text]) .content-wrapper{
        opacity: 1;
      }
      :host([show-text]) .image-button{
        background-color: var(--image-button-background-color-show-text, var(--image-button-background-color));
      }
      :host([show-text]) .image-button::before{
        border-top: 2px solid transparent;
        border-bottom: 2px solid var(--image-button-border-color);
      }
      :host([show-text]) .image-button::after{
        border-bottom: 2px solid transparent;
      }
      @media only screen and (max-width: _max-width_) {
        :host .content-wrapper {
          background: var(--content-wrapper-background-mobile, var(--content-wrapper-background));
        }
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    const styles = [{
      // @ts-ignore
      path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
      namespaceFallback: true
    }]

    switch (this.getAttribute('namespace')) {
      case 'picture-text-default-':
      default:
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false
        }, ...styles], false)
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    if (this.content === null) return

    this.button.classList.add('image-button')

    this.contentWrapper.classList.add('content-wrapper')
    this.contentWrapper.appendChild(this.content)

    this.wrapper = document.createElement('div')
    this.wrapper.classList.add('wrapper')

    this.wrapper.appendChild(this.picture)
    this.wrapper.appendChild(this.button)
    this.wrapper.appendChild(this.contentWrapper)
    this.html = this.wrapper
  }

  get content () {
    return this.root.querySelector('.content')
  }

  get picture () {
    return this.root.querySelector('a-picture')
  }

  get contentWrapper () {
    return this._contentWrapper || (this._contentWrapper = document.createElement('div'))
  }

  get button () {
    return this._button || (this._button = document.createElement('button'))
  }
}
