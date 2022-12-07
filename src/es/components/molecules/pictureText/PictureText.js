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
 * {number} [top] The position to top
 * {number} [left] The position to left
 * {left, right, top, bottom } [place=bottom] default is bottom

 * }
 */
export default class Hotspot extends Shadow() {
  constructor (options = {}, ...args) {
    super(Object.assign(options, { importMetaUrl: import.meta.url }), ...args)


    this.buttonClickListener = e => {
      if (this.hasAttribute('show-text')) {
        this.removeAttribute('show-text')
      } else {
        this.setAttribute('show-text', true)
      }
    }

  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    this.button.addEventListener('click', this.buttonClickListener)
  }

  disconnectedCallback () {
    this.button.removeEventListener('click', this.buttonClickListener)
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
    return !this.wrapper
  }

  /**
   * renders the a-Hotspot css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
        :host .wrapper {
            width: max-content;
            position: relative;
            --color: var(--m-white);
            max-width: 100%;
        }

        :host .image-button {
            position: absolute;
            background-color: var(--color-secondary);
            right: 1rem;
            bottom: 0.625rem;
            width: 2.4rem;
            height: 2.4rem;
            border: 0;
            border-radius: 50%;
            transition: background-color 150ms 50ms ease-in-out;
            z-index: 2;
        }
        :host .image-button:hover{
            background-color: var(--color-hover);
        }
        :host .image-button::before{
            border-top: 2px solid #fff;
            border-bottom: 2px solid #fff;
            position: absolute;
            top: 1rem;
            left: 0.7rem;
            width: 1rem;
            height: 0.2rem;
            content: '';
            transition: border-top-color 150ms 50ms ease-in-out;
        }
        :host .image-button::after{
            border-bottom: 2px solid #fff;
            position: absolute;
            top: 1rem;
            left: 0.7rem;
            width: 0.625rem;
            height: 0.625rem;
            content: '';
            transition: border-bottom-color 150ms 50ms ease-in-out;
        }

        :host .content-wrapper {
            color: var(--color);
            display: none;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            background: linear-gradient(-180deg,rgba(255,255,255,0) 0,rgba(255,255,255,0) 30%,rgba(61,61,61,.5) 50%,rgba(14,14,14,.8) 100%);
            opacity: 0;
            transition: opacity 150ms .2s ease-in-out;
        }

        :host .content {
            padding: 0 2.2rem 3.1rem;
            z-index: 2;
        }

        :host([show-text]) .content-wrapper{
            display: flex;
            align-items: end;
            opacity: 1;
            transition: opacity 150ms 0s ease-in-out;
        }

        :host([show-text]) .image-button{
            background-color: var(--m-gray-600);
        }
        :host([show-text]) .image-button::before{
            border-top: 2px solid transparent;
            border-bottom: 2px solid #fff;
        }
        :host([show-text]) .image-button::after{
            border-bottom: 2px solid transparent;
        }


        @media only screen and (max-width: _max-width_) {
            :host .wrapper {
                display: flex;
                align-items: center;
                height: 90vh;
            }

            :host .content-wrapper {
                background: linear-gradient(-180deg,rgba(255,255,255,0) 0,rgba(255,255,255,0) 30%,rgba(61,61,61,.5) 50%,rgba(14,14,14,.8) 60%,rgba(14,14,14,.8) 100%);
            }
        }
    `

    const styles = [{
      // @ts-ignore
      path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
      namespaceFallback: true
    }]

    switch (this.getAttribute('namespace')) {
      case 'picture-text-default-':
      default:
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`,
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
